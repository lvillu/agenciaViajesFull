using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Requests;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.UpdateSubAccount
{
    public sealed record UpdateSubAccountCommand(
        int Id,
        UpdateSubAccountRequest Request
    ) : IRequest<Result<SubAccountResponse>>, ITransactionalCommand { }
}
