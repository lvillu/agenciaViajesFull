using agenciaViajes.Application.Domain.Shared;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.RateLimiting;

namespace agenciaViajes.Api;

/// <summary>
/// Límite de intentos en endpoints de autenticación (fuerza bruta y quema de
/// CPU vía BCrypt). Vive en el proyecto Api porque AddRateLimiter requiere el
/// framework web completo. Partición por IP remota: detrás del gateway todos
/// comparten IP, por eso el límite es generoso (30/min) — frena ataques sin
/// bloquear uso legítimo. Responde 429 con el envelope ApiResponse.
/// </summary>
public static class RateLimitingConfiguration
{
    public const string AuthPolicy = "auth";

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";
                var result = Result<string>.Failure("Demasiados intentos. Espere un minuto e intente de nuevo.");
                await context.HttpContext.Response.WriteAsJsonAsync(result, cancellationToken);
            };

            options.AddPolicy(AuthPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 30,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));
        });

        return services;
    }
}
