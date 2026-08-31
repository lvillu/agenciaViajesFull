namespace agenciaViajes.Application.Domain.Entities
{
    public class Sale
    {
        public int Id { get; set; }

        public int ClientId { get; set; }

        public int? ProviderId { get; set; }

        public string? ReservationNumber { get; set; }

        public string? Description { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsDollar { get; set; }

        public decimal? ProfitPercentage { get; set; }

        public decimal? RequiredDeposit { get; set; }

        public DateTime? FinalPaymentDueDate { get; set; }

        public DateTime TravelDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public string? Status { get; set; }

        public bool Active { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }

        // Navigation properties
        public Client? Client { get; set; }
        public Provider? Provider { get; set; }
        public ICollection<Payment>? Payments { get; set; }
        public ICollection<SaleProvider> SaleProviders { get; set; } = new List<SaleProvider>();
    }
}
