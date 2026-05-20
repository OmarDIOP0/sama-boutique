namespace SamaBoutique.Server.Models.DTOs
{
    public record ClientCreateRequest(
    string Nom,
    string? Email,
    string? Telephone,
    string? Adresse,
    DateTime? DateNaissance
);

    public record ClientUpdateRequest(
        string Nom,
        string? Email,
        string? Telephone,
        string? Adresse,
        DateTime? DateNaissance
    );

    public record ClientResponse(
        Guid Id,
        string Nom,
        string? Email,
        string? Telephone,
        string? Adresse,
        int PointsFidelite,
        string Segment,
        decimal SoldeCredit,
        int NbCommandes,
        int NbAchats,
        decimal TotalDepense,
        DateTime CreatedAt
    );
}
