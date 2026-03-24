namespace bckend.Models;

public class FlatImage
{
    public int Id { get; set; }
    public int FlatId { get; set; }
    public Flat? Flat { get; set; }
    public string Url { get; set; } = string.Empty;
}
