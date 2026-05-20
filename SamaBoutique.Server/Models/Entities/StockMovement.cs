namespace SamaBoutique.Server.Models.Entities
{
    public class StockMovement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid VariantId { get; set; }
        public ProductVariant Variant { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Type { get; set; } = string.Empty; // Entrée, Sortie, Ajustement, Vente, Retour
        public int Quantite { get; set; }
        public int StockAvant { get; set; }
        public int StockApres { get; set; }
        public string? Motif { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
