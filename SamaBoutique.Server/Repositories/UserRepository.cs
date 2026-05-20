using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext db) : base(db) { }

        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email.ToLower());
        public async Task<User?> GetByTelephoneAsync(string telephone)
            => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Telephone == telephone.ToLower());

        public async Task<User?> GetWithRoleAsync(Guid id)
            => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

        public async Task<bool> EmailExistsAsync(string email)
            => await _db.Users.AnyAsync(u => u.Email == email.ToLower());
    }
}
