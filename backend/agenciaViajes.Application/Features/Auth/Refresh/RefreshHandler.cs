using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Refresh
{
    public class RefreshHandler : IRequestHandler<RefreshCommand, Result<AuthResponse>>
    {
        private readonly IAuthRepository _authRepository;

        public RefreshHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<Result<AuthResponse>> Handle(RefreshCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return Result<AuthResponse>.Failure("No hay refresh token.");
            }

            var stored = await _authRepository.GetRefreshTokenWithUserAsync(request.RefreshToken, cancellationToken);
            if (stored == null)
            {
                return Result<AuthResponse>.Failure("Refresh token invalido.");
            }

            if (stored.IsRevoked)
            {
                return Result<AuthResponse>.Failure("Refresh token invalido.");
            }

            if (stored.ExpiresAt < DateTime.UtcNow)
            {
                return Result<AuthResponse>.Failure("Refresh Token expiro.");
            }

            if (stored.User == null || !stored.User.Active)
            {
                return Result<AuthResponse>.Failure("Usuario inactivo.");
            }

            var window = stored.ExpiresAt - stored.CreatedAt;
            var newRefreshToken = await _authRepository.RotateRefreshTokenAsync(stored, cancellationToken);
            var newToken = _authRepository.GenerateToken(stored.User);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                userName = stored.User.UserName,
                token = newToken,
                refreshToken = newRefreshToken,
                refreshTokenExpiresInSeconds = (int)window.TotalSeconds
            });
        }
    }
}
