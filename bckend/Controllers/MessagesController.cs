using System.Security.Claims;
using bckend.Data;
using bckend.DTOs.Messages;
using bckend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageResponseDto>>> GetMyMessages([FromQuery] int? bookingId, [FromQuery] int? flatId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var query = dbContext.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .AsQueryable();

        if (!User.IsInRole("Admin"))
        {
            query = query.Where(m => m.SenderId == userId || m.RecipientId == userId);
        }

        if (bookingId.HasValue)
        {
            query = query.Where(m => m.BookingId == bookingId.Value);
        }

        if (flatId.HasValue)
        {
            query = query.Where(m => m.FlatId == flatId.Value);
        }

        var messages = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();
        return Ok(messages.Select(MapMessage));
    }

    [HttpPost]
    public async Task<ActionResult<MessageResponseDto>> Send(MessageCreateRequestDto request)
    {
        if (request.FlatId is null && request.BookingId is null)
        {
            return BadRequest("Either FlatId or BookingId is required.");
        }

        var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (request.BookingId is not null)
        {
            var booking = await dbContext.Bookings.Include(b => b.Flat).FirstOrDefaultAsync(b => b.Id == request.BookingId.Value);
            if (booking is null)
            {
                return NotFound("Booking not found.");
            }

            var isParticipant = senderId == booking.TenantId || senderId == booking.Flat!.OwnerId || User.IsInRole("Admin");
            if (!isParticipant)
            {
                return Forbid();
            }
        }

        if (request.FlatId is not null)
        {
            var flat = await dbContext.Flats.FirstOrDefaultAsync(f => f.Id == request.FlatId.Value);
            if (flat is null)
            {
                return NotFound("Flat not found.");
            }

            var canTalk = senderId == flat.OwnerId || User.IsInRole("Tenant") || User.IsInRole("Admin");
            if (!canTalk)
            {
                return Forbid();
            }
        }

        var message = new Message
        {
            FlatId = request.FlatId,
            BookingId = request.BookingId,
            SenderId = senderId,
            RecipientId = request.RecipientId,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Messages.Add(message);
        await dbContext.SaveChangesAsync();

        await dbContext.Entry(message).Reference(m => m.Sender).LoadAsync();
        await dbContext.Entry(message).Reference(m => m.Recipient).LoadAsync();

        return CreatedAtAction(nameof(GetMyMessages), new { id = message.Id }, MapMessage(message));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var message = await dbContext.Messages.FirstOrDefaultAsync(m => m.Id == id);
        if (message is null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!User.IsInRole("Admin") && message.SenderId != userId)
        {
            return Forbid();
        }

        dbContext.Messages.Remove(message);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static MessageResponseDto MapMessage(Message message)
    {
        return new MessageResponseDto
        {
            Id = message.Id,
            FlatId = message.FlatId,
            BookingId = message.BookingId,
            SenderId = message.SenderId,
            SenderName = message.Sender?.FullName ?? string.Empty,
            RecipientId = message.RecipientId,
            RecipientName = message.Recipient?.FullName ?? string.Empty,
            Body = message.Body,
            CreatedAt = message.CreatedAt
        };
    }
}
