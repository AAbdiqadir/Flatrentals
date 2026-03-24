namespace bckend.Models;

public class SeedFlat
{
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal RentPrice { get; set; }
    public int Rooms { get; set; }
    public int? Bathrooms { get; set; }
    public bool IsAvailable { get; set; } = true;
    public List<string> ImageUrls { get; set; } = [];
}
