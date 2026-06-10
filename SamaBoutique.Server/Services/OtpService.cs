using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SamaBoutique.Server.Services
{
    public interface IOtpService
    {
        /// <summary>Détecte le canal, génère et "envoie" un OTP. DevCode renseigné hors prod.</summary>
        (bool Ok, string? Error, string Channel, string? DevCode) Send(string contact);
        /// <summary>Vérifie l'OTP. Retourne un verifyToken JWT (10 min) si valide.</summary>
        (bool Ok, string? Error, string? VerifyToken) Verify(string contact, string code);
        /// <summary>Valide le verifyToken issu de Verify. Retourne (contact normalisé, canal) ou null.</summary>
        (string Contact, string Channel)? ValidateVerifyToken(string token);
        bool IsEmail(string contact);
        bool IsSenegalPhone(string contact);
        string Normalize(string contact);
    }

    public class OtpService : IOtpService
    {
        private sealed class Entry
        {
            public string Code = "";
            public string Channel = "sms";
            public DateTime ExpiresAt;
            public int Attempts;
            public DateTime? BlockedUntil;
            public int SendCount;
            public DateTime WindowStart;
        }

        private readonly ConcurrentDictionary<string, Entry> _store = new();
        private readonly IConfiguration _config;
        private readonly IHostEnvironment _env;
        private readonly ILogger<OtpService> _logger;

        private const int MaxSendsPerHour = 3;
        private const int MaxAttempts = 5;
        private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);
        private static readonly TimeSpan BlockDuration = TimeSpan.FromMinutes(30);

        public OtpService(IConfiguration config, IHostEnvironment env, ILogger<OtpService> logger)
        {
            _config = config;
            _env = env;
            _logger = logger;
        }

        public bool IsEmail(string contact) => !string.IsNullOrWhiteSpace(contact) && contact.Contains('@');

        public bool IsSenegalPhone(string contact)
        {
            var digits = OnlyDigits(contact);
            if (contact.Trim().StartsWith("+221")) digits = digits.Length >= 12 ? digits[3..] : digits;
            else if (digits.StartsWith("221") && digits.Length == 12) digits = digits[3..];
            return System.Text.RegularExpressions.Regex.IsMatch(digits, "^(70|75|76|77|78)\\d{7}$");
        }

        public string Normalize(string contact)
        {
            contact = contact.Trim();
            if (IsEmail(contact)) return contact.ToLowerInvariant();
            var digits = OnlyDigits(contact);
            if (digits.StartsWith("221") && digits.Length == 12) digits = digits[3..];
            return "+221" + digits[^Math.Min(9, digits.Length)..];
        }

        public (bool, string?, string, string?) Send(string contact)
        {
            if (string.IsNullOrWhiteSpace(contact))
                return (false, "Veuillez saisir un téléphone ou un email", "", null);

            var isEmail = IsEmail(contact);
            if (!isEmail && !IsSenegalPhone(contact))
                return (false, "Numéro sénégalais invalide. Pour un numéro étranger, utilisez votre email.", "", null);

            var key = Normalize(contact);
            var channel = isEmail ? "email" : "sms";
            var now = DateTime.UtcNow;

            var entry = _store.GetOrAdd(key, _ => new Entry { WindowStart = now });

            lock (entry)
            {
                // Fenêtre glissante d'une heure pour le rate limit
                if (now - entry.WindowStart > TimeSpan.FromHours(1))
                {
                    entry.WindowStart = now;
                    entry.SendCount = 0;
                }
                if (entry.SendCount >= MaxSendsPerHour)
                    return (false, "Trop de demandes de code. Réessayez dans une heure.", channel, null);

                var code = GenerateCode(isEmail ? 6 : 4);
                entry.Code = code;
                entry.Channel = channel;
                entry.ExpiresAt = now.Add(Ttl);
                entry.Attempts = 0;
                entry.BlockedUntil = null;
                entry.SendCount++;

                // Pas de passerelle SMS/SMTP en local : on journalise le code.
                _logger.LogInformation("OTP {Channel} pour {Key} : {Code}", channel, key, code);

                var devCode = _env.IsDevelopment() ? code : null;
                return (true, null, channel, devCode);
            }
        }

        public (bool, string?, string?) Verify(string contact, string code)
        {
            var key = Normalize(contact);
            if (!_store.TryGetValue(key, out var entry))
                return (false, "Aucun code en attente. Renvoyez un code.", null);

            lock (entry)
            {
                var now = DateTime.UtcNow;
                if (entry.BlockedUntil is { } b && b > now)
                    return (false, "Trop de tentatives. Réessayez plus tard.", null);
                if (now > entry.ExpiresAt)
                    return (false, "Code expiré. Renvoyez un nouveau code.", null);

                if (!string.Equals(entry.Code, code?.Trim(), StringComparison.Ordinal))
                {
                    entry.Attempts++;
                    var remaining = MaxAttempts - entry.Attempts;
                    if (remaining <= 0)
                    {
                        entry.BlockedUntil = now.Add(BlockDuration);
                        return (false, "Trop de tentatives. Compte temporairement bloqué (30 min).", null);
                    }
                    return (false, $"Code incorrect. {remaining} tentative{(remaining > 1 ? "s" : "")} restante{(remaining > 1 ? "s" : "")}.", null);
                }

                // Succès : on consomme l'entrée
                _store.TryRemove(key, out _);
                return (true, null, IssueVerifyToken(key, entry.Channel));
            }
        }

        public (string, string)? ValidateVerifyToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidAudience = _config["Jwt:Audience"],
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero,
                }, out _);

                if (principal.FindFirst("purpose")?.Value != "otp-verify") return null;
                var contact = principal.FindFirst("otp_contact")?.Value;
                var channel = principal.FindFirst("otp_channel")?.Value;
                if (string.IsNullOrEmpty(contact) || string.IsNullOrEmpty(channel)) return null;
                return (contact, channel);
            }
            catch
            {
                return null;
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private string IssueVerifyToken(string contact, string channel)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim("purpose", "otp-verify"),
                new Claim("otp_contact", contact),
                new Claim("otp_channel", channel),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"], audience: _config["Jwt:Audience"],
                claims: claims, expires: DateTime.UtcNow.AddMinutes(10), signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string OnlyDigits(string s) => new(s.Where(char.IsDigit).ToArray());

        private static string GenerateCode(int length)
        {
            var n = System.Security.Cryptography.RandomNumberGenerator.GetInt32(0, (int)Math.Pow(10, length));
            return n.ToString().PadLeft(length, '0');
        }
    }
}
