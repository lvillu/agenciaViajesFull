using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.Login;
using agenciaViajes.Application.Features.Auth.Logout;
using agenciaViajes.Application.Features.Auth.SignUp;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class AuthRoutes
    {
        public const string ROUTE_TAGS = "Auth";
        public const string BASE_URL = "/api/Auth";

        public static void AddAuthRoutes(this IEndpointRouteBuilder app)
        {
            var authGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS);

            authGroup.MapPost("/login", Login);
            authGroup.MapPost("/logout", Logout);
            authGroup.MapPost("/signup", SignUp);
        }

        private static async Task<IResult> Login([FromBody] AuthRequest command, ISender sender, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new LoginCommand(command), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NoContent();
        }

        private static async Task<IResult> Logout(HttpContext context, ISender sender, CancellationToken cancellationToken)
        {
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (string.IsNullOrEmpty(token))
                return Results.Unauthorized();

            var response = await sender.Send(new LogoutCommand(token), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NoContent();
        }

        private static async Task<IResult> SignUp([FromBody] SignUpRequest request, ISender sender, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new SignUpCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

    }
}
