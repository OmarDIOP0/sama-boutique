using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByTelephoneAsync(string telephone);
        Task<User?> GetWithRoleAsync(Guid id);
        Task<bool> EmailExistsAsync(string email);
    }
}
