using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    public static class SwaggerConfiguration
    {
        public static IServiceCollection AddSwagerExplorer(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Mi API",
                    Version = "v1",
                    Description = "Descripción de tu API"
                });

                c.AddSecurityDefinition("JWT",
                    new OpenApiSecurityScheme
                    {
                        Description = "JWT Authorization header using the Bearer Schema",
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.Http,
                        Scheme = "Bearer"
                    });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "JWT"
                            }
                        },
                        new List<string>()
                    } });
            });

            return services;
        }

        public static WebApplication ConfigureSwaggerExplorer(this WebApplication app)
        {
            // Fase 4: Swagger solo en desarrollo (exponía el esquema completo en prod)
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            return app;
        }
    }
}
