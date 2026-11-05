namespace bckend.Models;

public class FlatImage
{
    public int Id { get; set; }
    public int FlatId { get; set; }
    public string? photoId  { get; set; }
    public Flat? Flat { get; set; }
    public required string Url { get; set; }
}
