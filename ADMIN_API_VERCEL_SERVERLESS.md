# Admin API - Vercel Serverless Configuration

**Status:** ✅ 100% Vercel Serverless Compatible  
**Last Updated:** January 31, 2026

## Directory Structure

```
/api/admin/
├── login.js                    # POST /api/admin/login
├── company.js                  # GET/POST /api/admin/company
├── orders.js                   # GET /api/admin/orders
├── orders/
│   └── [id].js                # PATCH /api/admin/orders/:id
├── products/
│   ├── index.js               # GET/POST /api/admin/products
│   ├── [id].js                # GET/PUT/DELETE /api/admin/products/:id
│   └── [id]/
│       └── toggle.js          # PATCH /api/admin/products/:id/toggle
├── upload.js                  # (deprecated, for file uploads)
└── products.js.bak            # (deprecated - renamed to avoid conflict)
```

## API Endpoints

### Authentication

All endpoints require the `x-admin-secret` header:

```bash
curl -X GET https://your-domain/api/admin/products \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

### 1. Login

**Endpoint:** `POST /api/admin/login`

**Request:**
```bash
curl -X POST https://your-domain/api/admin/login \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
{ "ok": true }
```

**Response (401):**
```json
{ "error": "Unauthorized: Invalid or missing admin secret" }
```

---

### 2. Products - List & Create

**Endpoint:** `GET/POST /api/admin/products`

#### GET - List all products

```bash
curl -X GET https://your-domain/api/admin/products \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
[
  {
    "id": "uuid-123",
    "name": "Ikan Bandeng",
    "name_en": "Milkfish",
    "description": "...",
    "stock": 100,
    "price": 50000,
    "available": true,
    "image_url": "https://...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST - Create new product

```bash
curl -X POST https://your-domain/api/admin/products \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ikan Bandeng",
    "name_en": "Milkfish",
    "description": "Ikan bandeng berkualitas premium",
    "description_en": "Premium milkfish",
    "specifications": ["Ukuran 500-600g", "Segar"],
    "specifications_en": ["Size 500-600g", "Fresh"],
    "uses": ["Digoreng", "Dibakar"],
    "uses_en": ["Fried", "Grilled"],
    "stock": 100,
    "price": 50000,
    "available": true,
    "image_url": "https://..."
  }'
```

**Response (201):**
```json
{
  "id": "uuid-123",
  "name": "Ikan Bandeng",
  ...
}
```

---

### 3. Products - Single (Get, Update, Delete)

**Endpoint:** `GET/PUT/DELETE /api/admin/products/:id`

#### GET - Get single product

```bash
curl -X GET https://your-domain/api/admin/products/uuid-123 \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
{
  "id": "uuid-123",
  "name": "Ikan Bandeng",
  ...
}
```

#### PUT - Update product

```bash
curl -X PUT https://your-domain/api/admin/products/uuid-123 \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ikan Bandeng Premium",
    "stock": 150,
    "price": 55000,
    "available": true
  }'
```

**Response (200):**
```json
{
  "id": "uuid-123",
  "name": "Ikan Bandeng Premium",
  ...
}
```

#### DELETE - Delete product

```bash
curl -X DELETE https://your-domain/api/admin/products/uuid-123 \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
{ "success": true }
```

---

### 4. Products - Toggle Availability

**Endpoint:** `PATCH /api/admin/products/:id/toggle`

```bash
curl -X PATCH https://your-domain/api/admin/products/uuid-123/toggle \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

This endpoint toggles the availability status. Send empty JSON body `{}` to toggle, or explicitly set:

```bash
curl -X PATCH https://your-domain/api/admin/products/uuid-123/toggle \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{ "available": false }'
```

**Response (200):**
```json
{
  "id": "uuid-123",
  "name": "Ikan Bandeng",
  "available": false,
  ...
}
```

---

### 5. Company Profile

**Endpoint:** `GET/POST /api/admin/company`

#### GET - Get company info

```bash
curl -X GET https://your-domain/api/admin/company \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
{
  "id": "company-1",
  "name": "CV Karya Perikanan Indonesia",
  "description": "...",
  "logo_url": "https://...",
  ...
}
```

#### POST - Update/Create company info

```bash
curl -X POST https://your-domain/api/admin/company \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CV Karya Perikanan Indonesia",
    "description": "Supplier ikan berkualitas",
    "logo_url": "https://...",
    "phone": "+62-123-456",
    "email": "info@karya.co.id"
  }'
```

**Response (200/201):**
```json
{
  "id": "company-1",
  "name": "CV Karya Perikanan Indonesia",
  ...
}
```

---

### 6. Orders - List

**Endpoint:** `GET /api/admin/orders`

```bash
curl -X GET https://your-domain/api/admin/orders \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

**Response (200):**
```json
[
  {
    "id": "order-123",
    "customer_name": "Budi Santoso",
    "whatsapp": "+62-812-3456",
    "product": "Ikan Bandeng",
    "quantity": 50,
    "status": "pending",
    "address": "Jl. Merdeka 123",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 7. Orders - Update Status

**Endpoint:** `PATCH /api/admin/orders/:id`

```bash
curl -X PATCH https://your-domain/api/admin/orders/order-123 \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{ "status": "confirmed" }'
```

**Valid statuses:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `completed`
- `cancelled`

**Response (200):**
```json
{
  "id": "order-123",
  "customer_name": "Budi Santoso",
  "status": "confirmed",
  ...
}
```

---

## Environment Variables

Required env vars (set in Vercel):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=your-secure-admin-secret-here
```

## Error Responses

### 401 Unauthorized
```json
{ "error": "Unauthorized: Invalid or missing admin secret" }
```

### 404 Not Found
```json
{ "error": "Product not found" }
```

### 405 Method Not Allowed
```json
{ "error": "Method not allowed" }
```

### 500 Server Error
```json
{
  "error": "Failed to fetch products",
  "details": "Supabase error message"
}
```

## Vercel Deployment Checklist

- ✅ All handlers use `export default async function handler(req, res)`
- ✅ ESM imports (`import`) instead of CommonJS (`require`)
- ✅ Dynamic routes use `[id]` and `[id]/` folder structure
- ✅ Env vars loaded via `process.env.*`
- ✅ Response headers set via `res.setHeader()`
- ✅ No Express.js or custom middleware
- ✅ Graceful error handling (no crashes)
- ✅ All endpoints return JSON

## Frontend Integration

The admin frontend (`admin.html` + `js/admin.js`) automatically:

1. Stores admin secret in `sessionStorage`
2. Sends it via `x-admin-secret` header on every request
3. Redirects to login on 401/403 response
4. Displays products, orders, and company info
5. Allows add/edit/delete operations

## Testing

Test a single endpoint:

```bash
# Test login
curl -X POST http://localhost:3000/api/admin/login \
  -H "x-admin-secret: YOUR_SECRET"

# Test products list
curl -X GET http://localhost:3000/api/admin/products \
  -H "x-admin-secret: YOUR_SECRET"
```

## Troubleshooting

### Getting 500 FUNCTION_INVOCATION_FAILED

**Possible causes:**
1. Missing env vars - check Vercel dashboard
2. Supabase connection issues - verify URL and key
3. Syntax errors - check Vercel logs
4. Handler not exported - ensure `export default async function handler(req, res)`

**Check Vercel logs:**
```bash
vercel logs
```

### Getting 404

1. Check URL path matches file structure
2. Ensure files use correct naming: `[id].js` not `{id}.js`
3. Try re-deploying: `vercel deploy`

### Products endpoint returns empty

1. Check Supabase connection
2. Verify `products` table exists
3. Check admin secret is correct
4. Look at Vercel function logs

## Migration Notes

- Old file `/api/admin/products.js` renamed to `products.js.bak`
- All handlers refactored to Vercel Serverless
- Improved error logging and error details
- Added env var validation
- Better body parsing for both stream and object inputs

