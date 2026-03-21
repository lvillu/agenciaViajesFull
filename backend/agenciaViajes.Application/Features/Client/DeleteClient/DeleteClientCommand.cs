using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Client.DeleteClient
{
    public sealed record DeleteClientCommand(int Id) : IRequest<Result>, ITransactionalCommand { }
}
