using bckend.helpers;
using bckend.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace bckend.Services;

public class ImageStorage: IImageStorage

{
    private readonly Cloudinary _cloudinary;

    public ImageStorage(IOptions<CloudinarySettings> config)
    {
        var acc = new Account(config.Value.CloudName, config.Value.APIKey, config.Value.APISecret);
        
        _cloudinary = new Cloudinary(acc);
        
        
    }
    public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
    {
        var uploadResult = new ImageUploadResult();

        if (file.Length >0)
        {
            using var stream = file.OpenReadStream();

            var uploadParam = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Width(1200).
                Height(1200).Crop("limit").Quality("auto").FetchFormat("auto"),
                
                Folder = "flatrentals"

            };
            
            uploadResult = await _cloudinary.UploadAsync(uploadParam);

        }

        return uploadResult;



    }

    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        
        return  await _cloudinary.DestroyAsync(deleteParams);
    }
}