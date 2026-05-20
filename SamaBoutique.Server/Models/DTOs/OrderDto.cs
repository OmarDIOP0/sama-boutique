namespace SamaBoutique.Server.Models.DTOs
{
    public record OrderCreateRequest(
    Guid ClientId,
    string? AdresseLivraison,
    string? ModePaiement,
    List<OrderItemRequest> Items
);

    public record OrderItemRequest(
        Guid VariantId,
        int Quantite,
        decimal PrixUnitaire
    );

    public record OrderStatusRequest(string Statut);

    public record OrderResponse(
        Guid Id,
        Guid ClientId,
        string ClientNom,
        string Statut,
        decimal TotalHT,
        decimal TotalTTC,
        string? AdresseLivraison,
        string? ModePaiement,
        string? NumeroFacture,
        List<OrderItemResponse> Items,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public record OrderItemResponse(
        Guid Id,
        Guid VariantId,
        string ProductNom,
        string? Variante,
        int Quantite,
        decimal PrixUnitaire,
        decimal SousTotal
    );
}
