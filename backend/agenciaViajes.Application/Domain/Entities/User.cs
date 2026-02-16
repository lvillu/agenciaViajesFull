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
    }
}
