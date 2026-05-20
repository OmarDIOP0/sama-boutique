using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/analytics")]
    [Authorize(Roles = "SuperAdmin,Admin,Caissier")]
    public class AnalyticsController : BaseController
    {
        private readonly IAnalyticsService _svc;
        public AnalyticsController(IAnalyticsService svc) => _svc = svc;

        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis()
            => ApiOk(await _svc.GetKpisAsync());

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts(
            [FromQuery] int top = 10,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
            => ApiOk(await _svc.GetTopProductsAsync(top, from, to));

        [HttpGet("top-clients")]
        public async Task<IActionResult> GetTopClients([FromQuery] int top = 10)
            => ApiOk(await _svc.GetTopClientsAsync(top));

        [HttpGet("sales-chart")]
        public async Task<IActionResult> GetSalesChart([FromQuery] string periode = "daily")
        {
            if (periode != "daily" && periode != "monthly")
                return ApiFail("Période invalide. Valeurs acceptées : daily, monthly");
            return ApiOk(await _svc.GetSalesChartAsync(periode));
        }

        [HttpGet("payment-breakdown")]
        public async Task<IActionResult> GetPaymentBreakdown(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var f = from ?? DateTime.UtcNow.AddMonths(-1);
            var t = to ?? DateTime.UtcNow;
            return ApiOk(await _svc.GetPaymentBreakdownAsync(f, t));
        }
    }
}
