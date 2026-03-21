using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientById
{
    public sealed record GetClientByIdQuery(int Id) : IRequest<Result<ClientResponse>> { }
}
