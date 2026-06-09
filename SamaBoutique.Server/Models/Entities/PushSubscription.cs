namespace SamaBoutique.Server.Models.Entities
{
    /// <summary>
    /// Abonnement Web Push d'un appareil (navigateur) rattaché à un utilisateur.
    /// Les préférences sont stockées au niveau de l'appareil.
    /// </summary>
    public class PushSubscription
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public string Endpoint { get; set; } = string.Empty;   // unique
        public string P256dh { get; set; } = string.Empty;     // clé publique du client
        public string Auth { get; set; } = string.Empty;       // secret d'authentification

        public bool IsAdmin { get; set; }                       // appareil d'un membre du staff
        public string? UserAgent { get; set; }

        // Préférences (catégories)
        public bool NotifyOrders { get; set; } = true;          // commandes (admin: nouvelles / client: ses statuts)
        public bool NotifyPromotions { get; set; } = true;      // promotions (client)
        public bool NotifyStock { get; set; } = true;           // alertes stock (admin)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
