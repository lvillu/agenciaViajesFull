namespace agenciaViajes.Application.Domain.Entities
{
    public class Payment
    {
        public int Id { get; set; }

        public int SaleId { get; set; }

        public DateTime PaymentDate { get; set; }

        public decimal Amount { get; set; }

        public decimal? ExchangeRate { get; set; }

        public decimal? AmountMXN { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }

        // Navigation property
        public Sale? Sale { get; set; }
    }
}
