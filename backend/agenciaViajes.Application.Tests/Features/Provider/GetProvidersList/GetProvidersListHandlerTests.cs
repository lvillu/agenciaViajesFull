using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Provider.GetProvidersList;
using FluentAssertions;
using NSubstitute;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;

namespace agenciaViajes.Application.Tests.Features.Provider.GetProvidersList;

public class GetProvidersListHandlerTests
{
    private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
    private readonly GetProvidersListHandler _handler;

    public GetProvidersListHandlerTests()
    {
        _handler = new GetProvidersListHandler(_providerRepository);
    }

    [Fact]
    public async Task Handle_WhenNoProviders_ReturnsEmptyList()
    {
        _providerRepository.GetAllAsync(false, Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetProvidersListQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenProvidersExist_ReturnsMappedResponses()
    {
        var providers = new List<ProviderEntity>
        {
            new() { Id = 1, Name = "Hotel A", Acronym = "HA", Email = "a@hotel.com", Phone = "111", ProviderContactName = "Ana", DepositPercentage = 20m, FinalPaymentDaysBefore = 10, ProfitPercentage = 10m, Active = true },
            new() { Id = 2, Name = "Tour B", Acronym = "TB", Email = "b@tour.com", Phone = "222", ProviderContactName = "Beto", DepositPercentage = null, FinalPaymentDaysBefore = null, ProfitPercentage = null, Active = false }
        };
        _providerRepository.GetAllAsync(true, Arg.Any<CancellationToken>()).Returns(providers);

        var result = await _handler.Handle(new GetProvidersListQuery(true), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].Id.Should().Be(1);
        result.Data[0].Name.Should().Be("Hotel A");
        result.Data[0].Active.Should().BeTrue();
        result.Data[1].Id.Should().Be(2);
        result.Data[1].Name.Should().Be("Tour B");
        result.Data[1].Active.Should().BeFalse();

        await _providerRepository.Received(1).GetAllAsync(true, Arg.Any<CancellationToken>());
    }
}
