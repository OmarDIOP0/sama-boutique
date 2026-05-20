using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Responses;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IClientService
    {
        Task<PagedResponse<ClientResponse>> GetAllAsync(int page, int pageSize, string? search, string? segment);
        Task<ClientResponse?> GetByIdAsync(Guid id);
        Task<(ClientResponse? Client, string? Error)> CreateAsync(ClientCreateRequest req);
        Task<(ClientResponse? Client, string? Error)> UpdateAsync(Guid id, ClientUpdateRequest req);
        Task<(bool Ok, string? Error)> DeleteAsync(Guid id);
    }
}
