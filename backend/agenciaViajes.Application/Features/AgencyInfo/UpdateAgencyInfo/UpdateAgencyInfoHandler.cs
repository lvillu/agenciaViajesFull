using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.AgencyInfo.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo
{
    public class UpdateAgencyInfoHandler : IRequestHandler<UpdateAgencyInfoCommand, Result<AgencyInfoResponse>>
    {
        private readonly IAgencyInfoRepository _agencyInfoRepository;

        public UpdateAgencyInfoHandler(IAgencyInfoRepository agencyInfoRepository)
        {
            _agencyInfoRepository = agencyInfoRepository;
        }

        public async Task<Result<AgencyInfoResponse>> Handle(UpdateAgencyInfoCommand request, CancellationToken cancellationToken)
        {
            var agencyInfo = new Domain.Entities.AgencyInfo
            {
                Name = request.Request.Name,
                Address = request.Request.Address,
                City = request.Request.City,
                State = request.Request.State,
                ZipCode = request.Request.ZipCode,
                Phone = request.Request.Phone,
                Email = request.Request.Email,
                SecturReg = request.Request.SecturReg,
                Facebook = request.Request.Facebook,
                Instagram = request.Request.Instagram,
                LogoUrl = request.Request.LogoUrl
            };

            agencyInfo = await _agencyInfoRepository.UpsertAsync(agencyInfo, cancellationToken);

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

            return Result<AgencyInfoResponse>.Success(response, "Información de la agencia actualizada exitosamente");
        }
    }
}
