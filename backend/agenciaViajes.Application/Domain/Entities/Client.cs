namespace agenciaViajes.Application.Domain.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string? Address { get; set; }
        public string Phone { get; set; } = default!;
        public string? Email { get; set; }
        public DateOnly? BirthDate { get; set; }
        public bool Active { get; set; } = true;
    }
}
