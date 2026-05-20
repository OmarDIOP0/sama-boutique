using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface IRefreshTokenRepository : IRepository<RefreshToken>
    {
        Task<RefreshToken?> GetActiveTokenAsync(string token);
        Task RevokeAllUserTokensAsync(Guid userId, string ip);
    }
}
