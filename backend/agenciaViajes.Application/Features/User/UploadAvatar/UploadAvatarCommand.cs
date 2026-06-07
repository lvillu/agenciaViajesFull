using agenciaViajes.Application.Domain.Shared;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace agenciaViajes.Application.Features.User.UploadAvatar;

public sealed record UploadAvatarCommand(
    IFormFile File
) : IRequest<Result<string>>, ITransactionalCommand;
