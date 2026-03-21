using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetMonthlySalesChart
{
    public sealed record GetMonthlySalesChartQuery() : IRequest<Result<ChartDataResponse>> { }
}
