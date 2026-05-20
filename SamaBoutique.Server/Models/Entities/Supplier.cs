namespace SamaBoutique.Server.Models.Entities
{
    public class Supplier
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string? Contact { get; set; }
        public string? Email { get; set; }
        public string? Telephone { get; set; }
        public string? ConditionsPaiement { get; set; }
        public decimal SoldeDette { get; set; } = 0;
        public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    }

    public class PurchaseOrder
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;
        public string Statut { get; set; } = "EnAttente"; // EnAttente, Confirmée, Livrée, Annulée
        public decimal MontantTotal { get; set; }
        public DateTime DateCommande { get; set; } = DateTime.UtcNow;
        public DateTime? DateLivraisonPrevue { get; set; }
        public DateTime? DateLivraisonReelle { get; set; }
        public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }

    public class PurchaseOrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PurchaseOrderId { get; set; }
        public PurchaseOrder PurchaseOrder { get; set; } = null!;
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public int QuantiteCommandee { get; set; }
        public int QuantiteRecue { get; set; } = 0;
        public decimal PrixAchatUnitaire { get; set; }
    }

}
