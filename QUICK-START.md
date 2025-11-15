# Quick Start Guide - Stuck On Steven

This guide will help you get started with the new C# backend setup.

## What Changed?

✅ **Backend**: Converted from Node.js to C# ASP.NET Core
✅ **Database**: Still using MySQL (same database)
✅ **Frontend**: No changes needed (React still works the same)
✅ **Deployment**: Now on VPS instead of shared hosting

---

## Local Development

### Prerequisites

1. **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download)
2. **MySQL** - Already running on Hostinger (remote connection)
3. **Node.js** - For frontend development

### Running the Backend (C#)

```bash
cd backend-csharp
dotnet restore
dotnet run
```

The API will run on `http://localhost:5000`

### Running the Frontend (React)

In a separate terminal:

```bash
npm install  # If you haven't already
npm start
```

The React app will run on `http://localhost:3000`

### Testing the Connection

1. Start both backend and frontend
2. Open `http://localhost:3000` in your browser
3. The app should load normally and connect to your backend at `http://localhost:5000/api`

---

## Deploying to VPS

Follow the complete guide in `VPS-SETUP.md`

### Quick Deploy Summary

1. **SSH into VPS**: `ssh stuckonsteven@your-vps-ip`
2. **Deploy backend**: Upload and build C# app
3. **Deploy frontend**: Build React app locally, upload to VPS
4. **Configure Nginx**: Set up reverse proxy
5. **Get SSL**: Use Certbot for HTTPS

**Full instructions**: See `VPS-SETUP.md`

---

## File Structure

```
mxmartin-website-new/
├── backend-csharp/          # NEW C# Backend
│   ├── Controllers/         # API endpoints
│   ├── Models/             # Database entities
│   ├── Data/               # DB context
│   ├── Program.cs          # App entry point
│   └── appsettings.json    # Configuration
│
├── server/                  # OLD Node.js backend (can be deleted)
│
├── src/                    # React frontend (unchanged)
│   ├── pages/
│   ├── components/
│   └── config.ts          # API URL configuration
│
├── public/                 # Static assets
├── build/                  # Production build (after npm run build)
│
├── .env.development       # Dev environment (localhost)
├── .env.production        # Prod environment (stuckonsteven.com)
├── VPS-SETUP.md          # Complete VPS setup guide
└── QUICK-START.md        # This file
```

---

## Environment Variables

### Frontend

The React app uses `.env` files to configure the API URL:

- **Development** (`.env.development`): `http://localhost:5000/api`
- **Production** (`.env.production`): `https://stuckonsteven.com/api`

### Backend

The C# app uses `appsettings.json` files:

- **Development** (`appsettings.Development.json`): Remote MySQL on Hostinger
- **Production** (`appsettings.json`): Local MySQL on VPS

---

## API Endpoints (Same as Before)

All endpoints remain the same:

- **Songs**: `/api/songs`
- **Lyrics**: `/api/lyrics`
- **Photos**: `/api/photos`
- **Videos**: `/api/videos`

---

## Common Tasks

### Build Frontend for Production

```bash
npm run build
```

Creates an optimized build in the `build/` folder.

### Update Backend on VPS

```bash
# On VPS
cd /var/www/stuckonsteven/backend
dotnet publish -c Release -o ./publish
sudo systemctl restart stuckonsteven-api
```

### Update Frontend on VPS

```bash
# Local machine
npm run build
scp -r build/* stuckonsteven@your-vps-ip:/var/www/stuckonsteven/frontend/
```

### View Backend Logs

```bash
# On VPS
sudo journalctl -u stuckonsteven-api -f
```

---

## Testing Everything Works

### 1. Test API Directly

Visit: `https://stuckonsteven.com/api/test`
Expected: `{"message":"C# API is working!"}`

### 2. Test Frontend

Visit: `https://stuckonsteven.com`
Expected: Website loads normally

### 3. Test Admin Functions

1. Go to any admin page (Listen, Lyrics, Photos, Videos)
2. Click "Admin Login"
3. Enter password: `$Aragorn60`
4. Try uploading content
5. Verify it saves and displays correctly

---

## Troubleshooting

### Frontend can't connect to API

**Check:**
1. Is the backend running? `sudo systemctl status stuckonsteven-api`
2. Is Nginx configured correctly? `sudo nginx -t`
3. Are there CORS errors? Check browser console

### Database connection fails

**Check:**
1. MySQL service running? `sudo systemctl status mysql`
2. Correct credentials in `appsettings.json`?
3. Database exists? `mysql -u u128398700_admin -p`

### File uploads fail

**Check:**
1. Uploads directory exists? `/var/www/stuckonsteven/uploads`
2. Correct permissions? `sudo chown -R stuckonsteven:stuckonsteven /var/www/stuckonsteven/uploads`
3. Nginx file size limit? Check `client_max_body_size` in Nginx config

---

## Next Steps

1. ✅ Review the `VPS-SETUP.md` guide
2. ✅ Set up your VPS following the instructions
3. ✅ Deploy your backend and frontend
4. ✅ Point your domain to the VPS
5. ✅ Get SSL certificates
6. ✅ Test everything works
7. ✅ Set up automated backups

---

## Need Help?

- **VPS Setup**: See `VPS-SETUP.md` for detailed instructions
- **C# Backend**: See `backend-csharp/README.md`
- **.NET Docs**: https://learn.microsoft.com/aspnet/core
- **Nginx Docs**: https://nginx.org/en/docs/

Good luck! 🚀
