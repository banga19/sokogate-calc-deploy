# LIVE DEPLOYMENT FIX — Complete Instructions

## What Was Fixed

The live version (`sokogate-calc-deploy/`) has been updated to match the working local version:

1. ✅ **`app.js`** — Now uses `BASE_PATH` env var with `express.Router()` mounted at `BASE_PATH`
2. ✅ **Routes** — All at `/Calculate/*` (health, page, calculate POST)
3. ✅ **Static files** — Served from `public/` at `/Calculate/style.css`, `/Calculate/script.js`
4. ✅ **package.json** — `"start": "node app.js"` (not `src/server.js`)
5. ✅ All files synced from main `sokogate-calc/` project

---

## Current State

### Local (sokogate-calc/) — ✅ WORKING
- Port: 3000
- BASE_PATH: `/Calculate`
- All tests pass

### Production (sokogate-calc-deploy/) — 📁 READY FOR UPLOAD
- All files updated at: `/home/apop/sokogate-calc-deploy/`
- ZIP available: `/home/apop/sokogate-calc/sokogate-calc-cpanel.zip` (36KB)

---

## cPanel Deployment Steps

### Step 1: Clean Old Files

**CRITICAL:** The `/Calculate` folder currently contains a React app (Nexus360) that conflicts.

**Via cPanel File Manager:**
1. Go to `public_html/repositories/sokogate-calc-deploy/`
2. **Delete if exists:**
   - `index.html`
   - `assets/` folder
   - Any other `.js`, `.css` files not part of Sokogate
3. Empty Trash

**Via SSH:**
```bash
cd /home/ultimotr/public_html/repositories/sokogate-calc-deploy
rm -rf index.html assets/
```

---

### Step 2: Upload & Extract

**Option A: ZIP Upload (Recommended)**
1. Download `sokogate-calc-cpanel.zip` from `/home/apop/sokogate-calc/`
2. cPanel → File Manager → `public_html/`
3. Upload ZIP
 4. Extract to `public_html/repositories/sokogate-calc-deploy/`
 5. Verify 13 files at root of `sokogate-calc-deploy/` (no nested folder)

**Option B: Direct File Copy (SSH)**
```bash
# From your local machine or server where sokogate-calc-deploy/ is accessible:
cp -r /home/apop/sokogate-calc-deploy/* /home/ultimotr/public_html/repositories/sokogate-calc-deploy/
cd /home/ultimotr/public_html/repositories/sokogate-calc-deploy
```

Expected file structure:
```
public_html/repositories/sokogate-calc-deploy/
├── app.js
├── package.json
├── package-lock.json
├── .npmrc
├── views/
│   └── index.ejs
├── public/
│   ├── style.css
│   └── script.js
├── .htaccess
├── DEPLOYMENT.md
├── sokogate-calculator-wordpress-plugin.php
└── WORDPRESS-INTEGRATION-GUIDE.md
```

---

### Step 3: Configure Node.js App in cPanel

1. cPanel → **Setup Node.js App** (or "Node.js Selector")
2. Click **Create Application** (or edit if already exists):
   ```
   Node.js version:     18.x or 20.x
   Application mode:    Production
    Application root:    /home/ultimotr/public_html/repositories/sokogate-calc-deploy
   Application URL:     https://ultimotradingltd.co.ke/Calculate
   Startup file:        app.js
   ```
3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   BASE_PATH=/Calculate
   CORS_ORIGIN=https://ultimotradingltd.co.ke
   ```
4. Click **Create** / **Save**

---

### Step 4: Install Dependencies

**Via cPanel UI:**
- In Setup Node.js App panel
- Find your app
- Click **Run NPM Install**

**Via SSH:**
```bash
cd /home/ultimotr/public_html/repositories/sokogate-calc-deploy
npm install --production
```

Expected output: 79 packages installed, 0 vulnerabilities.

---

### Step 5: Restart Application

1. In **Setup Node.js App**
2. Find your app
3. Click **Restart**
4. Wait 10–15 seconds

---

### Step 6: Verify Live Deployment

**Test endpoints in browser or via curl:**

```bash
# Health check
curl https://ultimotradingltd.co.ke/Calculate/health
# Expected: {"status":"ok","timestamp":"2026-04-27T..."}

# Main page
curl -I https://ultimotradingltd.co.ke/Calculate/
# Expected: HTTP/1.1 200 OK

# Calculate page
curl -I https://ultimotradingltd.co.ke/Calculate/calculate
# Expected: HTTP/1.1 200 OK

# Static CSS
curl -I https://ultimotradingltd.co.ke/Calculate/style.css
# Expected: HTTP/1.1 200 OK, Content-Type: text/css

# Static JS
curl -I https://ultimotradingltd.co.ke/Calculate/script.js
# Expected: HTTP/1.1 200 OK

# POST calculation
curl -X POST https://ultimotradingltd.co.ke/Calculate/calculate \
     -d "area=500&materialType=bricks"
# Expected: HTML containing "Bricks (9x4.5 inch)" badge
```

**Browser test:**
1. Visit `https://ultimotradingltd.co.ke/Calculate/`
2. Should see Sokogate calculator UI (not Nexus360 React app)
3. Enter area: 500
4. Select Material: Bricks
5. Click Calculate
6. Should see brick count, cement bags, sand amount

---

## Troubleshooting

### Still seeing "Nexus360" React app

**Cause:** Old `index.html` or `assets/` folder still present.

**Fix:**
1. Check: `ls -la /home/ultimotr/public_html/repositories/sokogate-calc-deploy/`
2. If `index.html` exists → delete it
3. If `assets/` exists → `rm -rf assets/`
4. Clear browser cache (hard refresh: `Ctrl+Shift+R`)
5. Restart Node.js app

---

### "Cannot POST /Calculate/calculate"

**Cause:** BASE_PATH not set or routes not mounted.

**Check:**
```bash
# SSH into server and view app.js
grep "BASE_PATH" /home/ultimotr/public_html/repositories/sokogate-calc-deploy/app.js
# Should show: const BASE_PATH = process.env.BASE_PATH || '/Calculate';
# And: app.use(BASE_PATH, router);
```

**Fix:** Ensure env var `BASE_PATH=/Calculate` is set in cPanel Node.js config.

---

### Static files return 404

**Cause:** `express.static` not mounted at `BASE_PATH`.

**Fix:** In `app.js` line 33–34 should be:
```javascript
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));
```

---

### "Cannot find module 'express'"

**Cause:** Dependencies not installed.

**Fix:** Run `npm install` in `/home/ultimotr/public_html/repositories/sokogate-calc-deploy/`

---

### Port already in use

cPanel assigns its own port via `PORT` env var. Do not hardcode port in config.

---

## File Sync Summary

| File | Source (sokogate-calc/) | Deploy (sokogate-calc-deploy/) | Status |
|------|------------------------|-------------------------------|--------|
| app.js | 204 lines, BASE_PATH routing | 204 lines | ✅ Synced |
| package.json | start: `node app.js` | start: `node app.js` | ✅ Synced |
| views/index.ejs | basePath dynamic | basePath dynamic | ✅ Synced |
| public/style.css | v1.0.2 | v1.0.2 | ✅ Synced |
| public/script.js | basePath aware | basePath aware | ✅ Synced |
| .htaccess | proxy commented | proxy commented | ✅ Synced |
| DEPLOYMENT.md | cPanel guide | cPanel guide | ✅ Synced |
| WordPress plugin | v1.0 | v1.0 | ✅ Synced |

---

## Environment Variables (cPanel)

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3000` | Yes (cPanel assigns, but set explicitly) |
| `BASE_PATH` | `/Calculate` | **Yes** |
| `CORS_ORIGIN` | `https://ultimotradingltd.co.ke` | Yes |

---

## Expected Final State

After successful deployment:
- ✅ No `index.html` or `assets/` in `/Calculate`
- ✅ 13 files in `/Calculate` (flat structure)
- ✅ Node.js app running via cPanel Passenger
- ✅ `/Calculate/health` returns JSON
- ✅ `/Calculate/` serves Sokogate calculator
- ✅ All material calculations work
- ✅ CSS/JS load without 404s

---

## Rollback Plan

If issues persist after deployment:
1. Keep current `/Calculate` folder as backup
2. Replace `app.js`, `package.json` with previous versions
3. Restart app
4. Previous version used `/sokogate-calc` routes — update `.htaccess` accordingly

---

**Last updated:** 2026-04-27 22:55 (EAT)  
**Deploy folder:** `/home/apop/sokogate-calc-deploy/`  
**ZIP package:** `/home/apop/sokogate-calc/sokogate-calc-cpanel.zip`
