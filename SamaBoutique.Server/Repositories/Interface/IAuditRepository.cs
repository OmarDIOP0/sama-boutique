using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IAuditRepository
    {
        Task AddAsync(AuditLog log);
        Task SaveAsync();
    }
}
