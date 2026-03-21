using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Requests;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.CreateClient
{
    public sealed record CreateClientCommand(CreateClientRequest Request) : IRequest<Result<ClientResponse>>, ITransactionalCommand { }
}
