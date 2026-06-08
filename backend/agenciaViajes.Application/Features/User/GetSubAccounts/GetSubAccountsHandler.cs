using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.User.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.User.GetSubAccounts
{
    public class GetSubAccountsHandler : IRequestHandler<GetSubAccountsQuery, Result<List<SubAccountResponse>>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAccountService _accountService;

        public GetSubAccountsHandler(
            IUserRepository userRepository,
            IAccountService accountService)
        {
            _userRepository = userRepository;
            _accountService = accountService;
        }

        public async Task<Result<List<SubAccountResponse>>> Handle(GetSubAccountsQuery request, CancellationToken cancellationToken)
        {
            if (_accountService.Role != "owner")
            {
                return Result<List<SubAccountResponse>>.Failure("Solo el titular de la cuenta puede consultar subcuentas");
            }

            var subAccounts = await _userRepository.GetSubAccountsByAccountIdAsync(
                _accountService.AccountId, cancellationToken);

            var response = subAccounts.Select(u => new SubAccountResponse
            {
                Id = u.Id,
                Name = u.Name,
                LastName = u.LastName,
                UserName = u.UserName,
                Email = u.Email,
                Active = u.Active,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }).ToList();

            return Result<List<SubAccountResponse>>.Success(response);
        }
    }
}
