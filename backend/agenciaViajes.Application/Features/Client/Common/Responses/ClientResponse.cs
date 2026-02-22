namespace agenciaViajes.Application.Features.Client.Common.Responses
{
    public class ClientResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateOnly? BirthDate { get; set; }
        public bool Active { get; set; }
    }
}
