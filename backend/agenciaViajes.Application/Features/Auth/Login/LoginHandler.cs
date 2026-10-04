using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
    {
        private readonly IAuthRepository _authRepository;

        public LoginHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }
        public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var (user, token, refreshToken) = await _authRepository.AuthLoginAsync(
                request.request.username, 
                request.request.password, 
                request.request.rememberMe,
                cancellationToken);

            if (user == null || string.IsNullOrEmpty(token))
            {
                return Result<AuthResponse>.Failure("Usuario o contraseña incorrectos");
            }

            var lifetime = _authRepository.GetRefreshTokenLifetime(request.request.rememberMe);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                userName = user.UserName,
                token = token,
                refreshToken = refreshToken,
                refreshTokenExpiresInSeconds = (int)lifetime.TotalSeconds
            });
        }
    }
}
