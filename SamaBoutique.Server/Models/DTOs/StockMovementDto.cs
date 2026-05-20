namespace SamaBoutique.Server.Models.DTOs
{
    public record StockMovementRequest(
     Guid VariantId,
     string Type, // Entrée | Sortie | Ajustement
     int Quantite,
     string? Motif
 );

    public record StockMovementResponse(
        Guid Id,
        Guid VariantId,
        string ProductNom,
        string? Variante,
        string Type,
        int Quantite,
        int StockAvant,
        int StockApres,
        string? Motif,
        string UserNom,
        DateTime Date
    );
}
