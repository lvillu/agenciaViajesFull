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

            // NOTA (Fase 5): no usar EnableRetryOnFailure aquí. La estrategia de
            // reintentos es incompatible con las transacciones explícitas de
            // TransactionBehaivor (todos los ITransactionalCommand fallarían).
            // El resume de auto-pause se cubre con Command Timeout=120 en el
            // connection string + purga del pool por ConnectionIdleLifetime.
            services.AddDbContext<AppDbContext>(options =>
              options.UseNpgsql(configuration.GetConnectionString("IbarraTravelDB")));


            return services;
        }

        // Aqui va la configuracion para la generacion del token y la seguridad
    }
}
