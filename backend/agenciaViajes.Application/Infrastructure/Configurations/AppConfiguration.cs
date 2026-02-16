using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Infrastructure.Behaivor;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.Text;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    public static class AppConfiguration
    {
        public static IServiceCollection ConfigureCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .WithExposedHeaders("Content-Length", "Content-Type") // Headers expuestos explícitamente
                          .SetPreflightMaxAge(TimeSpan.FromHours(12))
                          .SetIsOriginAllowedToAllowWildcardSubdomains()
                          .WithHeaders(HeaderNames.CacheControl, "public, max-age=30") // Opcional
                          .WithHeaders(HeaderNames.Vary, ""); // ⬅️ Esto elimina el header Vary
                });
            });

            return services;
        }


        public static IServiceCollection AddAppConfig(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<AppSettings>(config.GetSection("AppSettings"));

            return services;
        }

        public static IServiceCollection AddFluentValidationConfig(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(typeof(Class1).Assembly);
            return services;
        }

        public static IServiceCollection AddBehaivorConfig(this IServiceCollection services)
        {
            //Validaciones
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaivor<,>));

            //Transacciones 
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehaivor<,>));
            return services;
        }

        public static IServiceCollection AddAuthenticationAuthorization(this IServiceCollection services, IConfiguration config)
        {

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtSettings = config.GetSection("AppSettings");
                    var secretKey = jwtSettings.GetValue<string>("SecretKey");

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                    };
                });

            services.AddAuthorization();

            return services;
        }
    }
}
