using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Services.Interface;

namespace SamaBoutique.Server.Controllers
{
    [Route("api/products")]
    [Authorize]
    public class ProductsController : BaseController
    {
        private readonly IProductService _svc;
        public ProductsController(IProductService svc) => _svc = svc;

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, [FromQuery] string? statut = null,
            [FromQuery] Guid? categoryId = null)
            => ApiPaged(await _svc.GetAllAsync(page, pageSize, search, statut, categoryId));

        [AllowAnonymous]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await _svc.GetByIdAsync(id);
            return p == null ? ApiNotFound("Produit introuvable") : ApiOk(p);
        }

        [AllowAnonymous]
        [HttpGet("barcode/{barcode}")]
        public async Task<IActionResult> GetByBarcode(string barcode)
        {
            var p = await _svc.GetByBarcodeAsync(barcode);
            return p == null ? ApiNotFound("Aucun produit trouvé pour ce code-barres") : ApiOk(p);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Create([FromBody] ProductCreateRequest req)
        {
            var (product, error) = await _svc.CreateAsync(req);
            if (error != null) return ApiFail(error);
            return ApiCreated(product!, nameof(GetById), new { id = product!.Id }, "Produit créé avec succès");
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductUpdateRequest req)
        {
            var (product, error) = await _svc.UpdateAsync(id, req);
            if (error != null) return ApiFail(error);
            if (product == null) return ApiNotFound("Produit introuvable");
            return ApiOk(product, "Produit mis à jour");
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (ok, message) = await _svc.DeleteAsync(id);
            if (!ok) return ApiFail(message!);
            return ApiOk<object>(null!, message ?? "Produit supprimé");
        }

        // ── Promotion groupée ────────────────────────────────────────────────
        [HttpPost("promo/bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ApplyBulkPromo([FromBody] BulkPromoRequest req)
        {
            var (count, error) = await _svc.ApplyBulkPromoAsync(req);
            if (error != null) return ApiFail(error);
            return ApiOk<object>(new { count }, $"Promotion appliquée à {count} produit(s)");
        }

        [HttpDelete("promo/bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> RemoveBulkPromo([FromQuery] Guid? categoryId)
        {
            var (count, _) = await _svc.RemoveBulkPromoAsync(categoryId);
            return ApiOk<object>(new { count }, $"Promotion retirée de {count} produit(s)");
        }

        [HttpGet("alerts/stock")]
        public async Task<IActionResult> GetStockAlerts()
            => ApiOk(await _svc.GetStockAlertsAsync());

        [AllowAnonymous]
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
            => ApiOk(await _svc.GetCategoriesAsync());

        [HttpPost("categories")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateRequest req)
        {
            var (cat, error) = await _svc.CreateCategoryAsync(req);
            if (error != null) return ApiFail(error);
            return ApiOk(cat!, "Catégorie créée");
        }

        [HttpPut("categories/{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryCreateRequest req)
        {
            var (cat, error) = await _svc.UpdateCategoryAsync(id, req);
            if (error != null) return ApiFail(error);
            return ApiOk(cat!, "Catégorie mise à jour");
        }

        [HttpDelete("categories/{id:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var (ok, error) = await _svc.DeleteCategoryAsync(id);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Catégorie supprimée");
        }

        // ── Photos ────────────────────────────────────────────────────────────

        [HttpPost("{id:guid}/photos")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> UploadPhoto(Guid id, IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return ApiFail("Aucun fichier reçu");

            var (url, error) = await _svc.AddPhotoAsync(id, photo);
            if (error != null) return ApiFail(error);
            return ApiOk(new { url }, "Photo ajoutée");
        }

        [HttpDelete("{id:guid}/photos")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeletePhoto(Guid id, [FromQuery] string photoUrl)
        {
            if (string.IsNullOrWhiteSpace(photoUrl))
                return ApiFail("URL de la photo requise");

            var (ok, error) = await _svc.DeletePhotoAsync(id, photoUrl);
            if (!ok) return ApiFail(error!);
            return ApiOk<object>(null!, "Photo supprimée");
        }
    }
}
