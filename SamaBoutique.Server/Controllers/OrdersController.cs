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

        // Un client ne voit QUE ses propres commandes ; le staff voit tout.
        private bool IsStaff =>
            User.IsInRole("SuperAdmin") || User.IsInRole("Admin") ||
            User.IsInRole("Caissier") || User.IsInRole("Vendeur");

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? statut = null, [FromQuery] Guid? clientId = null)
        {
            // Pour un client, on force le filtre sur son propre identifiant
            // (Client.Id == User.Id) afin qu'il ne voie pas les commandes des autres.
            var effectiveClientId = IsStaff ? clientId : CurrentUserId;
            return ApiPaged(await _svc.GetAllAsync(page, pageSize, statut, effectiveClientId));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var o = await _svc.GetByIdAsync(id);
            if (o == null) return ApiNotFound("Commande introuvable");
            // Un client ne peut consulter que ses propres commandes
            if (!IsStaff && o.ClientId != CurrentUserId) return ApiNotFound("Commande introuvable");
            return ApiOk(o);
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
