using System.ComponentModel.DataAnnotations;

namespace bckend.DTOs.Messages;

public class MessageCreateRequestDto
{
    public int? FlatId { get; set; }
    public int? BookingId { get; set; }

    [Required]
    public string RecipientId { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Body { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public int Id { get; set; }
    public int? FlatId { get; set; }
    public int? BookingId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string RecipientId { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
