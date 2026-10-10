using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;

namespace agenciaViajes.Application.Domain.Middleware
{
    public class TokenValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public TokenValidationMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var isSecureApi = context.GetEndpoint()?.Metadata?.GetMetadata<AuthorizeAttribute>() != null;

            if (!isSecureApi)
            {
                await _next(context);
                return;
            }

            if (token == null)
            {
                context.Response.StatusCode = 401; // Unauthorized
                GeneraExcepcion(context, "No tienes acceso a la informacion.");
                return;
            }

            // Verifica el token actual
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var jwtSettings = _configuration.GetSection("AppSettings");
                var secretKey = jwtSettings.GetValue<string>("SecretKey");

                if (string.IsNullOrEmpty(secretKey))
                {
                    context.Response.StatusCode = 500;
                    GeneraExcepcion(context, "Configuracion de SecretKey invalida.");
                    return;
                }

                var key = Encoding.UTF8.GetBytes(secretKey);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);
            }
            catch (SecurityTokenExpiredException)
            {
                // El cliente debe renovar el access token via POST /api/Auth/refresh
                context.Response.StatusCode = 401; // Unauthorized
                GeneraExcepcion(context, "Tu sesión ha expirado.");
                return;
            }
            catch (Exception)
            {
                context.Response.StatusCode = 401; // Unauthorized
                GeneraExcepcion(context, "No tienes acceso a la informacion.");
                return;
            }


            await _next(context);
        }



        private void GeneraExcepcion(HttpContext context, string message)
        {
            var result = JsonSerializer.Serialize(new
            {
                success = false,
                message = message
            });

            context.Response.WriteAsync(result);
        }
    }
}
