## Vercel Serverless Admin API - Refactoring Complete

### Current Status: ✅ FULLY REFACTORED

All admin APIs have been refactored to work **100% with Vercel Serverless Functions** (NO Express).

---

## API Structure

```
/api
  /admin
    login.js              → POST (verify admin secret)
    products.js           → GET (list), POST (create)
    products/[id].js      → GET, PUT (update), DELETE
    products/[id]/toggle.js → PATCH (toggle availability)
    orders.js             → GET (list)
    orders/[id].js        → PATCH (update status)
    upload.js             → POST (upload image)
    company.js            → GET, PUT (update profile)
```

---

## Endpoint Details

### 1. Login
**File:** `api/admin/login.js`  
**Method:** `POST`  
**Auth:** `x-admin-secret` header  
**Response:** `{ ok: true }`

### 2. Products Collection
**File:** `api/admin/products.js`  
**Methods:** `GET` (list), `POST` (create)  
**Auth:** `x-admin-secret` required for POST  
**GET Response:** `[{ id, name, price, stock, available, ... }]`  
**POST Response:** `{ id, name, price, ... }`

### 3. Single Product
**File:** `api/admin/products/[id].js`  
**Methods:** `GET`, `PUT`, `DELETE`  
**Auth:** `x-admin-secret` required  
**Response:** Product object or success

### 4. Toggle Availability
**File:** `api/admin/products/[id]/toggle.js`  
**Method:** `PATCH`  
**Auth:** `x-admin-secret` required  
**Body:** `{ available: true/false }` (optional - toggles if omitted)  
**Response:** Updated product object

### 5. Orders
**File:** `api/admin/orders.js`  
**Method:** `GET`  
**Auth:** `x-admin-secret` required  
**Response:** `[{ id, customer_name, status, ... }]`

### 6. Update Order Status
**File:** `api/admin/orders/[id].js`  
**Method:** `PATCH`  
**Auth:** `x-admin-secret` required  
**Body:** `{ status: "pending|confirmed|processing|shipped|completed|cancelled" }`  
**Response:** Updated order object

### 7. Image Upload
**File:** `api/admin/upload.js`  
**Method:** `POST`  
**Auth:** `x-admin-secret` required  
**FormData:** `file` (multipart)  
**Response:** `{ imageUrl: "https://..." }`

### 8. Company Info
**File:** `api/admin/company.js`  
**Methods:** `GET`, `PUT`  
**Auth:** `x-admin-secret` required for PUT  
**PUT Body:** `{ name, description, phone, ... }`  
**Response:** Company object

---

## Authentication

Every admin endpoint checks the `x-admin-secret` header:

```javascript
const token = req.headers['x-admin-secret'];
if (token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
}
```

**Frontend Usage:**
```javascript
const response = await fetch('/api/admin/products', {
    headers: {
        'x-admin-secret': adminSecret  // stored in sessionStorage
    }
});
```

---

## Frontend Integration (admin.js)

All API calls in `js/admin.js` have been updated:

- ✅ Login: `POST /api/admin/login`
- ✅ Products: `GET/POST /api/admin/products`
- ✅ Single Product: `GET/PUT/DELETE /api/admin/products/:id`
- ✅ Toggle: `PATCH /api/admin/products/:id/toggle`
- ✅ Orders: `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`
- ✅ Upload: `POST /api/admin/upload`
- ✅ Company: `GET/PUT /api/admin/company`

---

## Environment Variables (Vercel)

Set these in your Vercel project settings:

```
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
ADMIN_SECRET = "your-admin-secret"
```

---

## Technical Details

### ESM Module System
All files use ES modules (`import`/`export default`):
```javascript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // handler logic
}
```

### Supabase Integration
Each handler initializes Supabase client with SERVICE_ROLE_KEY:
```javascript
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### JSON Body Parsing
Custom body parser (no Express middleware):
```javascript
async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') return JSON.parse(req.body);
    
    let rawBody = '';
    for await (const chunk of req) {
        rawBody += chunk;
    }
    return JSON.parse(rawBody || '{}');
}
```

### File Upload (formidable)
Uses `formidable` for multipart form parsing:
```javascript
const form = formidable({ multiples: false, keepExtensions: true });
const { fields, files } = await parseForm(req);
```

---

## Deprecated Files (Ignored)

These files are no longer used. They're kept for reference but have been marked deprecated:

- ❌ `server.js` - Legacy Express server (unused)
- ❌ `admin-routes.js` - Legacy Express routes (unused)
- ❌ `admin-setup.js` - Legacy SQLite setup (unused)

---

## Testing Checklist

### ✅ Before Deployment

- [ ] Admin secret is set in `.env.local` for local testing
- [ ] Supabase credentials are valid and accessible
- [ ] `formidable` package is installed
- [ ] All API files have `export default async function handler`
- [ ] Frontend `admin.js` uses `/api/admin/...` paths
- [ ] No `require()` or `module.exports` (ESM only)
- [ ] No Express usage anywhere

### ✅ Test Endpoints

1. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/login \
     -H "x-admin-secret: YOUR_SECRET"
   ```
   Expected: `{ "ok": true }` (200)

2. **Get Products:**
   ```bash
   curl http://localhost:3000/api/admin/products \
     -H "x-admin-secret: YOUR_SECRET"
   ```
   Expected: `[{ id, name, price, ... }]` (200)

3. **Create Product:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/products \
     -H "x-admin-secret: YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","price":100}'
   ```
   Expected: Product object (201)

4. **Toggle Availability:**
   ```bash
   curl -X PATCH http://localhost:3000/api/admin/products/123/toggle \
     -H "x-admin-secret: YOUR_SECRET"
   ```
   Expected: Updated product (200)

---

## Deployment to Vercel

1. Push code to Git repository
2. Connect to Vercel
3. Set environment variables in Vercel project settings
4. Vercel auto-detects `/api` serverless functions
5. Deploy and test in production

---

## Architecture Benefits

✅ **No server management** - Vercel handles infrastructure  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **Secure** - Service Role Key never exposed to frontend  
✅ **Fast** - Serverless cold start optimization  
✅ **Cost-effective** - Pay per invocation  
✅ **Type-safe** - Supabase JS client with types

---

## Troubleshooting

### 401 Unauthorized
- Check `ADMIN_SECRET` env var is set
- Verify `x-admin-secret` header is passed in frontend

### 500 Error on Upload
- Ensure `formidable` is installed: `npm install formidable`
- Check Supabase storage bucket exists: `product_images`

### 404 Not Found
- Verify file paths: `/api/admin/products/[id].js` (brackets in filename)
- Check Vercel functions are deployed

### Supabase Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active and not paused

---

**Status:** ✅ Fully refactored and ready for Vercel deployment
