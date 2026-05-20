using SamaBoutique.Server.Models.DTOs;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IAnalyticsService
    {
        Task<KpisResponse> GetKpisAsync();
        Task<List<TopProductResponse>> GetTopProductsAsync(int top, DateTime? from, DateTime? to);
        Task<List<TopClientResponse>> GetTopClientsAsync(int top);
        Task<List<SalesChartResponse>> GetSalesChartAsync(string periode);
        Task<List<PaymentBreakdownResponse>> GetPaymentBreakdownAsync(DateTime from, DateTime to);
    }
}
