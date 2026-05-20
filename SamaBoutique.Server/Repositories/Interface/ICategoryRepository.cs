using SamaBoutique.Server.Models.Entities;

namespace SamaBoutique.Server.Repositories.Interface
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<List<Category>> GetAllWithChildrenAsync();
    }
}
