using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public abstract class BaseRepository<T> : IRepository<T> where T : class
    {
        protected readonly AppDbContext _db;
        protected BaseRepository(AppDbContext db) => _db = db;
        public virtual async Task<T?> GetByIdAsync(Guid id) => await _db.Set<T>().FindAsync(id);
        public virtual async Task<IEnumerable<T>> GetAllAsync() => await _db.Set<T>().ToListAsync();
        public virtual async Task<T> AddAsync(T entity) { await _db.Set<T>().AddAsync(entity); return entity; }
        public virtual Task UpdateAsync(T entity) { _db.Set<T>().Update(entity); return Task.CompletedTask; }
        public virtual Task DeleteAsync(T entity) { _db.Set<T>().Remove(entity); return Task.CompletedTask; }
        public virtual async Task<bool> ExistsAsync(Guid id) => await _db.Set<T>().FindAsync(id) != null;
        public virtual async Task<int> SaveChangesAsync() => await _db.SaveChangesAsync();
    }
}
