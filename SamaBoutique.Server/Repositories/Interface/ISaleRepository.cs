using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface ISaleRepository : IRepository<Sale>
    {
        Task<(List<Sale> Items, int Total)> GetPagedAsync(int page, int pageSize, DateTime? from, DateTime? to, string? statut);
        Task<Sale?> GetWithItemsAsync(Guid id);
    }
}
