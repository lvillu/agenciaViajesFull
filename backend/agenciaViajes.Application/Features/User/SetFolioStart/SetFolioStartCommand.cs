using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.User.SetFolioStart;

public sealed record SetFolioStartCommand(int FolioStart) : IRequest<Result<bool>>, ITransactionalCommand { }
