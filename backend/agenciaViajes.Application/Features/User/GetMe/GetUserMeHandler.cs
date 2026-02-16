using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.GetMe
{
    public class GetUserMeHandler : IRequestHandler<GetUserMeQuery, Result<UserMeResponse>>
    {
        private readonly IAuthRepository _authRepository;

        public GetUserMeHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<Result<UserMeResponse>> Handle(GetUserMeQuery request, CancellationToken cancellationToken)
        {
            // Buscar el usuario por nombre de usuario
            var user = await _authRepository.GetUserByUserNameAsync(request.UserName, cancellationToken);

            if (user == null)
            {
                return Result<UserMeResponse>.Failure("Usuario no encontrado");
            }

            // Mapear a response
            var response = new UserMeResponse
            {
                FullName = $"{user.Name} {user.LastName}",
                Email = user.Email,
                UserName = user.UserName,
                UserIconUrl = user.UserIconUrl
            };

            return Result<UserMeResponse>.Success(response);
        }
    }
}
