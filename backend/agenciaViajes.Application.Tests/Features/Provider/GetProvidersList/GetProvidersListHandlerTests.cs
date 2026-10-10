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
    public async Task Handle_WhenNoProviders_ReturnsEmptyPage()
    {
        _providerRepository.GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>())
            .Returns((new List<ProviderEntity>(), 0));

        var result = await _handler.Handle(new GetProvidersListQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Items.Should().BeEmpty();
        result.Data.Total.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WhenProvidersExist_ReturnsMappedPage()
    {
        var providers = new List<ProviderEntity>
        {
            new() { Id = 1, Name = "Hotel A", Acronym = "HA", Email = "a@hotel.com", Phone = "111", ProviderContactName = "Ana", DepositPercentage = 20m, FinalPaymentDaysBefore = 10, ProfitPercentage = 10m, Active = true },
            new() { Id = 2, Name = "Tour B", Acronym = "TB", Email = "b@tour.com", Phone = "222", ProviderContactName = "Beto", DepositPercentage = null, FinalPaymentDaysBefore = null, ProfitPercentage = null, Active = false }
        };
        _providerRepository.GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>())
            .Returns((providers, 2));

        var result = await _handler.Handle(new GetProvidersListQuery(true), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(2);
        result.Data.Total.Should().Be(2);
        result.Data.Page.Should().Be(1);
        result.Data.PageSize.Should().Be(20);
        result.Data.Items[0].Id.Should().Be(1);
        result.Data.Items[0].Name.Should().Be("Hotel A");
        result.Data.Items[0].Active.Should().BeTrue();
        result.Data.Items[1].Id.Should().Be(2);
        result.Data.Items[1].Name.Should().Be("Tour B");
        result.Data.Items[1].Active.Should().BeFalse();

        await _providerRepository.Received(1).GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithPageSizeOverMax_ClampsTo100()
    {
        _providerRepository.GetPagedAsync(1, 100, false, Arg.Any<CancellationToken>())
            .Returns((new List<ProviderEntity>(), 0));

        var result = await _handler.Handle(new GetProvidersListQuery(false, 1, 500), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.PageSize.Should().Be(100);
        await _providerRepository.Received(1).GetPagedAsync(1, 100, false, Arg.Any<CancellationToken>());
    }
}
