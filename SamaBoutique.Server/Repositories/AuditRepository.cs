using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class AuditRepository : IAuditRepository
    {
        private readonly AppDbContext _db;
        public AuditRepository(AppDbContext db) => _db = db;

        public async Task AddAsync(AuditLog log) => await _db.AuditLogs.AddAsync(log);
        public async Task SaveAsync() => await _db.SaveChangesAsync();
    }
}
