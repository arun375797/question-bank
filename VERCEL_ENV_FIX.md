# 🔴 CRITICAL FIX: Wrong Environment Variable Name

## The Problem

Your code uses: `VITE_API_BASE`
But you set: `VITE_API_URL` ❌

**That's why it's not working!** The variable names don't match.

## The Fix

### In Vercel Dashboard:

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. **Delete** the old variable (if it exists):
   - Find `VITE_API_URL` → Delete it

3. **Add** the correct variable:
   - **Name**: `VITE_API_BASE` (exact, case-sensitive)
   - **Value**: `http://16.16.217.71` (no trailing slash, no /api)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

4. **Save**

5. **REDEPLOY** (This is critical!):
   - Go to **Deployments** tab
   - Click **3 dots (⋯)** on latest deployment
   - Click **Redeploy**
   - Wait for it to finish

## Why It's Failing

The error shows:
```
GET https://question-bank-...vercel.app/api/languages 404
```

This means:
- ❌ The frontend is calling its own Vercel domain (wrong!)
- ✅ It should call `http://16.16.217.71/api/languages` (AWS backend)

This happens because `VITE_API_BASE` is undefined, so the code falls back to `/api` (relative URL), which goes to the Vercel domain.

## Quick Checklist

- [ ] Variable name is **exactly**: `VITE_API_BASE` (not `VITE_API_URL`)
- [ ] Variable value is: `http://16.16.217.71` (no slash, no /api)
- [ ] Set for all environments (Production, Preview, Development)
- [ ] **Redeployed after setting the variable** ← Most important!
- [ ] After redeploy, check browser Network tab - should see requests to `16.16.217.71`

## Test After Fix

1. After redeploying, open your Vercel site
2. Open DevTools (F12) → Network tab
3. Try using the app
4. You should see requests to: `http://16.16.217.71/api/languages`
5. Status should be 200 (success) instead of 404

