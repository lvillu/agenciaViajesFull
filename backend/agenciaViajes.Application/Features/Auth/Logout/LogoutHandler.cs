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
            return Result<bool>.Success(_authRepository.AuthLogOut(request.Token));
        }
    }
}
