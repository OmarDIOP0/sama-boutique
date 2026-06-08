using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Services
{
    public class SaleService : ISaleService
    {
        private readonly ISaleRepository _saleRepo;
        private readonly IStockRepository _stockRepo;
        private readonly IClientRepository _clientRepo;

        public SaleService(ISaleRepository saleRepo, IStockRepository stockRepo, IClientRepository clientRepo)
        {
            _saleRepo = saleRepo;
            _stockRepo = stockRepo;
            _clientRepo = clientRepo;
        }

        public async Task<(SaleResponse?, string?)> CreateAsync(SaleCreateRequest req, Guid userId)
        {
            if (!req.Items.Any()) return (null, "La vente doit contenir au moins un article");
            if (req.MontantRecu < 0) return (null, "Le montant reçu ne peut pas être négatif");

            var sale = new Sale
            {
                UserId = userId,
                ClientId = req.ClientId,
                RemiseGlobale = req.RemiseGlobale,
                ModePaiement = req.ModePaiement,
                MontantRecu = req.MontantRecu
            };

            decimal totalHT = 0;

            foreach (var item in req.Items)
            {
                var variant = await _stockRepo.GetVariantAsync(item.VariantId);
                if (variant == null) return (null, $"Variante introuvable : {item.VariantId}");
                if (variant.StockActuel < item.Quantite)
                    return (null, $"Stock insuffisant pour {variant.Product.Nom}. Disponible : {variant.StockActuel}");

                var sousTotal = Math.Round(item.Quantite * item.PrixUnitaire * (1 - item.RemisePct / 100), 2);
                totalHT += sousTotal;

                sale.Items.Add(new SaleItem
                {
                    VariantId = item.VariantId,
                    Quantite = item.Quantite,
                    PrixUnitaire = item.PrixUnitaire,
                    RemisePct = item.RemisePct,
                    SousTotal = sousTotal
                });

                var before = variant.StockActuel;
                variant.StockActuel -= item.Quantite;

                await _stockRepo.AddAsync(new StockMovement
                {
                    VariantId = variant.Id,
                    UserId = userId,
                    Type = "Vente",
                    Quantite = item.Quantite,
                    StockAvant = before,
                    StockApres = variant.StockActuel,
                    Motif = "Vente POS"
                });
            }

            var remise = req.RemiseGlobale / 100;
            sale.TotalHT = Math.Round(totalHT * (1 - remise), 2);
            sale.TotalTTC = sale.TotalHT;
            sale.MonnaieRendue = Math.Round(req.MontantRecu - sale.TotalTTC, 2);

            if (req.ClientId.HasValue)
            {
                var points = (int)(sale.TotalTTC / 1000);
                if (points > 0)
                {
                    var client = await _clientRepo.GetByIdAsync(req.ClientId.Value);
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
                        sale.LoyaltyTransaction = new LoyaltyTransaction
                        {
                            ClientId = req.ClientId.Value,
                            Points = points,
                            Type = "Gain"
                        };
                    }
                }
            }

            await _saleRepo.AddAsync(sale);
            await _saleRepo.SaveChangesAsync();
            return (await GetByIdAsync(sale.Id), null);
        }

        public async Task<PagedResponse<SaleResponse>> GetAllAsync(int page, int pageSize, DateTime? from, DateTime? to, string? statut, string? modePaiement = null, Guid? userId = null)
        {
            var (items, total) = await _saleRepo.GetPagedAsync(page, pageSize, from, to, statut, modePaiement, userId);
            return PagedResponse<SaleResponse>.Ok(items.Select(Map).ToList(), total, page, pageSize);
        }

        public async Task<SaleResponse?> GetByIdAsync(Guid id)
        {
            var s = await _saleRepo.GetWithItemsAsync(id);
            return s == null ? null : Map(s);
        }

        public async Task<(bool, string?)> CancelAsync(Guid id, Guid userId)
        {
            var sale = await _saleRepo.GetWithItemsAsync(id);
            if (sale == null) return (false, "Vente introuvable");
            if (sale.Statut == "Annulée") return (false, "Cette vente est déjà annulée");

            sale.Statut = "Annulée";

            foreach (var item in sale.Items)
            {
                var variant = await _stockRepo.GetVariantAsync(item.VariantId);
                if (variant == null) continue;
                var before = variant.StockActuel;
                variant.StockActuel += item.Quantite;
                await _stockRepo.AddAsync(new StockMovement
                {
                    VariantId = item.VariantId,
                    UserId = userId,
                    Type = "Retour",
                    Quantite = item.Quantite,
                    StockAvant = before,
                    StockApres = variant.StockActuel,
                    Motif = $"Annulation vente {id}"
                });
            }

            await _saleRepo.SaveChangesAsync();
            return (true, null);
        }

        private static SaleResponse Map(Sale s) => new(
            s.Id, s.UserId, 
            s.User?.Nom ?? "",
            s.ClientId, 
            s.Client?.Nom,
            s.TotalHT,
            s.TotalTTC, 
            s.RemiseGlobale,
            s.ModePaiement,
            s.MontantRecu, 
            s.MonnaieRendue, s.Statut,
            s.Items.Select(i => new SaleItemResponse(
                i.Id, 
                i.VariantId,
                i.Variant?.Product?.Nom ?? "",
                i.Variant?.GetLabel() is { Length: > 0 } l ? l : null,
                i.Quantite,
                i.PrixUnitaire, 
                i.RemisePct, 
                i.SousTotal)).ToList(),
            s.Date);
    }
}
