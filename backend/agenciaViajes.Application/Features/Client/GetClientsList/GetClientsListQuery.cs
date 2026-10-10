using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientsList
{
    public sealed record GetClientsListQuery(bool IncludeInactive = false, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResponse<ClientResponse>>> { }
}
