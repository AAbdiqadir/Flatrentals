using System.Security.Claims;
using bckend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("tenant")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> TenantSummary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bookingsCount = await dbContext.Bookings.CountAsync(b => b.TenantId == userId);
        var messagesCount = await dbContext.Messages.CountAsync(m => m.SenderId == userId || m.RecipientId == userId);
        var listingsCount = await dbContext.Flats.CountAsync(f => f.IsAvailable);

        return Ok(new
        {
            listingsCount,
            bookingsCount,
            messagesCount
        });
    }

    [HttpGet("owner")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> OwnerSummary()
    {
        var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var myFlatsCount = await dbContext.Flats.CountAsync(f => f.OwnerId == ownerId);
        var bookingRequestsCount = await dbContext.Bookings.CountAsync(b => b.Flat!.OwnerId == ownerId);
        var messagesCount = await dbContext.Messages.CountAsync(m => m.SenderId == ownerId || m.RecipientId == ownerId);

        return Ok(new
        {
            myFlatsCount,
            bookingRequestsCount,
            messagesCount
        });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminSummary()
    {
        var usersCount = await dbContext.Users.CountAsync();
        var flatsCount = await dbContext.Flats.CountAsync();
        var bookingsCount = await dbContext.Bookings.CountAsync();
        var messagesCount = await dbContext.Messages.CountAsync();

        return Ok(new
        {
            usersCount,
            flatsCount,
            bookingsCount,
            messagesCount
        });
    }
}
