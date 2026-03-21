using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetMonthlyProfitsChart
{
    public sealed record GetMonthlyProfitsChartQuery() : IRequest<Result<ChartDataResponse>> { }
}
