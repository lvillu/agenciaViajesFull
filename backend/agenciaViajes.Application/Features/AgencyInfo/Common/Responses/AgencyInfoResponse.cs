namespace agenciaViajes.Application.Features.AgencyInfo.Common.Responses
{
    public class AgencyInfoResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? SecturReg { get; set; }
        public string? Facebook { get; set; }
        public string? Instagram { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
