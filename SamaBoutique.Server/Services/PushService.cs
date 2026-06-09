using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.DTOs;
using System.Text.Json;
using WebPush;
using PushEntity = SamaBoutique.Server.Models.Entities.PushSubscription;
using WebPushSub = WebPush.PushSubscription;

namespace SamaBoutique.Server.Services
{
    public interface IPushService
    {
        string PublicKey { get; }
        Task SubscribeAsync(Guid userId, bool isAdmin, PushSubscriptionRequest req);
        Task UnsubscribeAsync(Guid userId, string? endpoint);
        Task<PushPreferencesResponse> GetPreferencesAsync(Guid userId);
        Task UpdatePreferencesAsync(Guid userId, PushPreferencesRequest req);
        Task SendTestAsync(Guid userId);

        // Déclencheurs métier (catégorie : "orders" | "promotions" | "stock" | "system")
        Task SendToUserAsync(Guid userId, string title, string body, string category, string? url = null);
        Task SendToAdminsAsync(string title, string body, string category, string? url = null);
    }

    public class PushService : IPushService
    {
        private readonly AppDbContext _db;
        private readonly IVapidProvider _vapid;
        private readonly ILogger<PushService> _logger;
        private static readonly WebPushClient _client = new();

        public PushService(AppDbContext db, IVapidProvider vapid, ILogger<PushService> logger)
        {
            _db = db;
            _vapid = vapid;
            _logger = logger;
        }

        public string PublicKey => _vapid.PublicKey;

        public async Task SubscribeAsync(Guid userId, bool isAdmin, PushSubscriptionRequest req)
        {
            var existing = await _db.PushSubscriptions.FirstOrDefaultAsync(s => s.Endpoint == req.Endpoint);
            if (existing != null)
            {
                existing.UserId = userId;
                existing.IsAdmin = isAdmin;
                existing.P256dh = req.Keys.P256dh;
                existing.Auth = req.Keys.Auth;
                existing.UserAgent = req.UserAgent;
                existing.NotifyOrders = req.NotifyOrders;
                existing.NotifyPromotions = req.NotifyPromotions;
                existing.NotifyStock = req.NotifyStock;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.PushSubscriptions.Add(new PushEntity
                {
                    UserId = userId,
                    IsAdmin = isAdmin,
                    Endpoint = req.Endpoint,
                    P256dh = req.Keys.P256dh,
                    Auth = req.Keys.Auth,
                    UserAgent = req.UserAgent,
                    NotifyOrders = req.NotifyOrders,
                    NotifyPromotions = req.NotifyPromotions,
                    NotifyStock = req.NotifyStock,
                });
            }
            await _db.SaveChangesAsync();
        }

        public async Task UnsubscribeAsync(Guid userId, string? endpoint)
        {
            var q = _db.PushSubscriptions.Where(s => s.UserId == userId);
            if (!string.IsNullOrWhiteSpace(endpoint))
                q = q.Where(s => s.Endpoint == endpoint);
            var subs = await q.ToListAsync();
            if (subs.Count > 0)
            {
                _db.PushSubscriptions.RemoveRange(subs);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<PushPreferencesResponse> GetPreferencesAsync(Guid userId)
        {
            var sub = await _db.PushSubscriptions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefaultAsync();

            if (sub == null)
                return new PushPreferencesResponse(false, true, true, true);

            return new PushPreferencesResponse(true, sub.NotifyOrders, sub.NotifyPromotions, sub.NotifyStock);
        }

        public async Task UpdatePreferencesAsync(Guid userId, PushPreferencesRequest req)
        {
            var subs = await _db.PushSubscriptions.Where(s => s.UserId == userId).ToListAsync();
            foreach (var s in subs)
            {
                s.NotifyOrders = req.NotifyOrders;
                s.NotifyPromotions = req.NotifyPromotions;
                s.NotifyStock = req.NotifyStock;
                s.UpdatedAt = DateTime.UtcNow;
            }
            if (subs.Count > 0) await _db.SaveChangesAsync();
        }

        public Task SendTestAsync(Guid userId)
            => SendToUserAsync(userId, "🔔 Notification de test",
                "Les notifications push fonctionnent parfaitement !", "system", "/");

        public async Task SendToUserAsync(Guid userId, string title, string body, string category, string? url = null)
        {
            var subs = await _db.PushSubscriptions.Where(s => s.UserId == userId).ToListAsync();
            await DispatchAsync(Filter(subs, category), title, body, category, url);
        }

        public async Task SendToAdminsAsync(string title, string body, string category, string? url = null)
        {
            var subs = await _db.PushSubscriptions.Where(s => s.IsAdmin).ToListAsync();
            await DispatchAsync(Filter(subs, category), title, body, category, url);
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private static List<PushEntity> Filter(List<PushEntity> subs, string category) => category switch
        {
            "orders" => subs.Where(s => s.NotifyOrders).ToList(),
            "promotions" => subs.Where(s => s.NotifyPromotions).ToList(),
            "stock" => subs.Where(s => s.NotifyStock).ToList(),
            _ => subs, // system / test : toujours envoyé
        };

        private async Task DispatchAsync(List<PushEntity> subs, string title, string body, string category, string? url)
        {
            if (subs.Count == 0) return;

            var payload = JsonSerializer.Serialize(new
            {
                title,
                body,
                url = url ?? "/",
                category,
                icon = "/pwa-192x192.png",
                badge = "/pwa-192x192.png",
                tag = category,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            });

            var stale = new List<PushEntity>();
            foreach (var s in subs)
            {
                try
                {
                    var ws = new WebPushSub(s.Endpoint, s.P256dh, s.Auth);
                    await _client.SendNotificationAsync(ws, payload, _vapid.Details);
                }
                catch (WebPushException ex) when ((int)ex.StatusCode == 404 || (int)ex.StatusCode == 410)
                {
                    // Abonnement expiré / révoqué → purge
                    stale.Add(s);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Échec d'envoi push vers {Endpoint}", s.Endpoint);
                }
            }

            if (stale.Count > 0)
            {
                _db.PushSubscriptions.RemoveRange(stale);
                await _db.SaveChangesAsync();
            }
        }
    }
}
