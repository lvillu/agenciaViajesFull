namespace agenciaViajes.Application.Domain.Shared
{
    public interface IAccountService
    {
        Guid AccountId { get; }
        int UserId { get; }
        string Role { get; }
        string UserName { get; }
    }
}
