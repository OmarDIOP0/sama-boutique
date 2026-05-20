using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SamaBoutique.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class GoogleAuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly IRefreshTokenRepository _tokenRepo;
    private readonly IClientRepository _clientRepo;
    private readonly IConfiguration _config;

    private const string FRONTEND_URL = "https://localhost:59263";

    public GoogleAuthController(IUserRepository userRepo, IRefreshTokenRepository tokenRepo, IClientRepository clientRepo, IConfiguration config)
    {
        _userRepo    = userRepo;
        _tokenRepo   = tokenRepo;
        _clientRepo  = clientRepo;
        _config      = config;
    }

    [HttpGet("google")]
    public IActionResult GoogleLogin([FromQuery] string? returnUrl = null)
    {
        var callbackUrl = Url.Action("GoogleCallback", "GoogleAuth", new { returnUrl }, Request.Scheme);
        var properties  = new AuthenticationProperties { RedirectUri = callbackUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync("Cookies");
        if (!result.Succeeded)
            return Redirect($"{FRONTEND_URL}/login?error={Uri.EscapeDataString("Échec de la connexion Google")}");

        var email  = result.Principal?.FindFirstValue(ClaimTypes.Email);
        var nom    = result.Principal?.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(email))
            return Redirect($"{FRONTEND_URL}/login?error=email_manquant");

        var user = await _userRepo.GetByEmailAsync(email);
        if (user == null)
        {
            var clientRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");

            user = new User
            {
                Nom          = nom ?? email.Split('@')[0],
                Email        = email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                RoleId       = clientRoleId,
                IsActive     = true,
                CreatedAt    = DateTime.UtcNow,
                LastLogin    = DateTime.UtcNow
            };
            await _userRepo.AddAsync(user);
            await _userRepo.SaveChangesAsync();
        }
        else
        {
            user.LastLogin = DateTime.UtcNow;
            await _userRepo.SaveChangesAsync();
        }

        if (!user.IsActive)
            return Redirect($"{FRONTEND_URL}/login?error={Uri.EscapeDataString("Compte désactivé")}");

        // Crée un Client si aucun n'existe pour cet email
        var client = await _clientRepo.GetByEmailAsync(email);
        if (client == null)
        {
            client = new Client
            {
                Nom   = user.Nom,
                Email = email.ToLower()
            };
            await _clientRepo.AddAsync(client);
            await _clientRepo.SaveChangesAsync();
        }

        var fullUser    = await _userRepo.GetWithRoleAsync(user.Id);
        var accessToken = GenerateJwtToken(fullUser!, client.Id);
        var refreshToken = await CreateRefreshTokenAsync(user.Id, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "google");

        var userInfo = Uri.EscapeDataString(JsonSerializer.Serialize(new
        {
            id       = user.Id,
            clientId = client.Id,
            nom      = user.Nom,
            email    = user.Email,
            role     = fullUser?.Role?.Nom ?? "Client"
        }));

        return Redirect($"{FRONTEND_URL}/auth/callback?token={Uri.EscapeDataString(accessToken)}&refresh={Uri.EscapeDataString(refreshToken)}&user={userInfo}");
    }

    private string GenerateJwtToken(User user, Guid clientId)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var exp   = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60"));
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name,               user.Nom),
            new Claim(ClaimTypes.Role,               user.Role?.Nom ?? "Client"),
            new Claim("permissions",                 user.Role?.Permissions ?? "[]"),
            new Claim("clientId",                    clientId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
        };
        return new JwtSecurityTokenHandler().WriteToken(
            new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, expires: exp, signingCredentials: creds));
    }

    private async Task<string> CreateRefreshTokenAsync(Guid userId, string ip)
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        var tokenValue = Convert.ToBase64String(bytes);
        await _tokenRepo.AddAsync(new RefreshToken { UserId = userId, Token = tokenValue, ExpiresAt = DateTime.UtcNow.AddDays(7), CreatedByIp = ip });
        await _tokenRepo.SaveChangesAsync();
        return tokenValue;
    }
}
