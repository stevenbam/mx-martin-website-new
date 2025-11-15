namespace StuckOnSteven.Api.Models;

public class Lyric
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Lyrics { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
