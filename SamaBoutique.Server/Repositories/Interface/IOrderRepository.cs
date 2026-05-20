using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<(List<Order> Items, int Total)> GetPagedAsync(int page, int pageSize, string? statut, Guid? clientId);
        Task<Order?> GetWithItemsAsync(Guid id);
    }
}
