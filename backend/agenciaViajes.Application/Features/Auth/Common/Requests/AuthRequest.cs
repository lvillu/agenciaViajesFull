namespace agenciaViajes.Application.Features.Auth.Common.Requests
{
    public class AuthRequest
    {
        public required string username { get; set; }
        public required string password { get; set; }
    }
}
