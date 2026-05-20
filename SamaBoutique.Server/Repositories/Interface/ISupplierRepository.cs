using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface ISupplierRepository : IRepository<Supplier>
    {
        Task<(List<Supplier> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search);
    }
}
