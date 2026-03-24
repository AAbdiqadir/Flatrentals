using System.ComponentModel.DataAnnotations;

namespace bckend.DTOs.Bookings;

public class BookingCreateRequestDto
{
    [Required]
    public int FlatId { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required, MaxLength(120)]
    public string PaymentReference { get; set; } = string.Empty;
}

public class BookingUpdateRequestDto
{
    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required, MaxLength(120)]
    public string PaymentReference { get; set; } = string.Empty;
}

public class BookingStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = "Pending";
}

public class BookingResponseDto
{
    public int Id { get; set; }
    public int FlatId { get; set; }
    public string FlatAddress { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentReference { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
