using System.ComponentModel.DataAnnotations;

namespace bckend.Models;

public class Flat
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(120)]
    public string City { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public decimal RentPrice { get; set; }

    public int Rooms { get; set; }

    public int? Bathrooms { get; set; }

    public string OwnerId { get; set; } = string.Empty;
    public ApplicationUser? Owner { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsAvailable { get; set; } = true;

    public ICollection<FlatImage> Images { get; set; } = new List<FlatImage>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
