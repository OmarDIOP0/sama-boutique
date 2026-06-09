using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/auth")]
    public class AuthController : BaseController
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        /// <summary>Connexion - retourne un JWT + refresh token</summary>
        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var (resp, error) = await _auth.LoginAsync(req, CurrentUserIp);
            if (error != null) return ApiFail(error, 401);
            return ApiOk(resp!, "Connexion réussie");
        }

        /// <summary>Inscription client (vitrine publique)</summary>
        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Register([FromBody] RegisterClientRequest req)
        {
            var (resp, error) = await _auth.RegisterClientAsync(req);
            if (error != null) return ApiFail(error);
            return ApiOk(resp!, "Compte créé avec succès");
        }

        /// <summary>Rafraîchissement du token JWT</summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest req)
        {
            var (resp, error) = await _auth.RefreshAsync(req.RefreshToken, CurrentUserIp);
            if (error != null) return ApiFail(error, 401);
            return ApiOk(resp!, "Token renouvelé");
        }

        /// <summary>Déconnexion - révoque les tokens</summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _auth.RevokeTokenAsync(CurrentUserId, CurrentUserIp);
            return ApiOk<object>(null!, "Déconnexion réussie");
        }

        /// <summary>Changer le mot de passe</summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var (ok, error) = await _auth.ChangePasswordAsync(CurrentUserId, req);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Mot de passe modifié avec succès");
        }

        /// <summary>Profil de l'utilisateur connecté</summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _auth.GetMeAsync(CurrentUserId);
            if (user == null) return ApiNotFound("Utilisateur introuvable");
            return ApiOk(user);
        }

        /// <summary>Mise à jour du profil (utilisateur connecté)</summary>
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var (user, error) = await _auth.UpdateProfileAsync(CurrentUserId, req);
            if (error != null) return ApiFail(error);
            return ApiOk(user!, "Profil mis à jour");
        }
    }
}
