using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.CreateProvider;
using agenciaViajes.Application.Features.Provider.DeleteProvider;
using agenciaViajes.Application.Features.Provider.GetProviderById;
using agenciaViajes.Application.Features.Provider.GetProvidersList;
using agenciaViajes.Application.Features.Provider.UpdateProvider;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class ProviderRoutes
    {
        public const string ROUTE_TAGS = "Provider";
        public const string BASE_URL = "/api/Provider";

        public static void AddProviderRoutes(this IEndpointRouteBuilder app)
        {
            var providerGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();  // Requiere autenticación

            providerGroup.MapGet("/", GetProvidersList);
            providerGroup.MapGet("/{id:int}", GetProviderById);
            providerGroup.MapPost("/", CreateProvider);
            providerGroup.MapPut("/{id:int}", UpdateProvider);
            providerGroup.MapDelete("/{id:int}", DeleteProvider);
        }

        private static async Task<IResult> GetProvidersList(
            ISender sender,
            bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            var response = await sender.Send(new GetProvidersListQuery(includeInactive), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetProviderById(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetProviderByIdQuery(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }

        private static async Task<IResult> CreateProvider(
            CreateProviderRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreateProviderCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> UpdateProvider(
            int id,
            UpdateProviderRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateProviderCommand(id, request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> DeleteProvider(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new DeleteProviderCommand(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }
    }
}
