# Stuck On Steven - C# Backend API

This is the ASP.NET Core Web API backend for the Stuck On Steven website.

## Features

- RESTful API built with ASP.NET Core 8.0
- Entity Framework Core with MySQL
- File upload support for audio files
- CORS enabled for frontend communication
- Swagger/OpenAPI documentation

## Prerequisites

- .NET 8.0 SDK or later
- MySQL 8.0 or MariaDB
- (For development) Visual Studio 2022, VS Code, or Rider

## Project Structure

```
backend-csharp/
├── Controllers/        # API endpoints
├── Models/            # Entity models
├── Data/              # Database context
├── appsettings.json   # Configuration (production)
├── appsettings.Development.json  # Configuration (development)
└── Program.cs         # Application entry point
```

## Configuration

### Database Connection

Update `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=your_db;User=your_user;Password=your_password;"
  }
}
```

### File Upload Path

Configure the upload directory in `appsettings.json`:

```json
{
  "FileStorage": {
    "UploadPath": "/var/www/stuckonsteven/uploads",
    "MaxFileSize": 52428800
  }
}
```

## Running Locally

### Development Mode

```bash
cd backend-csharp
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5000` (or `https://localhost:5001`)

### Production Build

```bash
dotnet publish -c Release -o ./publish
```

## API Endpoints

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/{id}` - Get single song
- `POST /api/songs` - Create song
- `POST /api/songs/upload` - Upload audio file
- `PUT /api/songs/{id}` - Update song
- `DELETE /api/songs/{id}` - Delete song

### Lyrics
- `GET /api/lyrics` - Get all lyrics
- `GET /api/lyrics/{id}` - Get single lyric
- `POST /api/lyrics` - Create lyric
- `PUT /api/lyrics/{id}` - Update lyric
- `DELETE /api/lyrics/{id}` - Delete lyric

### Photos
- `GET /api/photos` - Get all photos
- `GET /api/photos/{id}` - Get single photo
- `POST /api/photos` - Create photo
- `PUT /api/photos/{id}` - Update photo
- `DELETE /api/photos/{id}` - Delete photo

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/{id}` - Get single video
- `POST /api/videos` - Create video
- `PUT /api/videos/{id}` - Update video
- `DELETE /api/videos/{id}` - Delete video

## Deployment

See `VPS-SETUP.md` for complete VPS deployment instructions.
