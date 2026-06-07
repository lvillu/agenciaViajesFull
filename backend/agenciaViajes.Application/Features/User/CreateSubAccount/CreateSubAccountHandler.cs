using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Features.User.CreateSubAccount
{
    public class CreateSubAccountHandler : IRequestHandler<CreateSubAccountCommand, Result<SubAccountResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAccountService _accountService;

        public CreateSubAccountHandler(
            IUserRepository userRepository,
            IAccountService accountService)
        {
            _userRepository = userRepository;
            _accountService = accountService;
        }

        public async Task<Result<SubAccountResponse>> Handle(CreateSubAccountCommand request, CancellationToken cancellationToken)
        {
            // Only account owners can create sub-accounts
            if (_accountService.Role != "owner")
            {
                return Result<SubAccountResponse>.Failure("Solo el titular de la cuenta puede crear subcuentas");
            }

            // Validate username doesn't already exist
            var userNameExists = await _userRepository.UserNameExistsAsync(request.Request.userName, cancellationToken);
            if (userNameExists)
            {
                return Result<SubAccountResponse>.Failure($"El nombre de usuario '{request.Request.userName}' ya está registrado");
            }

            // Create sub-account user with same AccountId as owner
            var subAccount = new UserEntity
            {
                Name = request.Request.name,
                LastName = request.Request.lastName,
                UserName = request.Request.userName,
                Email = request.Request.email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Request.password),
                Active = true,
                AccountId = _accountService.AccountId,
                Role = "subaccount",
                ParentUserId = _accountService.UserId,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _userRepository.CreateAsync(subAccount, cancellationToken);

            var response = new SubAccountResponse
            {
                Id = created.Id,
                Name = created.Name,
                LastName = created.LastName,
                UserName = created.UserName,
                Email = created.Email,
                Active = created.Active,
                CreatedAt = DateTime.UtcNow
            };

            return Result<SubAccountResponse>.Success(response, "Subcuenta creada exitosamente");
        }
    }
}
