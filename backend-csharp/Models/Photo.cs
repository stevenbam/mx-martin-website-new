namespace StuckOnSteven.Api.Models;

public class Photo
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
