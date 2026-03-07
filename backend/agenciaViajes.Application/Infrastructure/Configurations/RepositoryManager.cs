using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Helpers;
using agenciaViajes.Application.Infrastructure.Persistance;
using Microsoft.Extensions.DependencyInjection;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    public static class RepositoryManager
    {
        public static IServiceCollection RepositoryManagerInjection(this IServiceCollection services)
        {
            //Repositorios de Rutas
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IProviderRepository, ProviderRepository>();
            services.AddScoped<IClientRepository, ClientRepository>();
            services.AddScoped<ISaleRepository, SaleRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();


            services.AddScoped<TransactionHelper>();

            //Esta entidad toma los valores del app.setting
            services.AddScoped<AppSettings>();

            return services;
        }

    }
}
