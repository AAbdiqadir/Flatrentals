using System.ComponentModel.DataAnnotations;

namespace bckend.Models;

public class Booking
{
    public int Id { get; set; }

    public int FlatId { get; set; }
    public Flat? Flat { get; set; }

    public string TenantId { get; set; } = string.Empty;
    public ApplicationUser? Tenant { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    [MaxLength(120)]
    public string PaymentReference { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
