# Deployment Guide for Mx Martin Website

## Overview
Your website now uses a MySQL database hosted on Hostinger to store all content (songs, lyrics, photos, videos). This guide will help you deploy both the React frontend and Node.js backend to production.

## Development vs Production

### Development (Local)
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: Connects to Hostinger MySQL remotely (srv1254.hstgr.io)

### Production (Hostinger)
- **Frontend**: Your domain (e.g., https://mxmartin.com)
- **Backend**: Your domain/api (e.g., https://mxmartin.com/api)
- **Database**: Connects via localhost (127.0.0.1) on server

## Pre-Deployment Checklist

### 1. Update Production Environment Variables

**Frontend (.env.production)**
```
REACT_APP_API_URL=https://yourdomain.com/api
```
Replace `yourdomain.com` with your actual domain.

**Backend (server/.env.production)**
Already configured for Hostinger:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=u128398700_admin
DB_PASSWORD=$Aragorn60
DB_NAME=u128398700_mxmartin_db
PORT=5000
```

### 2. Build the React App
```bash
cd C:\Users\steve\source\repos\mxmartin-website-new
npm run build
```
This creates a production-optimized `build` folder.

## Hostinger Deployment Options

### Option 1: Hostinger with Node.js Support

If your Hostinger plan supports Node.js:

1. **Upload Backend Files**
   - Upload the entire `server` folder to your hosting
   - Upload `server/.env.production` and rename to `.env`
   - Run `npm install` on the server
   - Start server: `npm start`

2. **Upload Frontend Build**
   - Upload contents of `build` folder to your public_html or web root
   - Configure .htaccess for React routing (see below)

3. **Configure .htaccess for React Routing**
   Create `.htaccess` in your web root:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /

     # API requests go to Node.js server
     RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

     # React Router - redirect all non-file requests to index.html
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_FILENAME} !-l
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Option 2: Hostinger without Node.js (PHP Backend Alternative)

If Node.js isn't available, you'll need to convert the backend to PHP:

1. **Create PHP API files** (I can help with this if needed)
2. **Upload to public_html/api**
3. **Upload React build to public_html**

### Option 3: Separate Hosting for Backend

- **Frontend**: Hostinger (static files)
- **Backend**: Deploy to Heroku, Railway, or Render
- Update `.env.production` with backend URL

## Post-Deployment Steps

### 1. Seed Initial Data

After deployment, add your existing songs to the database:

```bash
# From your local machine, run this script
node server/seed-data.js
```

Or manually add via the admin interface on each page.

### 2. Test All Features
- [ ] Songs load on Listen page
- [ ] Lyrics load and can be edited
- [ ] Photos can be uploaded and deleted
- [ ] Videos can be uploaded and deleted
- [ ] Admin login works on all pages
- [ ] All uploads save to database

### 3. Security Considerations

**IMPORTANT**:
- Change the admin password from 'mxmartin2024' in production
- Add HTTPS (Hostinger provides free SSL certificates)
- Consider adding user authentication instead of hardcoded passwords
- Add file size limits for uploads
- Validate uploaded file types on server

## File Structure

```
mxmartin-website-new/
├── src/                    # React frontend source
├── build/                  # Production build (after npm run build)
├── server/                 # Node.js backend
│   ├── routes/            # API endpoints
│   ├── db.js              # Database connection
│   ├── server.js          # Express server
│   ├── .env               # Development environment
│   └── .env.production    # Production environment
├── .env.development        # Frontend dev environment
└── .env.production         # Frontend prod environment
```

## Troubleshooting

### Database Connection Issues
- Verify Remote MySQL is enabled in Hostinger
- Check IP whitelist includes your server IP
- Confirm credentials in .env file

### API Not Working
- Check server logs for errors
- Verify CORS is properly configured
- Ensure API_URL in frontend matches backend URL

### Files Too Large
- Adjust `limit: '50mb'` in server.js if needed
- Check Hostinger's upload limits
- Consider using cloud storage (AWS S3, Cloudinary) for large files

## Running Locally

**Terminal 1 - Backend:**
```bash
cd C:\Users\steve\source\repos\mxmartin-website-new\server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\steve\source\repos\mxmartin-website-new
npm start
```

## Environment Variables Summary

| Variable | Development | Production |
|----------|------------|------------|
| Frontend API URL | http://localhost:5000/api | https://yourdomain.com/api |
| Backend DB Host | srv1254.hstgr.io | 127.0.0.1 |
| Backend DB Port | 3306 | 3306 |
| Backend Server Port | 5000 | 5000 (or as configured) |

## Support

For Hostinger-specific deployment help, check:
- Hostinger Knowledge Base
- Hostinger Support (via their panel)

For code issues, check the server logs and browser console for errors.
