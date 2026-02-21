namespace agenciaViajes.Application.Features.Provider.Common.Responses
{
    public class ProviderResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Acronym { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ProviderContactName { get; set; } = string.Empty;
        public bool Active { get; set; }
    }
}
