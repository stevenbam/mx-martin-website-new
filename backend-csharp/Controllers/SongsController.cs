using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StuckOnSteven.Api.Data;
using StuckOnSteven.Api.Models;

namespace StuckOnSteven.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public SongsController(
        ApplicationDbContext context,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Song>>> GetSongs()
    {
        return await _context.Songs
            .OrderByDescending(s => s.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Song>> GetSong(int id)
    {
        var song = await _context.Songs.FindAsync(id);

        if (song == null)
        {
            return NotFound(new { error = "Song not found" });
        }

        return song;
    }

    [HttpPost]
    public async Task<ActionResult<Song>> CreateSong([FromBody] Song song)
    {
        song.CreatedAt = DateTime.UtcNow;
        song.UpdatedAt = DateTime.UtcNow;

        _context.Songs.Add(song);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSong), new { id = song.Id }, song);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<object>> UploadSong([FromForm] IFormFile song, [FromForm] string title)
    {
        if (song == null || song.Length == 0)
        {
            return BadRequest(new { error = "No file uploaded" });
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            return BadRequest(new { error = "Title is required" });
        }

        // Validate file type
        var allowedExtensions = new[] { ".mp3", ".wav", ".ogg", ".m4a", ".webm" };
        var extension = Path.GetExtension(song.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { error = "Only audio files are allowed" });
        }

        // Get upload path from configuration
        var uploadPath = _configuration["FileStorage:UploadPath"] ?? "./uploads";
        var songsPath = Path.Combine(uploadPath, "songs");

        // Create directory if it doesn't exist
        if (!Directory.Exists(songsPath))
        {
            Directory.CreateDirectory(songsPath);
        }

        // Save file
        var fileName = song.FileName;
        var filePath = Path.Combine(songsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await song.CopyToAsync(stream);
        }

        // Create song record
        var newSong = new Song
        {
            Title = title,
            FilePath = $"/uploads/songs/{fileName}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Songs.Add(newSong);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSong), new { id = newSong.Id }, new
        {
            id = newSong.Id,
            title = newSong.Title,
            file_path = newSong.FilePath,
            message = "Song uploaded successfully"
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSong(int id, [FromBody] Song song)
    {
        if (id != song.Id)
        {
            return BadRequest();
        }

        var existingSong = await _context.Songs.FindAsync(id);
        if (existingSong == null)
        {
            return NotFound(new { error = "Song not found" });
        }

        existingSong.Title = song.Title;
        existingSong.FilePath = song.FilePath;
        existingSong.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SongExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(existingSong);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSong(int id)
    {
        var song = await _context.Songs.FindAsync(id);
        if (song == null)
        {
            return NotFound(new { error = "Song not found" });
        }

        // Delete physical file if it exists
        var uploadPath = _configuration["FileStorage:UploadPath"] ?? "./uploads";
        var filePath = Path.Combine(uploadPath, song.FilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.Songs.Remove(song);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Song deleted successfully" });
    }

    private bool SongExists(int id)
    {
        return _context.Songs.Any(e => e.Id == id);
    }
}
