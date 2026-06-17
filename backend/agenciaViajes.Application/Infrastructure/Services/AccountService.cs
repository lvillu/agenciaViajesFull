using agenciaViajes.Application.Domain.Shared;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace agenciaViajes.Application.Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AccountService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid AccountId
        {
            get
            {
                try
                {
                    var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("accountId")?.Value;
                    if (claim != null && Guid.TryParse(claim, out var accountId))
                        return accountId;
                }
                catch
                {
                    // No HttpContext available (e.g., migration, background job)
                }
                return Guid.Empty;
            }
        }

        public int UserId
        {
            get
            {
                try
                {
                    var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId")?.Value;
                    if (claim != null && int.TryParse(claim, out var userId))
                        return userId;
                }
                catch { }
                return 0;
            }
        }

        public string Role
        {
            get
            {
                try
                {
                    return _httpContextAccessor.HttpContext?.User?.FindFirst("role")?.Value ?? string.Empty;
                }
                catch
                {
                    return string.Empty;
                }
            }
        }

        public string UserName
        {
            get
            {
                try
                {
                    return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
                }
                catch
                {
                    return string.Empty;
                }
            }
        }
    }
}
