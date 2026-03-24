using System.Net.Http.Headers;
using System.Text.Json;
using bckend.Options;
using Microsoft.Extensions.Options;

namespace bckend.Services;

public class CompreFaceRecognitionService(
    HttpClient httpClient,
    IOptions<CompreFaceOptions> options,
    ILogger<CompreFaceRecognitionService> logger) : IFaceRecognitionService
{
    private readonly CompreFaceOptions _options = options.Value;

    public async Task<FaceEnrollmentResult> EnrollAsync(string subject, byte[] imageBytes, CancellationToken cancellationToken)
    {
        if (!IsConfigured(out var configError))
        {
            return new FaceEnrollmentResult(false, configError);
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl.TrimEnd('/')}/api/v1/recognition/faces");
        request.Headers.Add("x-api-key", _options.RecognitionApiKey);
        request.Content = BuildMultipart(imageBytes, subject);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode)
        {
            return new FaceEnrollmentResult(true, null);
        }

        var error = await response.Content.ReadAsStringAsync(cancellationToken);
        logger.LogWarning("CompreFace enroll failed with status {StatusCode}: {Error}", response.StatusCode, error);
        return new FaceEnrollmentResult(false, $"CompreFace enroll failed ({(int)response.StatusCode}).");
    }

    public async Task<FaceRecognitionResult?> RecognizeBestAsync(byte[] imageBytes, CancellationToken cancellationToken)
    {
        if (!IsConfigured(out _))
        {
            return null;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl.TrimEnd('/')}/api/v1/recognition/recognize");
        request.Headers.Add("x-api-key", _options.RecognitionApiKey);
        request.Content = BuildMultipart(imageBytes, null);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning("CompreFace recognize failed with status {StatusCode}: {Error}", response.StatusCode, error);
            return null;
        }

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseBestMatch(payload);
    }

    private MultipartFormDataContent BuildMultipart(byte[] imageBytes, string? subject)
    {
        var form = new MultipartFormDataContent();
        var imageContent = new ByteArrayContent(imageBytes);
        imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/jpeg");
        form.Add(imageContent, "file", "face.jpg");

        if (!string.IsNullOrWhiteSpace(subject))
        {
            form.Add(new StringContent(subject), "subject");
        }

        if (!string.IsNullOrWhiteSpace(_options.FacePlugins))
        {
            form.Add(new StringContent(_options.FacePlugins), "face_plugins");
        }

        return form;
    }

    private bool IsConfigured(out string? error)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            error = "CompreFace:BaseUrl is missing.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(_options.RecognitionApiKey))
        {
            error = "CompreFace:RecognitionApiKey is missing.";
            return false;
        }

        error = null;
        return true;
    }

    private static FaceRecognitionResult? ParseBestMatch(string payload)
    {
        try
        {
            using var doc = JsonDocument.Parse(payload);
            if (!doc.RootElement.TryGetProperty("result", out var resultElement) || resultElement.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            FaceRecognitionResult? best = null;

            foreach (var detectedFace in resultElement.EnumerateArray())
            {
                if (!detectedFace.TryGetProperty("subjects", out var subjectsElement) || subjectsElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var subjectMatch in subjectsElement.EnumerateArray())
                {
                    if (!subjectMatch.TryGetProperty("subject", out var subjectElement) ||
                        !subjectMatch.TryGetProperty("similarity", out var similarityElement))
                    {
                        continue;
                    }

                    var subject = subjectElement.GetString();
                    if (string.IsNullOrWhiteSpace(subject))
                    {
                        continue;
                    }

                    var similarity = similarityElement.GetDouble();
                    if (best is null || similarity > best.Similarity)
                    {
                        best = new FaceRecognitionResult(subject, similarity);
                    }
                }
            }

            return best;
        }
        catch
        {
            return null;
        }
    }
}
