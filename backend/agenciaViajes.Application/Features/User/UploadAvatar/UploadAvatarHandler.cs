using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace agenciaViajes.Application.Features.User.UploadAvatar;

public class UploadAvatarHandler : IRequestHandler<UploadAvatarCommand, Result<string>>
{
    private readonly IUserRepository _userRepository;
    private readonly IAccountService _accountService;
    private readonly UploadsPathSettings _uploadsPath;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png"];
    private const long MaxFileSize = 2 * 1024 * 1024; // 2 MB

    public UploadAvatarHandler(
        IUserRepository userRepository,
        IAccountService accountService,
        IOptions<UploadsPathSettings> uploadsPath)
    {
        _userRepository = userRepository;
        _accountService = accountService;
        _uploadsPath = uploadsPath.Value;
    }

    public async Task<Result<string>> Handle(UploadAvatarCommand command, CancellationToken cancellationToken)
    {
        var file = command.File;

        // 1. Validate file is present
        if (file is null || file.Length == 0)
        {
            return Result<string>.Failure("No se ha proporcionado un archivo");
        }

        // 2. Validate file size (max 2 MB)
        if (file.Length > MaxFileSize)
        {
            return Result<string>.Failure("El archivo excede el tamaño máximo de 2 MB");
        }

        // 3. Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return Result<string>.Failure("Solo se permiten archivos JPG, JPEG o PNG");
        }

        // 4. Get user from DB
        var user = await _userRepository.GetByIdAsync(_accountService.UserId, cancellationToken);
        if (user is null)
        {
            return Result<string>.Failure("Usuario no encontrado");
        }

        // 5. Ensure upload directory exists
        var uploadsDir = _uploadsPath.Avatars;
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        // 6. Save file — always use .jpg extension for consistency
        var fileName = $"avatar_{_accountService.UserId}.jpg";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        // 7. Update UserIconUrl in database — relative path for KrakenD
        var avatarUrl = $"/User/avatar/{_accountService.UserId}";
        user.UserIconUrl = avatarUrl;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return Result<string>.Success(avatarUrl, "Avatar actualizado correctamente");
    }
}
