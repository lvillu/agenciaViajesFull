using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Requests;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.UpdateClient
{
    public sealed record UpdateClientCommand(int Id, UpdateClientRequest Request) : IRequest<Result<ClientResponse>>, ITransactionalCommand { }
}
