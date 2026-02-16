namespace agenciaViajes.Application.Features.Auth.Common.Responses
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? UserIconUrl { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
