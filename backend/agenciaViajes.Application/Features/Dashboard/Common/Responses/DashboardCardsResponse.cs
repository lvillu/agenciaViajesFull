namespace agenciaViajes.Application.Features.Dashboard.Common.Responses
{
    public class DashboardCardsResponse
    {
        public decimal EstimatedProfitCurrentMonth { get; set; }
        public int PendingSettlementCount { get; set; }
        public List<DashboardSaleItem> PendingSettlementSales { get; set; } = new();
        public int NearCancellationCount { get; set; }
        public List<DashboardSaleItem> NearCancellationSales { get; set; } = new();
    }

    public class DashboardSaleItem
    {
        public int Id { get; set; }
        public string? ClientName { get; set; }
        public string? ProviderName { get; set; }
        public string? ReservationNumber { get; set; }
        public string? Description { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsDollar { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal RemainingBalance { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public DateTime TravelDate { get; set; }
    }
}
