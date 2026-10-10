namespace agenciaViajes.Application.Domain.Entities
{
    public class Sale
    {
        public int Id { get; set; }

        public int ClientId { get; set; }

        public string? Description { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsDollar { get; set; }

        public decimal? ProfitPercentage { get; set; }

        // Null = todo el total es comisionable
        public decimal? CommissionableAmount { get; set; }

        public decimal CommissionBase => CommissionableAmount ?? TotalAmount;

        public decimal? NonCommissionableAmount => CommissionableAmount.HasValue ? TotalAmount - CommissionableAmount.Value : null;

        public decimal? RequiredDeposit { get; set; }

        public DateTime? FinalPaymentDueDate { get; set; }

        public DateTime TravelDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public string? Status { get; set; }

        public bool Active { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }

        // Account isolation
        public Guid AccountId { get; set; }

        // Navigation properties
        public Client? Client { get; set; }
        public ICollection<Payment>? Payments { get; set; }
        public ICollection<SaleProvider> SaleProviders { get; set; } = new List<SaleProvider>();
    }
}
