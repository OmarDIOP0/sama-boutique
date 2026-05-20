using System.Data;

namespace SamaBoutique.Server.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty; 
        public string PasswordHash { get; set; } = string.Empty;
        public Guid RoleId { get; set; }
        public Role Role { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public bool TwoFaEnabled { get; set; } = false;
        public string? TwoFaSecret { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockedUntil { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public Employee? Employee { get; set; }
        public ICollection<Sale> Sales { get; set; } = new List<Sale>();
        public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        public bool IsLocked() => LockedUntil.HasValue && LockedUntil > DateTime.UtcNow;
    }
}
