using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Services
{
    public class StockService : IStockService
    {
        private readonly IStockRepository _repo;

        public StockService(IStockRepository repo) => _repo = repo;

        public async Task<(StockMovementResponse?, string?)> AddMovementAsync(StockMovementRequest req, Guid userId)
        {
            var variant = await _repo.GetVariantAsync(req.VariantId);
            if (variant == null) return (null, "Variante introuvable");

            if (req.Type == "Sortie" && variant.StockActuel < req.Quantite)
                return (null, $"Stock insuffisant. Disponible : {variant.StockActuel}");

            if (req.Quantite <= 0)
                return (null, "La quantité doit être supérieure à 0");

            var stockAvant = variant.StockActuel;

            variant.StockActuel = req.Type switch
            {
                "Entrée" => variant.StockActuel + req.Quantite,
                "Sortie" => variant.StockActuel - req.Quantite,
                "Ajustement" => req.Quantite,
                _ => throw new ArgumentException($"Type de mouvement invalide : {req.Type}")
            };

            var movement = new StockMovement
            {
                VariantId = req.VariantId,
                UserId = userId,
                Type = req.Type,
                Quantite = req.Quantite,
                StockAvant = stockAvant,
                StockApres = variant.StockActuel,
                Motif = req.Motif
            };

            await _repo.AddAsync(movement);
            await _repo.SaveChangesAsync();

            return (new StockMovementResponse(
                movement.Id, variant.Id, variant.Product.Nom,
                variant.GetLabel().Length > 0 ? variant.GetLabel() : null,
                movement.Type, movement.Quantite, movement.StockAvant,
                movement.StockApres, movement.Motif, "", movement.Date), null);
        }

        public async Task<PagedResponse<StockMovementResponse>> GetMovementsAsync(int page, int pageSize, Guid? variantId, string? type)
        {
            var (items, total) = await _repo.GetPagedAsync(page, pageSize, variantId, type);
            var dtos = items.Select(sm => new StockMovementResponse(
                sm.Id, sm.VariantId, sm.Variant.Product.Nom,
                sm.Variant.GetLabel().Length > 0 ? sm.Variant.GetLabel() : null,
                sm.Type, sm.Quantite, sm.StockAvant, sm.StockApres,
                sm.Motif, sm.User.Nom, sm.Date)).ToList();
            return PagedResponse<StockMovementResponse>.Ok(dtos, total, page, pageSize);
        }
    }
}
