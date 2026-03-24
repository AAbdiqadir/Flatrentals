using System.ComponentModel.DataAnnotations;

namespace bckend.Models;

public class Message
{
    public int Id { get; set; }

    public int? FlatId { get; set; }
    public Flat? Flat { get; set; }

    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }

    public string SenderId { get; set; } = string.Empty;
    public ApplicationUser? Sender { get; set; }

    public string RecipientId { get; set; } = string.Empty;
    public ApplicationUser? Recipient { get; set; }

    [MaxLength(2000)]
    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
