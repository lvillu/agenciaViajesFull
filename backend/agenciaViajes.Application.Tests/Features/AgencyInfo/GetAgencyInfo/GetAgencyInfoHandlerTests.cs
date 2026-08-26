using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.AgencyInfo.GetAgencyInfo;
using FluentAssertions;
using NSubstitute;
using AgencyInfoEntity = agenciaViajes.Application.Domain.Entities.AgencyInfo;

namespace agenciaViajes.Application.Tests.Features.AgencyInfo.GetAgencyInfo;

public class GetAgencyInfoHandlerTests
{
    private readonly IAgencyInfoRepository _agencyInfoRepository = Substitute.For<IAgencyInfoRepository>();
    private readonly GetAgencyInfoHandler _handler;

    public GetAgencyInfoHandlerTests()
    {
        _handler = new GetAgencyInfoHandler(_agencyInfoRepository);
    }

    [Fact]
    public async Task Handle_WhenNoAgencyConfigured_ReturnsFailure()
    {
        _agencyInfoRepository.GetAsync(Arg.Any<CancellationToken>()).Returns((AgencyInfoEntity?)null);

        var result = await _handler.Handle(new GetAgencyInfoQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("No se ha configurado la información de la agencia");
    }

    [Fact]
    public async Task Handle_WhenAgencyExists_ReturnsMappedResponse()
    {
        var agency = new AgencyInfoEntity
        {
            Id = 1,
            Name = "Viajes Marina",
            Address = "Av. Reforma 100",
            City = "CDMX",
            State = "CMX",
            ZipCode = "06600",
            Phone = "5551234567",
            Email = "contacto@marina.com",
            SecturReg = "SECTUR-123",
            Facebook = "fb/marina",
            Instagram = "@marina",
            LogoUrl = "https://cdn/logo.png",
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _agencyInfoRepository.GetAsync(Arg.Any<CancellationToken>()).Returns(agency);

        var result = await _handler.Handle(new GetAgencyInfoQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(1);
        result.Data.Name.Should().Be("Viajes Marina");
        result.Data.Address.Should().Be("Av. Reforma 100");
        result.Data.City.Should().Be("CDMX");
        result.Data.State.Should().Be("CMX");
        result.Data.ZipCode.Should().Be("06600");
        result.Data.Phone.Should().Be("5551234567");
        result.Data.Email.Should().Be("contacto@marina.com");
        result.Data.SecturReg.Should().Be("SECTUR-123");
        result.Data.Facebook.Should().Be("fb/marina");
        result.Data.Instagram.Should().Be("@marina");
        result.Data.LogoUrl.Should().Be("https://cdn/logo.png");
        result.Data.UpdatedAt.Should().Be(agency.UpdatedAt);
    }
}
