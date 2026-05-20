namespace SamaBoutique.Server.Models.Entities
{
    public class Employee
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Poste { get; set; } = string.Empty;
        public decimal CommissionPct { get; set; } = 0;
        public DateTime DateEmbauche { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
