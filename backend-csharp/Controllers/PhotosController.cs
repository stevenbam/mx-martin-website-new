using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StuckOnSteven.Api.Data;
using StuckOnSteven.Api.Models;

namespace StuckOnSteven.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PhotosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Photo>>> GetPhotos()
    {
        return await _context.Photos
            .OrderByDescending(p => p.Id)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Photo>> GetPhoto(int id)
    {
        var photo = await _context.Photos.FindAsync(id);

        if (photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        return photo;
    }

    [HttpPost]
    public async Task<ActionResult<Photo>> CreatePhoto([FromBody] Photo photo)
    {
        photo.CreatedAt = DateTime.UtcNow;
        photo.UpdatedAt = DateTime.UtcNow;

        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPhoto), new { id = photo.Id }, photo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePhoto(int id, [FromBody] Photo photo)
    {
        if (id != photo.Id)
        {
            return BadRequest();
        }

        var existingPhoto = await _context.Photos.FindAsync(id);
        if (existingPhoto == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        existingPhoto.Url = photo.Url;
        existingPhoto.Caption = photo.Caption;
        existingPhoto.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PhotoExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(existingPhoto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePhoto(int id)
    {
        var photo = await _context.Photos.FindAsync(id);
        if (photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Photo deleted successfully" });
    }

    private bool PhotoExists(int id)
    {
        return _context.Photos.Any(e => e.Id == id);
    }
}
