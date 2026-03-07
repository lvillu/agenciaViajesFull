using agenciaViajes.Application.Features.Sale.Common.Requests;
using agenciaViajes.Application.Features.Sale.CreateSale;
using agenciaViajes.Application.Features.Sale.DeleteSale;
using agenciaViajes.Application.Features.Sale.GetSaleById;
using agenciaViajes.Application.Features.Sale.GetSalesList;
using agenciaViajes.Application.Features.Sale.UpdateSale;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class SaleRoutes
    {
        public const string ROUTE_TAGS = "Sale";
        public const string BASE_URL = "/api/Sale";

        public static void AddSaleRoutes(this IEndpointRouteBuilder app)
        {
            var saleGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();

            saleGroup.MapGet("/", GetSalesList);
            saleGroup.MapGet("/{id:int}", GetSaleById);
            saleGroup.MapPost("/", CreateSale);
            saleGroup.MapPut("/{id:int}", UpdateSale);
            saleGroup.MapDelete("/{id:int}", DeleteSale);
        }

        private static async Task<IResult> GetSalesList(
            ISender sender,
            bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            var response = await sender.Send(new GetSalesListQuery(includeInactive), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetSaleById(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetSaleByIdQuery(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }

        private static async Task<IResult> CreateSale(
            CreateSaleRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreateSaleCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> UpdateSale(
            int id,
            UpdateSaleRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateSaleCommand(id, request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> DeleteSale(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new DeleteSaleCommand(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }
    }
}
