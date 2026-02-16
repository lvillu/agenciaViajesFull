namespace agenciaViajes.Application.Features.Auth.Common.Requests
{
    public class SignUpRequest
    {
        public required string Name { get; set; }
        public required string LastName { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}
