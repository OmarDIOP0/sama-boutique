namespace SamaBoutique.Server.Models.Entities
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public Category? Parent { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public int Ordre { get; set; } = 0;
    }
}
