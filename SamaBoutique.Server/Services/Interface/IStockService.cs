using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Responses;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IStockService
    {
        Task<(StockMovementResponse? Result, string? Error)> AddMovementAsync(StockMovementRequest req, Guid userId);
        Task<PagedResponse<StockMovementResponse>> GetMovementsAsync(int page, int pageSize, Guid? variantId, string? type);
    }
}
