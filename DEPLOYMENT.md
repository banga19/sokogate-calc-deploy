# Sokogate-Calc cPanel Deployment Guide

## Overview
This guide walks you through deploying the Sokogate Construction Calculator Node.js app to cPanel using the **Setup Node.js App** feature.

## Prerequisites
- cPanel hosting with Node.js support (Phusion Passenger)
- Node.js 18.x or 20.x recommended
- FTP/File Manager access or Git deployment enabled

## Pre-Deployment Checklist

Your app is already configured for cPanel:
- ✅ `app.js` exports `module.exports = app`
- ✅ `app.js` listens on `process.env.PORT`
- ✅ `package.json` has `"start": "node app.js"`
- ✅ `.npmrc` set to `production` (no devDependencies installed)
- ✅ `.htaccess` proxy rules are **commented out by default** (safe for Passenger)

> **Note:** The deployment package uses the simplified `app.js` (not `src/server.js`). The `src/` directory is excluded from the ZIP.

## Step 1: Prepare Files for Upload

**DO NOT upload these folders/files:**
```
node_modules/          # Will be installed on server
.git/                  # Git history (not needed)
node_modules.tar.gz    # Backup archive
node_modules.zip       # Backup archive
app.js.backup          # Backup file
```

**Files to upload:**
```
app.js
package.json
package-lock.json
.npmrc
views/
public/
```

## Step 2: Upload to cPanel

### Option A: File Manager
1. Login to cPanel → **File Manager**
2. Navigate to `public_html/` or subdomain folder
3. Create folder: `sokogate-calc/`
4. Upload all files (zip and extract, or upload individually)

### Option B: FTP/SFTP
1. Connect via FTP client (FileZilla, etc.)
2. Upload files to `/home/username/public_html/sokogate-calc/`

### Option C: Git (if enabled)
1. cPanel → **Git Version Control**
2. Clone your repository
3. Ensure `.gitignore` excludes `node_modules/`

## Step 3: Setup Node.js App in cPanel

1. Login to cPanel → **"Setup Node.js App"** (or "Node.js Selector")
2. Click **"Create Application"**
3. Configure:
   ```
   Node.js version:     18.x or 20.x (recommended)
   Application mode:    Production
   Application root:    /home/username/public_html/Calculate
   Application URL:     yourdomain.com/Calculate
   Application startup file: app.js
   ```
4. Set **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   BASE_PATH=/Calculate
   CORS_ORIGIN=https://yourdomain.com
   ```
5. Click **Create**

## Step 4: Install Dependencies

After creating the app, cPanel provides a command to run:

```bash
cd /home/username/sokogate-calc
npm install
```

**Or use the cPanel interface:**
1. In **Setup Node.js App**, find your app
2. Click **Run NPM Install**
3. Wait for installation to complete

## Step 5: Restart the App

1. In cPanel → **Setup Node.js App**
2. Find your app and click **Restart**
3. Wait 10-20 seconds for the app to start

## Step 6: Verify Deployment

Visit these URLs to test:
```
https://yourdomain.com/Calculate              # Calculator page
https://yourdomain.com/Calculate/health       # Health check (should return JSON)
https://yourdomain.com/Calculate/style.css    # Static assets
```

**Expected responses:**
- `/Calculate` → HTML calculator page (HTTP 200)
- `/Calculate/health` → `{"status":"ok","timestamp":"..."}` (HTTP 200)
- `/Calculate/style.css` → CSS content (HTTP 200)

## Troubleshooting

### App Won't Start
- Check cPanel **Node.js Logs** for errors
- Verify `app.js` exists in application root
- Ensure `package.json` was uploaded
- Run `npm install` manually via SSH if available

### 404 Errors
- Check Application URL path matches your folder structure
- Verify the app is running in cPanel (status should show "Running")
- The `.htaccess` proxy rules are commented out by default for Passenger compatibility
- If using WordPress iframe integration, uncomment the proxy rule in `.htaccess`

### Static Files Not Loading (CSS/JS)
- Check browser console for 404 errors
- Verify `public/` folder was uploaded
- Check that `express.static()` path is correct

### Port Already in Use
- cPanel assigns a port automatically via `process.env.PORT`
- The app defaults to port 3000 if `PORT` is not set
- Ensure the `PORT` environment variable in cPanel matches your `.htaccess` proxy rule (if using iframe integration)

## Useful cPanel Commands (via SSH)

If you have SSH access:

```bash
# Navigate to app directory
cd /home/username/public_html/Calculate

# Install dependencies
npm ci

# Check app status
node app.js

# View logs
cat /home/username/logs/passenger.log
```

## WordPress iframe Integration

If embedding the calculator in a WordPress page:
1. Upload the `sokogate-calculator-wordpress-plugin.php` file to WordPress
2. Activate the plugin
3. Uncomment the proxy rule in `.htaccess`:
   ```apache
   RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
   ```
4. Ensure the `PORT` environment variable matches the port in `.htaccess`

## Post-Deployment

- [ ] Test all calculator functions (cement, bricks, concrete, etc.)
- [ ] Verify 3D visualization loads correctly
- [ ] Test on mobile device
- [ ] Set up SSL certificate (Let's Encrypt in cPanel)
- [ ] Configure backups

## Support

If you encounter issues:
1. Check cPanel Node.js error logs
2. Verify file permissions (755 for folders, 644 for files)
3. Contact your hosting provider if Passenger is not available

---
**Deployed Version:** 1.0.0  
**Last Updated:** 2026-04-27  
**ZIP Size:** ~36KB (13 files, flat structure)
