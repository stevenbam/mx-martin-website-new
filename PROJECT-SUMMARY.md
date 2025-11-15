# Stuck On Steven - Project Summary

**Date**: November 15, 2025
**Project**: Website rebrand and migration to VPS with C# backend

---

## 🎯 What We Accomplished

### 1. Website Rebranding (Mx Martin → Stuck On Steven)

#### Changed:
- ✅ Site title in `src/components/Header.tsx`
- ✅ Welcome message in `src/pages/Home.tsx`
- ✅ Footer copyright in `src/components/Footer.tsx`
- ✅ Page title in `public/index.html`
- ✅ App name in `public/manifest.json`
- ✅ Package name in `package.json` → `stuckonsteven-website`
- ✅ All admin passwords changed from `mxmartin2024` to `$Aragorn60`
- ✅ Domain references updated to `stuckonsteven.com`
- ✅ Updated `.env.production` API URL to `https://stuckonsteven.com/api`

#### Files Updated:
- `src/components/Header.tsx`
- `src/pages/Home.tsx`
- `src/components/Footer.tsx`
- `public/index.html`
- `public/manifest.json`
- `package.json`
- `.env.production`
- `DEPLOYMENT.md`
- `HOSTINGER-DEPLOYMENT-STEPS.md`
- Admin password in all pages: `Apps.tsx`, `Lyrics.tsx`, `Photos.tsx`, `Video.tsx`, `SongList.tsx`

---

### 2. C# ASP.NET Core Backend Created

#### Location: `backend-csharp/`

#### Tech Stack:
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core
- **Database**: MySQL (Pomelo.EntityFrameworkCore.MySql)
- **API Documentation**: Swagger/OpenAPI

#### Files Created:

**Project Configuration:**
- `StuckOnSteven.Api.csproj` - Project file with dependencies
- `appsettings.json` - Production configuration
- `appsettings.Development.json` - Development configuration
- `Program.cs` - Application entry point and configuration

**Models** (`Models/`):
- `Song.cs` - Song entity
- `Lyric.cs` - Lyric entity
- `Photo.cs` - Photo entity
- `Video.cs` - Video entity

**Database** (`Data/`):
- `ApplicationDbContext.cs` - EF Core DbContext with table mappings

**Controllers** (`Controllers/`):
- `SongsController.cs` - Songs CRUD + file upload
- `LyricsController.cs` - Lyrics CRUD
- `PhotosController.cs` - Photos CRUD
- `VideosController.cs` - Videos CRUD

**Other:**
- `.gitignore` - Excludes build artifacts, uploads, etc.
- `README.md` - Backend documentation
- `deploy-backend.sh` - VPS deployment script

#### Key Features:
- RESTful API endpoints matching original Node.js backend
- File upload support (up to 50MB)
- CORS enabled for frontend
- Static file serving for `/uploads`
- MySQL connection pooling
- **JSON Serialization**: Configured to use snake_case (file_path, created_at, etc.)

---

### 3. VPS Deployment on Hostinger

#### Server Details:
- **VPS**: Hostinger Ubuntu server
- **IP**: `srv1130533` (actual IP in Hostinger panel)
- **User**: `stuckonsteven`
- **Domain**: `stuckonsteven.com`

#### Software Installed:
- ✅ .NET 8.0 SDK
- ✅ MySQL 8.0
- ✅ Nginx
- ✅ Node.js 20.x
- ✅ Git
- ✅ Certbot (Let's Encrypt SSL)

#### Architecture:
```
Internet → Nginx:80/443
    ↓
    ├─ / → React Frontend (/var/www/stuckonsteven/frontend)
    ├─ /api → C# Backend:5000 (systemd service)
    ├─ /uploads → Static files (/var/www/stuckonstiven/uploads)
    └─ MySQL Database (localhost)
```

#### Directory Structure on VPS:
```
/var/www/stuckonsteven/
├── backend-csharp/          # C# backend source
│   ├── publish/            # Built app (running)
│   └── ...
├── frontend/               # React build files
│   ├── index.html
│   ├── static/
│   └── ...
├── uploads/                # User uploaded files
│   └── songs/
├── src/                    # React source (from git)
├── public/
└── package.json
```

#### Services Running:
- **Backend**: systemd service `stuckonsteven-api.service`
  - Runs: `/usr/bin/dotnet /var/www/stuckonsteven/backend-csharp/publish/StuckOnSteven.Api.dll`
  - Auto-restarts on failure
  - Logs: `sudo journalctl -u stuckonsteven-api -f`

- **Frontend**: Nginx serving static files
  - Config: `/etc/nginx/sites-available/stuckonsteven.com`

- **SSL**: Let's Encrypt certificate
  - Auto-renewal configured
  - HTTPS enforced

#### Database:
- **Name**: `u128398700_mxmartin_db`
- **User**: `u128398700_admin`
- **Password**: `$Aragorn60`
- **Host**: `localhost` (production), `srv1254.hstgr.io` (development)

---

## 🔧 Issues Encountered & Fixes

### Issue 1: Nginx Firewall Blocking
**Problem**: Site timing out when accessing by IP
**Cause**: UFW firewall only allowed SSH, not HTTP/HTTPS
**Fix**:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Issue 2: Systemd Service Timeout
**Problem**: Backend service showing timeout errors
**Cause**: Service configured with `Type=notify` but app not sending ready signal
**Fix**: Changed systemd service type from `notify` to `simple`

### Issue 3: MySQL Secure Installation
**Problem**: Accidentally enabled password validation
**Fix**: Continued with strong password `$Aragorn60` which passed validation

### Issue 4: Database Schema Mismatch
**Problem**: `Unknown column 'created_at' in 'field list'`
**Cause**: Imported database from old site lacked timestamp columns
**Fix**: Added columns with ALTER TABLE:
```sql
ALTER TABLE songs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE songs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- (repeated for lyrics, photos, videos tables)
```

### Issue 5: TypeScript Dependency Conflict
**Problem**: npm install failed due to TypeScript version mismatch
**Cause**: TypeScript 5.9.3 vs react-scripts 5.0.1 expecting 4.x
**Fix**: Used `npm install --legacy-peer-deps`
**TODO**: Clean this up later (downgrade TypeScript or migrate from CRA)

### Issue 6: Missing tesseract.js Package
**Problem**: Build failed - can't resolve 'tesseract.js'
**Fix**: `npm install tesseract.js --legacy-peer-deps`

### Issue 7: JSON Property Name Mismatch
**Problem**: Frontend error "Cannot read properties of undefined (reading 'startsWith')"
**Cause**: C# backend returned `filePath` (camelCase), React expected `file_path` (snake_case)
**Fix**: Configured ASP.NET Core JSON serialization to use snake_case:
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
    });
```

### Issue 8: Old Song Database Records
**Problem**: Migrated songs had wrong file paths (`/songs/` instead of `/uploads/songs/`)
**Cause**: Old database schema difference
**Fix**: Deleted old songs, re-uploaded fresh through admin interface

---

## 📁 Documentation Created

1. **VPS-SETUP.md** - Complete VPS deployment guide (70+ steps)
   - Initial VPS setup
   - Software installation
   - Backend deployment
   - Frontend deployment
   - Nginx configuration
   - SSL setup
   - Troubleshooting

2. **QUICK-START.md** - Quick reference guide
   - Local development
   - Deployment commands
   - Common tasks

3. **backend-csharp/README.md** - C# backend documentation
   - API endpoints
   - Configuration
   - Running locally

4. **deploy.ps1** - Windows PowerShell deployment script
5. **backend-csharp/deploy-backend.sh** - VPS deployment script

---

## 🚀 Current State

### ✅ Working:
- Website accessible at `https://stuckonsteven.com`
- SSL/HTTPS enabled and working
- API endpoints functional
- Lyrics page displaying migrated data
- Song upload functionality working
- Admin authentication working (password: `$Aragorn60`)

### ⚠️ Known Issues:
- TypeScript dependency conflict (using --legacy-peer-deps workaround)
- Old song audio files not migrated (only database records were migrated)
  - **Solution**: Re-upload songs through admin interface

### 📝 TODO/Future Improvements:
1. Fix TypeScript version conflict properly
2. Consider migrating from Create React App to Vite
3. Set up automated database backups
4. Consider environment-based admin passwords
5. Add proper authentication (instead of hardcoded passwords)
6. Optimize images and assets
7. Add monitoring/logging solution

---

## 🔑 Important Credentials

**VPS Access:**
- SSH: `ssh stuckonsteven@your-vps-ip`
- User: `stuckonsteven`

**Database:**
- Name: `u128398700_mxmartin_db`
- User: `u128398700_admin`
- Password: `$Aragorn60`
- Remote Host (dev): `srv1254.hstgr.io`
- Local Host (prod): `localhost`

**Admin Password (Frontend):**
- All pages: `$Aragorn60`

**Domain:**
- Domain: `stuckonsteven.com`
- DNS: A records pointing to VPS IP

---

## 📋 Useful Commands

### VPS Management:
```bash
# View backend logs
sudo journalctl -u stuckonsteven-api -f

# Restart backend
sudo systemctl restart stuckonsteven-api

# Check backend status
sudo systemctl status stuckonsteven-api

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t
```

### Deployment:
```bash
# On VPS - update backend
cd /var/www/stuckonsteven
git pull
cd backend-csharp
dotnet publish -c Release -o ./publish
sudo systemctl restart stuckonsteven-api

# On VPS - update frontend
cd /var/www/stuckonsteven
npm install --legacy-peer-deps
npm run build
sudo cp -r build/* frontend/
```

### Database:
```bash
# Connect to database
mysql -u u128398700_admin -p u128398700_mxmartin_db

# Backup database
mysqldump -u u128398700_admin -p u128398700_mxmartin_db > backup.sql

# Restore database
mysql -u u128398700_admin -p u128398700_mxmartin_db < backup.sql
```

---

## 🎓 What We Learned

1. **DNS Propagation**: Can take time, but usually faster than expected
2. **Firewall First**: Always configure firewall before installing web servers
3. **Schema Migrations**: Database schemas from different backends may need adjustments
4. **Property Naming**: Important to maintain consistent naming conventions (snake_case vs camelCase)
5. **Git Workflow**: Better to edit locally and push than edit directly on server
6. **Database Paths vs File Paths**: Database stores URL paths, not filesystem paths

---

## 📊 Project Statistics

**Lines of Code Added:**
- C# Backend: ~800 lines
- Documentation: ~1000+ lines
- Configuration: ~200 lines

**Files Created:** 20+
**Commits:** Multiple (rebranding + backend addition)
**Deployment Time:** ~4 hours (including troubleshooting)

---

## 🎉 Success Metrics

- ✅ Complete website rebrand
- ✅ Full backend migration from Node.js to C#
- ✅ VPS deployment from scratch
- ✅ SSL/HTTPS configured
- ✅ Data migration successful
- ✅ Zero downtime migration possible (kept old site running)

---

## 📞 Next Session Quick Start

**To catch me up in a future conversation, share this file and mention:**

1. Current project state (from "Current State" section above)
2. What you want to work on next
3. Any new issues encountered

**Common next tasks might be:**
- Fixing TypeScript dependency issue
- Setting up automated backups
- Adding new features
- Performance optimization
- Security hardening

---

**Project Repository:** https://github.com/stevenbam/mx-martin-website-new
**Live Site:** https://stuckonsteven.com
**Last Updated:** November 15, 2025
