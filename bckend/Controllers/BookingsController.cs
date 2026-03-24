using System.Security.Claims;
using bckend.Data;
using bckend.DTOs.Bookings;
using bckend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var query = dbContext.Bookings
            .Include(b => b.Flat)
            .Include(b => b.Tenant)
            .AsQueryable();

        if (User.IsInRole("Tenant"))
        {
            query = query.Where(b => b.TenantId == userId);
        }
        else if (User.IsInRole("Owner"))
        {
            query = query.Where(b => b.Flat!.OwnerId == userId);
        }

        var bookings = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(bookings.Select(MapBooking));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingResponseDto>> GetById(int id)
    {
        var booking = await dbContext.Bookings
            .Include(b => b.Flat)
            .Include(b => b.Tenant)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        if (!CanAccessBooking(booking))
        {
            return Forbid();
        }

        return Ok(MapBooking(booking));
    }

    [HttpPost]
    [Authorize(Roles = "Tenant,Admin")]
    public async Task<ActionResult<BookingResponseDto>> Create(BookingCreateRequestDto request)
    {
        if (request.StartDate >= request.EndDate)
        {
            return BadRequest("StartDate must be before EndDate.");
        }

        var flat = await dbContext.Flats.FirstOrDefaultAsync(f => f.Id == request.FlatId);
        if (flat is null)
        {
            return NotFound("Flat not found.");
        }

        var tenantId = User.IsInRole("Admin") && Request.Headers.TryGetValue("X-Tenant-Id", out var values)
            ? values.ToString()
            : User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var booking = new Booking
        {
            FlatId = request.FlatId,
            TenantId = tenantId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            PaymentReference = request.PaymentReference,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Bookings.Add(booking);
        await dbContext.SaveChangesAsync();

        await dbContext.Entry(booking).Reference(b => b.Flat).LoadAsync();
        await dbContext.Entry(booking).Reference(b => b.Tenant).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, MapBooking(booking));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Tenant,Admin")]
    public async Task<ActionResult<BookingResponseDto>> Update(int id, BookingUpdateRequestDto request)
    {
        var booking = await dbContext.Bookings
            .Include(b => b.Flat)
            .Include(b => b.Tenant)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") && booking.TenantId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return Forbid();
        }

        booking.StartDate = request.StartDate;
        booking.EndDate = request.EndDate;
        booking.PaymentReference = request.PaymentReference;

        await dbContext.SaveChangesAsync();
        return Ok(MapBooking(booking));
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<BookingResponseDto>> UpdateStatus(int id, BookingStatusUpdateDto request)
    {
        var booking = await dbContext.Bookings
            .Include(b => b.Flat)
            .Include(b => b.Tenant)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        if (User.IsInRole("Owner") && booking.Flat?.OwnerId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return Forbid();
        }

        if (!Enum.TryParse<BookingStatus>(request.Status, true, out var status))
        {
            return BadRequest("Invalid status.");
        }

        booking.Status = status;
        await dbContext.SaveChangesAsync();

        return Ok(MapBooking(booking));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Tenant,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await dbContext.Bookings.FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") && booking.TenantId != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return Forbid();
        }

        dbContext.Bookings.Remove(booking);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private bool CanAccessBooking(Booking booking)
    {
        if (User.IsInRole("Admin"))
        {
            return true;
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return booking.TenantId == userId || booking.Flat?.OwnerId == userId;
    }

    private static BookingResponseDto MapBooking(Booking booking)
    {
        return new BookingResponseDto
        {
            Id = booking.Id,
            FlatId = booking.FlatId,
            FlatAddress = booking.Flat?.Address ?? string.Empty,
            TenantId = booking.TenantId,
            TenantName = booking.Tenant?.FullName ?? string.Empty,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            Status = booking.Status.ToString(),
            PaymentReference = booking.PaymentReference,
            CreatedAt = booking.CreatedAt
        };
    }
}
