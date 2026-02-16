using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace agenciaViajes.Application.Infrastructure.Configurations
{
    public static class MediatRConfiguration
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            return services;
        }
    }
}
