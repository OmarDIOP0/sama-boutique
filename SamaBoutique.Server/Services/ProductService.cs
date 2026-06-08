using Microsoft.AspNetCore.Http;
using SamaBoutique.Server.Models.DTOs;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using SamaBoutique.Server.Services.Interface;
using System.Text.Json;

namespace SamaBoutique.Server.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly ICategoryRepository _catRepo;
        private readonly IWebHostEnvironment _env;

        public ProductService(IProductRepository repo, ICategoryRepository catRepo, IWebHostEnvironment env)
        {
            _repo = repo;
            _catRepo = catRepo;
            _env = env;
        }

        public async Task<PagedResponse<ProductResponse>> GetAllAsync(int page, int pageSize, string? search, string? statut, Guid? categoryId)
        {
            var (items, total) = await _repo.GetPagedAsync(page, pageSize, search, statut, categoryId);
            return PagedResponse<ProductResponse>.Ok(items.Select(Map).ToList(), total, page, pageSize);
        }

        public async Task<ProductResponse?> GetByIdAsync(Guid id)
        {
            var p = await _repo.GetWithVariantsAsync(id);
            return p == null ? null : Map(p);
        }

        public async Task<ProductResponse?> GetByBarcodeAsync(string barcode)
        {
            var p = await _repo.GetByBarcodeAsync(barcode);
            return p == null ? null : Map(p);
        }

        public async Task<(ProductResponse?, string?)> CreateAsync(ProductCreateRequest req)
        {
            if (req.PrixVente < req.PrixAchat)
                return (null, "Le prix de vente ne peut pas être inférieur au prix d'achat");

            // Normalise le code-barres : vide → génère un EAN-13 interne unique
            var codeBarres = string.IsNullOrWhiteSpace(req.CodeBarres)
                ? await GenerateUniqueEan13Async()
                : req.CodeBarres.Trim();

            if (!string.IsNullOrWhiteSpace(req.CodeBarres) && await _repo.BarcodeExistsAsync(codeBarres))
                return (null, "Ce code-barres est déjà utilisé");

            // Build variants — always ensure at least one "Standard" variant so the product can be sold
            var variants = (req.Variants?.Count > 0)
                ? req.Variants.Select(v => new ProductVariant
                {
                    Taille = v.Taille,
                    Couleur = v.Couleur,
                    StockActuel = v.StockActuel,
                    StockMinimum = v.StockMinimum,
                    PrixOverride = v.PrixOverride > 0 ? v.PrixOverride : null  // 0 means "use base price"
                }).ToList()
                : new List<ProductVariant>
                {
                    new ProductVariant { StockActuel = 0, StockMinimum = 5 }
                };

            var product = new Product
            {
                Nom = req.Nom,
                Description = req.Description,
                CodeBarres = codeBarres,
                CategoryId = req.CategoryId,
                PrixAchat = req.PrixAchat,
                PrixVente = req.PrixVente,
                PrixPromo = req.PrixPromo > 0 ? req.PrixPromo : null,
                Statut = req.Statut,
                Variants = variants
            };

            await _repo.AddAsync(product);
            await _repo.SaveChangesAsync();
            return (Map(product), null);
        }

        public async Task<(ProductResponse?, string?)> UpdateAsync(Guid id, ProductUpdateRequest req)
        {
            var product = await _repo.GetWithVariantsAsync(id);
            if (product == null) return (null, "Produit introuvable");

            if (req.PrixVente < req.PrixAchat)
                return (null, "Le prix de vente ne peut pas être inférieur au prix d'achat");

            // Si le champ est vide, on garde l'ancien code-barres (ne pas écraser)
            var newCodeBarres = string.IsNullOrWhiteSpace(req.CodeBarres)
                ? product.CodeBarres
                : req.CodeBarres.Trim();

            if (!string.IsNullOrWhiteSpace(req.CodeBarres) && await _repo.BarcodeExistsAsync(newCodeBarres!, id))
                return (null, "Ce code-barres est déjà utilisé");

            // Validation prix promo : doit être > 0 et < prix de vente
            if (req.PrixPromo.HasValue && req.PrixPromo.Value > 0 && req.PrixPromo.Value >= req.PrixVente)
                return (null, "Le prix promo doit être inférieur au prix de vente");

            product.Nom = req.Nom; product.Description = req.Description;
            product.CodeBarres = newCodeBarres;
            product.CategoryId = req.CategoryId;
            product.PrixAchat = req.PrixAchat; product.PrixVente = req.PrixVente;
            product.PrixPromo = req.PrixPromo > 0 ? req.PrixPromo : null;
            product.Statut = req.Statut;
            product.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(product);
            await _repo.SaveChangesAsync();
            return (Map(product), null);
        }

        public async Task<(bool, string?)> DeleteAsync(Guid id)
        {
            var product = await _repo.GetWithVariantsAsync(id);
            if (product == null) return (false, "Produit introuvable");

            var hasSales = product.Variants.Any(v => v.SaleItems.Count > 0);
            if (hasSales)
            {
                product.Statut = "Archivé"; product.UpdatedAt = DateTime.UtcNow;
                await _repo.UpdateAsync(product);
            }
            else
                await _repo.DeleteAsync(product);

            await _repo.SaveChangesAsync();
            return (true, hasSales ? "Produit archivé (a des ventes associées)" : null);
        }

        public async Task<(int Count, string? Error)> ApplyBulkPromoAsync(BulkPromoRequest req)
        {
            if (req.RemisePct <= 0 || req.RemisePct >= 100)
                return (0, "La remise doit être comprise entre 1 et 99 %");
            var count = await _repo.ApplyBulkPromoAsync(req.RemisePct, req.CategoryId);
            return (count, null);
        }

        public async Task<(int Count, string? Error)> RemoveBulkPromoAsync(Guid? categoryId)
        {
            var count = await _repo.RemoveBulkPromoAsync(categoryId);
            return (count, null);
        }

        public async Task<List<StockAlertResponse>> GetStockAlertsAsync()
        {
            var alerts = await _repo.GetStockAlertsAsync();
            return alerts.Select(pv => new StockAlertResponse(
                pv.Id, pv.ProductId, pv.Product.Nom, pv.GetLabel().Length > 0 ? pv.GetLabel() : null,
                pv.StockActuel, pv.StockMinimum,
                pv.IsRupture() ? "Rupture" : "Critique")).ToList();
        }

        public async Task<List<CategoryResponse>> GetCategoriesAsync()
        {
            var cats = await _catRepo.GetAllWithChildrenAsync();
            return cats.Select(MapCat).ToList();
        }

        public async Task<(CategoryResponse?, string?)> CreateCategoryAsync(CategoryCreateRequest req)
        {
            var cat = new Category { Nom = req.Nom, ParentId = req.ParentId, Ordre = req.Ordre };
            await _catRepo.AddAsync(cat);
            await _catRepo.SaveChangesAsync();
            return (MapCat(cat), null);
        }

        public async Task<(CategoryResponse? Cat, string? Error)> UpdateCategoryAsync(Guid id, CategoryCreateRequest req)
        {
            var cat = await _catRepo.GetByIdAsync(id);
            if (cat == null) return (null, "Catégorie introuvable");

            cat.Nom = req.Nom;
            cat.ParentId = req.ParentId;
            cat.Ordre = req.Ordre;

            await _catRepo.UpdateAsync(cat);
            await _catRepo.SaveChangesAsync();

            // Reload with relations
            var updated = await _catRepo.GetByIdAsync(id);
            return (MapCat(updated!), null);
        }

        public async Task<(bool Ok, string? Error)> DeleteCategoryAsync(Guid id)
        {
            var cat = await _catRepo.GetByIdAsync(id);
            if (cat == null) return (false, "Catégorie introuvable");
            if (cat.Products.Count > 0)
                return (false, "Impossible de supprimer : des produits sont liés à cette catégorie");
            await _catRepo.DeleteAsync(cat);
            await _catRepo.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(string? Url, string? Error)> AddPhotoAsync(Guid id, IFormFile file)
        {
            var product = await _repo.GetWithVariantsAsync(id);
            if (product == null) return (null, "Produit introuvable");

            // Validate file
            var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowed.Contains(file.ContentType.ToLower()))
                return (null, "Type de fichier non autorisé (jpeg, png, webp, gif uniquement)");
            if (file.Length > 5 * 1024 * 1024)
                return (null, "Fichier trop volumineux (max 5 Mo)");

            // Save to wwwroot/images/products/{productId}/
            var folder = Path.Combine(_env.WebRootPath, "images", "products", id.ToString());
            Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(folder, fileName);

            await using var stream = File.Create(filePath);
            await file.CopyToAsync(stream);

            var url = $"/images/products/{id}/{fileName}";

            // Update Photos JSON list
            var photos = JsonSerializer.Deserialize<List<string>>(product.Photos) ?? new();
            photos.Add(url);
            product.Photos = JsonSerializer.Serialize(photos);
            product.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(product);
            await _repo.SaveChangesAsync();

            return (url, null);
        }

        public async Task<(bool Ok, string? Error)> DeletePhotoAsync(Guid id, string photoUrl)
        {
            var product = await _repo.GetWithVariantsAsync(id);
            if (product == null) return (false, "Produit introuvable");

            var photos = JsonSerializer.Deserialize<List<string>>(product.Photos) ?? new();
            if (!photos.Remove(photoUrl))
                return (false, "Photo introuvable");

            // Delete physical file
            var relativePath = photoUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var filePath = Path.Combine(_env.WebRootPath, relativePath);
            if (File.Exists(filePath)) File.Delete(filePath);

            product.Photos = JsonSerializer.Serialize(photos);
            product.UpdatedAt = DateTime.UtcNow;
            await _repo.UpdateAsync(product);
            await _repo.SaveChangesAsync();

            return (true, null);
        }

        /// <summary>
        /// Génère un EAN-13 interne unique (préfixe "2" réservé usage interne).
        /// Réessaie en cas de collision avec un code existant.
        /// </summary>
        private async Task<string> GenerateUniqueEan13Async()
        {
            string code;
            do
            {
                code = GenerateEan13();
            }
            while (await _repo.BarcodeExistsAsync(code));
            return code;
        }

        private static string GenerateEan13()
        {
            // Préfixe "2" (usage interne) + 11 chiffres aléatoires + chiffre de contrôle
            var rng = Random.Shared;
            var digits = new int[12];
            digits[0] = 2; // préfixe interne
            for (int i = 1; i < 12; i++)
                digits[i] = rng.Next(0, 10);

            // Calcul du chiffre de contrôle EAN-13
            int sum = 0;
            for (int i = 0; i < 12; i++)
                sum += digits[i] * (i % 2 == 0 ? 1 : 3);
            int check = (10 - (sum % 10)) % 10;

            return string.Concat(digits.Select(d => d.ToString())) + check;
        }

        private static ProductResponse Map(Product p) => new(
            p.Id, p.Nom, p.Description, p.CodeBarres, p.CategoryId,
            p.Category?.Nom ?? "", p.PrixAchat, p.PrixVente,
            p.GetMarge(), p.Statut,
            JsonSerializer.Deserialize<List<string>>(p.Photos) ?? new(),
            p.Variants.Select(v => new VariantResponse(
                v.Id, v.Taille, v.Couleur, v.StockActuel, v.StockMinimum,
                // Prix variante : override > prix promo produit > prix de vente
                v.PrixOverride is > 0 ? v.PrixOverride.Value : p.PrixEffectif(),
                v.IsStockCritical(), v.IsRupture())).ToList(),
            p.CreatedAt, p.UpdatedAt,
            p.PrixPromo, p.EnPromo(), p.RemisePct());

        private static CategoryResponse MapCat(Category c) => new(
            c.Id, c.Nom, c.ParentId, c.Parent?.Nom, c.Ordre, c.Products.Count,
            c.SubCategories.Select(MapCat).ToList());
    }
}
