using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/notifications")]
    public class NotificationsController : BaseController
    {
        private readonly IPushService _push;
        public NotificationsController(IPushService push) => _push = push;

        /// <summary>Clé publique VAPID nécessaire au navigateur pour s'abonner.</summary>
        [HttpGet("vapid-public-key")]
        [AllowAnonymous]
        public IActionResult GetPublicKey() => ApiOk(new { publicKey = _push.PublicKey });

        /// <summary>Enregistre l'abonnement push de l'appareil courant.</summary>
        [HttpPost("subscribe")]
        [Authorize]
        public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Endpoint) || req.Keys is null)
                return ApiFail("Abonnement invalide");

            var isAdmin = !User.IsInRole("Client");
            await _push.SubscribeAsync(CurrentUserId, isAdmin, req);
            return ApiOk<object>(null!, "Notifications activées");
        }

        /// <summary>Désabonne l'appareil (ou tous les appareils de l'utilisateur).</summary>
        [HttpPost("unsubscribe")]
        [Authorize]
        public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest? req)
        {
            await _push.UnsubscribeAsync(CurrentUserId, req?.Endpoint);
            return ApiOk<object>(null!, "Notifications désactivées");
        }

        /// <summary>Préférences de notification de l'utilisateur.</summary>
        [HttpGet("preferences")]
        [Authorize]
        public async Task<IActionResult> GetPreferences()
            => ApiOk(await _push.GetPreferencesAsync(CurrentUserId));

        /// <summary>Met à jour les préférences (catégories).</summary>
        [HttpPut("preferences")]
        [Authorize]
        public async Task<IActionResult> UpdatePreferences([FromBody] PushPreferencesRequest req)
        {
            await _push.UpdatePreferencesAsync(CurrentUserId, req);
            return ApiOk<object>(null!, "Préférences enregistrées");
        }

        /// <summary>Envoie une notification de test à l'utilisateur courant.</summary>
        [HttpPost("test")]
        [Authorize]
        public async Task<IActionResult> Test()
        {
            await _push.SendTestAsync(CurrentUserId);
            return ApiOk<object>(null!, "Notification de test envoyée");
        }
    }

    public record UnsubscribeRequest(string? Endpoint);
}
