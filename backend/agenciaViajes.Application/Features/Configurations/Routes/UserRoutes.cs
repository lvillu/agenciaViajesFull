using agenciaViajes.Application.Features.User.GetMe;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class UserRoutes
    {
        public const string ROUTE_TAGS = "User";
        public const string BASE_URL = "/api/User";

        public static void AddUserRoutes(this IEndpointRouteBuilder app)
        {
            var userGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();  // Requiere autenticación

            userGroup.MapGet("/me", GetUserMe);
        }

        private static async Task<IResult> GetUserMe(HttpContext context, ISender sender, CancellationToken cancellationToken)
        {
            // Obtener el username del token JWT (claim "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")
            var userName = context.User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(userName))
                return Results.Unauthorized();

            var response = await sender.Send(new GetUserMeQuery(userName), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }
    }
}
