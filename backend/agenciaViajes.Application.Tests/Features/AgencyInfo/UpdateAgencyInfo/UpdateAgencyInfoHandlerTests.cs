using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.AgencyInfo.Common.Requests;
using agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo;
using FluentAssertions;
using NSubstitute;
using AgencyInfoEntity = agenciaViajes.Application.Domain.Entities.AgencyInfo;

namespace agenciaViajes.Application.Tests.Features.AgencyInfo.UpdateAgencyInfo;

public class UpdateAgencyInfoHandlerTests
{
    private readonly IAgencyInfoRepository _agencyInfoRepository = Substitute.For<IAgencyInfoRepository>();
    private readonly UpdateAgencyInfoHandler _handler;

    public UpdateAgencyInfoHandlerTests()
    {
        _handler = new UpdateAgencyInfoHandler(_agencyInfoRepository);
    }

    private static UpdateAgencyInfoRequest BuildValidRequest() => new()
    {
        Name = "Agencia Actualizada",
        Address = "Calle Nueva 200",
        City = "Guadalajara",
        State = "JAL",
        ZipCode = "44100",
        Phone = "3312345678",
        Email = "info@agencia.com",
        SecturReg = "SECTUR-999",
        Facebook = "fb/agencia",
        Instagram = "@agencia",
        LogoUrl = "https://cdn/nuevo-logo.png"
    };

    [Fact]
    public async Task Handle_WhenValid_UpsertsAndReturnsMappedResponse()
    {
        var request = BuildValidRequest();
        _agencyInfoRepository.UpsertAsync(Arg.Any<AgencyInfoEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var entity = callInfo.Arg<AgencyInfoEntity>();
                entity.Id = 1;
                entity.UpdatedAt = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc);
                return entity;
            });

        var result = await _handler.Handle(new UpdateAgencyInfoCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Be("Información de la agencia actualizada exitosamente");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(1);
        result.Data.Name.Should().Be(request.Name);
        result.Data.Address.Should().Be(request.Address);
        result.Data.City.Should().Be(request.City);
        result.Data.State.Should().Be(request.State);
        result.Data.ZipCode.Should().Be(request.ZipCode);
        result.Data.Phone.Should().Be(request.Phone);
        result.Data.Email.Should().Be(request.Email);
        result.Data.SecturReg.Should().Be(request.SecturReg);
        result.Data.Facebook.Should().Be(request.Facebook);
        result.Data.Instagram.Should().Be(request.Instagram);
        result.Data.LogoUrl.Should().Be(request.LogoUrl);

        await _agencyInfoRepository.Received(1).UpsertAsync(
            Arg.Is<AgencyInfoEntity>(a =>
                a.Name == request.Name &&
                a.Email == request.Email &&
                a.SecturReg == request.SecturReg),
            Arg.Any<CancellationToken>());
    }
}
