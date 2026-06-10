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

            // ── Backfill : fiches Client manquantes ──────────────────────────────
            // Les comptes clients enregistrés avant la correction n'avaient pas de
            // fiche Client (Id = User.Id) : ils étaient invisibles côté admin et ne
            // pouvaient pas commander. On les recrée ici.
            {
                var clientRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");
                var existingClientIds = (await db.Clients.Select(c => c.Id).ToListAsync()).ToHashSet();
                var clientUsers = await db.Users.Where(u => u.RoleId == clientRoleId).ToListAsync();
                var missing = clientUsers.Where(u => !existingClientIds.Contains(u.Id)).ToList();
                if (missing.Count > 0)
                {
                    foreach (var u in missing)
                    {
                        db.Clients.Add(new Client
                        {
                            Id = u.Id,
                            Nom = u.Nom,
                            Email = u.Email,
                            Telephone = string.IsNullOrWhiteSpace(u.Telephone) ? null : u.Telephone,
                            Segment = "Nouveau",
                            CreatedAt = u.CreatedAt,
                        });
                    }
                    await db.SaveChangesAsync();
                }
            }

            // ── Seed : zones de livraison (vraies données sénégalaises) ──────────
            if (!await db.DeliveryZones.AnyAsync())
            {
                db.DeliveryZones.AddRange(
                    new DeliveryZone { Nom = "Dakar Centre", Region = "Dakar", Tarif = 1500, DelaiMinH = 2, DelaiMaxH = 4, Ordre = 1,
                        Communes = "[\"Plateau\",\"Médina\",\"Fann\",\"Point E\",\"Amitié\",\"Mermoz\",\"Sacré-Cœur\",\"Liberté\",\"Grand Dakar\",\"HLM\"]" },
                    new DeliveryZone { Nom = "Dakar Ouest", Region = "Dakar", Tarif = 2000, DelaiMinH = 3, DelaiMaxH = 6, Ordre = 2,
                        Communes = "[\"Almadies\",\"Ngor\",\"Ouakam\",\"Yoff\",\"Parcelles Assainies\",\"Cambérène\"]" },
                    new DeliveryZone { Nom = "Dakar Est", Region = "Dakar", Tarif = 2500, DelaiMinH = 4, DelaiMaxH = 8, Ordre = 3,
                        Communes = "[\"Pikine\",\"Guédiawaye\",\"Thiaroye\",\"Keur Massar\",\"Yeumbeul\",\"Malika\",\"Dalifort\",\"Mbao\"]" },
                    new DeliveryZone { Nom = "Banlieue Sud", Region = "Dakar", Tarif = 3500, DelaiMinH = 24, DelaiMaxH = 48, Ordre = 4,
                        Communes = "[\"Rufisque\",\"Bargny\",\"Diamniadio\",\"Sébikotane\",\"Sangalkam\"]" },
                    new DeliveryZone { Nom = "Thiès & environs", Region = "Thiès", Tarif = 5000, DelaiMinH = 24, DelaiMaxH = 72, Ordre = 5,
                        Communes = "[\"Thiès\",\"Tivaouane\",\"Mbour\",\"Joal-Fadiouth\",\"Saly\"]" },
                    new DeliveryZone { Nom = "Autres régions Sénégal", Region = "National", Tarif = 7000, DelaiMinH = 48, DelaiMaxH = 120, Ordre = 6,
                        Communes = "[\"Saint-Louis\",\"Ziguinchor\",\"Kaolack\",\"Tambacounda\",\"Kolda\",\"Louga\",\"Matam\",\"Fatick\",\"Kaffrine\",\"Kédougou\",\"Sédhiou\",\"Diourbel\"]" },
                    new DeliveryZone { Nom = "Retrait boutique", Region = "Dakar", Tarif = 0, DelaiMinH = 0, DelaiMaxH = 0, Ordre = 0,
                        Description = "Retirez votre commande directement en boutique (gratuit)", Communes = "[]" }
                );
                await db.SaveChangesAsync();
            }
        }
    }
}
