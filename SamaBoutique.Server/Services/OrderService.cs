using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repo;
        private readonly IClientRepository _clientRepo;
        private static readonly HashSet<string> ValidStatuts = new() { "EnAttente", "Confirmee", "EnPreparation", "Expediee", "Livree", "Annulee", "Retournee" };

        public OrderService(IOrderRepository repo, IClientRepository clientRepo)
        {
            _repo = repo;
            _clientRepo = clientRepo;
        }

        public async Task<PagedResponse<OrderResponse>> GetAllAsync(int page, int pageSize, string? statut, Guid? clientId)
        {
            var (items, total) = await _repo.GetPagedAsync(page, pageSize, statut, clientId);
            return PagedResponse<OrderResponse>.Ok(items.Select(Map).ToList(), total, page, pageSize);
        }

        public async Task<OrderResponse?> GetByIdAsync(Guid id)
        {
            var o = await _repo.GetWithItemsAsync(id);
            return o == null ? null : Map(o);
        }

        public async Task<(OrderResponse?, string?)> CreateAsync(OrderCreateRequest req)
        {
            if (!req.Items.Any()) return (null, "La commande doit contenir au moins un article");

            if (!await _clientRepo.ExistsAsync(req.ClientId))
                return (null, $"Client introuvable (Id: {req.ClientId})");

            var order = new Order
            {
                ClientId = req.ClientId,
                AdresseLivraison = req.AdresseLivraison,
                ModePaiement = req.ModePaiement,
                NumeroFacture = $"FAC-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}",
                Items = req.Items.Select(i => new OrderItem
                {
                    VariantId = i.VariantId,
                    Quantite = i.Quantite,
                    PrixUnitaire = i.PrixUnitaire,
                    SousTotal = Math.Round(i.Quantite * i.PrixUnitaire, 2)
                }).ToList()
            };

            order.TotalHT = order.Items.Sum(i => i.SousTotal);
            order.TotalTTC = order.TotalHT;

            await _repo.AddAsync(order);
            await _repo.SaveChangesAsync();
            return (await GetByIdAsync(order.Id), null);
        }

        public async Task<(OrderResponse?, string?)> UpdateStatusAsync(Guid id, string statut)
        {
            if (!ValidStatuts.Contains(statut))
                return (null, $"Statut invalide. Valeurs acceptées : {string.Join(", ", ValidStatuts)}");

            var order = await _repo.GetByIdAsync(id);
            if (order == null) return (null, "Commande introuvable");

            order.Statut = statut;
            order.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(order);
            await _repo.SaveChangesAsync();
            return (await GetByIdAsync(id), null);
        }

        private static OrderResponse Map(Order o) => new(
            o.Id, o.ClientId, o.Client?.Nom ?? "", o.Statut,
            o.TotalHT, o.TotalTTC, o.AdresseLivraison, o.ModePaiement, o.NumeroFacture,
            o.Items.Select(i => new OrderItemResponse(
                i.Id, i.VariantId, i.Variant?.Product?.Nom ?? "",
                i.Variant?.GetLabel() is { Length: > 0 } l ? l : null,
                i.Quantite, i.PrixUnitaire, i.SousTotal)).ToList(),
            o.CreatedAt, o.UpdatedAt);
    }
}
