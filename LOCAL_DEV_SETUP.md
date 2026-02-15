# Local Development Setup (Client → AWS Backend)

## Quick Setup

### Step 1: Create Environment File

In the `client/` directory, create a file named `.env.local`:

```bash
cd client
echo "VITE_API_BASE=http://16.16.217.71" > .env.local
```

Or manually create `.env.local` with:
```
VITE_API_BASE=http://16.16.217.71
```

⚠️ **Important**: 
- No trailing slash
- No `/api` at the end
- Use `http://` (not `https://`) unless you set up SSL

### Step 2: Restart Vite Dev Server

If your dev server is running, stop it (Ctrl+C) and restart:

```bash
cd client
npm run dev
```

Vite will automatically load `.env.local` and use it.

### Step 3: Test Connection

1. Open browser: `http://localhost:5173`
2. Open DevTools (F12) → Network tab
3. Try to use the app (go to Manage page)
4. Look for requests to `http://16.16.217.71/api/languages`
5. Check if they succeed (status 200) or fail

## How It Works

Your `client/src/api/client.js` checks for `VITE_API_BASE`:

```javascript
baseURL: import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : "/api"
```

- **With `.env.local`**: Uses `http://16.16.217.71/api`
- **Without `.env.local`**: Uses `/api` (which goes through Vite proxy to `localhost:5000`)

## Troubleshooting

### Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Cause**: Backend not accessible or wrong URL

**Fix**:
1. Test backend directly: `http://16.16.217.71/api/health` in browser
2. If it doesn't work, backend isn't accessible (check EC2, Security Groups, Nginx)

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause**: Backend CORS doesn't allow `http://localhost:5173`

**Fix**: 
1. SSH to EC2
2. Check `server/src/index.js` - CORS should include `"http://localhost:5173"`
3. If missing, add it and restart: `pm2 restart api`

### Error: "Network Error" or "Timeout"

**Cause**: Backend not responding or MongoDB connection issue

**Fix**:
1. Check backend logs: SSH to EC2 → `pm2 logs api`
2. Check MongoDB Atlas IP whitelist includes EC2 IP
3. Test backend health: `http://16.16.217.71/api/health`

### Still Using Local Backend?

If you want to use local backend (`localhost:5000`) instead:

1. Delete or comment out `.env.local`:
   ```bash
   # VITE_API_BASE=http://16.16.217.71
   ```

2. The Vite proxy in `vite.config.js` will handle `/api` requests

## Environment Files Priority

Vite loads environment files in this order (later ones override earlier):
1. `.env` (all environments)
2. `.env.local` (local only, gitignored)
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env.[mode].local` (e.g., `.env.development.local`)

For local dev with AWS backend, use `.env.local` (it's gitignored, so won't affect others).

## Quick Test Commands

```bash
# Test backend health
curl http://16.16.217.71/api/health

# Test backend API
curl http://16.16.217.71/api/languages

# Check if .env.local exists
cat client/.env.local
```

