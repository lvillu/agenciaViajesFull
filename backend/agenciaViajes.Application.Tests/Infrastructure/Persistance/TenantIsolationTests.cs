using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using agenciaViajes.Application.Infrastructure.Persistance;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;
using PaymentTypeEnum = agenciaViajes.Application.Domain.Entities.PaymentType;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Tests.Infrastructure.Persistance;

/// <summary>
/// Aislamiento multi-tenant a nivel repositorio (Fase 5). Usa EF InMemory con
/// la MISMA BD compartida y dos tenants (IAccountService mockeado por JWT).
/// Nota: InMemory valida el scoping de queries/filtros, no la semántica SQL
/// de PostgreSQL (índices, transacciones y concurrencia se cubren en E2E).
/// </summary>
public class TenantIsolationTests
{
    private static readonly Guid AccountA = Guid.NewGuid();
    private static readonly Guid AccountB = Guid.NewGuid();

    private readonly string _dbName = $"tenant-{Guid.NewGuid()}";

    private AppDbContext BuildContext(Guid accountId)
    {
        var accountService = Substitute.For<IAccountService>();
        accountService.AccountId.Returns(accountId);
        accountService.Role.Returns("owner");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(_dbName)
            .Options;

        return new AppDbContext(options, accountService);
    }

    private void Seed()
    {
        using var ctx = BuildContext(AccountA);
        ctx.Users.Add(new UserEntity
        {
            Name = "Owner", LastName = "A", UserName = "owner_a", Email = "a@t.com",
            PasswordHash = "x", AccountId = AccountA, Role = "owner", FolioStart = 100
        });
        ctx.Users.Add(new UserEntity
        {
            Name = "Owner", LastName = "B", UserName = "owner_b", Email = "b@t.com",
            PasswordHash = "x", AccountId = AccountB, Role = "owner", FolioStart = 500
        });
        ctx.Clients.Add(new ClientEntity
        {
            Id = 1, Name = "Cli", LastName = "A", Phone = "111", Email = "a@cli.com", Active = true, AccountId = AccountA
        });
        ctx.Clients.Add(new ClientEntity
        {
            Id = 2, Name = "Cli", LastName = "B", Phone = "222", Email = "b@cli.com", Active = true, AccountId = AccountB
        });
        ctx.Sales.Add(new SaleEntity
        {
            Id = 10, ClientId = 1, TotalAmount = 1000m, TravelDate = DateTime.UtcNow,
            Active = true, AccountId = AccountA
        });
        ctx.Sales.Add(new SaleEntity
        {
            Id = 20, ClientId = 2, TotalAmount = 2000m, TravelDate = DateTime.UtcNow,
            Active = true, AccountId = AccountB
        });
        ctx.SaveChanges();
    }

    private TRepo Repo<TRepo>(Guid account, Func<AppDbContext, IAccountService, TRepo> factory)
    {
        var accountService = Substitute.For<IAccountService>();
        accountService.AccountId.Returns(account);
        accountService.Role.Returns("owner");
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(_dbName)
            .Options;
        return factory(new AppDbContext(options, accountService), accountService);
    }

    [Fact]
    public async Task ClientList_OnlyReturnsOwnAccount()
    {
        Seed();
        var repoA = Repo(AccountA, (ctx, svc) => new ClientRepository(ctx, svc));
        var repoB = Repo(AccountB, (ctx, svc) => new ClientRepository(ctx, svc));

        var listA = await repoA.GetAllAsync();
        var listB = await repoB.GetAllAsync();

        listA.Select(c => c.Id).Should().BeEquivalentTo([1]);
        listB.Select(c => c.Id).Should().BeEquivalentTo([2]);
    }

    [Fact]
    public async Task ClientGetById_DoesNotReturnForeignClient()
    {
        Seed();
        var repoB = Repo(AccountB, (ctx, svc) => new ClientRepository(ctx, svc));

        var foreign = await repoB.GetByIdAsync(1);

        foreign.Should().BeNull();
    }

    [Fact]
    public async Task ClientDelete_DoesNotDeleteForeignClient()
    {
        Seed();
        var repoB = Repo(AccountB, (ctx, svc) => new ClientRepository(ctx, svc));

        var deleted = await repoB.DeleteAsync(1);

        deleted.Should().BeFalse();
        var repoA = Repo(AccountA, (ctx, svc) => new ClientRepository(ctx, svc));
        (await repoA.GetByIdAsync(1)).Should().NotBeNull();
    }

    [Fact]
    public async Task ClientExistsByEmail_IsScopedPerAccount()
    {
        Seed();
        var repoB = Repo(AccountB, (ctx, svc) => new ClientRepository(ctx, svc));

        (await repoB.ExistsByEmailAsync("a@cli.com")).Should().BeFalse();
        (await repoB.ExistsByEmailAsync("b@cli.com")).Should().BeTrue();
    }

    [Fact]
    public async Task SalePagedList_OnlyReturnsOwnAccount()
    {
        Seed();
        var repoA = Repo(AccountA, (ctx, svc) => new SaleRepository(ctx, svc));
        var repoB = Repo(AccountB, (ctx, svc) => new SaleRepository(ctx, svc));

        var (itemsA, totalA) = await repoA.GetPagedAsync(1, 20);
        var (itemsB, totalB) = await repoB.GetPagedAsync(1, 20);

        totalA.Should().Be(1);
        itemsA.Select(s => s.Id).Should().BeEquivalentTo([10]);
        totalB.Should().Be(1);
        itemsB.Select(s => s.Id).Should().BeEquivalentTo([20]);
    }

    [Fact]
    public async Task PaymentBySaleId_DoesNotReturnForeignPayments()
    {
        Seed();
        var repoA = Repo(AccountA, (ctx, svc) => new PaymentRepository(ctx, svc));
        using (var ctx = BuildContext(AccountA))
        {
            ctx.Payments.Add(new PaymentEntity
            {
                SaleId = 10, FolioNumber = 100, PaymentType = PaymentTypeEnum.Anticipo,
                PaymentDate = DateTime.UtcNow, Amount = 100m, AccountId = AccountA
            });
            ctx.SaveChanges();
        }

        var repoB = Repo(AccountB, (ctx, svc) => new PaymentRepository(ctx, svc));
        var foreign = await repoB.GetBySaleIdAsync(10);

        foreign.Should().BeEmpty();
    }

    [Fact]
    public async Task PaymentFolio_SequencesAreIndependentPerAccount()
    {
        Seed();
        var repoA = Repo(AccountA, (ctx, svc) => new PaymentRepository(ctx, svc));
        var repoB = Repo(AccountB, (ctx, svc) => new PaymentRepository(ctx, svc));

        var payA = await repoA.CreateAsync(new PaymentEntity
        {
            SaleId = 10, PaymentType = PaymentTypeEnum.Anticipo,
            PaymentDate = DateTime.UtcNow, Amount = 100m, AccountId = AccountA
        });
        var payB = await repoB.CreateAsync(new PaymentEntity
        {
            SaleId = 20, PaymentType = PaymentTypeEnum.Anticipo,
            PaymentDate = DateTime.UtcNow, Amount = 100m, AccountId = AccountB
        });

        payA.FolioNumber.Should().Be(100);
        payB.FolioNumber.Should().Be(500);
    }
}
