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
        private readonly IStockRepository _stockRepo;
        private readonly ISaleRepository _saleRepo;
        private static readonly HashSet<string> ValidStatuts = new() { "EnAttente", "Confirmee", "EnPreparation", "Expediee", "Livree", "Annulee", "Retournee" };
        // Compte système (SuperAdmin seedé) utilisé comme "enregistreur" des ventes en ligne
        private static readonly Guid SystemUserId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        public OrderService(IOrderRepository repo, IClientRepository clientRepo, IStockRepository stockRepo, ISaleRepository saleRepo)
        {
            _repo = repo;
            _clientRepo = clientRepo;
            _stockRepo = stockRepo;
            _saleRepo = saleRepo;
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

            // ── Vérifier et déduire le stock pour chaque variante ─────────────────
            var variantCache = new Dictionary<Guid, ProductVariant>();
            foreach (var item in req.Items)
            {
                var variant = await _stockRepo.GetVariantAsync(item.VariantId);
                if (variant == null)
                    return (null, $"Variante introuvable (Id: {item.VariantId})");
                if (variant.StockActuel < item.Quantite)
                    return (null, $"Stock insuffisant pour « {variant.Product?.Nom ?? item.VariantId.ToString()} » " +
                                  $"(disponible : {variant.StockActuel}, demandé : {item.Quantite})");
                variantCache[item.VariantId] = variant;
            }

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

            // ── Déduire le stock après création de la commande ───────────────────
            foreach (var item in req.Items)
            {
                var variant = variantCache[item.VariantId];
                variant.StockActuel -= item.Quantite;

                // Enregistrer un mouvement de stock
                await _stockRepo.AddAsync(new StockMovement
                {
                    VariantId = item.VariantId,
                    Type = "Sortie",
                    Quantite = item.Quantite,
                    Motif = $"Commande {order.NumeroFacture}",
                    StockAvant = variant.StockActuel + item.Quantite,
                    StockApres = variant.StockActuel,
                    UserId = req.ClientId, // Id utilisateur client
                });
            }

            // ── Enregistrer la vente correspondante (revenu unifié) ──────────────
            // Le stock est déjà déduit ci-dessus : on ne crée QUE l'enregistrement
            // de vente pour que Ventes / Tableau de bord / Analytiques le comptent.
            var sale = new Sale
            {
                UserId = SystemUserId,          // vente en ligne (pas de caissier)
                ClientId = req.ClientId,
                ModePaiement = req.ModePaiement ?? "MobileMoney",
                TotalHT = order.TotalHT,
                TotalTTC = order.TotalTTC,
                MontantRecu = order.TotalTTC,
                MonnaieRendue = 0,
                Statut = "Complétée",
                Date = DateTime.UtcNow,
                Items = req.Items.Select(i => new SaleItem
                {
                    VariantId = i.VariantId,
                    Quantite = i.Quantite,
                    PrixUnitaire = i.PrixUnitaire,
                    RemisePct = 0,
                    SousTotal = Math.Round(i.Quantite * i.PrixUnitaire, 2),
                }).ToList(),
            };
            await _saleRepo.AddAsync(sale);

            // ── Fidélité : 1 point par tranche de 1000 FCFA ──────────────────────
            var points = (int)(order.TotalTTC / 1000);
            if (points > 0)
            {
                var client = await _clientRepo.GetByIdAsync(req.ClientId);
                if (client != null)
                {
                    client.PointsFidelite += points;
                    client.Segment = client.PointsFidelite switch
                    {
                        >= 5000 => "VIP",
                        >= 1000 => "Régulier",
                        _ => "Nouveau"
                    };
                    await _clientRepo.UpdateAsync(client);
                }
            }

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
