using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class OrderRepository : BaseRepository<Order>, IOrderRepository
    {
        public OrderRepository(AppDbContext db) : base(db) { }

        public async Task<(List<Order> Items, int Total)> GetPagedAsync(int page, int pageSize, string? statut, Guid? clientId)
        {
            var q = _db.Orders.Include(o => o.Client)
                .Include(o => o.Items).ThenInclude(i => i.Variant).ThenInclude(v => v.Product)
                .OrderByDescending(o => o.CreatedAt).AsQueryable();

            if (!string.IsNullOrWhiteSpace(statut)) q = q.Where(o => o.Statut == statut);
            if (clientId.HasValue) q = q.Where(o => o.ClientId == clientId.Value);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<Order?> GetWithItemsAsync(Guid id)
            => await _db.Orders.Include(o => o.Client)
                .Include(o => o.Items).ThenInclude(i => i.Variant).ThenInclude(v => v.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
    }
}
