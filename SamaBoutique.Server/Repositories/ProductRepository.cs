using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class ProductRepository : BaseRepository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext db) : base(db) { }

        public async Task<(List<Product> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search, string? statut, Guid? categoryId)
        {
            var q = _db.Products.Include(p => p.Category).Include(p => p.Variants)
                .Where(p => p.Statut != "Archivé").AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(p => p.Nom.Contains(search) || (p.CodeBarres != null && p.CodeBarres.Contains(search)));
            if (!string.IsNullOrWhiteSpace(statut))
                q = q.Where(p => p.Statut == statut);
            if (categoryId.HasValue)
                q = q.Where(p => p.CategoryId == categoryId.Value);

            var total = await q.CountAsync();
            var items = await q.OrderBy(p => p.Nom).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<Product?> GetWithVariantsAsync(Guid id)
            => await _db.Products.Include(p => p.Category).Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Product?> GetByBarcodeAsync(string barcode)
            => await _db.Products.Include(p => p.Category).Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.CodeBarres == barcode);

        public async Task<List<ProductVariant>> GetStockAlertsAsync()
            => await _db.ProductVariants.Include(pv => pv.Product)
                .Where(pv => pv.StockActuel <= pv.StockMinimum && pv.Product.Statut == "Actif")
                .OrderBy(pv => pv.StockActuel).ToListAsync();

        public async Task<bool> BarcodeExistsAsync(string barcode, Guid? excludeId = null)
            => await _db.Products.AnyAsync(p => p.CodeBarres == barcode && (!excludeId.HasValue || p.Id != excludeId.Value));
    }
}
