namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IAnalyticsRepository
    {
        Task<decimal> GetCaAsync(DateTime from, DateTime to);
        Task<int> GetNbVentesAsync(DateTime from, DateTime to);
        Task<int> GetNbClientsActifsAsync(DateTime from, DateTime to);
        Task<int> GetNbProduitsEnRuptureAsync();
        Task<int> GetNbProduitsEnAlerteAsync();
        Task<List<(Guid ProductId, string Nom, string Category, int Qte, decimal Ca, decimal Marge)>> GetTopProductsAsync(int top, DateTime? from, DateTime? to);
        Task<List<(Guid ClientId, string Nom, string? Email, string Segment, int NbAchats, decimal Total, int Points)>> GetTopClientsAsync(int top);
        Task<List<(string Periode, decimal Montant, int NbVentes)>> GetSalesChartAsync(string periode);
        Task<List<(string Mode, int NbVentes, decimal Montant)>> GetPaymentBreakdownAsync(DateTime from, DateTime to);
    }
}
