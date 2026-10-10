using Microsoft.Extensions.Configuration;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    /// <summary>
    /// Fail-fast de seguridad: la API no debe arrancar con una clave JWT
    /// ausente, pública o débil. Se ejecuta en Program.cs antes de construir el host.
    /// </summary>
    public static class JwtSettingsValidator
    {
        public const int MinSecretLength = 64;

        // Valor público que venía por defecto en docker-compose/appsettings.
        // Si llega hasta aquí, el despliegue usaría una clave conocida por todos.
        private const string InsecureDefault = "GiveASecretKeyHavingAtLeast32Characters";

        // Plantilla de .env.example: válida en longitud a propósito, pero es
        // pública del repo; copiarla tal cual también debe fallar.
        private const string ExampleTemplate = "CAMBIA_ESTO_POR_UNA_CLAVE_ALEATORIA_DE_AL_MENOS_64_CARACTERES_0123456789";

        public static void Validate(IConfiguration config)
        {
            var secret = config.GetSection("AppSettings").GetValue<string>("SecretKey");

            if (string.IsNullOrWhiteSpace(secret))
            {
                throw new InvalidOperationException(
                    "AppSettings:SecretKey no está configurado. Defina la variable de entorno SECRET_KEY " +
                    "con al menos 64 caracteres aleatorios (p. ej. `openssl rand -base64 48`). " +
                    "La API no arranca sin una clave válida.");
            }

            if (secret == InsecureDefault || secret == ExampleTemplate)
            {
                throw new InvalidOperationException(
                    "AppSettings:SecretKey usa un valor público del repositorio (default o plantilla de ejemplo). " +
                    "Genere una clave propia (`openssl rand -base64 48`) y configúrela en SECRET_KEY. " +
                    "La API no arranca con una clave pública.");
            }

            if (secret.Length < MinSecretLength)
            {
                throw new InvalidOperationException(
                    $"AppSettings:SecretKey es débil ({secret.Length} caracteres, mínimo {MinSecretLength}). " +
                    "Genere una clave aleatoria (`openssl rand -base64 48`). La API no arranca con una clave débil.");
            }
        }
    }
}
