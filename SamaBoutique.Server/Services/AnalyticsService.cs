using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IAnalyticsRepository _repo;

        public AnalyticsService(IAnalyticsRepository repo) => _repo = repo;

        public async Task<KpisResponse> GetKpisAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var week = today.AddDays(-7);
            var month = new DateTime(now.Year, now.Month, 1);
            var year = new DateTime(now.Year, 1, 1);
            var prevMonth = month.AddMonths(-1);

            var caJour = await _repo.GetCaAsync(today, now);
            var caSemaine = await _repo.GetCaAsync(week, now);
            var caMois = await _repo.GetCaAsync(month, now);
            var caAnnee = await _repo.GetCaAsync(year, now);
            var caMoisPrec = await _repo.GetCaAsync(prevMonth, month);

            var nbJour = await _repo.GetNbVentesAsync(today, now);
            var nbMois = await _repo.GetNbVentesAsync(month, now);
            var nbMoisPrec = await _repo.GetNbVentesAsync(prevMonth, month);

            var panier = nbMois > 0 ? Math.Round(caMois / nbMois, 2) : 0;
            var evoCa = caMoisPrec > 0 ? Math.Round((caMois - caMoisPrec) / caMoisPrec * 100, 2) : 0;
            var evoVentes = nbMoisPrec > 0 ? Math.Round((decimal)(nbMois - nbMoisPrec) / nbMoisPrec * 100, 2) : 0;

            return new KpisResponse(caJour, caSemaine, caMois, caAnnee, nbJour, nbMois, panier, 0, 0, 0, evoCa, evoVentes);
        }

        public async Task<List<TopProductResponse>> GetTopProductsAsync(int top, DateTime? from, DateTime? to)
        {
            var data = await _repo.GetTopProductsAsync(top, from, to);
            return data.Select(x => new TopProductResponse(x.Item1, x.Item2, x.Item3, x.Item4, x.Item5, x.Item6)).ToList();
        }

        public async Task<List<TopClientResponse>> GetTopClientsAsync(int top)
        {
            var data = await _repo.GetTopClientsAsync(top);
            return data.Select(x => new TopClientResponse(x.Item1, x.Item2, x.Item3, x.Item4, x.Item5, x.Item6, x.Item7)).ToList();
        }

        public async Task<List<SalesChartResponse>> GetSalesChartAsync(string periode)
        {
            var data = await _repo.GetSalesChartAsync(periode);
            return data.Select(x => new SalesChartResponse(x.Item1, x.Item2, x.Item3, x.Item3 > 0 ? Math.Round(x.Item2 / x.Item3, 2) : 0)).ToList();
        }

        public async Task<List<PaymentBreakdownResponse>> GetPaymentBreakdownAsync(DateTime from, DateTime to)
        {
            var data = await _repo.GetPaymentBreakdownAsync(from, to);
            var total = data.Sum(x => x.Item3);
            return data.Select(x => new PaymentBreakdownResponse(x.Item1, x.Item2, x.Item3,
                total > 0 ? Math.Round(x.Item3 / total * 100, 2) : 0)).ToList();
        }
    }
}
