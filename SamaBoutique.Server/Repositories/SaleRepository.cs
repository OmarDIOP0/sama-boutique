using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class SaleRepository : BaseRepository<Sale>, ISaleRepository
    {
        public SaleRepository(AppDbContext db) : base(db) { }

        public async Task<(List<Sale> Items, int Total)> GetPagedAsync(int page, int pageSize, DateTime? from, DateTime? to, string? statut, string? modePaiement = null, Guid? userId = null)
        {
            var q = _db.Sales.Include(s => s.User).Include(s => s.Client)
                .Include(s => s.Items).ThenInclude(i => i.Variant).ThenInclude(v => v.Product)
                .OrderByDescending(s => s.Date).AsQueryable();

            if (from.HasValue) q = q.Where(s => s.Date >= from.Value);
            if (to.HasValue) q = q.Where(s => s.Date <= to.Value);
            if (!string.IsNullOrWhiteSpace(statut)) q = q.Where(s => s.Statut == statut);
            if (!string.IsNullOrWhiteSpace(modePaiement)) q = q.Where(s => s.ModePaiement == modePaiement);
            if (userId.HasValue) q = q.Where(s => s.UserId == userId.Value);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<Sale?> GetWithItemsAsync(Guid id)
            => await _db.Sales.Include(s => s.User).Include(s => s.Client)
                .Include(s => s.Items).ThenInclude(i => i.Variant).ThenInclude(v => v.Product)
                .FirstOrDefaultAsync(s => s.Id == id);
    }
}
