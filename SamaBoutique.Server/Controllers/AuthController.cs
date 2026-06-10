using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/auth")]
    public class AuthController : BaseController
    {
        private readonly IAuthService _auth;
        private readonly IOtpService _otp;
        public AuthController(IAuthService auth, IOtpService otp)
        {
            _auth = auth;
            _otp = otp;
        }

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

        /// <summary>Envoi d'un code OTP (SMS si téléphone, email sinon)</summary>
        [HttpPost("send-otp")]
        [EnableRateLimiting("auth")]
        public IActionResult SendOtp([FromBody] SendOtpRequest req)
        {
            var (ok, error, channel, devCode) = _otp.Send(req.Contact);
            if (!ok) return ApiFail(error!);
            return ApiOk(new SendOtpResponse(channel, devCode), "Code envoyé");
        }

        /// <summary>Renvoi d'un code OTP</summary>
        [HttpPost("resend-otp")]
        [EnableRateLimiting("auth")]
        public IActionResult ResendOtp([FromBody] SendOtpRequest req)
        {
            var (ok, error, channel, devCode) = _otp.Send(req.Contact);
            if (!ok) return ApiFail(error!);
            return ApiOk(new SendOtpResponse(channel, devCode), "Nouveau code envoyé");
        }

        /// <summary>Vérification de l'OTP : retourne un verifyToken (10 min)</summary>
        [HttpPost("verify-otp")]
        [EnableRateLimiting("auth")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpRequest req)
        {
            var (ok, error, verifyToken) = _otp.Verify(req.Contact, req.Otp);
            if (!ok) return ApiFail(error!);
            return ApiOk(new VerifyOtpResponse(verifyToken!), "Code vérifié");
        }

        /// <summary>Finalisation de l'inscription après vérification OTP</summary>
        [HttpPost("register-otp")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> RegisterOtp([FromBody] RegisterOtpRequest req)
        {
            var (resp, error) = await _auth.RegisterWithOtpAsync(req);
            if (error != null) return ApiFail(error);
            return ApiOk(resp!, "Compte créé avec succès");
        }

        /// <summary>Réinitialisation du mot de passe après OTP (mot de passe oublié)</summary>
        [HttpPost("reset-password-otp")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResetPasswordOtp([FromBody] ResetPasswordOtpRequest req)
        {
            var (ok, error) = await _auth.ResetPasswordWithOtpAsync(req);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Mot de passe réinitialisé");
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
