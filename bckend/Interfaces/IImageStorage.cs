public interface IImageStorage
{
    Task<IReadOnlyList<string>> SaveAsync(
        IReadOnlyCollection<IFormFile> images,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        IEnumerable<string> imageUrls,
        CancellationToken cancellationToken);
}