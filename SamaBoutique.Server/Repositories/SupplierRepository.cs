using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
    {
        public SupplierRepository(AppDbContext db) : base(db) { }

        public async Task<(List<Supplier> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search)
        {
            var q = _db.Suppliers.Include(s => s.PurchaseOrders).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(s => s.Nom.Contains(search));

            var total = await q.CountAsync();
            var items = await q.OrderBy(s => s.Nom).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }
    }
}
