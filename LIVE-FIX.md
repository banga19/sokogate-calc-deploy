# cPanel Live Deployment Fix — Step-by-Step

## Problem Diagnosis

**Live site URL:** `https://ultimotradingltd.co.ke/Calculate`

**Issue:** Returns a React application (Nexus360) instead of Sokogate Calculator.

**Root cause:** The `/Calculate` directory on cPanel contains old static files (`index.html`, `/assets/` folder) from a previous deployment. Apache serves these static files directly before Node.js app can handle the request.

---

## Fix Procedure

### 1. Prepare the Updated ZIP

The deployment package has been regenerated at `/home/apop/sokogate-calc/sokogate-calc-cpanel.zip` with:

- ✅ Fixed `package.json` start script: `node app.js`
- ✅ Fixed `app.js` routes: mounted at `BASE_PATH` (`/Calculate`)
- ✅ Fixed static middleware: `app.use(BASE_PATH, express.static(...))`
- ✅ Clean flat ZIP structure — 13 files, no `src/`, no `.env`
- ✅ All critical files validated

**Latest ZIP size:** 36KB | **Modified:** 2026-04-27 22:36

---

### 2. cPanel File Cleanup (CRITICAL)

Before uploading the new ZIP, **delete all existing files** in the `/Calculate` folder:

#### Via cPanel File Manager:
1. Login to cPanel → **File Manager**
 2. Navigate to `public_html/repositories/sokogate-calc-deploy/`
3. **Delete** these items if they exist:
   - `index.html` (React app HTML)
   - `assets/` folder (React build artifacts)
   - Any `.js`, `.css` files that are not part of Sokogate
4. **Empty the trash** (permanent deletion)

#### Via SSH (if available):
```bash
cd /home/ultimotr/public_html/repositories/sokogate-calc-deploy
rm -rf index.html assets/
```

---

### 3. Upload & Extract

1. In cPanel File Manager, navigate to `public_html/repositories/`
2. Create folder `sokogate-calc-deploy` if it doesn't exist
3. Upload `sokogate-calc-cpanel.zip`
4. Extract **in-place** (extract to current directory)
5. Verify extracted files:
   ```
   public_html/repositories/sokogate-calc-deploy/app.js
   public_html/repositories/sokogate-calc-deploy/package.json
   public_html/repositories/sokogate-calc-deploy/views/index.ejs
   public_html/repositories/sokogate-calc-deploy/public/style.css
   public_html/repositories/sokogate-calc-deploy/public/script.js
    ... all 13 files at root level (no nested subfolders)
    ```

---

### 4. Configure Node.js App

1. cPanel → **Setup Node.js App** (or "Node.js Selector")
2. Click **Create Application** or edit existing:
   ```
   Node.js version:        18.x or 20.x
   Application mode:       Production
    Application root:       /home/ultimotr/public_html/repositories/sokogate-calc-deploy
   Application URL:        https://ultimotradingltd.co.ke/Calculate
   Startup file:           app.js
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

### 5. Install Dependencies

**Option A: cPanel Interface**
- In **Setup Node.js App**, find your app
- Click **Run NPM Install**
- Wait for completion (~30 seconds)

**Option B: SSH**
```bash
cd /home/ultimotr/public_html/repositories/sokogate-calc-deploy
npm install --production
```

---

### 6. Restart & Verify

1. In **Setup Node.js App**, click **Restart** next to your app
2. Wait 10-15 seconds
3. Test in browser (or via curl):

```bash
# Health check
curl https://ultimotradingltd.co.ke/Calculate/health
# Expected: {"status":"ok","timestamp":"..."}

# Main page
curl -I https://ultimotradingltd.co.ke/Calculate/
# Expected: HTTP/200

# CSS
curl -I https://ultimotradinglnd.co.ke/Calculate/style.css
# Expected: HTTP/200, Content-Type: text/css

# Calculator POST
curl -X POST https://ultimotradingltd.co.ke/Calculate/calculate \
     -d "area=100&materialType=cement"
# Expected: HTML containing "Cement & Sand (Plastering)"
```

---

## Expected Results

| Endpoint | Expected |
|----------|----------|
| `/Calculate/health` | `{"status":"ok","timestamp":"..."}` |
| `/Calculate/` | Sokogate calculator HTML page |
| `/Calculate/calculate` (POST) | Calculator page with material results |
| `/Calculate/style.css` | CSS file (200 OK) |
| `/Calculate/script.js` | JavaScript file (200 OK) |

---

## Troubleshooting

### Still seeing React app (Nexus360)

1. **Hard refresh browser** (`Ctrl+Shift+R` or `Cmd+Shift+R`) — cache issue
 2. Check `public_html/repositories/sokogate-calc-deploy/` — ensure **no** `index.html` exists
3. Check cPanel logs: **Setup Node.js App** → **Application Logs**
4. Verify routes: `curl -v https://ultimotradingltd.co.ke/Calculate/health`

### Cannot POST /Calculate/calculate

**Cause:** BASE_PATH mismatch or router not mounted.

**Check:**
```bash
# View live app.js
cat /home/ultimotr/public_html/repositories/sokogate-calc-deploy/app.js | grep "router"
# Should show: app.use(BASE_PATH, router);
```

### Static files 404

**Cause:** `express.static` not mounted at BASE_PATH.

**Check:**
```bash
curl -I https://ultimotradingltd.co.ke/Calculate/style.css
# Should return 200, not 404
```

### Port already in use

cPanel assigns its own port. Ensure `PORT` env var is set to `3000` (or remove it to use default).

---

## Rollback

If issues persist, revert to previous working version:
1. Keep backup of current upload
2. Re-upload previous `sokogate-calc-cpanel.zip` (pre-2026-04-27)
3. Restart app

---

## Verification Checklist

- [ ] `index.html` deleted from `/Calculate` folder
- [ ] `/Calculate/assets/` folder deleted
- [ ] ZIP uploaded and extracted (13 files at root of `/Calculate`)
- [ ] Node.js app configured with `BASE_PATH=/Calculate`
- [ ] NPM install completed successfully
- [ ] App restarted
- [ ] `/Calculate/health` returns JSON
- [ ] `/Calculate/` shows calculator UI with Sokogate branding
- [ ] Form submission works (cement, bricks, tiles, etc.)
- [ ] CSS and JS load without 404s
- [ ] Browser console shows no errors

---

**Last updated:** 2026-04-27  
**Fixed:** BASE_PATH routing, static file mounting, ZIP structure
