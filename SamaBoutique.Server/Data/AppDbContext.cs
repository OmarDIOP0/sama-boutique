using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<StockMovement> StockMovements => Set<StockMovement>();
        public DbSet<Sale> Sales => Set<Sale>();
        public DbSet<SaleItem> SaleItems => Set<SaleItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
        public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
        public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<DeliveryZone> DeliveryZones => Set<DeliveryZone>();
        public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

            // ── Role ──────────────────────────────────────────
            mb.Entity<Role>(e =>
            {
                e.HasKey(r => r.Id);
                e.Property(r => r.Nom).IsRequired().HasMaxLength(50);
                e.HasIndex(r => r.Nom).IsUnique();
            });

            // ── User ──────────────────────────────────────────
            mb.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.Property(u => u.Nom).IsRequired().HasMaxLength(200);
                e.Property(u => u.Email).IsRequired().HasMaxLength(200);
                e.HasIndex(u => u.Email).IsUnique();
                e.HasOne(u => u.Role).WithMany(r => r.Users)
                 .HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── RefreshToken ───────────────────────────────────
            mb.Entity<RefreshToken>(e =>
            {
                e.HasKey(r => r.Id);
                e.HasIndex(r => r.Token).IsUnique();
                e.HasOne(r => r.User).WithMany(u => u.RefreshTokens)
                 .HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            // ── Employee ──────────────────────────────────────
            mb.Entity<Employee>(e =>
            {
                e.HasKey(emp => emp.Id);
                e.Property(emp => emp.CommissionPct).HasColumnType("decimal(5,2)");
                e.HasOne(emp => emp.User).WithOne(u => u.Employee)
                 .HasForeignKey<Employee>(emp => emp.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            // ── Client ────────────────────────────────────────
            mb.Entity<Client>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Nom).IsRequired().HasMaxLength(200);
                e.Property(c => c.SoldeCredit).HasColumnType("decimal(18,2)");
            });

            // ── Category ──────────────────────────────────────
            mb.Entity<Category>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Nom).IsRequired().HasMaxLength(100);
                e.HasOne(c => c.Parent).WithMany(c => c.SubCategories)
                 .HasForeignKey(c => c.ParentId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── Product ───────────────────────────────────────
            mb.Entity<Product>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.Nom).IsRequired().HasMaxLength(200);
                e.Property(p => p.PrixAchat).HasColumnType("decimal(18,2)");
                e.Property(p => p.PrixVente).HasColumnType("decimal(18,2)");
                e.Property(p => p.PrixPromo).HasColumnType("decimal(18,2)");
                e.HasIndex(p => p.CodeBarres).IsUnique().HasFilter("[CodeBarres] IS NOT NULL");
                e.HasOne(p => p.Category).WithMany(c => c.Products)
                 .HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── ProductVariant ────────────────────────────────
            mb.Entity<ProductVariant>(e =>
            {
                e.HasKey(pv => pv.Id);
                e.Property(pv => pv.PrixOverride).HasColumnType("decimal(18,2)");
                e.HasOne(pv => pv.Product).WithMany(p => p.Variants)
                 .HasForeignKey(pv => pv.ProductId).OnDelete(DeleteBehavior.Cascade);
            });

            // ── StockMovement ─────────────────────────────────
            mb.Entity<StockMovement>(e =>
            {
                e.HasKey(sm => sm.Id);
                e.HasOne(sm => sm.Variant).WithMany(pv => pv.StockMovements)
                 .HasForeignKey(sm => sm.VariantId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(sm => sm.User).WithMany(u => u.StockMovements)
                 .HasForeignKey(sm => sm.UserId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── Sale ──────────────────────────────────────────
            mb.Entity<Sale>(e =>
            {
                e.HasKey(s => s.Id);
                e.Property(s => s.TotalHT).HasColumnType("decimal(18,2)");
                e.Property(s => s.TotalTTC).HasColumnType("decimal(18,2)");
                e.Property(s => s.RemiseGlobale).HasColumnType("decimal(18,2)");
                e.Property(s => s.MontantRecu).HasColumnType("decimal(18,2)");
                e.Property(s => s.MonnaieRendue).HasColumnType("decimal(18,2)");
                e.HasOne(s => s.User).WithMany(u => u.Sales)
                 .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(s => s.Client).WithMany(c => c.Sales)
                 .HasForeignKey(s => s.ClientId).OnDelete(DeleteBehavior.SetNull);
            });

            // ── SaleItem ──────────────────────────────────────
            mb.Entity<SaleItem>(e =>
            {
                e.HasKey(si => si.Id);
                e.Property(si => si.PrixUnitaire).HasColumnType("decimal(18,2)");
                e.Property(si => si.RemisePct).HasColumnType("decimal(5,2)");
                e.Property(si => si.SousTotal).HasColumnType("decimal(18,2)");
                e.HasOne(si => si.Sale).WithMany(s => s.Items)
                 .HasForeignKey(si => si.SaleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(si => si.Variant).WithMany(pv => pv.SaleItems)
                 .HasForeignKey(si => si.VariantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── Order ─────────────────────────────────────────
            mb.Entity<Order>(e =>
            {
                e.HasKey(o => o.Id);
                e.Property(o => o.TotalHT).HasColumnType("decimal(18,2)");
                e.Property(o => o.TotalTTC).HasColumnType("decimal(18,2)");
                e.HasOne(o => o.Client).WithMany(c => c.Orders)
                 .HasForeignKey(o => o.ClientId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── OrderItem ─────────────────────────────────────
            mb.Entity<OrderItem>(e =>
            {
                e.HasKey(oi => oi.Id);
                e.Property(oi => oi.PrixUnitaire).HasColumnType("decimal(18,2)");
                e.Property(oi => oi.SousTotal).HasColumnType("decimal(18,2)");
                e.HasOne(oi => oi.Order).WithMany(o => o.Items)
                 .HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(oi => oi.Variant).WithMany(pv => pv.OrderItems)
                 .HasForeignKey(oi => oi.VariantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── Supplier ──────────────────────────────────────
            mb.Entity<Supplier>(e =>
            {
                e.HasKey(s => s.Id);
                e.Property(s => s.Nom).IsRequired().HasMaxLength(200);
                e.Property(s => s.SoldeDette).HasColumnType("decimal(18,2)");
            });

            // ── PurchaseOrder ─────────────────────────────────
            mb.Entity<PurchaseOrder>(e =>
            {
                e.HasKey(po => po.Id);
                e.Property(po => po.MontantTotal).HasColumnType("decimal(18,2)");
                e.HasOne(po => po.Supplier).WithMany(s => s.PurchaseOrders)
                 .HasForeignKey(po => po.SupplierId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── PurchaseOrderItem ─────────────────────────────
            mb.Entity<PurchaseOrderItem>(e =>
            {
                e.HasKey(poi => poi.Id);
                e.Property(poi => poi.PrixAchatUnitaire).HasColumnType("decimal(18,2)");
                e.HasOne(poi => poi.PurchaseOrder).WithMany(po => po.Items)
                 .HasForeignKey(poi => poi.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(poi => poi.Product).WithMany(p => p.PurchaseOrderItems)
                 .HasForeignKey(poi => poi.ProductId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── LoyaltyTransaction ────────────────────────────
            mb.Entity<LoyaltyTransaction>(e =>
            {
                e.HasKey(lt => lt.Id);
                e.HasOne(lt => lt.Client).WithMany(c => c.LoyaltyTransactions)
                 .HasForeignKey(lt => lt.ClientId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(lt => lt.Sale).WithOne(s => s.LoyaltyTransaction)
                 .HasForeignKey<LoyaltyTransaction>(lt => lt.SaleId).OnDelete(DeleteBehavior.SetNull);
            });

            // ── AuditLog ──────────────────────────────────────
            mb.Entity<AuditLog>(e =>
            {
                e.HasKey(al => al.Id);
                e.HasOne(al => al.User).WithMany(u => u.AuditLogs)
                 .HasForeignKey(al => al.UserId).OnDelete(DeleteBehavior.Restrict);
            });

            // ── DeliveryZone ──────────────────────────────────
            mb.Entity<DeliveryZone>(e =>
            {
                e.HasKey(d => d.Id);
                e.Property(d => d.Nom).IsRequired().HasMaxLength(150);
                e.Property(d => d.Tarif).HasColumnType("decimal(18,2)");
                e.Property(d => d.FreeFrom).HasColumnType("decimal(18,2)");
            });

            // ── PushSubscription ──────────────────────────────
            mb.Entity<PushSubscription>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.Endpoint).IsRequired();
                e.HasIndex(p => p.Endpoint).IsUnique();
                e.HasOne(p => p.User)
                 .WithMany()
                 .HasForeignKey(p => p.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            SeedData(mb);
        }

        private static void SeedData(ModelBuilder mb)
        {
            var superAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var adminRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var caissierRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var vendeurRoleId = Guid.Parse("44444444-4444-4444-4444-444444444444");
            var clientRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");

            mb.Entity<Role>().HasData(
                new Role { Id = superAdminRoleId, Nom = "SuperAdmin", Permissions = "[\"*\"]" },
                new Role { Id = adminRoleId, Nom = "Admin", Permissions = "[\"products\",\"stock\",\"sales\",\"clients\",\"orders\",\"reports\",\"suppliers\"]" },
                new Role { Id = caissierRoleId, Nom = "Caissier", Permissions = "[\"pos\",\"stock.read\",\"orders.read\"]" },
                new Role { Id = vendeurRoleId, Nom = "Vendeur", Permissions = "[\"products.read\",\"pos\"]" },
                new Role { Id = clientRoleId, Nom = "Client", Permissions = "[\"orders.own\",\"profile\"]" }
            );
        }
    }
}
