namespace agenciaViajes.Application.Features.Payment.Common.Requests
{
    public class UpdatePaymentRequest
    {
        public int SaleId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? AmountMXN { get; set; }
        public decimal? TransactionFee { get; set; }
        public string? Notes { get; set; }
    }
}
