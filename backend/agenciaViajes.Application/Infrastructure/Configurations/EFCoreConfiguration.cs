using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    public static class EFCoreConfiguration
    {
        public static IServiceCollection InjectDbContext(this IServiceCollection services, IConfiguration configuration)
        {

                        // Especificar explícitamente la assembly donde residen las migraciones
                        var migrationsAssemblyName = typeof(AppDbContext).Assembly.GetName().Name;
                        services.AddDbContext<AppDbContext>(options =>
                            options.UseNpgsql(
                                    configuration.GetConnectionString("IbarraTravelDB"),
                                    npgsql => npgsql.MigrationsAssembly(migrationsAssemblyName)));


            return services;
        }

        // Aqui va la configuracion para la generacion del token y la seguridad
    }
}
