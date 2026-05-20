using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _repo;

        public ClientService(IClientRepository repo) => _repo = repo;

        public async Task<PagedResponse<ClientResponse>> GetAllAsync(int page, int pageSize, string? search, string? segment)
        {
            var (items, total) = await _repo.GetPagedAsync(page, pageSize, search, segment);
            return PagedResponse<ClientResponse>.Ok(items.Select(Map).ToList(), total, page, pageSize);
        }

        public async Task<ClientResponse?> GetByIdAsync(Guid id)
        {
            var c = await _repo.GetWithHistoryAsync(id);
            return c == null ? null : Map(c);
        }

        public async Task<(ClientResponse?, string?)> CreateAsync(ClientCreateRequest req)
        {
            if (!string.IsNullOrWhiteSpace(req.Email) && await _repo.EmailExistsAsync(req.Email))
                return (null, "Cette adresse email est déjà utilisée");

            var client = new Client
            {
                Nom = req.Nom,
                Email = req.Email,
                Telephone = req.Telephone,
                Adresse = req.Adresse,
            };

            await _repo.AddAsync(client);
            await _repo.SaveChangesAsync();
            return (Map(client), null);
        }

        public async Task<(ClientResponse?, string?)> UpdateAsync(Guid id, ClientUpdateRequest req)
        {
            var client = await _repo.GetByIdAsync(id);
            if (client == null) return (null, "Client introuvable");

            if (!string.IsNullOrWhiteSpace(req.Email) && await _repo.EmailExistsAsync(req.Email, id))
                return (null, "Cette adresse email est déjà utilisée");

            client.Nom = req.Nom; client.Email = req.Email;
            client.Telephone = req.Telephone; client.Adresse = req.Adresse;

            await _repo.UpdateAsync(client);
            await _repo.SaveChangesAsync();
            return (await GetByIdAsync(id), null);
        }

        public async Task<(bool, string?)> DeleteAsync(Guid id)
        {
            var client = await _repo.GetWithHistoryAsync(id);
            if (client == null) return (false, "Client introuvable");

            if (client.Sales.Count > 0 || client.Orders.Count > 0)
                return (false, "Impossible de supprimer un client ayant des achats. Archivez-le.");

            await _repo.DeleteAsync(client);
            await _repo.SaveChangesAsync();
            return (true, null);
        }

        private static ClientResponse Map(Client c) => new(
            c.Id, c.Nom, c.Email, c.Telephone, c.Adresse, c.PointsFidelite,
            c.Segment, c.SoldeCredit,
            c.Orders.Count, c.Sales.Count, c.Sales.Sum(s => s.TotalTTC), c.CreatedAt);
    }
}
