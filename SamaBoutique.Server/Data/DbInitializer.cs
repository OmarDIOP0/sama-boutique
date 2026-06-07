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

            // ── Seed : Super Admin ────────────────────────────────────────────
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

            // ── Seed : Client de test ─────────────────────────────────────────
            if (!await db.Users.AnyAsync(u => u.Email == "client@samaboutique.com"))
            {
                var clientRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");

                // Compte utilisateur (pour la connexion)
                db.Users.Add(new User
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                    Nom = "Client Test",
                    Email = "client@samaboutique.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Client@2025!"),
                    RoleId = clientRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
            }

            // Fiche client — même ID que le User pour simplifier la liaison
            if (!await db.Clients.AnyAsync(c => c.Email == "client@samaboutique.com"))
            {
                db.Clients.Add(new Client
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), // = User.Id
                    Nom = "Client Test",
                    Email = "client@samaboutique.com",
                    Telephone = "+221770000000",
                    Adresse = "Dakar, Sénégal",
                    Segment = "Nouveau",
                    PointsFidelite = 0,
                    SoldeCredit = 0,
                    CreatedAt = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
            }
        }
    }
}
