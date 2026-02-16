using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class ApiBaseRoutes
    {
        public const string ROUTE_TAGS = "Base";
        public const string BASE_URL = "/api/Base";

        public static void AddApiRoutes(this IEndpointRouteBuilder app)
        {
            var authGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS);

            authGroup.MapGet("/protected", Protected).RequireAuthorization();
            authGroup.MapGet("/unprotected", UnProtected);
            authGroup.MapGet("/unprotected-cache", UnProtectedCache);
        }

        private static Task<IResult> Protected(ISender sender, CancellationToken cancellationToken)
        {
            return Task.FromResult(Results.Ok("API PRIVADA"));
        }

        private static Task<IResult> UnProtected(ISender sender, CancellationToken cancellationToken)
        {
            return Task.FromResult(Results.Ok("API PUBLICA"));
        }

        private static DateTime _lastCall = DateTime.MinValue;
        private static int _callCount = 0;

        public static Task<IResult> UnProtectedCache(ISender sender, CancellationToken cancellationToken)
        {
            _callCount++;
            var now = DateTime.UtcNow;
            var timeSinceLastCall = now - _lastCall;
            _lastCall = now;

            var response = new
            {
                Message = "API PUBLICA CON CACHE",
                CurrentTime = now.ToString("O"),
                TimeSinceLastCall = timeSinceLastCall.ToString(),
                CallCount = _callCount,
                Data = new[] { "item1", "item2", "item3" }
            };

            return Task.FromResult(Results.Ok(response));
        }
    }
}
