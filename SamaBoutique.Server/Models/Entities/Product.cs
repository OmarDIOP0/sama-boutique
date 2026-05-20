namespace SamaBoutique.Server.Models.Entities
{
    public class Product
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CodeBarres { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public decimal PrixAchat { get; set; }
        public decimal PrixVente { get; set; }
        public string Statut { get; set; } = "Actif"; // Actif, Inactif, Archivé
        public string Photos { get; set; } = "[]";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();

        public decimal GetMarge() => PrixVente > 0 ? Math.Round((PrixVente - PrixAchat) / PrixVente * 100, 2) : 0;
    }
}
