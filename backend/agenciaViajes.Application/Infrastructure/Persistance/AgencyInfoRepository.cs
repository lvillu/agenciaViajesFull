using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class AgencyInfoRepository : IAgencyInfoRepository
    {
        private readonly AppDbContext _context;

        public AgencyInfoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AgencyInfo?> GetAsync(CancellationToken cancellationToken = default)
        {
            return await _context.AgencyInfo.FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<AgencyInfo> UpsertAsync(AgencyInfo agencyInfo, CancellationToken cancellationToken = default)
        {
            agencyInfo.UpdatedAt = DateTime.UtcNow;

            var existing = await _context.AgencyInfo.FirstOrDefaultAsync(cancellationToken);
            if (existing == null)
            {
                agencyInfo.Id = 1;
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
