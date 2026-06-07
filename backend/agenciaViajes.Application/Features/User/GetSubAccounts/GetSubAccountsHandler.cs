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
                CreatedAt = u.CreatedAt
            }).ToList();

            return Result<List<SubAccountResponse>>.Success(response);
        }
    }
}
