using agenciaViajes.Application.Features.Configurations.Routes;
using Microsoft.AspNetCore.Builder;

namespace agenciaViajes.Application.Features.Configurations.Modules
{
    public static class ModulesConfiguration
    {
        public static void Configure(WebApplication app)
        {
            var cacheablePaths = new[]
            {
            "/api/Base/unprotected-cache"
        };

            app.Use(async (context, next) =>
            {

                if (cacheablePaths.Any(path => context.Request.Path.StartsWithSegments(path)))
                {
                    context.Response.Headers["Cache-Control"] = "public, max-age=30";
                }
                await next();
            });

            app.AddAuthRoutes();
            app.AddUserRoutes();
            app.AddProviderRoutes();
            app.AddClientRoutes();
            app.AddSaleRoutes();
            app.AddPaymentRoutes();
            app.AddDashboardRoutes();
            app.AddApiRoutes();

        }

    }
}
