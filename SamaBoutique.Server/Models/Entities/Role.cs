namespace SamaBoutique.Server.Models.Entities
{
    public class Role
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string Permissions { get; set; } = "[]";
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
