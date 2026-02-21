namespace agenciaViajes.Application.Domain.Entities
{
    public class Provider
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Acronym { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string ProviderContactName { get; set; } = default!;
        public bool Active { get; set; } = true;

    }
}
