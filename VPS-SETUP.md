# Complete VPS Setup Guide for Stuck On Steven

This guide will walk you through setting up your Hostinger VPS with Ubuntu to run the Stuck On Steven website with a C# backend.

## Overview

**Stack:**
- **Frontend**: React (served by Nginx)
- **Backend**: ASP.NET Core 8.0 (C# Web API)
- **Database**: MySQL 8.0
- **Web Server**: Nginx (reverse proxy + static file serving)
- **Process Manager**: systemd

**Architecture:**
```
Internet → Nginx:80/443 → {
    / → React Frontend (static files)
    /api → ASP.NET Core Backend:5000
    /uploads → Static file serving
}
```

---

## Part 1: Initial VPS Setup

### 1.1 Connect to Your VPS

```bash
ssh root@your-vps-ip
```

Replace `your-vps-ip` with your Hostinger VPS IP address.

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Create a Non-Root User

```bash
adduser stuckonsteven
usermod -aG sudo stuckonsteven
su - stuckonsteven
```

### 1.4 Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Part 2: Install Required Software

### 2.1 Install .NET 8.0 SDK

```bash
# Add Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install .NET SDK
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Verify installation
dotnet --version
```

### 2.2 Install MySQL Server

```bash
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

**During secure installation:**
- Set root password: `$Aragorn60` (or your preferred password)
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### 2.3 Configure MySQL Database

```bash
sudo mysql -u root -p
```

Then run these SQL commands:

```sql
CREATE DATABASE u128398700_mxmartin_db;
CREATE USER 'u128398700_admin'@'localhost' IDENTIFIED BY '$Aragorn60';
GRANT ALL PRIVILEGES ON u128398700_mxmartin_db.* TO 'u128398700_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Note:** If you already have data in your Hostinger MySQL database, you'll need to migrate it. See "Data Migration" section below.

### 2.4 Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 Install Git

```bash
sudo apt install -y git
```

---

## Part 3: Deploy Backend (C# API)

### 3.1 Create Application Directory

```bash
sudo mkdir -p /var/www/stuckonsteven
sudo chown -R stuckonsteven:stuckonsteven /var/www/stuckonsteven
cd /var/www/stuckonsteven
```

### 3.2 Upload Your Backend Code

**Option A: Using Git (Recommended)**

If your code is in a Git repository:

```bash
cd /var/www/stuckonsteven
git clone https://github.com/yourusername/your-repo.git backend
cd backend/backend-csharp
```

**Option B: Using SCP from Local Machine**

From your local Windows machine (PowerShell):

```powershell
scp -r C:\Users\steve\source\repos\mxmartin-website-new\backend-csharp stuckonsteven@your-vps-ip:/var/www/stuckonsteven/backend
```

### 3.3 Build the Application

```bash
cd /var/www/stuckonsteven/backend
dotnet restore
dotnet publish -c Release -o ./publish
```

### 3.4 Create Uploads Directory

```bash
mkdir -p /var/www/stuckonsteven/uploads/songs
```

### 3.5 Create Systemd Service

Create the service file:

```bash
sudo nano /etc/systemd/system/stuckonsteven-api.service
```

Paste this content:

```ini
[Unit]
Description=Stuck On Steven API
After=network.target

[Service]
Type=notify
User=stuckonsteven
WorkingDirectory=/var/www/stuckonsteven/backend/publish
ExecStart=/usr/bin/dotnet /var/www/stuckonsteven/backend/publish/StuckOnSteven.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=stuckonsteven-api
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save and exit (Ctrl+X, then Y, then Enter).

### 3.6 Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable stuckonsteven-api
sudo systemctl start stuckonsteven-api

# Check status
sudo systemctl status stuckonsteven-api

# View logs if needed
sudo journalctl -u stuckonsteven-api -f
```

---

## Part 4: Deploy Frontend (React)

### 4.1 Build Frontend Locally

On your local Windows machine:

```powershell
cd C:\Users\steve\source\repos\mxmartin-website-new
npm run build
```

This creates a `build` folder with your optimized React app.

### 4.2 Upload to VPS

From your local machine:

```powershell
scp -r C:\Users\steve\source\repos\mxmartin-website-new\build stuckonsteven@your-vps-ip:/var/www/stuckonsteven/frontend
```

**OR** using an FTP client like FileZilla:
- Connect to your VPS
- Upload the `build` folder contents to `/var/www/stuckonsteven/frontend`

---

## Part 5: Configure Nginx

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/stuckonsteven.com
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name stuckonsteven.com www.stuckonsteven.com;

    # Frontend - React App
    root /var/www/stuckonsteven/frontend;
    index index.html;

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/stuckonsteven/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API - Proxy to ASP.NET Core
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Upload size limit (50MB)
        client_max_body_size 50M;
    }

    # Frontend routing - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save and exit.

### 5.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/stuckonsteven.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Part 6: Configure Domain & SSL

### 6.1 Point Domain to VPS

In your domain registrar (or Hostinger DNS panel):

1. Add an **A record**:
   - Name: `@`
   - Value: Your VPS IP address
   - TTL: 3600

2. Add an **A record** for www:
   - Name: `www`
   - Value: Your VPS IP address
   - TTL: 3600

Wait for DNS propagation (can take up to 24 hours, usually much faster).

### 6.2 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d stuckonsteven.com -d www.stuckonsteven.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain certificates
- Update Nginx configuration
- Set up auto-renewal

### 6.3 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## Part 7: Data Migration (If Needed)

If you have existing data in your Hostinger MySQL database:

### 7.1 Export from Hostinger

From your local machine or Hostinger's phpMyAdmin:

```bash
mysqldump -h srv1254.hstgr.io -u u128398700_admin -p u128398700_mxmartin_db > backup.sql
```

### 7.2 Import to VPS

Upload the SQL file to your VPS, then:

```bash
mysql -u u128398700_admin -p u128398700_mxmartin_db < backup.sql
```

---

## Part 8: Testing & Verification

### 8.1 Test API

```bash
curl http://localhost:5000/api/test
curl http://stuckonsteven.com/api/test
```

Expected response: `{"message":"C# API is working!"}`

### 8.2 Test Frontend

Visit in browser:
- `http://stuckonsteven.com`
- `https://stuckonsteven.com` (after SSL)

### 8.3 Test Full Integration

1. Log into admin panel (password: `$Aragorn60`)
2. Upload a song
3. Verify it appears in the list
4. Check uploads directory: `ls -la /var/www/stuckonsteven/uploads/songs/`

### 8.4 Check Logs

```bash
# API logs
sudo journalctl -u stuckonsteven-api -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Part 9: Maintenance & Updates

### 9.1 Update Backend

```bash
cd /var/www/stuckonsteven/backend
git pull  # If using Git
dotnet publish -c Release -o ./publish
sudo systemctl restart stuckonsteven-api
```

### 9.2 Update Frontend

From local machine:
```powershell
cd C:\Users\steve\source\repos\mxmartin-website-new
npm run build
scp -r build/* stuckonsteven@your-vps-ip:/var/www/stuckonsteven/frontend/
```

### 9.3 Database Backup

Create a backup script:

```bash
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u u128398700_admin -p'$Aragorn60' u128398700_mxmartin_db > ~/backups/db_backup_$DATE.sql
find ~/backups -name "db_backup_*.sql" -mtime +7 -delete
```

Make it executable and schedule with cron:

```bash
chmod +x ~/backup-db.sh
mkdir ~/backups
crontab -e
```

Add this line (daily backup at 2 AM):
```
0 2 * * * /home/stuckonsteven/backup-db.sh
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check service status
sudo systemctl status stuckonsteven-api

# View detailed logs
sudo journalctl -u stuckonsteven-api -n 100 --no-pager

# Check if port 5000 is in use
sudo netstat -tlnp | grep 5000
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u u128398700_admin -p u128398700_mxmartin_db

# Check MySQL service
sudo systemctl status mysql
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R stuckonsteven:stuckonsteven /var/www/stuckonsteven

# Fix uploads directory
sudo chmod -R 755 /var/www/stuckonsteven/uploads
```

### Frontend 404 Errors

If refreshing pages gives 404 errors:
- Verify the Nginx `try_files` directive is correct
- Make sure `index.html` exists in `/var/www/stuckonsteven/frontend`

---

## Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSL certificate installed
- [ ] MySQL root login disabled remotely
- [ ] Non-root user created
- [ ] Strong passwords used
- [ ] Regular backups scheduled
- [ ] System updates automated: `sudo apt install unattended-upgrades`

---

## Quick Reference Commands

```bash
# Restart API
sudo systemctl restart stuckonsteven-api

# Restart Nginx
sudo systemctl restart nginx

# View API logs
sudo journalctl -u stuckonsteven-api -f

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

---

## Support

For issues with:
- **Hostinger VPS**: Contact Hostinger support
- **SSL Certificates**: Check Let's Encrypt documentation
- **.NET/C# Issues**: Check ASP.NET Core documentation

---

**Congratulations!** Your Stuck On Steven website is now running on a VPS with C# backend! 🎉
