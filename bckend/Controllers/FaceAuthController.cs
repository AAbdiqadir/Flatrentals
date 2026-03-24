using System.Security.Claims;
using bckend.DTOs.Auth;
using bckend.DTOs.Face;
using bckend.Models;
using bckend.Options;
using bckend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaceAuthController(
    UserManager<ApplicationUser> userManager,
    JwtTokenService jwtTokenService,
    IFaceRecognitionService faceRecognitionService,
    IOptions<CompreFaceOptions> options) : ControllerBase
{
    private readonly CompreFaceOptions _options = options.Value;

    [HttpPost("enroll")]
    [Authorize]
    public async Task<ActionResult> Enroll(FaceEnrollRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryDecodeImage(request.ImageBase64, out var imageBytes))
        {
            return BadRequest("ImageBase64 is invalid.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var subject = BuildSubject(userId);
        var result = await faceRecognitionService.EnrollAsync(subject, imageBytes, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(result.Error ?? "Face enroll failed.");
        }

        return Ok(new { message = "Face enrolled successfully.", subject });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(FaceLoginRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        if (!TryDecodeImage(request.ImageBase64, out var imageBytes))
        {
            return BadRequest("ImageBase64 is invalid.");
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized("Face login failed.");
        }

        var recognition = await faceRecognitionService.RecognizeBestAsync(imageBytes, cancellationToken);
        if (recognition is null)
        {
            return Unauthorized("No face match found.");
        }

        if (!string.Equals(recognition.Subject, BuildSubject(user.Id), StringComparison.Ordinal))
        {
            return Unauthorized("Face does not match this account.");
        }

        if (recognition.Similarity < _options.MinimumSimilarity)
        {
            return Unauthorized("Face similarity threshold not met.");
        }

        var roles = await userManager.GetRolesAsync(user);
        var token = jwtTokenService.CreateToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? string.Empty
        });
    }

    private static string BuildSubject(string userId) => $"user:{userId}";

    private static bool TryDecodeImage(string base64Image, out byte[] bytes)
    {
        bytes = [];

        if (string.IsNullOrWhiteSpace(base64Image))
        {
            return false;
        }

        var payload = base64Image.Trim();
        var commaIndex = payload.IndexOf(',');
        if (payload.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) && commaIndex >= 0)
        {
            payload = payload[(commaIndex + 1)..];
        }

        try
        {
            bytes = Convert.FromBase64String(payload);
            return bytes.Length > 0;
        }
        catch
        {
            return false;
        }
    }
}
