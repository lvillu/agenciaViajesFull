namespace agenciaViajes.Application.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;

        public string PasswordHash { get; set; } = default!;

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public string? UserIconUrl { get; set; }
        public bool Active { get; set; } = true;

        // Account isolation
        public Guid AccountId { get; set; }
        public string Role { get; set; } = "owner";

        // Self-referencing FK for sub-accounts
        public int? ParentUserId { get; set; }
        public User? ParentUser { get; set; }

        // Starting folio number for this account's payment sequence
        // 0 means not configured yet (show welcome modal on first login)
        public int FolioStart { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; }
    }
}
