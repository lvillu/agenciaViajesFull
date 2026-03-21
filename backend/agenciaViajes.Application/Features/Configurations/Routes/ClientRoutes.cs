using agenciaViajes.Application.Features.Client.Common.Requests;
using agenciaViajes.Application.Features.Client.CreateClient;
using agenciaViajes.Application.Features.Client.DeleteClient;
using agenciaViajes.Application.Features.Client.GetClientById;
using agenciaViajes.Application.Features.Client.GetClientsList;
using agenciaViajes.Application.Features.Client.UpdateClient;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class ClientRoutes
    {
        public const string ROUTE_TAGS = "Client";
        public const string BASE_URL = "/api/Client";

        public static void AddClientRoutes(this IEndpointRouteBuilder app)
        {
            var clientGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();  // Requiere autenticación

            clientGroup.MapGet("/", GetClientsList);
            clientGroup.MapGet("/{id:int}", GetClientById);
            clientGroup.MapPost("/", CreateClient);
            clientGroup.MapPut("/{id:int}", UpdateClient);
            clientGroup.MapDelete("/{id:int}", DeleteClient);
        }

        private static async Task<IResult> GetClientsList(
            ISender sender,
            bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            var response = await sender.Send(new GetClientsListQuery(includeInactive), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetClientById(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetClientByIdQuery(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }

        private static async Task<IResult> CreateClient(
            CreateClientRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreateClientCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> UpdateClient(
            int id,
            UpdateClientRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateClientCommand(id, request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> DeleteClient(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new DeleteClientCommand(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }
    }
}
