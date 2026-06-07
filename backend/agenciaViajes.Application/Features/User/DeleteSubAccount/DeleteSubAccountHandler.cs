using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.User.DeleteSubAccount
{
    public class DeleteSubAccountHandler : IRequestHandler<DeleteSubAccountCommand, Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAccountService _accountService;

        public DeleteSubAccountHandler(
            IUserRepository userRepository,
            IAccountService accountService)
        {
            _userRepository = userRepository;
            _accountService = accountService;
        }

        public async Task<Result> Handle(DeleteSubAccountCommand request, CancellationToken cancellationToken)
        {
            // Only account owners can delete sub-accounts
            if (_accountService.Role != "owner")
            {
                return Result.Failure("Solo el titular de la cuenta puede eliminar subcuentas");
            }

            // Find the sub-account
            var subAccount = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
            if (subAccount == null)
            {
                return Result.Failure("Subcuenta no encontrada");
            }

            // Verify the sub-account belongs to the same account
            if (subAccount.AccountId != _accountService.AccountId)
            {
                return Result.Failure("La subcuenta no pertenece a esta cuenta");
            }

            // Verify it's actually a sub-account
            if (subAccount.Role != "subaccount")
            {
                return Result.Failure("No se puede eliminar el usuario principal de esta forma");
            }

            // Soft delete
            subAccount.Active = false;
            await _userRepository.UpdateAsync(subAccount, cancellationToken);

            return Result.Success();
        }
    }
}
