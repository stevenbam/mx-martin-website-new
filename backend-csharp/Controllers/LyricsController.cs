using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StuckOnSteven.Api.Data;
using StuckOnSteven.Api.Models;

namespace StuckOnSteven.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LyricsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LyricsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Lyric>>> GetLyrics()
    {
        return await _context.Lyrics
            .OrderByDescending(l => l.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Lyric>> GetLyric(int id)
    {
        var lyric = await _context.Lyrics.FindAsync(id);

        if (lyric == null)
        {
            return NotFound(new { error = "Lyrics not found" });
        }

        return lyric;
    }

    [HttpPost]
    public async Task<ActionResult<Lyric>> CreateLyric([FromBody] Lyric lyric)
    {
        lyric.CreatedAt = DateTime.UtcNow;
        lyric.UpdatedAt = DateTime.UtcNow;

        _context.Lyrics.Add(lyric);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLyric), new { id = lyric.Id }, lyric);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLyric(int id, [FromBody] Lyric lyric)
    {
        if (id != lyric.Id)
        {
            return BadRequest();
        }

        var existingLyric = await _context.Lyrics.FindAsync(id);
        if (existingLyric == null)
        {
            return NotFound(new { error = "Lyrics not found" });
        }

        existingLyric.Title = lyric.Title;
        existingLyric.Lyrics = lyric.Lyrics;
        existingLyric.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!LyricExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(existingLyric);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLyric(int id)
    {
        var lyric = await _context.Lyrics.FindAsync(id);
        if (lyric == null)
        {
            return NotFound(new { error = "Lyrics not found" });
        }

        _context.Lyrics.Remove(lyric);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lyrics deleted successfully" });
    }

    private bool LyricExists(int id)
    {
        return _context.Lyrics.Any(e => e.Id == id);
    }
}
