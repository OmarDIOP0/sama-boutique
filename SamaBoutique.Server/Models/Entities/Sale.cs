using System.Net.ServerSentEvents;

namespace SamaBoutique.Server.Models.Entities
{
    public class Sale
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid? ClientId { get; set; }
        public Client? Client { get; set; }
        public decimal TotalHT { get; set; }
        public decimal TotalTTC { get; set; }
        public decimal RemiseGlobale { get; set; } = 0;
        public string ModePaiement { get; set; } = string.Empty; // Espèces, Carte, MobileMoney, Mixte, Crédit
        public decimal MontantRecu { get; set; }
        public decimal MonnaieRendue { get; set; }
        public string Statut { get; set; } = "Complétée"; // Complétée, Annulée, Remboursée
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
        public LoyaltyTransaction? LoyaltyTransaction { get; set; }
    }
    public class SaleItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SaleId { get; set; }
        public Sale Sale { get; set; } = null!;
        public Guid VariantId { get; set; }
        public ProductVariant Variant { get; set; } = null!;
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal RemisePct { get; set; } = 0;
        public decimal SousTotal { get; set; }
    }
}
