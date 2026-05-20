using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IClientRepository : IRepository<Client>
    {
        Task<(List<Client> Items, int Total)> GetPagedAsync(int page, int pageSize, string? search, string? segment);
        Task<Client?> GetWithHistoryAsync(Guid id);
        Task<Client?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email, Guid? excludeId = null);
    }
}
