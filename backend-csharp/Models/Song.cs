namespace StuckOnSteven.Api.Models;

public class Song
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string FilePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
