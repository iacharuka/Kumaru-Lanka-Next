
// ============================================================
// Services/IImageService.cs + ImageService.cs
// ============================================================
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace KumaruLanka.API.Services;

public interface IImageService
{
    Task<string?> UploadAsync(IFormFile file, string folder);
}

public class ImageService : IImageService
{
    private readonly Cloudinary _cloudinary;
    public ImageService(IConfiguration config)
    {
        var account  = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> UploadAsync(IFormFile file, string folder)
    {
        if (file.Length == 0) return null;
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"kumaru-lanka/{folder}",
            Transformation = new Transformation().Width(800).Height(600).Crop("fill").Quality("auto")
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return result.SecureUrl?.ToString();
    }
}