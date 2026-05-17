using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.AgencyInfo.Common.Requests;
using agenciaViajes.Application.Features.AgencyInfo.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo
{
    public sealed record UpdateAgencyInfoCommand(
        UpdateAgencyInfoRequest Request
    ) : IRequest<Result<AgencyInfoResponse>>, ITransactionalCommand { }
}
