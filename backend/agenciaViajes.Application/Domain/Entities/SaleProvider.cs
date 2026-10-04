namespace agenciaViajes.Application.Domain.Entities
{
    public class SaleProvider
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int ProviderId { get; set; }
        public string? ReservationNumber { get; set; }
        public DateTime CreatedAt { get; set; }

        public Sale? Sale { get; set; }
        public Provider? Provider { get; set; }
    }
}
