using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Refresh
{
    public sealed record RefreshCommand(string RefreshToken) : IRequest<Result<AuthResponse>>, ITransactionalCommand { }
}
