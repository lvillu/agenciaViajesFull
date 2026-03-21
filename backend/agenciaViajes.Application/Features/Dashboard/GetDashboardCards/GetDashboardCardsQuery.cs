using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetDashboardCards
{
    public sealed record GetDashboardCardsQuery() : IRequest<Result<DashboardCardsResponse>> { }
}
