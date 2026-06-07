using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Features.User.CreateSubAccount;
using agenciaViajes.Application.Features.User.DeleteSubAccount;
using agenciaViajes.Application.Features.User.GetMe;
using agenciaViajes.Application.Features.User.GetSubAccounts;
using agenciaViajes.Application.Features.User.UpdateSubAccount;
using agenciaViajes.Application.Features.User.UploadAvatar;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
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

            // Avatar management
            userGroup.MapPost("/avatar", UploadAvatar);
            userGroup.MapGet("/avatar/{userId:int}", GetAvatarFile);

            // Sub-account management
            userGroup.MapGet("/subaccounts", GetSubAccounts);
            userGroup.MapPost("/subaccounts", CreateSubAccount);
            userGroup.MapPut("/subaccounts/{id:int}", UpdateSubAccount);
            userGroup.MapDelete("/subaccounts/{id:int}", DeleteSubAccount);
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

        private static async Task<IResult> GetSubAccounts(ISender sender, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetSubAccountsQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> CreateSubAccount(
            agenciaViajes.Application.Features.User.Common.Requests.CreateSubAccountRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreateSubAccountCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> UpdateSubAccount(
            int id,
            agenciaViajes.Application.Features.User.Common.Requests.UpdateSubAccountRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateSubAccountCommand(id, request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> DeleteSubAccount(int id, ISender sender, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new DeleteSubAccountCommand(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        /// <summary>
        /// Sube/actualiza el avatar del usuario autenticado.
        /// Recibe multipart/form-data con un campo "file" (JPG o PNG, máx 2 MB).
        /// </summary>
        private static async Task<IResult> UploadAvatar(HttpContext context, ISender sender, CancellationToken cancellationToken)
        {
            var file = context.Request.Form.Files.FirstOrDefault();
            if (file is null)
            {
                var errorResult = Result<string>.Failure("No se ha proporcionado un archivo");
                return Results.BadRequest(errorResult);
            }

            var response = await sender.Send(new UploadAvatarCommand(file), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        /// <summary>
        /// Obtiene el archivo de avatar de un usuario por su ID.
        /// </summary>
        private static async Task<IResult> GetAvatarFile(int userId, IOptions<UploadsPathSettings> uploadsPath, CancellationToken cancellationToken)
        {
            var filePath = Path.Combine(uploadsPath.Value.Avatars, $"avatar_{userId}.jpg");

            if (!File.Exists(filePath))
            {
                return Results.NotFound(new { message = "Avatar no encontrado" });
            }

            var fileBytes = await File.ReadAllBytesAsync(filePath, cancellationToken);
            return Results.File(fileBytes, "image/jpeg");
        }
    }
}
