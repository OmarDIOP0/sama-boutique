using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/delivery")]
    public class DeliveryController : BaseController
    {
        private readonly IDeliveryService _svc;
        public DeliveryController(IDeliveryService svc) => _svc = svc;

        /// <summary>Liste des zones (public : activeOnly pour le storefront)</summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false)
            => ApiOk(await _svc.GetAllAsync(activeOnly));

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Create([FromBody] DeliveryZoneRequest req)
        {
            var (zone, error) = await _svc.CreateAsync(req);
            if (error != null) return ApiFail(error);
            return ApiOk(zone!, "Zone créée");
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DeliveryZoneRequest req)
        {
            var (zone, error) = await _svc.UpdateAsync(id, req);
            if (error != null) return ApiFail(error);
            return ApiOk(zone!, "Zone mise à jour");
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (ok, error) = await _svc.DeleteAsync(id);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Zone supprimée");
        }
    }
}
