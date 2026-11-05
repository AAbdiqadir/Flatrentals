using CloudinaryDotNet.Actions;

namespace bckend.Interfaces;
public interface IImageStorage
{
    Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
    
    Task<DeletionResult> DeletePhotoAsync(string publicId);
}