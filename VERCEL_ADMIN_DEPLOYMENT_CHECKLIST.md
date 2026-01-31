# Vercel Admin API Deployment Verification

**Status:** Ready for Deployment ✅  
**Date:** January 31, 2026

## Pre-Deployment Checklist

- [x] All handler files use `export default async function handler(req, res)`
- [x] No CommonJS (`require`, `module.exports`) - all ESM
- [x] All imports are ESM (`import`)
- [x] Dynamic route files properly named: `[id].js`, not `{id}.js`
- [x] Nested dynamic routes: `/api/admin/products/[id]/toggle.js`
- [x] No Express.js, no app.use, no middleware
- [x] Env vars only via `process.env.VARIABLE`
- [x] Response headers set via `res.setHeader()`
- [x] All endpoints return JSON (Content-Type: application/json)
- [x] Graceful error handling (try-catch on all DB calls)
- [x] Auth header validation on all endpoints
- [x] Conflicting files renamed: `products.js` → `products.js.bak`
- [x] File structure correct:
  - `/api/admin/login.js` ✅
  - `/api/admin/company.js` ✅
  - `/api/admin/orders.js` ✅
  - `/api/admin/orders/[id].js` ✅
  - `/api/admin/products/index.js` ✅ (renamed from products.js)
  - `/api/admin/products/[id].js` ✅
  - `/api/admin/products/[id]/toggle.js` ✅

## Vercel Environment Variables (Required)

Add these to your Vercel project settings:

```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
ADMIN_SECRET=[your-secure-admin-secret]
```

**Important:** Use Service Role Key, NOT anon key. Service Role allows unrestricted DB access.

## Expected Endpoint Behavior

### ✅ GET /api/admin/products
- Returns: 200 with product array
- Requires: x-admin-secret header
- Response format: `[{ id, name, stock, price, available, ... }]`

### ✅ POST /api/admin/products
- Returns: 201 with created product
- Requires: x-admin-secret header + JSON body
- Creates new product in Supabase

### ✅ GET /api/admin/products/:id
- Returns: 200 with single product
- Requires: x-admin-secret header
- Not found returns: 404

### ✅ PUT /api/admin/products/:id
- Returns: 200 with updated product
- Requires: x-admin-secret header + JSON body
- Updates product in Supabase

### ✅ DELETE /api/admin/products/:id
- Returns: 200 with { success: true }
- Requires: x-admin-secret header
- Deletes product from Supabase

### ✅ PATCH /api/admin/products/:id/toggle
- Returns: 200 with updated product
- Requires: x-admin-secret header
- Toggles availability status

### ✅ POST /api/admin/login
- Returns: 200 with { ok: true }
- Requires: x-admin-secret header
- Validates secret, used by frontend for auth

### ✅ GET /api/admin/company
- Returns: 200 with company object
- Requires: x-admin-secret header

### ✅ POST /api/admin/company
- Returns: 200/201 with company object
- Requires: x-admin-secret header + JSON body

### ✅ GET /api/admin/orders
- Returns: 200 with orders array
- Requires: x-admin-secret header

### ✅ PATCH /api/admin/orders/:id
- Returns: 200 with updated order
- Requires: x-admin-secret header + { status: "..." }

## Testing Commands

```bash
# Test from command line
ADMIN_SECRET="your-secret-here"

# Test login
curl -X POST https://your-domain/api/admin/login \
  -H "x-admin-secret: $ADMIN_SECRET"

# Test products list
curl -X GET https://your-domain/api/admin/products \
  -H "x-admin-secret: $ADMIN_SECRET"

# Test create product
curl -X POST https://your-domain/api/admin/products \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","stock":100,"price":50000,"available":true}'
```

## Deployment Steps

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Refactor admin API for Vercel Serverless"
   git push
   ```

2. **Verify Vercel build:**
   - Check Vercel dashboard for successful build
   - No errors in function logs

3. **Test endpoints:**
   - Open https://your-domain/admin.html
   - Enter admin secret
   - Should load products, orders, company info
   - Try creating/editing a product
   - Try toggling availability

4. **Check Vercel logs:**
   ```bash
   vercel logs
   ```

## Common Issues & Fixes

### Issue: 500 FUNCTION_INVOCATION_FAILED

**Fix 1:** Check env vars
```bash
vercel env ls
```

**Fix 2:** Check Vercel logs
```bash
vercel logs --follow
```

**Fix 3:** Re-deploy
```bash
vercel deploy --prod
```

### Issue: Products endpoint returns empty array

**Fix:** Check Supabase connection
```bash
# Verify in Supabase dashboard:
# 1. Table "products" exists
# 2. Has data in it
# 3. Service role key has access
```

### Issue: 401 Unauthorized on every request

**Fix:** Check admin secret
1. Verify env var set correctly in Vercel
2. Check frontend sends header correctly
3. Try logging header value (careful with secrets!)

### Issue: Dynamic route not matching

**Fix:** Vercel uses `req.query.id`, not URL parsing
- ✅ Correct: `let id = req.query?.id`
- ❌ Wrong: Parsing from req.url

## Rollback Plan

If something breaks:

1. Revert to previous commit
2. Re-deploy: `vercel deploy --prod`
3. Check logs: `vercel logs`

Old file backup: `/api/admin/products.js.bak` (can restore if needed)

## Success Indicators

✅ Admin panel loads without errors  
✅ Can login with admin secret  
✅ Products list displays  
✅ Can create/edit/delete products  
✅ Can toggle product availability  
✅ Can update company info  
✅ Can manage orders and statuses  
✅ No 500 errors in Vercel logs  
✅ All endpoints return valid JSON  

## Documentation Files

- `ADMIN_API_VERCEL_SERVERLESS.md` - Full API reference
- `VERCEL_ADMIN_DEPLOYMENT_CHECKLIST.md` - This file
- Admin frontend: `/admin.html`
- Frontend JavaScript: `/js/admin.js`

