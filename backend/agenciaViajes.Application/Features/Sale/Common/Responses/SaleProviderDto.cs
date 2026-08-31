namespace agenciaViajes.Application.Features.Sale.Common.Responses
{
    public class SaleProviderDto
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public string? ProviderName { get; set; }
        public string? ProviderAcronym { get; set; }
        public string? ReservationNumber { get; set; }
    }
}
