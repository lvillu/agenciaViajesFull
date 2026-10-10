namespace agenciaViajes.Application.Domain.Entities
{
    public class AppSettings
    {
        public string SecretKey { get; set; }
        public int ExpiresInMinutes { get; set; }
        public int RefreshTokenExpiresInMinutes { get; set; }
        public int RememberMeRefreshTokenExpiresInMinutes { get; set; }
        public bool CookieSecure { get; set; }
    }
}
