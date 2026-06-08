using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.User.SetFolioStart;

public class SetFolioStartHandler : IRequestHandler<SetFolioStartCommand, Result<bool>>
{
    private readonly IUserRepository _userRepository;
    private readonly IAccountService _accountService;

    public SetFolioStartHandler(
        IUserRepository userRepository,
        IAccountService accountService)
    {
        _userRepository = userRepository;
        _accountService = accountService;
    }

    public async Task<Result<bool>> Handle(SetFolioStartCommand request, CancellationToken cancellationToken)
    {
        // Only the account owner can set the folio start
        if (_accountService.Role != "owner")
        {
            return Result<bool>.Failure("Solo el titular de la cuenta puede configurar el folio inicial");
        }

        // Validate folio start (must be >= 1)
        if (request.FolioStart < 1)
        {
            return Result<bool>.Failure("El folio inicial debe ser mayor o igual a 1");
        }

        // Get the owner user for this account
        var owner = await _userRepository.GetOwnerByAccountIdAsync(_accountService.AccountId, cancellationToken);
        if (owner == null)
        {
            return Result<bool>.Failure("No se encontró el usuario titular");
        }

        // Update the folio start
        owner.FolioStart = request.FolioStart;
        await _userRepository.UpdateAsync(owner, cancellationToken);

        return Result<bool>.Success(true, "Folio inicial configurado exitosamente");
    }
}
