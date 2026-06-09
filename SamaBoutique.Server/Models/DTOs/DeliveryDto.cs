namespace SamaBoutique.Server.Models.DTOs
{
    public record DeliveryZoneRequest(
        string Nom,
        string? Region,
        List<string> Communes,
        decimal Tarif,
        int DelaiMinH,
        int DelaiMaxH,
        bool IsActive,
        string? Description,
        decimal? FreeFrom,
        int Ordre
    );

    public record DeliveryZoneResponse(
        Guid Id,
        string Nom,
        string? Region,
        List<string> Communes,
        decimal Tarif,
        int DelaiMinH,
        int DelaiMaxH,
        bool IsActive,
        string? Description,
        decimal? FreeFrom,
        int Ordre
    );
}
