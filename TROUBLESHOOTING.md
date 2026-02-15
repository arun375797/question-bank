# Troubleshooting: Vercel Frontend → AWS EC2 Backend Connection

## Quick Checklist

### 1. Backend is Running on EC2 ✅
SSH into your EC2 and check:
```bash
pm2 status
pm2 logs api
```

### 2. Backend is Accessible from Internet
Test in your browser:
- `http://16.16.217.71/api/health` - Should return JSON
- `http://16.16.217.71/api/languages` - Should return data or error (not connection refused)

### 3. Vercel Environment Variable
In Vercel Dashboard → Settings → Environment Variables:
- **Name**: `VITE_API_BASE`
- **Value**: `http://16.16.217.71` (NO trailing slash, NO /api)
- **Environment**: Production, Preview, Development (all)

### 4. CORS Configuration
Your backend CORS should allow your Vercel domain. Check `server/src/index.js`:
```javascript
origin: [
  "https://question-bank-gamma.vercel.app",
  /\.vercel\.app$/
]
```

### 5. MongoDB Atlas IP Whitelist
MongoDB Atlas → Network Access → Add IP:
- Add: `16.16.217.71/32` (your EC2 IP)
- Or temporarily: `0.0.0.0/0` (for testing only)

## Common Errors & Fixes

### Error: "Failed to load resource: 404"
**Cause**: Backend not accessible or wrong URL
**Fix**: 
1. Test `http://16.16.217.71/api/health` in browser
2. Check Nginx is running: `sudo systemctl status nginx`
3. Check PM2: `pm2 status`

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause**: CORS not configured or Vercel domain not in allowed origins
**Fix**:
1. SSH to EC2
2. Edit: `nano ~/question-bank/server/src/index.js`
3. Add your exact Vercel URL to CORS origins
4. Restart: `pm2 restart api`

### Error: "Connection refused" or "Network Error"
**Cause**: Security Group blocking or backend not running
**Fix**:
1. AWS Console → EC2 → Security Groups
2. Inbound rules must have: HTTP (80) → 0.0.0.0/0
3. Check backend: `pm2 logs api`

### Error: "MongoDB connection failed"
**Cause**: MongoDB Atlas IP whitelist or wrong connection string
**Fix**:
1. MongoDB Atlas → Network Access → Add `16.16.217.71/32`
2. Check `.env` on EC2: `cat ~/question-bank/server/.env`

## Step-by-Step Debugging

### Step 1: Test Backend Directly
```bash
# In your browser or curl
curl http://16.16.217.71/api/health
# Should return: {"success":true,"message":"Domain Question Bank API is running"}
```

### Step 2: Check Nginx Configuration
SSH to EC2:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 50 /var/log/nginx/error.log
```

### Step 3: Check PM2 Logs
```bash
pm2 status
pm2 logs api --lines 50
```

### Step 4: Verify Environment Variable in Vercel
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Confirm `VITE_API_BASE` = `http://16.16.217.71`
4. Redeploy (or it auto-redeploys)

### Step 5: Check Browser Console
Open browser DevTools → Network tab:
- Look for failed requests to `/api/languages`
- Check the exact URL it's trying to hit
- Check response headers for CORS errors

## Quick Fixes

### Restart Everything on EC2
```bash
pm2 restart api
sudo systemctl restart nginx
```

### Update CORS (if needed)
```bash
cd ~/question-bank/server
nano src/index.js
# Add your Vercel URL to CORS origins
pm2 restart api
```

### Rebuild Frontend Locally (to test)
```bash
cd client
# Create .env.local
echo "VITE_API_BASE=http://16.16.217.71" > .env.local
npm run build
npm run preview
```

