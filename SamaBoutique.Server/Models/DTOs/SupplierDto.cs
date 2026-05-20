namespace SamaBoutique.Server.Models.DTOs
{
    public record SupplierCreateRequest(
      string Nom,
      string? Contact,
      string? Email,
      string? Telephone,
      string? ConditionsPaiement
  );

    public record SupplierUpdateRequest(
        string Nom,
        string? Contact,
        string? Email,
        string? Telephone,
        string? ConditionsPaiement
    );

    public record SupplierResponse(
        Guid Id,
        string Nom,
        string? Contact,
        string? Email,
        string? Telephone,
        string? ConditionsPaiement,
        decimal SoldeDette,
        int NbCommandes
    );
}
