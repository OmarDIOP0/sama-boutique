namespace SamaBoutique.Server.Models.DTOs
{
    public record ProductCreateRequest(
    string Nom,
    string? Description,
    string? CodeBarres,
    Guid CategoryId,
    decimal PrixAchat,
    decimal PrixVente,
    string Statut,
    List<VariantCreateRequest> Variants
);

    public record ProductUpdateRequest(
        string Nom,
        string? Description,
        string? CodeBarres,
        Guid CategoryId,
        decimal PrixAchat,
        decimal PrixVente,
        string Statut
    );

    public record VariantCreateRequest(
        string? Taille,
        string? Couleur,
        int StockActuel,
        int StockMinimum,
        decimal? PrixOverride
    );

    public record VariantUpdateRequest(
        Guid Id,
        string? Taille,
        string? Couleur,
        int StockMinimum,
        decimal? PrixOverride
    );

    public record ProductResponse(
        Guid Id,
        string Nom,
        string? Description,
        string? CodeBarres,
        Guid CategoryId,
        string CategoryNom,
        decimal PrixAchat,
        decimal PrixVente,
        decimal Marge,
        string Statut,
        List<string> Photos,
        List<VariantResponse> Variants,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public record VariantResponse(
        Guid Id,
        string? Taille,
        string? Couleur,
        int StockActuel,
        int StockMinimum,
        decimal Prix,
        bool IsStockCritical,
        bool IsRupture
    );

    public record CategoryCreateRequest(string Nom, Guid? ParentId, int Ordre);

    public record CategoryResponse(
        Guid Id,
        string Nom,
        Guid? ParentId,
        string? ParentNom,
        int Ordre,
        int NbProduits,
        List<CategoryResponse> SubCategories
    );

    public record StockAlertResponse(
        Guid VariantId,
        Guid ProductId,
        string ProductNom,
        string? Variante,
        int StockActuel,
        int StockMinimum,
        string NiveauAlerte // "Critique" | "Rupture"
    );
}
