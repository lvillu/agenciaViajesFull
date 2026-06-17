namespace agenciaViajes.Application.Features.User.Common.Requests
{
    public class UpdateSubAccountRequest
    {
        public string name { get; set; } = string.Empty;
        public string lastName { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public bool active { get; set; }
    }
}
