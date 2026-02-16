using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Features.Auth.SignUp
{
    public class SignUpHandler : IRequestHandler<SignUpCommand, Result<UserResponse>>
    {
        private readonly IAuthRepository _authRepository;

        public SignUpHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<Result<UserResponse>> Handle(SignUpCommand request, CancellationToken cancellationToken)
        {
            // Validar que el usuario no exista
            var userExists = await _authRepository.UserExistsAsync(request.Request.UserName, cancellationToken);
            if (userExists)
            {
                return Result<UserResponse>.Failure($"El nombre de usuario '{request.Request.UserName}' ya está registrado");
            }

            // Crear nuevo usuario
            var user = new UserEntity
            {
                Name = request.Request.Name,
                LastName = request.Request.LastName,
                UserName = request.Request.UserName,
                Email = request.Request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Request.Password),
                Active = true,
                RefreshToken = null,
                RefreshTokenExpiryTime = null,
                UserIconUrl = null
            };

            // Registrar usuario en la BD
            var createdUser = await _authRepository.CreateUserAsync(user, cancellationToken);

            // Mapear a response
            var response = new UserResponse
            {
                Id = createdUser.Id,
                Name = createdUser.Name,
                LastName = createdUser.LastName,
                UserName = createdUser.UserName,
                Email = createdUser.Email,
                UserIconUrl = createdUser.UserIconUrl,
                Active = createdUser.Active,
                CreatedAt = DateTime.UtcNow
            };

            return Result<UserResponse>.Success(response, "Usuario registrado exitosamente");
        }
    }
}
