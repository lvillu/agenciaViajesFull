namespace agenciaViajes.Application.Features.Payment.Common.Responses
{
    public class PaymentResponse
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public string? SaleReservationNumber { get; set; }
        public string? ClientName { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? AmountMXN { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
