# Quick Fix: Vercel Not Connecting to AWS Backend

## ⚠️ Most Common Issue: You Must Redeploy After Setting Environment Variable

**This is the #1 reason it doesn't work!**

After adding/changing environment variables in Vercel, you MUST redeploy:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click the **3 dots (⋯)** on the latest deployment
4. Click **Redeploy**
5. Wait for it to finish

**OR** push a new commit to trigger auto-deploy.

---

## Step-by-Step Fix

### Step 1: Verify Environment Variable

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Must be exactly:**
- **Name**: `VITE_API_BASE` (case-sensitive, no spaces)
- **Value**: `http://16.16.217.71` (no trailing slash, no /api)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development (check all)

**Common mistakes:**
- ❌ `VITE_API_URL` (wrong name)
- ❌ `http://16.16.217.71/` (has trailing slash)
- ❌ `http://16.16.217.71/api` (includes /api)
- ❌ Only checked for Production

### Step 2: Redeploy (CRITICAL!)

After setting the env var, **redeploy**:
- Deployments → Latest → ⋯ → Redeploy

### Step 3: Test Backend Directly

Open in browser:
```
http://16.16.217.71/api/health
```

**Expected**: `{"success":true,"message":"Domain Question Bank API is running"}`

**If this fails** → Backend isn't accessible (see Step 6)

### Step 4: Check Browser Console on Vercel Site

1. Open: `https://question-bank-gamma.vercel.app`
2. Press F12 → **Console** tab
3. Look for errors
4. Press F12 → **Network** tab
5. Try using the app (go to Manage page)
6. Look for requests to `/api/languages`
7. Click on a request → check:
   - **Request URL**: Should be `http://16.16.217.71/api/languages`
   - **Status**: 200 (success) or error code
   - **Response Headers**: Look for CORS errors

### Step 5: Fix CORS (If Needed)

Your backend CORS should already include Vercel domain, but verify:

**SSH to EC2:**
```bash
cd ~/question-bank/server
cat src/index.js | grep -A 5 "origin:"
```

Should show:
```javascript
origin: [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://question-bank-gamma.vercel.app",  // ← Must be here
  /\.vercel\.app$/  // ← This allows all Vercel domains
],
```

**If missing, fix it:**
```bash
nano src/index.js
# Add your Vercel URL to the origin array
pm2 restart api
```

### Step 6: Verify Backend is Running

**SSH to EC2:**
```bash
# Check if app is running
pm2 status

# Check logs for errors
pm2 logs api --lines 30

# Check if port 5000 is listening
sudo ss -tulpn | grep 5000

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Step 7: Check Security Group

AWS Console → EC2 → Instances → Your Instance → Security tab

**Inbound rules must have:**
- ✅ HTTP (80) → Source: 0.0.0.0/0
- ✅ HTTPS (443) → Source: 0.0.0.0/0 (optional)
- ✅ SSH (22) → Source: My IP

### Step 8: Check MongoDB Atlas

MongoDB Atlas → Network Access

**Add your EC2 IP:**
- IP Address: `16.16.217.71/32`

---

## Common Error Messages & Fixes

### Error: "Failed to load resource: 404"
**Fix**: 
- Check env var value is correct
- Test backend: `http://16.16.217.71/api/health`
- Check Nginx config on EC2

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Fix**: 
- Add Vercel domain to backend CORS
- Restart backend: `pm2 restart api`

### Error: "Connection refused" or "Network Error"
**Fix**:
- Check Security Group allows HTTP (80)
- Check backend is running: `pm2 status`
- Check Nginx: `sudo systemctl status nginx`

### Error: "Mixed Content" (HTTPS → HTTP)
**Fix**: 
- This happens when HTTPS site tries to load HTTP resources
- For now, it should still work (browsers allow it for API calls)
- Long-term: Set up HTTPS on EC2 (certbot + domain)

---

## Quick Debug Checklist

Run these checks:

- [ ] Environment variable name: `VITE_API_BASE` (exact)
- [ ] Environment variable value: `http://16.16.217.71` (no slash, no /api)
- [ ] Environment variable set for: Production, Preview, Development
- [ ] **Redeployed after setting env var** ← Most important!
- [ ] Backend health works: `http://16.16.217.71/api/health`
- [ ] Backend CORS includes Vercel domain
- [ ] Security Group allows HTTP (80)
- [ ] MongoDB Atlas IP whitelist includes EC2 IP
- [ ] Browser Network tab shows requests to `16.16.217.71` (not localhost)

---

## Still Not Working?

Share these details:

1. **Screenshot of Vercel Environment Variables page**
2. **Browser Console errors** (F12 → Console tab)
3. **Network tab** - What URL is being called? Status code?
4. **Backend health check** - Does `http://16.16.217.71/api/health` work?
5. **Did you redeploy after setting the env var?**

