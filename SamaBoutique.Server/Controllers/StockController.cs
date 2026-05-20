using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/stock")]
    [Authorize]
    public class StockController : BaseController
    {
        private readonly IStockService _svc;
        public StockController(IStockService svc) => _svc = svc;

        [HttpPost("movement")]
        [Authorize(Roles = "SuperAdmin,Admin,Caissier")]
        public async Task<IActionResult> AddMovement([FromBody] StockMovementRequest req)
        {
            var (result, error) = await _svc.AddMovementAsync(req, CurrentUserId);
            if (error != null) return ApiFail(error);
            return ApiOk(result!, "Mouvement enregistré");
        }

        [HttpGet("movements")]
        public async Task<IActionResult> GetMovements(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] Guid? variantId = null, [FromQuery] string? type = null)
            => ApiPaged(await _svc.GetMovementsAsync(page, pageSize, variantId, type));
    }
}
