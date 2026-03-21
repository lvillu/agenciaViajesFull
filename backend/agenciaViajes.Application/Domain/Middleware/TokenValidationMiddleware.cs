using agenciaViajes.Application.Domain.Repositories;
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

        public async Task InvokeAsync(HttpContext context, IAuthRepository tokenService)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var isSecureApi = context.GetEndpoint()?.Metadata?.GetMetadata<AuthorizeAttribute>() != null;

            if (!isSecureApi)
            {
                await _next(context);
                return;
            }

            if (token == null && isSecureApi)
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
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);
            }
            catch (SecurityTokenExpiredException)
            {
                var jwtSecurityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                if (jwtSecurityToken == null)
                {
                    context.Response.StatusCode = 401;
                    GeneraExcepcion(context, "Token invalido.");
                    return;
                }

                // Si el token ha expirado, intenta refrescarlo con el refresh token
                // Obtener el refresh token directamente desde el JWT (en los claims)
                var refreshToken = jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == "RefreshToken")?.Value;

                if (string.IsNullOrEmpty(refreshToken))
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    GeneraExcepcion(context, "No hay refresh token.");
                    return;
                }

                // Obtener el usuario de la base de datos a partir del refreshToken
                var user = await tokenService.GetUserByRefreshTokenAsync(refreshToken);
                if (user == null)
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    GeneraExcepcion(context, "Refresh token invalido.");
                    return;
                }

                // Validar el tiempo de expiración del Refresh Token
                if(user.RefreshTokenExpiryTime != null && user.RefreshTokenExpiryTime < DateTime.UtcNow)
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    GeneraExcepcion(context, "Refresh Token expiro.");
                    return;
                }

                // Generar nuevo refresh token y guardarlo
                var newRefreshToken = Guid.NewGuid().ToString();
                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = tokenService.GenerateRefreshTokenExpires();
                
                // Generar nuevo token en base al usuario obtenido
                var newToken = tokenService.GenerateToken(user, newRefreshToken);
                // Cambiar el encabezado de autorización con el nuevo token
                context.Request.Headers["New-Auth-Header"] = $"Bearer {newToken}";
                // Ahora llamamos al siguiente middleware o API
                await _next(context);
                return; // Evitar más procesamiento después de pasar la solicitud
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
