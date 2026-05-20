using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            // Applique les migrations en attente
            await db.Database.MigrateAsync();

            // Seed admin uniquement s'il n'existe pas
            if (!await db.Users.AnyAsync(u => u.Email == "admin@samaboutique.com"))
            {
                var superAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");

                db.Users.Add(new User
                {
                    Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    Nom = "Super Admin",
                    Email = "admin@samaboutique.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@2025!"),
                    RoleId = superAdminRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
            }
        }
    }
}
