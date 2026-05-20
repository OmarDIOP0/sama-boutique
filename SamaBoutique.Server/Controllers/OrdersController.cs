using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/orders")]
    [Authorize]
    public class OrdersController : BaseController
    {
        private readonly IOrderService _svc;
        public OrdersController(IOrderService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? statut = null, [FromQuery] Guid? clientId = null)
            => ApiPaged(await _svc.GetAllAsync(page, pageSize, statut, clientId));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var o = await _svc.GetByIdAsync(id);
            return o == null ? ApiNotFound("Commande introuvable") : ApiOk(o);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderCreateRequest req)
        {
            var (order, error) = await _svc.CreateAsync(req);
            if (error != null) return ApiFail(error);
            return ApiCreated(order!, nameof(GetById), new { id = order!.Id }, "Commande créée avec succès");
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "SuperAdmin,Admin,Caissier")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatusRequest req)
        {
            var (order, error) = await _svc.UpdateStatusAsync(id, req.Statut);
            if (error != null) return ApiFail(error);
            if (order == null) return ApiNotFound("Commande introuvable");
            return ApiOk(order, "Statut mis à jour");
        }
    }
}
