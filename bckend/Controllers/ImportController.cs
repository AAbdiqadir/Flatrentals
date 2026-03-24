using bckend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ImportController(SeedService seedService) : ControllerBase
{
    [HttpPost("flats")]
    public async Task<IActionResult> ImportFlats([FromQuery] string ownerId)
    {
        if (string.IsNullOrWhiteSpace(ownerId))
        {
            return BadRequest("ownerId is required.");
        }

        var inserted = await seedService.SeedFlatsFromJsonAsync(ownerId);
        return Ok(new { inserted });
    }
}
