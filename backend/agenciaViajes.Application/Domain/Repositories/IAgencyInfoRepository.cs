using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IAgencyInfoRepository
    {
        Task<AgencyInfo?> GetAsync(CancellationToken cancellationToken = default);
        Task<AgencyInfo> UpsertAsync(AgencyInfo agencyInfo, CancellationToken cancellationToken = default);
    }
}
