using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Login
{
    public sealed record LoginCommand(AuthRequest request) : IRequest<Result<AuthResponse>> { }
}
