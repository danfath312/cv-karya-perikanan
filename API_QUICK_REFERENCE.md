VERCEL ADMIN API - QUICK REFERENCE
==================================

Base URL: /api/admin
Auth Header: x-admin-secret: YOUR_SECRET

═════════════════════════════════════════════════════════════════════════════

ENDPOINTS OVERVIEW

1. LOGIN (Verify Admin Secret)
   POST /api/admin/login
   Headers: x-admin-secret: YOUR_SECRET
   Response: { ok: true }
   Status: 200 (valid), 401 (invalid)

2. PRODUCTS - List & Create
   GET /api/admin/products
   POST /api/admin/products
   Headers: x-admin-secret: YOUR_SECRET
   POST Body: { name, description, price, stock, available, image_url, ... }
   Response: [{ id, name, price, ... }]
   Status: 200 (GET), 201 (POST created), 401 (invalid auth)

3. PRODUCT - Get Single
   GET /api/admin/products/:id
   Headers: x-admin-secret: YOUR_SECRET
   Response: { id, name, price, ... }
   Status: 200, 404 (not found), 401

4. PRODUCT - Update
   PUT /api/admin/products/:id
   Headers: x-admin-secret: YOUR_SECRET
   Body: { name, description, price, stock, ... }
   Response: { id, name, ... }
   Status: 200, 404, 401

5. PRODUCT - Delete
   DELETE /api/admin/products/:id
   Headers: x-admin-secret: YOUR_SECRET
   Response: { success: true }
   Status: 200, 404, 401

6. PRODUCT - Toggle Availability
   PATCH /api/admin/products/:id/toggle
   Headers: x-admin-secret: YOUR_SECRET
   Body: (optional) { available: true/false }
   Response: { id, name, available: true/false, ... }
   Status: 200, 404, 401
   Note: If body is empty, toggles current availability

7. IMAGE UPLOAD
   POST /api/admin/upload
   Headers: x-admin-secret: YOUR_SECRET
   Content-Type: multipart/form-data
   FormData: file (the image), fileName (optional custom name)
   Response: { imageUrl: "https://storage.supabase.co/..." }
   Status: 200, 400 (no file), 401
   Note: Uploads to Supabase Storage bucket "product_images"

8. ORDERS - List All
   GET /api/admin/orders
   Headers: x-admin-secret: YOUR_SECRET
   Response: [{ id, customer_name, status, ... }]
   Status: 200, 401

9. ORDER - Update Status
   PATCH /api/admin/orders/:id
   Headers: x-admin-secret: YOUR_SECRET
   Body: { status: "pending|confirmed|processing|shipped|completed|cancelled" }
   Response: { id, customer_name, status, ... }
   Status: 200, 404 (not found), 400 (invalid status), 401

10. COMPANY - Get Info
    GET /api/admin/company
    Headers: x-admin-secret: YOUR_SECRET (optional for GET)
    Response: { id, name, description, phone, ... }
    Status: 200, 401

11. COMPANY - Update Info
    PUT /api/admin/company
    Headers: x-admin-secret: YOUR_SECRET
    Body: { name, description, phone, whatsapp, email, address, ... }
    Response: { id, name, description, ... }
    Status: 200 (updated), 201 (created), 401

═════════════════════════════════════════════════════════════════════════════

COMMON USE CASES

Get all products:
─────────────────
fetch('/api/admin/products', {
  headers: { 'x-admin-secret': 'YOUR_SECRET' }
})

Create a product:
─────────────────
fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'x-admin-secret': 'YOUR_SECRET',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Product Name',
    price: 100,
    stock: 50,
    description: 'Description here'
  })
})

Update product:
───────────────
fetch('/api/admin/products/123', {
  method: 'PUT',
  headers: {
    'x-admin-secret': 'YOUR_SECRET',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Name',
    price: 150
  })
})

Toggle availability:
────────────────────
fetch('/api/admin/products/123/toggle', {
  method: 'PATCH',
  headers: { 'x-admin-secret': 'YOUR_SECRET' }
})

Upload image:
──────────────
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('fileName', 'custom-name.jpg');

fetch('/api/admin/upload', {
  method: 'POST',
  headers: { 'x-admin-secret': 'YOUR_SECRET' },
  body: formData
})

Update order status:
────────────────────
fetch('/api/admin/orders/456', {
  method: 'PATCH',
  headers: {
    'x-admin-secret': 'YOUR_SECRET',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'shipped' })
})

═════════════════════════════════════════════════════════════════════════════

ERROR RESPONSES

401 Unauthorized:
  { error: 'Unauthorized: Invalid or missing admin secret' }
  → Fix: Add x-admin-secret header with correct value

400 Bad Request:
  { error: 'Product name is required' }
  → Fix: Check required fields in request body

404 Not Found:
  { error: 'Product not found' }
  → Fix: Verify ID exists in database

405 Method Not Allowed:
  { error: 'Method not allowed' }
  → Fix: Check HTTP method (POST, GET, PUT, PATCH, DELETE)

500 Server Error:
  { error: 'Failed to create product' }
  → Fix: Check Supabase connection and permissions

═════════════════════════════════════════════════════════════════════════════

STATUS CODES QUICK LOOKUP

200 OK              ✓ Request successful
201 Created         ✓ New resource created
204 No Content      ✓ Successful (no response body)
400 Bad Request     ✗ Invalid input
401 Unauthorized    ✗ Missing/invalid admin secret
404 Not Found       ✗ Resource doesn't exist
405 Method Not      ✗ Wrong HTTP method
500 Server Error    ✗ Database or server issue

═════════════════════════════════════════════════════════════════════════════

ENVIRONMENT VARIABLES

Set in Vercel project settings:

SUPABASE_URL
  → Your Supabase project URL
  → From: https://app.supabase.com > Settings > API > Project URL
  
SUPABASE_SERVICE_ROLE_KEY
  → Secret key with full access
  → From: https://app.supabase.com > Settings > API > Service Role Key
  → ⚠️  NEVER share or expose in frontend

ADMIN_SECRET
  → Custom password for admin panel
  → Can be any strong string
  → Example: "KaryaPerikanan2024!@#$%"

═════════════════════════════════════════════════════════════════════════════

TESTING IN BROWSER CONSOLE

Get products:
─────────────
fetch('/api/admin/products', {
  headers: { 'x-admin-secret': prompt('Enter secret:') }
}).then(r => r.json()).then(d => console.log(d))

Create product:
───────────────
fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'x-admin-secret': prompt('Enter secret:'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Test', price: 99 })
}).then(r => r.json()).then(d => console.log(d))

═════════════════════════════════════════════════════════════════════════════

KEY POINTS

✓ Always include x-admin-secret header
✓ Use Content-Type: application/json for JSON requests
✓ Use multipart/form-data for file uploads (automatic with FormData)
✓ Valid order statuses: pending, confirmed, processing, shipped, completed, cancelled
✓ Image URL returned from upload endpoint is public and can be stored
✓ Products table must include: id, name, price, stock, available, image_url
✓ Orders table must include: id, customer_name, status, created_at

═════════════════════════════════════════════════════════════════════════════

RESPONSE FIELD TYPES

Products:
  id: number (auto)
  name: string (required)
  name_en: string (optional)
  description: string
  description_en: string
  specifications: array
  uses: array
  price: number
  stock: number
  available: boolean
  image_url: string (URL)
  created_at: timestamp
  updated_at: timestamp

Orders:
  id: number (auto)
  customer_name: string
  whatsapp: string (phone number)
  product: string
  quantity: number
  address: string
  status: string (enum)
  created_at: timestamp

Company:
  id: number (auto)
  name: string
  description: string
  phone: string
  whatsapp: string
  email: string
  address: string
  operating_hours: string
  logo_path: string (URL)

═════════════════════════════════════════════════════════════════════════════

CONTACT & SUPPORT

For detailed documentation:
  → VERCEL_SERVERLESS_REFACTOR.md

For deployment steps:
  → VERCEL_DEPLOYMENT_CHECKLIST.txt

For implementation details:
  → See individual files in /api/admin/

═════════════════════════════════════════════════════════════════════════════
