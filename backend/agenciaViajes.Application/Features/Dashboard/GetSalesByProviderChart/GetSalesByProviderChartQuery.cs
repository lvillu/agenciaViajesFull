using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetSalesByProviderChart
{
    public sealed record GetSalesByProviderChartQuery() : IRequest<Result<ChartDataResponse>> { }
}
