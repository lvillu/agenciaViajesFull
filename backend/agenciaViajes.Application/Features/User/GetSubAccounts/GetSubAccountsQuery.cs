using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.GetSubAccounts
{
    public sealed record GetSubAccountsQuery() : IRequest<Result<List<SubAccountResponse>>>;
}
