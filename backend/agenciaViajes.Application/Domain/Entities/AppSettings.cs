namespace agenciaViajes.Application.Domain.Entities
{
    public class AppSettings
    {
        public string SecretKey { get; set; }
        public int ExperiesInMinutes { get; set; }
        public int RefreshTokenExpiresInMinutes { get; set; }
    }
}
