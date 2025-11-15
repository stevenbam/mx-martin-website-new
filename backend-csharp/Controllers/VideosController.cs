using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StuckOnSteven.Api.Data;
using StuckOnSteven.Api.Models;

namespace StuckOnSteven.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VideosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Video>>> GetVideos()
    {
        return await _context.Videos
            .OrderByDescending(v => v.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Video>> GetVideo(int id)
    {
        var video = await _context.Videos.FindAsync(id);

        if (video == null)
        {
            return NotFound(new { error = "Video not found" });
        }

        return video;
    }

    [HttpPost]
    public async Task<ActionResult<Video>> CreateVideo([FromBody] Video video)
    {
        video.CreatedAt = DateTime.UtcNow;
        video.UpdatedAt = DateTime.UtcNow;

        _context.Videos.Add(video);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, video);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVideo(int id, [FromBody] Video video)
    {
        if (id != video.Id)
        {
            return BadRequest();
        }

        var existingVideo = await _context.Videos.FindAsync(id);
        if (existingVideo == null)
        {
            return NotFound(new { error = "Video not found" });
        }

        existingVideo.Title = video.Title;
        existingVideo.Url = video.Url;
        existingVideo.IsEmbed = video.IsEmbed;
        existingVideo.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!VideoExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(existingVideo);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var video = await _context.Videos.FindAsync(id);
        if (video == null)
        {
            return NotFound(new { error = "Video not found" });
        }

        _context.Videos.Remove(video);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Video deleted successfully" });
    }

    private bool VideoExists(int id)
    {
        return _context.Videos.Any(e => e.Id == id);
    }
}
