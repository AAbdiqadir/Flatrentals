using System.ComponentModel.DataAnnotations;

namespace bckend.DTOs.Flats;

public class FlatCreateRequestDto
{
    [Required, MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string City { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Range(1, 100000)]
    public decimal RentPrice { get; set; }

    [Range(1, 20)]
    public int Rooms { get; set; }

    [Range(0, 20)]
    public int? Bathrooms { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class FlatUpdateRequestDto : FlatCreateRequestDto;

public class FlatResponseDto
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal RentPrice { get; set; }
    public int Rooms { get; set; }
    public int? Bathrooms { get; set; }
    public List<string> Images { get; set; } = [];
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsAvailable { get; set; }
}

public class FlatFormRequestDto : FlatCreateRequestDto
{
    public string? OwnerId { get; set; }
}
