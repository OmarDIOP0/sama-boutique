using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/sales")]
    [Authorize]
    public class SalesController : BaseController
    {
        private readonly ISaleService _svc;
        public SalesController(ISaleService svc) => _svc = svc;

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin,Caissier,Vendeur")]
        public async Task<IActionResult> Create([FromBody] SaleCreateRequest req)
        {
            var (sale, error) = await _svc.CreateAsync(req, CurrentUserId);
            if (error != null) return ApiFail(error);
            return ApiCreated(sale!, nameof(GetById), new { id = sale!.Id }, "Vente enregistrée avec succès");
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null,
            [FromQuery] string? statut = null, [FromQuery] string? modePaiement = null,
            [FromQuery] Guid? userId = null)
            => ApiPaged(await _svc.GetAllAsync(page, pageSize, from, to, statut, modePaiement, userId));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var sale = await _svc.GetByIdAsync(id);
            return sale == null ? ApiNotFound("Vente introuvable") : ApiOk(sale);
        }

        [HttpPost("{id:guid}/cancel")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var (ok, error) = await _svc.CancelAsync(id, CurrentUserId);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Vente annulée avec succès");
        }
    }
}
