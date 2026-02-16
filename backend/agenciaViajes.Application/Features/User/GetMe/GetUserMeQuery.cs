using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.GetMe
{
    public sealed record GetUserMeQuery(string UserName) : IRequest<Result<UserMeResponse>> { }
}
