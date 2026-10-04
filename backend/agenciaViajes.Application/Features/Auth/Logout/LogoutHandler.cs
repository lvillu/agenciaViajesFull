using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Logout
{
    public class LogoutHandler : IRequestHandler<LogoutCommand, Result<bool>>
    {
        private readonly IAuthRepository _authRepository;

        public LogoutHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }
        public async Task<Result<bool>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return Result<bool>.Success(false);
            }

            var revoked = await _authRepository.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);
            return Result<bool>.Success(revoked);
        }
    }
}
