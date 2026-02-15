# Fixing Vercel → AWS Backend Connection

## Step 1: Verify Environment Variable in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Check these:**

1. **Variable Name**: Must be exactly `VITE_API_BASE` (case-sensitive)
2. **Variable Value**: Must be `http://16.16.217.71` (no trailing slash, no /api)
3. **Environments**: Should be checked for Production, Preview, and Development

**Common Mistakes:**
- ❌ `VITE_API_URL` (wrong name)
- ❌ `http://16.16.217.71/` (trailing slash)
- ❌ `http://16.16.217.71/api` (includes /api)
- ❌ Only set for Production (not Preview/Development)

## Step 2: Redeploy After Setting Environment Variable

**Important**: After adding/changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

OR trigger a new deployment by:
- Pushing a commit to your repo
- Vercel will auto-deploy with new env vars

## Step 3: Test Backend Directly

Before testing Vercel, verify backend is accessible:

Open in browser:
```
http://16.16.217.71/api/health
```

Should return:
```json
{"success":true,"message":"Domain Question Bank API is running"}
```

If this doesn't work → backend isn't accessible (see Step 6)

## Step 4: Check Browser Console on Vercel Site

1. Open your Vercel site: `https://question-bank-gamma.vercel.app`
2. Open DevTools (F12) → **Console** tab
3. Look for errors:
   - CORS errors
   - 404 errors
   - Network errors
4. Open **Network** tab
5. Try to use the app (navigate to Manage page)
6. Look for requests to `/api/languages`
7. Click on a failed request → check:
   - **Request URL**: Should be `http://16.16.217.71/api/languages`
   - **Status**: 200 (success) or error code
   - **Response**: Check for CORS headers

## Step 5: Fix CORS on Backend

Your backend must allow requests from your Vercel domain.

**SSH to EC2 and check:**

```bash
cd ~/question-bank/server
cat src/index.js | grep -A 5 "origin:"
```

Should include:
- `"https://question-bank-gamma.vercel.app"`
- `/\.vercel\.app$/` (regex for all Vercel domains)

**If missing, fix it:**

```bash
nano src/index.js
```

Update CORS origins to include:
```javascript
origin: [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://question-bank-gamma.vercel.app",
  /\.vercel\.app$/
],
```

Then restart:
```bash
pm2 restart api
pm2 logs api
```

## Step 6: Verify Backend is Running on EC2

**SSH to EC2:**

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs api --lines 20

# Check if port 5000 is listening
sudo ss -tulpn | grep 5000

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

## Step 7: Check Security Group (AWS)

AWS Console → EC2 → Instances → Your Instance → Security tab

**Inbound rules must have:**
- ✅ HTTP (80) → Source: 0.0.0.0/0
- ✅ HTTPS (443) → Source: 0.0.0.0/0 (optional but recommended)
- ✅ SSH (22) → Source: My IP

## Step 8: Check MongoDB Atlas IP Whitelist

MongoDB Atlas → Network Access

**Add your EC2 IP:**
- IP Address: `16.16.217.71/32`

OR temporarily for testing:
- IP Address: `0.0.0.0/0` (allows all IPs - not recommended for production)

## Step 9: Verify Environment Variable is Actually Loaded

**In your Vercel deployment logs:**

1. Go to Deployments → Latest deployment → Build Logs
2. Look for environment variables being loaded
3. Check if `VITE_API_BASE` is present

**In browser console (on Vercel site):**

Add this temporarily to check:
```javascript
console.log('API Base:', import.meta.env.VITE_API_BASE);
```

Should show: `http://16.16.217.71`

## Common Issues & Solutions

### Issue 1: "Failed to load resource: 404"
**Cause**: Wrong URL or backend route not found
**Fix**: 
- Check environment variable value
- Test backend directly: `http://16.16.217.71/api/health`
- Check Nginx config on EC2

### Issue 2: "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause**: Backend CORS doesn't allow Vercel domain
**Fix**: 
- Add Vercel domain to backend CORS
- Restart backend: `pm2 restart api`

### Issue 3: "Connection refused" or "Network Error"
**Cause**: Backend not accessible or Security Group blocking
**Fix**:
- Check Security Group allows HTTP (80)
- Check backend is running: `pm2 status`
- Check Nginx: `sudo systemctl status nginx`

### Issue 4: Environment variable not working
**Cause**: Not redeployed after setting env var
**Fix**: 
- Redeploy in Vercel
- Check variable name is exactly `VITE_API_BASE`
- Check it's set for the right environment (Production/Preview)

## Quick Debug Checklist

Run these in order:

1. ✅ Backend health check works: `http://16.16.217.71/api/health`
2. ✅ Environment variable set in Vercel: `VITE_API_BASE=http://16.16.217.71`
3. ✅ Redeployed after setting env var
4. ✅ Backend CORS includes Vercel domain
5. ✅ Security Group allows HTTP (80)
6. ✅ MongoDB Atlas IP whitelist includes EC2 IP
7. ✅ Browser Network tab shows requests to `16.16.217.71` (not localhost)

## Still Not Working?

Share these details:

1. **Browser Console errors** (screenshot or copy-paste)
2. **Network tab** - What URL is being called? What's the status code?
3. **Backend health check** - Does `http://16.16.217.71/api/health` work in browser?
4. **Vercel env var** - Screenshot of your environment variables page
5. **Backend logs** - `pm2 logs api` output

