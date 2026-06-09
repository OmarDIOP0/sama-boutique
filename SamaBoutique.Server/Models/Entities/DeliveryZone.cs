namespace SamaBoutique.Server.Models.Entities
{
    public class DeliveryZone
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string? Region { get; set; }
        public string Communes { get; set; } = "[]";   // JSON array des communes couvertes
        public decimal Tarif { get; set; }
        public int DelaiMinH { get; set; } = 24;        // délai min en heures
        public int DelaiMaxH { get; set; } = 48;        // délai max en heures
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public decimal? FreeFrom { get; set; }          // livraison gratuite à partir de ce montant (par zone)
        public int Ordre { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
