using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Responses;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IOrderService
    {
        Task<PagedResponse<OrderResponse>> GetAllAsync(int page, int pageSize, string? statut, Guid? clientId);
        Task<OrderResponse?> GetByIdAsync(Guid id);
        Task<(OrderResponse? Order, string? Error)> CreateAsync(OrderCreateRequest req);
        Task<(OrderResponse? Order, string? Error)> UpdateStatusAsync(Guid id, string statut);
    }
}
