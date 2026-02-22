using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientsList
{
    public sealed record GetClientsListQuery(bool IncludeInactive = false) : IRequest<Result<List<ClientResponse>>> { }
}
