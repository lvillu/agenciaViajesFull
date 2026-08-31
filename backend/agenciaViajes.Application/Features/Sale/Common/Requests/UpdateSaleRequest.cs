namespace agenciaViajes.Application.Features.Sale.Common.Requests
{
    public class UpdateSaleRequest
    {
        public int ClientId { get; set; }
        public List<SaleProviderRequest> Providers { get; set; } = new();
        public string? Description { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsDollar { get; set; }
        public decimal? ProfitPercentage { get; set; }
        public decimal? RequiredDeposit { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public DateTime TravelDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string? Status { get; set; }
    }
}
