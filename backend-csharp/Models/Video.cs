namespace StuckOnSteven.Api.Models;

public class Video
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Url { get; set; }
    public bool IsEmbed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
