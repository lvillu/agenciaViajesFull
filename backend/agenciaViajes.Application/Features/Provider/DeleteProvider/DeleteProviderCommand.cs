using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.DeleteProvider
{
    public sealed record DeleteProviderCommand(int Id) : IRequest<Result>, ITransactionalCommand { }
}
