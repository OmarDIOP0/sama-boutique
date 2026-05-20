using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<(List<Product> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search, string? statut, Guid? categoryId);
        Task<Product?> GetWithVariantsAsync(Guid id);
        Task<Product?> GetByBarcodeAsync(string barcode);
        Task<List<ProductVariant>> GetStockAlertsAsync();
        Task<bool> BarcodeExistsAsync(string barcode, Guid? excludeId = null);
    }
}
