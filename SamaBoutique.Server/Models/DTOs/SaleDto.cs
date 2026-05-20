namespace SamaBoutique.Server.Models.DTOs
{
    public record SaleCreateRequest(
      Guid? ClientId,
      decimal RemiseGlobale,
      string ModePaiement,
      decimal MontantRecu,
      List<SaleItemRequest> Items
  );

    public record SaleItemRequest(
        Guid VariantId,
        int Quantite,
        decimal PrixUnitaire,
        decimal RemisePct
    );

    public record SaleResponse(
        Guid Id,
        Guid UserId,
        string UserNom,
        Guid? ClientId,
        string? ClientNom,
        decimal TotalHT,
        decimal TotalTTC,
        decimal RemiseGlobale,
        string ModePaiement,
        decimal MontantRecu,
        decimal MonnaieRendue,
        string Statut,
        List<SaleItemResponse> Items,
        DateTime Date
    );

    public record SaleItemResponse(
        Guid Id,
        Guid VariantId,
        string ProductNom,
        string? Variante,
        int Quantite,
        decimal PrixUnitaire,
        decimal RemisePct,
        decimal SousTotal
    );
}
