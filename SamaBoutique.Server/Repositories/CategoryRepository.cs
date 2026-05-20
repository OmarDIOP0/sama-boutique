using Microsoft.EntityFrameworkCore;
using SamaBoutique.Server.Data;
using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Repositories.Interface;

namespace SamaBoutique.Server.Repositories
{
    public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext db) : base(db) { }

        public override async Task<Category?> GetByIdAsync(Guid id)
            => await _db.Categories
                .Include(c => c.Products)
                .Include(c => c.Parent)
                .Include(c => c.SubCategories)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<List<Category>> GetAllWithChildrenAsync()
            => await _db.Categories.Include(c => c.SubCategories).Include(c => c.Products)
                .Where(c => c.ParentId == null).OrderBy(c => c.Ordre).ToListAsync();
    }
}
