namespace SamaBoutique.Server.Models.Entities
{
    public class ProductVariant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public string? Taille { get; set; }
        public string? Couleur { get; set; }
        public int StockActuel { get; set; } = 0;
        public int StockMinimum { get; set; } = 5;
        public decimal? PrixOverride { get; set; }
        public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
        public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public bool IsStockCritical() => StockActuel <= StockMinimum;
        public bool IsRupture() => StockActuel == 0;
        public decimal GetPrix() => PrixOverride ?? Product?.PrixVente ?? 0;
        public string GetLabel() => $"{Taille} {Couleur}".Trim();
    }
}
