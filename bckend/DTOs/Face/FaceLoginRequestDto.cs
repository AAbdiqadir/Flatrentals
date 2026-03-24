namespace bckend.DTOs.Face;

public class FaceLoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string ImageBase64 { get; set; } = string.Empty;
}
