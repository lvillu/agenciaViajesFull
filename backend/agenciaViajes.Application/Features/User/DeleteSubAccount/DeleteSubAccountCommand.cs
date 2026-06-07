using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.User.DeleteSubAccount
{
    public sealed record DeleteSubAccountCommand(int Id) : IRequest<Result>, ITransactionalCommand { }
}
