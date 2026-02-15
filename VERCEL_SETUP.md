# Vercel Frontend Setup for AWS Backend

## Step 1: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `question-bank-gamma` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Name**: `VITE_API_BASE`
   - **Value**: `http://16.16.217.71` (your EC2 public IP)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

⚠️ **Important**: 
- Do NOT include `/api` in the value
- Do NOT include trailing slash
- Use `http://` (not `https://`) unless you set up SSL

## Step 2: Redeploy

After setting the environment variable:
- Vercel will automatically trigger a new deployment
- OR go to **Deployments** tab → Click **Redeploy** on latest deployment

## Step 3: Verify It Works

1. Open your Vercel site: `https://question-bank-gamma.vercel.app`
2. Open Browser DevTools (F12) → **Network** tab
3. Try to use the app (navigate to Manage page)
4. Look for requests to `http://16.16.217.71/api/languages`
5. Check if they succeed (status 200) or fail

## Step 4: If Still Getting Errors

### Check Browser Console
Look for:
- CORS errors → Backend CORS needs your Vercel domain
- 404 errors → Backend URL wrong or backend not running
- Connection refused → Security Group or Nginx issue

### Test Backend Directly
In browser, open:
```
http://16.16.217.71/api/health
```
Should return:
```json
{"success":true,"message":"Domain Question Bank API is running"}
```

If this doesn't work, the backend isn't accessible (see TROUBLESHOOTING.md)

## Environment Variable Format

✅ **Correct**:
```
VITE_API_BASE=http://16.16.217.71
```

❌ **Wrong**:
```
VITE_API_BASE=http://16.16.217.71/api  # Don't add /api
VITE_API_BASE=http://16.16.217.71/     # No trailing slash
VITE_API_BASE=https://16.16.217.71     # Use http unless you have SSL
```

## How It Works

Your `client/src/api/client.js` uses:
```javascript
baseURL: import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : "/api"
```

So if `VITE_API_BASE=http://16.16.217.71`, it becomes:
- `http://16.16.217.71/api/languages`
- `http://16.16.217.71/api/topics`
- etc.

## Next Steps (Optional but Recommended)

1. **Get a Domain**: Point a domain to your EC2 IP
2. **Add SSL**: Use Let's Encrypt (certbot) for HTTPS
3. **Update CORS**: Add your domain to backend CORS
4. **Update Vercel**: Change `VITE_API_BASE` to `https://api.yourdomain.com`

