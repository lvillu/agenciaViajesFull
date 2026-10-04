using System.Text.Json.Serialization;

namespace agenciaViajes.Application.Features.Auth.Common.Responses
{
    public class AuthResponse
    {
        public string userName { get; set; } = string.Empty;
        public string token { get; set; } = string.Empty;

        // Solo para que la ruta genere la cookie HttpOnly; nunca viaja en el body
        [JsonIgnore]
        public string? refreshToken { get; set; }

        // Segundos de vida de la cookie/refresh token asociada
        [JsonIgnore]
        public int refreshTokenExpiresInSeconds { get; set; }
    }
}
