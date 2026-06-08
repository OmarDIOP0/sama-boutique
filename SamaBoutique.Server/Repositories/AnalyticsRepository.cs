using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly AppDbContext _db;
        public AnalyticsRepository(AppDbContext db) => _db = db;

        public async Task<decimal> GetCaAsync(DateTime from, DateTime to)
            => await _db.Sales.Where(s => s.Date >= from && s.Date <= to && s.Statut == "Complétée").SumAsync(s => s.TotalTTC);

        public async Task<int> GetNbVentesAsync(DateTime from, DateTime to)
            => await _db.Sales.CountAsync(s => s.Date >= from && s.Date <= to && s.Statut == "Complétée");

        // Clients distincts ayant acheté sur la période
        public async Task<int> GetNbClientsActifsAsync(DateTime from, DateTime to)
            => await _db.Sales
                .Where(s => s.Date >= from && s.Date <= to && s.Statut == "Complétée" && s.ClientId.HasValue)
                .Select(s => s.ClientId)
                .Distinct()
                .CountAsync();

        // Variantes en rupture (stock = 0)
        public async Task<int> GetNbProduitsEnRuptureAsync()
            => await _db.ProductVariants.CountAsync(v => v.StockActuel == 0);

        // Variantes en alerte (stock <= seuil minimum, mais pas forcément 0)
        public async Task<int> GetNbProduitsEnAlerteAsync()
            => await _db.ProductVariants.CountAsync(v => v.StockActuel <= v.StockMinimum);

        public async Task<List<(Guid, string, string, int, decimal, decimal)>> GetTopProductsAsync(int top, DateTime? from, DateTime? to)
        {
            var q = _db.SaleItems.Include(si => si.Variant).ThenInclude(v => v.Product).ThenInclude(p => p.Category)
                .Where(si => si.Sale.Statut == "Complétée").AsQueryable();
            if (from.HasValue) q = q.Where(si => si.Sale.Date >= from.Value);
            if (to.HasValue) q = q.Where(si => si.Sale.Date <= to.Value);

            return await q.GroupBy(si => new { si.Variant.ProductId, si.Variant.Product.Nom, CatNom = si.Variant.Product.Category.Nom, si.Variant.Product.PrixAchat, si.Variant.Product.PrixVente })
                .Select(g => new { g.Key.ProductId, g.Key.Nom, g.Key.CatNom, Qte = g.Sum(x => x.Quantite), Ca = g.Sum(x => x.SousTotal), g.Key.PrixAchat, g.Key.PrixVente })
                .OrderByDescending(x => x.Qte).Take(top)
                .Select(x => ValueTuple.Create(x.ProductId, x.Nom, x.CatNom, x.Qte, x.Ca, x.PrixVente > 0 ? Math.Round((x.PrixVente - x.PrixAchat) / x.PrixVente * 100, 2) : 0m))
                .ToListAsync();
        }

        public async Task<List<(Guid, string, string?, string, int, decimal, int)>> GetTopClientsAsync(int top)
        {
            var grouped = await _db.Sales
                .Where(s => s.ClientId.HasValue && s.Statut == "Complétée")
                .GroupBy(s => new { s.ClientId, s.Client!.Nom, s.Client.Email, s.Client.Segment, s.Client.PointsFidelite })
                .Select(g => new
                {
                    ClientId = g.Key.ClientId!.Value,
                    Nom = g.Key.Nom,
                    Email = g.Key.Email,
                    Segment = g.Key.Segment,
                    Count = g.Count(),
                    Sum = g.Sum(x => x.TotalTTC),
                    PointsFidelite = g.Key.PointsFidelite
                })
                .OrderByDescending(x => x.Sum)
                .Take(top)
                .ToListAsync();

            return grouped
                .Select(x => (x.ClientId, x.Nom, x.Email, x.Segment, x.Count, x.Sum, x.PointsFidelite))
                .ToList();
        }

        public async Task<List<(string, decimal, int)>> GetSalesChartAsync(string periode)
        {
            if (periode == "monthly")
            {
                // Project raw integers to memory, then format the string in C#
                var monthly = await _db.Sales
                    .Where(s => s.Statut == "Complétée" && s.Date >= DateTime.UtcNow.AddMonths(-12))
                    .GroupBy(s => new { s.Date.Year, s.Date.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(x => x.TotalTTC), Count = g.Count() })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                return monthly
                    .Select(x => ($"{x.Year}-{x.Month:D2}", x.Total, x.Count))
                    .ToList();
            }

            // Daily — same pattern: project raw values from SQL, format in C#
            var daily = await _db.Sales
                .Where(s => s.Statut == "Complétée" && s.Date >= DateTime.UtcNow.AddDays(-30))
                .GroupBy(s => s.Date.Date)
                .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Day = g.Key.Day, Total = g.Sum(x => x.TotalTTC), Count = g.Count() })
                .OrderBy(x => x.Year).ThenBy(x => x.Month).ThenBy(x => x.Day)
                .ToListAsync();

            return daily
                .Select(x => ($"{x.Year}-{x.Month:D2}-{x.Day:D2}", x.Total, x.Count))
                .ToList();
        }

        public async Task<List<(string, int, decimal)>> GetPaymentBreakdownAsync(DateTime from, DateTime to)
            => await _db.Sales.Where(s => s.Date >= from && s.Date <= to && s.Statut == "Complétée")
                .GroupBy(s => s.ModePaiement)
                .Select(g => ValueTuple.Create(g.Key, g.Count(), g.Sum(x => x.TotalTTC)))
                .ToListAsync();
    }
}
