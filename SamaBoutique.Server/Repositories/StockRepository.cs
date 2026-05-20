using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class StockRepository : BaseRepository<StockMovement>, IStockRepository
    {
        public StockRepository(AppDbContext db) : base(db) { }

        public async Task<(List<StockMovement> Items, int Total)> GetPagedAsync(int page, int pageSize, Guid? variantId, string? type)
        {
            var q = _db.StockMovements
                .Include(sm => sm.Variant).ThenInclude(v => v.Product)
                .Include(sm => sm.User)
                .OrderByDescending(sm => sm.Date).AsQueryable();

            if (variantId.HasValue) q = q.Where(sm => sm.VariantId == variantId.Value);
            if (!string.IsNullOrWhiteSpace(type)) q = q.Where(sm => sm.Type == type);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<ProductVariant?> GetVariantAsync(Guid variantId)
            => await _db.ProductVariants.Include(v => v.Product).FirstOrDefaultAsync(v => v.Id == variantId);
    }
}
