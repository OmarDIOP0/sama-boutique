using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class ClientRepository : BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(AppDbContext db) : base(db) { }

        public async Task<(List<Client> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search, string? segment)
        {
            var q = _db.Clients.Include(c => c.Sales).Include(c => c.Orders).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(c => c.Nom.Contains(search) || (c.Email != null && c.Email.Contains(search)) || (c.Telephone != null && c.Telephone.Contains(search)));
            if (!string.IsNullOrWhiteSpace(segment))
                q = q.Where(c => c.Segment == segment);

            var total = await q.CountAsync();
            var items = await q.OrderBy(c => c.Nom).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<Client?> GetWithHistoryAsync(Guid id)
            => await _db.Clients.Include(c => c.Sales).ThenInclude(s => s.Items)
                .Include(c => c.Orders).Include(c => c.LoyaltyTransactions)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Client?> GetByEmailAsync(string email)
            => await _db.Clients.FirstOrDefaultAsync(c => c.Email == email);

        public async Task<bool> EmailExistsAsync(string email, Guid? excludeId = null)
            => await _db.Clients.AnyAsync(c => c.Email == email && (!excludeId.HasValue || c.Id != excludeId.Value));
    }
}
