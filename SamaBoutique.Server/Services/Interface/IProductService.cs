using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Responses;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IProductService
    {
        Task<PagedResponse<ProductResponse>> GetAllAsync(int page, int pageSize, string? search, string? statut, Guid? categoryId);
        Task<ProductResponse?> GetByIdAsync(Guid id);
        Task<ProductResponse?> GetByBarcodeAsync(string barcode);
        Task<(ProductResponse? Product, string? Error)> CreateAsync(ProductCreateRequest req);
        Task<(ProductResponse? Product, string? Error)> UpdateAsync(Guid id, ProductUpdateRequest req);
        Task<(bool Ok, string? Error)> DeleteAsync(Guid id);
        Task<(int Count, string? Error)> ApplyBulkPromoAsync(BulkPromoRequest req);
        Task<(int Count, string? Error)> RemoveBulkPromoAsync(Guid? categoryId);
        Task<List<StockAlertResponse>> GetStockAlertsAsync();
        Task<List<CategoryResponse>> GetCategoriesAsync();
        Task<(CategoryResponse? Cat, string? Error)> CreateCategoryAsync(CategoryCreateRequest req);
        Task<(CategoryResponse? Cat, string? Error)> UpdateCategoryAsync(Guid id, CategoryCreateRequest req);
        Task<(bool Ok, string? Error)> DeleteCategoryAsync(Guid id);
        Task<(string? Url, string? Error)> AddPhotoAsync(Guid id, IFormFile file);
        Task<(bool Ok, string? Error)> DeletePhotoAsync(Guid id, string photoUrl);
    }
}
