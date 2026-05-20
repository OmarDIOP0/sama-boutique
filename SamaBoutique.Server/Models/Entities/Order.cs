namespace SamaBoutique.Server.Models.Entities
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;
        public string Statut { get; set; } = "EnAttente"; // EnAttente, Confirmee, EnPreparation, Expediee, Livree, Annulee, Retournee
        public decimal TotalHT { get; set; }
        public decimal TotalTTC { get; set; }
        public string? AdresseLivraison { get; set; }
        public string? ModePaiement { get; set; }
        public string? NumeroFacture { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public Guid VariantId { get; set; }
        public ProductVariant Variant { get; set; } = null!;
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal SousTotal { get; set; }
    }

}
