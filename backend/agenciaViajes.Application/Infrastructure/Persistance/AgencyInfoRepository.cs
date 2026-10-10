using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class AgencyInfoRepository : IAgencyInfoRepository
    {
        private readonly AppDbContext _context;
        private readonly IAccountService _accountService;

        public AgencyInfoRepository(AppDbContext context, IAccountService accountService)
        {
            _context = context;
            _accountService = accountService;
        }

        // Tenant actual resuelto desde el JWT (claim accountId).
        private Guid AccountId => _accountService.AccountId;

        public async Task<AgencyInfo?> GetAsync(CancellationToken cancellationToken = default)
        {
            return await _context.AgencyInfo
                .FirstOrDefaultAsync(a => a.AccountId == AccountId, cancellationToken);
        }

        public async Task<AgencyInfo> UpsertAsync(AgencyInfo agencyInfo, CancellationToken cancellationToken = default)
        {
            agencyInfo.UpdatedAt = DateTime.UtcNow;

            var existing = await _context.AgencyInfo
                .FirstOrDefaultAsync(a => a.AccountId == AccountId, cancellationToken);
            if (existing == null)
            {
                agencyInfo.AccountId = AccountId;
                _context.AgencyInfo.Add(agencyInfo);
            }
            else
            {
                existing.Name = agencyInfo.Name;
                existing.Address = agencyInfo.Address;
                existing.City = agencyInfo.City;
                existing.State = agencyInfo.State;
                existing.ZipCode = agencyInfo.ZipCode;
                existing.Phone = agencyInfo.Phone;
                existing.Email = agencyInfo.Email;
                existing.SecturReg = agencyInfo.SecturReg;
                existing.Facebook = agencyInfo.Facebook;
                existing.Instagram = agencyInfo.Instagram;
                existing.LogoUrl = agencyInfo.LogoUrl;
                existing.UpdatedAt = agencyInfo.UpdatedAt;
                agencyInfo = existing;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return agencyInfo;
        }
    }
}
