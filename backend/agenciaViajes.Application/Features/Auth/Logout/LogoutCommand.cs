using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Logout
{
    public sealed record class LogoutCommand(string Token) : IRequest<Result<bool>>
    {
    }
}
