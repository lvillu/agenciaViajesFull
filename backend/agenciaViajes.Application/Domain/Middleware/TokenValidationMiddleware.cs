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
                JwtSecurityToken jwtSecurityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                // Si el token ha expirado, intenta refrescarlo con el refresh token
                // Obtener el refresh token directamente desde el JWT (en los claims)
                var refreshToken = jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == "RefreshToken")?.Value;

                if (string.IsNullOrEmpty(refreshToken))
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    GeneraExcepcion(context, "No hay refresh token.");
                    return;
                }

                /* ESTA FUNCION OBTIENE EL USER DE LA BASE DE DATOS A PARTIR DEL REFRESHTOKEN
                var user = await GetUserFromRefreshTokenAsync(refreshToken);
                if (user == null)
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    await context.Response.WriteAsync("Refresh token invalido.");
                    return;
                }
                */

                /* VALIDA EL TIEMPO DE EXPIRAICON DEL REFRESH TOKEN
                if(user.RefreshTokenExpires != null && user.RefreshTokenExpires < DateTime.Now)
                {
                    await ClearRefreshTokenAsync(user.RefreshToken);
                    context.Response.StatusCode = 401; // Unauthorized
                    await context.Response.WriteAsync("Refres Token expiro.");
                    return;
                }
                */

                // Generar nuevo token en base al usuario obtenido
                var newToken = tokenService.GenerateToken("middleware", refreshToken);
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
        /*
        private async Task<User> GetUserFromRefreshTokenAsync(string refreshToken)
        {
            // Aquí accedemos al DbContext usando el IServiceProvider
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                return await dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            }
        }
        */

        /* 
        private async Task ClearRefreshTokenAsync(string refreshToken)
        {
            // Aquí accedemos al DbContext usando el IServiceProvider
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Obtener el usuario que tiene el refresh token
                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

                if (user != null)
                {
                    // Limpiar los valores de refreshToken y refreshTokenExpires
                    user.RefreshToken = null;
                    user.RefreshTokenExpires = null;

                    // Guardar los cambios en la base de datos
                    await dbContext.SaveChangesAsync();
                }
            }
        */
    }
}
