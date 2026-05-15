using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.AgencyInfo.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.AgencyInfo.GetAgencyInfo
{
    public class GetAgencyInfoHandler : IRequestHandler<GetAgencyInfoQuery, Result<AgencyInfoResponse>>
    {
        private readonly IAgencyInfoRepository _agencyInfoRepository;

        public GetAgencyInfoHandler(IAgencyInfoRepository agencyInfoRepository)
        {
            _agencyInfoRepository = agencyInfoRepository;
        }

        public async Task<Result<AgencyInfoResponse>> Handle(GetAgencyInfoQuery request, CancellationToken cancellationToken)
        {
            var agencyInfo = await _agencyInfoRepository.GetAsync(cancellationToken);

            if (agencyInfo == null)
                return Result<AgencyInfoResponse>.Failure("No se ha configurado la información de la agencia");

            var response = new AgencyInfoResponse
            {
                Id = agencyInfo.Id,
                Name = agencyInfo.Name,
                Address = agencyInfo.Address,
                City = agencyInfo.City,
                State = agencyInfo.State,
                ZipCode = agencyInfo.ZipCode,
                Phone = agencyInfo.Phone,
                Email = agencyInfo.Email,
                SecturReg = agencyInfo.SecturReg,
                Facebook = agencyInfo.Facebook,
                Instagram = agencyInfo.Instagram,
                LogoUrl = agencyInfo.LogoUrl,
                UpdatedAt = agencyInfo.UpdatedAt
            };

            return Result<AgencyInfoResponse>.Success(response);
        }
    }
}
