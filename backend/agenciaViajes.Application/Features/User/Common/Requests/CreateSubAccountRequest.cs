namespace agenciaViajes.Application.Features.User.Common.Requests
{
    public class CreateSubAccountRequest
    {
        public string name { get; set; } = string.Empty;
        public string lastName { get; set; } = string.Empty;
        public string userName { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public string confirmPassword { get; set; } = string.Empty;
    }
}
