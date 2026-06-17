using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.UpdateSubAccount
{
    public class UpdateSubAccountHandler : IRequestHandler<UpdateSubAccountCommand, Result<SubAccountResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAccountService _accountService;

        public UpdateSubAccountHandler(
            IUserRepository userRepository,
            IAccountService accountService)
        {
            _userRepository = userRepository;
            _accountService = accountService;
        }

        public async Task<Result<SubAccountResponse>> Handle(UpdateSubAccountCommand command, CancellationToken cancellationToken)
        {
            // Only account owners can update sub-accounts
            if (_accountService.Role != "owner")
            {
                return Result<SubAccountResponse>.Failure("Solo el titular de la cuenta puede modificar subcuentas");
            }

            var user = await _userRepository.GetByIdAsync(command.Id, cancellationToken);
            if (user is null)
            {
                return Result<SubAccountResponse>.Failure("Subcuenta no encontrada");
            }

            // Verify the user belongs to the same account
            if (user.AccountId != _accountService.AccountId)
            {
                return Result<SubAccountResponse>.Failure("No tienes permiso para modificar esta subcuenta");
            }

            if (user.Role != "subaccount")
            {
                return Result<SubAccountResponse>.Failure("Solo se pueden modificar subcuentas");
            }

            // Update fields
            user.Name = command.Request.name;
            user.LastName = command.Request.lastName;
            user.Email = command.Request.email;
            user.Active = command.Request.active;

            await _userRepository.UpdateAsync(user, cancellationToken);

            var response = new SubAccountResponse
            {
                Id = user.Id,
                Name = user.Name,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                Active = user.Active,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };

            return Result<SubAccountResponse>.Success(response, "Subcuenta actualizada exitosamente");
        }
    }
}
