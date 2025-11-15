# 🚀 Hostinger Deployment Steps for Stuck On Steven

## 📦 Files You Have Ready:

1. **stuckonsteven-frontend.tar.gz** (2.6MB) - React app build
2. **stuckonsteven-backend.tar.gz** (27KB) - Node.js server
3. **.htaccess** - Apache configuration file

All files are in: `C:\Users\steve\source\repos\mxmartin-website-new\`

---

## 🔧 STEP 1: Deploy Frontend

### 1.1 Log into Hostinger
- Go to https://hpanel.hostinger.com
- Select your hosting account

### 1.2 Open File Manager
- Navigate to **Files** → **File Manager**
- Open the `public_html` folder

### 1.3 Clear Old Files (if any)
- **IMPORTANT**: Backup any existing files first!
- Delete all old files in `public_html` (or move them to a backup folder)

### 1.4 Upload Frontend
- Click **Upload** button
- Upload `stuckonsteven-frontend.tar.gz`
- After upload completes, **right-click** on the tar.gz file
- Select **Extract** (Hostinger supports tar.gz extraction)
- Delete the tar.gz file after extraction
- **Note**: Files should extract directly into public_html, not into a subfolder

### 1.5 Upload .htaccess
- In the same `public_html` folder
- Click **Upload** button
- Upload the `.htaccess` file from your local folder

✅ Your frontend is now deployed!

---

## 🖥️ STEP 2: Deploy Backend (Node.js)

### 2.1 Create Application Folder
- In File Manager, go **up one level** (outside public_html)
- You should be in `/home/your-username/`
- Create a new folder called `nodejs-app` or `stuckonsteven-api`

### 2.2 Upload Backend
- Open the folder you just created
- Click **Upload** button
- Upload `stuckonsteven-backend.tar.gz`
- Right-click and **Extract**
- Delete the tar.gz file after extraction
- **Note**: Files should extract directly into the folder, not into a subfolder

### 2.3 Rename Environment File
- You should see files like: `server.js`, `db.js`, `.env.production`, etc.
- **Rename** `.env.production` to `.env`

### 2.4 Set Up Node.js Application
- Go back to Hostinger Panel (hPanel)
- Find **Advanced** → **Node.js**
- Click **Create Application**

Fill in these details:
- **Application root**: `/home/your-username/nodejs-app` (or whatever you named it)
- **Application URL**: Leave blank or set to your domain
- **Application startup file**: `server.js`
- **Node.js version**: Select 18.x or 20.x (latest LTS)

### 2.5 Install Dependencies
- In the Node.js application panel, there should be a terminal or SSH access
- Or use **SSH Access** from the main panel
- Run these commands:

```bash
cd ~/nodejs-app  # or your folder name
npm install
```

### 2.6 Start the Application
- In the Node.js panel, click **Start Application**
- Or via command line: `node server.js`

✅ Your backend is now running!

---

## 🔍 STEP 3: Verify Deployment

### 3.1 Test Frontend
Visit these URLs in your browser:
- https://stuckonsteven.com - Should show the home page with Matrix background
- https://stuckonsteven.com/listen - Listen page
- https://stuckonsteven.com/lyrics - Lyrics page
- https://stuckonsteven.com/photos - Photos page
- https://stuckonsteven.com/videos - Videos page

### 3.2 Test Backend API
Visit this URL:
- https://stuckonsteven.com/api/songs

You should see JSON data (probably empty array `[]` at first)

### 3.3 Check for Errors
- Open browser console (F12) and look for any errors
- Check Hostinger's error logs if something doesn't work

---

## 📝 STEP 4: Add Initial Content

### Option A: Use Admin Interface
1. Go to https://stuckonsteven.com/listen
2. Click "Admin Login"
3. Enter password: `$Aragorn60`
4. Upload your songs, photos, videos, etc.

### Option B: Run Seed Script
If you have songs you want to bulk upload:
```bash
# From your local machine
cd C:\Users\steve\source\repos\mxmartin-website-new\server
node seed-data.js
```

---

## 🔒 STEP 5: Security (Important!)

### 5.1 Enable HTTPS
- In Hostinger panel, go to **SSL**
- Install free SSL certificate for stuckonsteven.com
- Enable "Force HTTPS"

### 5.2 Admin Password
- Current password is set to `$Aragorn60`
- Or implement proper authentication system

### 5.3 Check Database Access
- Verify your MySQL database is accessible
- In Hostinger panel, go to **Databases** → **Remote MySQL**
- The database is already set up: `u128398700_mxmartin_db`

---

## 🐛 Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify all files extracted properly
- Make sure `.htaccess` is in place

### API not working
- Check Node.js application status in Hostinger panel
- Verify `.env` file has correct database credentials
- Check error logs in Hostinger

### Database connection error
- Verify database credentials in `.env`
- Check if Remote MySQL is enabled
- Confirm database exists: `u128398700_mxmartin_db`

### 404 errors on page refresh
- Make sure `.htaccess` file is uploaded
- Check that mod_rewrite is enabled (should be by default)

---

## 📂 Final File Structure on Server

```
/home/your-username/
├── public_html/              ← Frontend files here
│   ├── index.html
│   ├── .htaccess
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   ├── songs/
│   └── [other build files]
│
└── nodejs-app/               ← Backend files here
    ├── server.js
    ├── .env
    ├── db.js
    ├── routes/
    ├── package.json
    └── [other server files]
```

---

## ✅ Deployment Checklist

- [ ] Frontend zip uploaded to `public_html`
- [ ] Frontend zip extracted
- [ ] `.htaccess` file uploaded to `public_html`
- [ ] Backend folder created outside `public_html`
- [ ] Backend zip uploaded and extracted
- [ ] `.env.production` renamed to `.env`
- [ ] Node.js application created in Hostinger
- [ ] `npm install` completed
- [ ] Node.js application started
- [ ] Frontend accessible at https://stuckonsteven.com
- [ ] API responding at https://stuckonsteven.com/api/songs
- [ ] SSL certificate installed and HTTPS enabled
- [ ] Admin password changed from default

---

## 📞 Need Help?

- **Hostinger Support**: Available 24/7 via live chat
- **Backend Logs**: Check in Hostinger panel under Node.js application
- **Frontend Issues**: Check browser console (F12)

---

Good luck with your deployment! 🎉
