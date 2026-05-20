namespace SamaBoutique.Server.Models.Entities
{
    public class Client
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telephone { get; set; }
        public string? Adresse { get; set; }
        public int PointsFidelite { get; set; } = 0;
        public string Segment { get; set; } = "Nouveau"; // Nouveau, Régulier, VIP, Inactif
        public decimal SoldeCredit { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Sale> Sales { get; set; } = new List<Sale>();
        public ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyTransaction>();
    }
}
