using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.Login;
using agenciaViajes.Application.Features.Auth.Logout;
using agenciaViajes.Application.Features.Auth.Refresh;
using agenciaViajes.Application.Features.Auth.SignUp;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class AuthRoutes
    {
        public const string ROUTE_TAGS = "Auth";
        public const string BASE_URL = "/api/Auth";
        public const string REFRESH_COOKIE_NAME = "refresh_token";

        public static void AddAuthRoutes(this IEndpointRouteBuilder app)
        {
            var authGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS);

            authGroup.MapPost("/login", Login);
            authGroup.MapPost("/logout", Logout);
            authGroup.MapPost("/signup", SignUp);
            authGroup.MapPost("/refresh", Refresh);
        }

        private static async Task<IResult> Login(AuthRequest command, ISender sender, HttpContext context, IOptions<AppSettings> appSettings, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new LoginCommand(command), cancellationToken);
            if (!response.IsSuccess || response.Data == null)
            {
                return Results.NoContent();
            }

            AppendRefreshCookie(context, response.Data.refreshToken, response.Data.refreshTokenExpiresInSeconds, appSettings.Value);
            return Results.Ok(response);
        }

        private static async Task<IResult> Logout(HttpContext context, ISender sender, CancellationToken cancellationToken)
        {
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var refreshToken = context.Request.Cookies[REFRESH_COOKIE_NAME];

            // La cookie se limpia siempre; el refresh token se revoca si existe
            context.Response.Cookies.Delete(REFRESH_COOKIE_NAME, new CookieOptions { Path = "/" });

            var response = await sender.Send(new LogoutCommand(token, refreshToken), cancellationToken);
            return Results.Ok(response);
        }

        private static async Task<IResult> Refresh(HttpContext context, ISender sender, IOptions<AppSettings> appSettings, CancellationToken cancellationToken)
        {
            var refreshToken = context.Request.Cookies[REFRESH_COOKIE_NAME];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Results.Unauthorized();
            }

            var response = await sender.Send(new RefreshCommand(refreshToken), cancellationToken);
            if (!response.IsSuccess || response.Data == null)
            {
                return Results.Unauthorized();
            }

            AppendRefreshCookie(context, response.Data.refreshToken, response.Data.refreshTokenExpiresInSeconds, appSettings.Value);
            return Results.Ok(response);
        }

        private static async Task<IResult> SignUp(SignUpRequest request, ISender sender, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new SignUpCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static void AppendRefreshCookie(HttpContext context, string? refreshToken, int maxAgeInSeconds, AppSettings appSettings)
        {
            if (string.IsNullOrEmpty(refreshToken) || maxAgeInSeconds <= 0)
            {
                return;
            }

            context.Response.Cookies.Append(REFRESH_COOKIE_NAME, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = appSettings.CookieSecure,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddSeconds(maxAgeInSeconds),
                MaxAge = TimeSpan.FromSeconds(maxAgeInSeconds)
            });
        }
    }
}
