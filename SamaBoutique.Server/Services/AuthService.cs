using Microsoft.IdentityModel.Tokens;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SamaBoutique.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IRefreshTokenRepository _tokenRepo;
        private readonly IConfiguration _config;
        private const int MaxFailedAttempts = 5;
        private const int LockMinutes = 15;

        public AuthService(IUserRepository userRepo, IRefreshTokenRepository tokenRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _tokenRepo = tokenRepo;
            _config = config;
        }
        public async Task<(LoginResponse?, string?)> LoginAsync(LoginRequest req, string ip)
        {
            // Cherche d'abord par email, puis par téléphone (format +221XXXXXXXXX)
            var user = await _userRepo.GetByEmailAsync(req.Email);

            if (user == null)
            {
                var normalized = req.Email.Replace(" ", "").Trim();
                user = await _userRepo.GetByTelephoneAsync(normalized);
            }

            if (user == null)
                return (null, "Numéro ou mot de passe incorrect");

            if (!user.IsActive)
                return (null, "Compte désactivé. Contactez l'administrateur");

            if (user.IsLocked())
                return (null, $"Compte temporairement bloqué. Réessayez après {user.LockedUntil:HH:mm}");

            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= MaxFailedAttempts)
                {
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(LockMinutes);
                    user.FailedLoginAttempts = 0;
                }
                await _userRepo.SaveChangesAsync();
                return (null, "Numéro ou mot de passe incorrect");
            }

            user.FailedLoginAttempts = 0;
            user.LockedUntil = null;
            user.LastLogin = DateTime.UtcNow;
            await _userRepo.SaveChangesAsync();

            var (accessToken, expiry) = GenerateAccessToken(user);
            var refreshToken = await CreateRefreshTokenAsync(user.Id, ip);

            return (BuildLoginResponse(user, accessToken, expiry, refreshToken.Token), null);
        }

        public async Task<(LoginResponse?, string?)> RefreshAsync(string token, string ip)
        {
            var stored = await _tokenRepo.GetActiveTokenAsync(token);
            if (stored == null) return (null, "Token invalide ou expiré");

            var user = stored.User;
            if (!user.IsActive) return (null, "Compte désactivé");

            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = ip;
            await _tokenRepo.SaveChangesAsync();

            var (accessToken, expiry) = GenerateAccessToken(user);
            var newRefresh = await CreateRefreshTokenAsync(user.Id, ip);

            return (BuildLoginResponse(user, accessToken, expiry, newRefresh.Token), null);
        }

        public async Task<(LoginResponse?, string?)> RegisterClientAsync(RegisterClientRequest req)
        {
            if (await _userRepo.EmailExistsAsync(req.Email))
                return (null, "Cette adresse email est déjà utilisée");

            // Récupérer le rôle Client (id fixe du seed)
            var clientRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");

            var user = new User
            {
                Nom = req.Nom,
                Email = req.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                RoleId = clientRoleId
            };

            await _userRepo.AddAsync(user);
            await _userRepo.SaveChangesAsync();

            // Recharger avec le rôle
            var fullUser = await _userRepo.GetWithRoleAsync(user.Id);
            var (accessToken, expiry) = GenerateAccessToken(fullUser!);
            var refreshToken = await CreateRefreshTokenAsync(user.Id, "register");

            return (BuildLoginResponse(fullUser!, accessToken, expiry, refreshToken.Token), null);
        }

        public async Task<(bool, string?)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
        {
            if (req.NewPassword != req.ConfirmNewPassword)
                return (false, "Les mots de passe ne correspondent pas");

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return (false, "Utilisateur introuvable");

            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
                return (false, "Mot de passe actuel incorrect");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _userRepo.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> RevokeTokenAsync(Guid userId, string ip)
        {
            await _tokenRepo.RevokeAllUserTokensAsync(userId, ip);
            await _tokenRepo.SaveChangesAsync();
            return true;
        }

        public async Task<UserInfoDto?> GetMeAsync(Guid userId)
        {
            var user = await _userRepo.GetWithRoleAsync(userId);
            if (user == null) return null;
            return BuildUserInfo(user);
        }

        public async Task<(UserInfoDto?, string?)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req)
        {
            var user = await _userRepo.GetWithRoleAsync(userId);
            if (user == null) return (null, "Utilisateur introuvable");

            if (string.IsNullOrWhiteSpace(req.Nom) || req.Nom.Trim().Length < 2)
                return (null, "Le nom doit contenir au moins 2 caractères");

            // Email : vérifier l'unicité s'il change
            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var newEmail = req.Email.Trim().ToLower();
                if (newEmail != user.Email && await _userRepo.EmailExistsAsync(newEmail))
                    return (null, "Cette adresse email est déjà utilisée");
                user.Email = newEmail;
            }

            user.Nom = req.Nom.Trim();
            if (!string.IsNullOrWhiteSpace(req.Telephone))
                user.Telephone = req.Telephone.Replace(" ", "").Trim();

            await _userRepo.SaveChangesAsync();
            return (BuildUserInfo(user), null);
        }

        // ── Helpers ─────────────────────────────
        private (string Token, DateTime Expiry) GenerateAccessToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60"));
            var perms = JsonSerializer.Deserialize<List<string>>(user.Role.Permissions) ?? new();

            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name,               user.Nom),
            new Claim(ClaimTypes.Role,               user.Role.Nom),
            new Claim("permissions",                 user.Role.Permissions),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
        };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"], audience: _config["Jwt:Audience"],
                claims: claims, expires: expiry, signingCredentials: creds);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiry);
        }

        private async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string ip)
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);

            var token = new RefreshToken
            {
                UserId = userId,
                Token = Convert.ToBase64String(bytes),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ip
            };

            await _tokenRepo.AddAsync(token);
            await _tokenRepo.SaveChangesAsync();
            return token;
        }

        private static LoginResponse BuildLoginResponse(User user, string token, DateTime expiry, string refreshToken)
            => new(token, refreshToken, expiry, BuildUserInfo(user));

        private static UserInfoDto BuildUserInfo(User user)
        {
            var perms = JsonSerializer.Deserialize<List<string>>(user.Role.Permissions) ?? new();
            return new(user.Id, user.Nom, user.Email, user.Role.Nom, perms, user.Telephone);
        }

        // Pour les clients : clientId = userId (même entité après migration du seed)
        // Si besoin d'une vraie séparation, injecter IClientRepository ici
    }
}
