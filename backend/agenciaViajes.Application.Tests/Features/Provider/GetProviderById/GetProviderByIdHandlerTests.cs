using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Provider.GetProviderById;
using FluentAssertions;
using NSubstitute;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;

namespace agenciaViajes.Application.Tests.Features.Provider.GetProviderById;

public class GetProviderByIdHandlerTests
{
    private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
    private readonly GetProviderByIdHandler _handler;

    public GetProviderByIdHandlerTests()
    {
        _handler = new GetProviderByIdHandler(_providerRepository);
    }

    [Fact]
    public async Task Handle_WhenProviderNotFound_ReturnsFailure()
    {
        _providerRepository.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((ProviderEntity?)null);

        var result = await _handler.Handle(new GetProviderByIdQuery(99), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Proveedor no encontrado");
    }

    [Fact]
    public async Task Handle_WhenProviderExists_ReturnsMappedResponse()
    {
        var provider = new ProviderEntity
        {
            Id = 3,
            Name = "Aerolínea X",
            Acronym = "AX",
            Email = "info@aerolinea.com",
            Phone = "5511223344",
            ProviderContactName = "Juan Pérez",
            DepositPercentage = 25m,
            FinalPaymentDaysBefore = 15,
            ProfitPercentage = 12.5m,
            Active = true
        };
        _providerRepository.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(provider);

        var result = await _handler.Handle(new GetProviderByIdQuery(3), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(provider.Id);
        result.Data.Name.Should().Be(provider.Name);
        result.Data.Acronym.Should().Be(provider.Acronym);
        result.Data.Email.Should().Be(provider.Email);
        result.Data.Phone.Should().Be(provider.Phone);
        result.Data.ProviderContactName.Should().Be(provider.ProviderContactName);
        result.Data.DepositPercentage.Should().Be(provider.DepositPercentage);
        result.Data.FinalPaymentDaysBefore.Should().Be(provider.FinalPaymentDaysBefore);
        result.Data.ProfitPercentage.Should().Be(provider.ProfitPercentage);
        result.Data.Active.Should().BeTrue();
    }
}
