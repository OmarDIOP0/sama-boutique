namespace SamaBoutique.Server.Models.Entities
{
    public class LoyaltyTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;
        public Guid? SaleId { get; set; }
        public Sale? Sale { get; set; }
        public int Points { get; set; }
        public string Type { get; set; } = string.Empty; // Gain, Rachat, Expiration
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Module { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
