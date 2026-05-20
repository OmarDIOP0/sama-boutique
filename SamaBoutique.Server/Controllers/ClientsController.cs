using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/clients")]
    [Authorize]
    public class ClientsController : BaseController
    {
        private readonly IClientService _svc;
        public ClientsController(IClientService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, [FromQuery] string? segment = null)
            => ApiPaged(await _svc.GetAllAsync(page, pageSize, search, segment));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var c = await _svc.GetByIdAsync(id);
            return c == null ? ApiNotFound("Client introuvable") : ApiOk(c);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClientCreateRequest req)
        {
            var (client, error) = await _svc.CreateAsync(req);
            if (error != null) return ApiFail(error);
            return ApiCreated(client!, nameof(GetById), new { id = client!.Id }, "Client créé avec succès");
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ClientUpdateRequest req)
        {
            var (client, error) = await _svc.UpdateAsync(id, req);
            if (error != null) return ApiFail(error);
            if (client == null) return ApiNotFound("Client introuvable");
            return ApiOk(client, "Client mis à jour");
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (ok, error) = await _svc.DeleteAsync(id);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Client supprimé");
        }
    }
}
