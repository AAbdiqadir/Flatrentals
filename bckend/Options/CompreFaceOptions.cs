namespace bckend.Options;

public class CompreFaceOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string RecognitionApiKey { get; set; } = string.Empty;
    public double MinimumSimilarity { get; set; } = 0.93;
    public string FacePlugins { get; set; } = string.Empty;
}
