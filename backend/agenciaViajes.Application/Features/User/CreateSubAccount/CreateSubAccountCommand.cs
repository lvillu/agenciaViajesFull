using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Requests;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.CreateSubAccount
{
    public sealed record CreateSubAccountCommand(
        CreateSubAccountRequest Request
    ) : IRequest<Result<SubAccountResponse>>, ITransactionalCommand { }
}
