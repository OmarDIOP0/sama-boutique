using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class RefreshTokenRepository : BaseRepository<RefreshToken>, IRefreshTokenRepository 
    {
        public RefreshTokenRepository(AppDbContext db) : base(db) { }

        public async Task<RefreshToken?> GetActiveTokenAsync(string token)
            => await _db.RefreshTokens
                .Include(r => r.User).ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(r => r.Token == token && !r.RevokedAt.HasValue && r.ExpiresAt > DateTime.UtcNow);

        public async Task RevokeAllUserTokensAsync(Guid userId, string ip)
        {
            var tokens = await _db.RefreshTokens.Where(r => r.UserId == userId && !r.RevokedAt.HasValue).ToListAsync();
            foreach (var t in tokens) { t.RevokedAt = DateTime.UtcNow; t.RevokedByIp = ip; }
        }
    }
}
