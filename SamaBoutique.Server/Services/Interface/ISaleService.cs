using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Responses;

namespace SamaBoutique.Server.Services.Interface
{
    public interface ISaleService
    {
        Task<(SaleResponse? Sale, string? Error)> CreateAsync(SaleCreateRequest req, Guid userId);
        Task<PagedResponse<SaleResponse>> GetAllAsync(int page, int pageSize, DateTime? from, DateTime? to, string? statut, string? modePaiement = null, Guid? userId = null);
        Task<SaleResponse?> GetByIdAsync(Guid id);
        Task<(bool Ok, string? Error)> CancelAsync(Guid id, Guid userId);
    }
}
