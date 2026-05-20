namespace SamaBoutique.Server.Models.DTOs
{
    public record KpisResponse(
    decimal CaJour,
    decimal CaSemaine,
    decimal CaMois,
    decimal CaAnnee,
    int NbVentesJour,
    int NbVentesMois,
    decimal PanierMoyen,
    int ProduitsEnAlerte,
    int ProduitsEnRupture,
    int NbClientsActifs,
    decimal EvolutionCaPct,
    decimal EvolutionVentesPct
);

    public record TopProductResponse(
        Guid Id,
        string Nom,
        string CategoryNom,
        int QtéVendue,
        decimal CaGenere,
        decimal Marge
    );

    public record TopClientResponse(
        Guid Id,
        string Nom,
        string? Email,
        string Segment,
        int NbAchats,
        decimal TotalDepense,
        int PointsFidelite
    );

    public record SalesChartResponse(
        string Periode,
        decimal Montant,
        int NbVentes,
        decimal PanierMoyen
    );

    public record PaymentBreakdownResponse(
        string ModePaiement,
        int NbVentes,
        decimal Montant,
        decimal Pourcentage
    );
}
