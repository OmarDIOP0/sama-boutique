namespace SamaBoutique.Server.Models.DTOs
{
    /// <summary>Clés renvoyées par le PushManager du navigateur.</summary>
    public record PushKeys(string P256dh, string Auth);

    /// <summary>Corps d'abonnement envoyé par le client.</summary>
    public record PushSubscriptionRequest(
        string Endpoint,
        PushKeys Keys,
        string? UserAgent = null,
        bool NotifyOrders = true,
        bool NotifyPromotions = true,
        bool NotifyStock = true);

    /// <summary>Mise à jour des préférences de notification.</summary>
    public record PushPreferencesRequest(
        bool NotifyOrders,
        bool NotifyPromotions,
        bool NotifyStock);

    /// <summary>État de l'abonnement courant (par appareil ou agrégé utilisateur).</summary>
    public record PushPreferencesResponse(
        bool Subscribed,
        bool NotifyOrders,
        bool NotifyPromotions,
        bool NotifyStock);
}
