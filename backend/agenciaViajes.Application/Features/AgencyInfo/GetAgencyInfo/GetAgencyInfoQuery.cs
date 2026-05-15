using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.AgencyInfo.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.AgencyInfo.GetAgencyInfo
{
    public sealed record GetAgencyInfoQuery() : IRequest<Result<AgencyInfoResponse>> { }
}
