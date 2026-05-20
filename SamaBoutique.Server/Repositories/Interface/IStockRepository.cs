using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IStockRepository : IRepository<StockMovement>
    {
        Task<(List<StockMovement> Items, int Total)> GetPagedAsync(int page, int pageSize, Guid? variantId, string? type);
        Task<ProductVariant?> GetVariantAsync(Guid variantId);
    }
}
