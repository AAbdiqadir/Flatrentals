namespace bckend.Services;

public interface IFaceRecognitionService
{
    Task<FaceEnrollmentResult> EnrollAsync(string subject, byte[] imageBytes, CancellationToken cancellationToken);
    Task<FaceRecognitionResult?> RecognizeBestAsync(byte[] imageBytes, CancellationToken cancellationToken);
}

public record FaceEnrollmentResult(bool IsSuccess, string? Error);
public record FaceRecognitionResult(string Subject, double Similarity);
