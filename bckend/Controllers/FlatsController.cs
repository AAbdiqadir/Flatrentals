using System.Security.Claims;
using bckend.Data;
using bckend.DTOs.Flats;
using bckend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlatsController(AppDbContext dbContext, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<FlatResponseDto>>> GetAll()
    {
        var flats = await dbContext.Flats
            .Include(f => f.Images)
            .Include(f => f.Owner)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(flats.Select(MapFlat));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<FlatResponseDto>> GetById(int id)
    {
        var flat = await dbContext.Flats
            .Include(f => f.Images)
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (flat is null)
        {
            return NotFound();
        }

        return Ok(MapFlat(flat));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<IEnumerable<FlatResponseDto>>> GetMyFlats()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var query = dbContext.Flats
            .Include(f => f.Images)
            .Include(f => f.Owner)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(f => f.OwnerId == currentUserId);
        }

        var flats = await query.OrderByDescending(f => f.CreatedAt).ToListAsync();
        return Ok(flats.Select(MapFlat));
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<FlatResponseDto>> Create([FromForm] FlatFormRequestDto request, [FromForm] List<IFormFile>? images)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");
        var ownerId = isAdmin && !string.IsNullOrWhiteSpace(request.OwnerId) ? request.OwnerId! : currentUserId;

        var flat = new Flat
        {
            Address = request.Address,
            City = request.City,
            Description = request.Description,
            RentPrice = request.RentPrice,
            Rooms = request.Rooms,
            Bathrooms = request.Bathrooms,
            IsAvailable = request.IsAvailable,
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow
        };

        if (images is { Count: > 0 })
        {
            flat.Images = await SaveImages(images);
        }

        dbContext.Flats.Add(flat);
        await dbContext.SaveChangesAsync();

        await dbContext.Entry(flat).Reference(f => f.Owner).LoadAsync();
        await dbContext.Entry(flat).Collection(f => f.Images).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = flat.Id }, MapFlat(flat));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<FlatResponseDto>> Update(int id, [FromForm] FlatFormRequestDto request, [FromForm] List<IFormFile>? images)
    {
        var flat = await dbContext.Flats.Include(f => f.Images).FirstOrDefaultAsync(f => f.Id == id);
        if (flat is null)
        {
            return NotFound();
        }

        if (!CanManageFlat(flat.OwnerId))
        {
            return Forbid();
        }

        flat.Address = request.Address;
        flat.City = request.City;
        flat.Description = request.Description;
        flat.RentPrice = request.RentPrice;
        flat.Rooms = request.Rooms;
        flat.Bathrooms = request.Bathrooms;
        flat.IsAvailable = request.IsAvailable;

        if (images is { Count: > 0 })
        {
            dbContext.FlatImages.RemoveRange(flat.Images);
            flat.Images = await SaveImages(images);
        }

        await dbContext.SaveChangesAsync();

        await dbContext.Entry(flat).Reference(f => f.Owner).LoadAsync();
        await dbContext.Entry(flat).Collection(f => f.Images).LoadAsync();

        return Ok(MapFlat(flat));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var flat = await dbContext.Flats.FirstOrDefaultAsync(f => f.Id == id);
        if (flat is null)
        {
            return NotFound();
        }

        if (!CanManageFlat(flat.OwnerId))
        {
            return Forbid();
        }

        dbContext.Flats.Remove(flat);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private bool CanManageFlat(string ownerId)
    {
        if (User.IsInRole("Admin"))
        {
            return true;
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return ownerId == currentUserId;
    }

    private async Task<List<FlatImage>> SaveImages(IEnumerable<IFormFile> images)
    {
        var uploadFolder = Path.Combine(environment.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadFolder);

        var saved = new List<FlatImage>();

        foreach (var image in images)
        {
            if (image.Length == 0)
            {
                continue;
            }

            var extension = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadFolder, fileName);

            await using var stream = new FileStream(fullPath, FileMode.Create);
            await image.CopyToAsync(stream);

            saved.Add(new FlatImage { Url = $"/uploads/{fileName}" });
        }

        return saved;
    }

    private static FlatResponseDto MapFlat(Flat flat)
    {
        return new FlatResponseDto
        {
            Id = flat.Id,
            Address = flat.Address,
            City = flat.City,
            Description = flat.Description,
            RentPrice = flat.RentPrice,
            Rooms = flat.Rooms,
            Bathrooms = flat.Bathrooms,
            Images = flat.Images.Select(i => i.Url).ToList(),
            OwnerId = flat.OwnerId,
            OwnerName = flat.Owner?.FullName ?? string.Empty,
            CreatedAt = flat.CreatedAt,
            IsAvailable = flat.IsAvailable
        };
    }
}
