using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using System.Text.Json;

namespace SamaBoutique.Server.Services
{
    public interface IDeliveryService
    {
        Task<List<DeliveryZoneResponse>> GetAllAsync(bool activeOnly = false);
        Task<(DeliveryZoneResponse? Zone, string? Error)> CreateAsync(DeliveryZoneRequest req);
        Task<(DeliveryZoneResponse? Zone, string? Error)> UpdateAsync(Guid id, DeliveryZoneRequest req);
        Task<(bool Ok, string? Error)> DeleteAsync(Guid id);
    }

    public class DeliveryService : IDeliveryService
    {
        private readonly AppDbContext _db;
        public DeliveryService(AppDbContext db) => _db = db;

        public async Task<List<DeliveryZoneResponse>> GetAllAsync(bool activeOnly = false)
        {
            var q = _db.DeliveryZones.AsQueryable();
            if (activeOnly) q = q.Where(z => z.IsActive);
            var zones = await q.OrderBy(z => z.Ordre).ThenBy(z => z.Nom).ToListAsync();
            return zones.Select(Map).ToList();
        }

        public async Task<(DeliveryZoneResponse?, string?)> CreateAsync(DeliveryZoneRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nom)) return (null, "Le nom de la zone est requis");
            if (req.Tarif < 0) return (null, "Le tarif ne peut pas être négatif");

            var zone = new DeliveryZone
            {
                Nom = req.Nom.Trim(),
                Region = req.Region,
                Communes = JsonSerializer.Serialize(req.Communes ?? new()),
                Tarif = req.Tarif,
                DelaiMinH = req.DelaiMinH,
                DelaiMaxH = req.DelaiMaxH,
                IsActive = req.IsActive,
                Description = req.Description,
                FreeFrom = req.FreeFrom,
                Ordre = req.Ordre
            };
            _db.DeliveryZones.Add(zone);
            await _db.SaveChangesAsync();
            return (Map(zone), null);
        }

        public async Task<(DeliveryZoneResponse?, string?)> UpdateAsync(Guid id, DeliveryZoneRequest req)
        {
            var zone = await _db.DeliveryZones.FindAsync(id);
            if (zone == null) return (null, "Zone introuvable");
            if (string.IsNullOrWhiteSpace(req.Nom)) return (null, "Le nom de la zone est requis");

            zone.Nom = req.Nom.Trim();
            zone.Region = req.Region;
            zone.Communes = JsonSerializer.Serialize(req.Communes ?? new());
            zone.Tarif = req.Tarif;
            zone.DelaiMinH = req.DelaiMinH;
            zone.DelaiMaxH = req.DelaiMaxH;
            zone.IsActive = req.IsActive;
            zone.Description = req.Description;
            zone.FreeFrom = req.FreeFrom;
            zone.Ordre = req.Ordre;
            zone.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return (Map(zone), null);
        }

        public async Task<(bool, string?)> DeleteAsync(Guid id)
        {
            var zone = await _db.DeliveryZones.FindAsync(id);
            if (zone == null) return (false, "Zone introuvable");
            _db.DeliveryZones.Remove(zone);
            await _db.SaveChangesAsync();
            return (true, null);
        }

        private static DeliveryZoneResponse Map(DeliveryZone z) => new(
            z.Id, z.Nom, z.Region,
            JsonSerializer.Deserialize<List<string>>(z.Communes) ?? new(),
            z.Tarif, z.DelaiMinH, z.DelaiMaxH, z.IsActive, z.Description, z.FreeFrom, z.Ordre);
    }
}
