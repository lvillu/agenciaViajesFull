using agenciaViajes.Application.Features.Dashboard.GetDashboardCards;
using agenciaViajes.Application.Features.Dashboard.GetMonthlyProfitsChart;
using agenciaViajes.Application.Features.Dashboard.GetMonthlySalesChart;
using agenciaViajes.Application.Features.Dashboard.GetSalesByProviderChart;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class DashboardRoutes
    {
        public const string ROUTE_TAGS = "Dashboard";
        public const string BASE_URL = "/api/Dashboard";

        public static void AddDashboardRoutes(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();

            group.MapGet("/cards", GetDashboardCards);
            group.MapGet("/charts/monthly-sales", GetMonthlySalesChart);
            group.MapGet("/charts/sales-by-provider", GetSalesByProviderChart);
            group.MapGet("/charts/monthly-profits", GetMonthlyProfitsChart);
        }

        private static async Task<IResult> GetDashboardCards(
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetDashboardCardsQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetMonthlySalesChart(
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetMonthlySalesChartQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetSalesByProviderChart(
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetSalesByProviderChartQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetMonthlyProfitsChart(
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetMonthlyProfitsChartQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }
    }
}
