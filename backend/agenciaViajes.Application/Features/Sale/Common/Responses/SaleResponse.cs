namespace agenciaViajes.Application.Features.Sale.Common.Responses
{
    public class SaleResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? ClientName { get; set; }
        public int ProviderId { get; set; }
        public string? ProviderName { get; set; }
        public string? ReservationNumber { get; set; }
        public string? Description { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsDollar { get; set; }
        public decimal? ProfitPercentage { get; set; }
        public decimal? ProfitAmount { get; set; }
        public decimal? RequiredDeposit { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public DateTime TravelDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string? Status { get; set; }
        public bool Active { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal RemainingBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
