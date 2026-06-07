namespace agenciaViajes.Application.Features.User.Common.Responses
{
    public class UserMeResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? UserIconUrl { get; set; }
        public string Role { get; set; } = "owner";
    }
}
