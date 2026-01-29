# Quick Testing Guide - Admin Login

## Setup

1. **Set ADMIN_SECRET environment variable** (local or .env file):
   ```bash
   ADMIN_SECRET=test-admin-secret-123
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```

3. **Open admin panel**:
   ```
   http://localhost:3000/admin.html
   ```

---

## Test Cases

### ✅ Test 1: Valid Login
1. Open admin panel
2. You should see login screen with "Admin Secret" field
3. Enter: `test-admin-secret-123`
4. Click "Login"
5. **Expected**: Dashboard loads, sessionStorage contains admin_secret

```javascript
// Verify in browser console:
sessionStorage.getItem('admin_secret')  // Should output: "test-admin-secret-123"
```

---

### ✅ Test 2: Invalid Secret
1. Open admin panel
2. Enter: `wrong-secret`
3. Click "Login"
4. **Expected**: Error message "Admin secret salah" appears
5. Stay on login screen

---

### ✅ Test 3: Empty Secret
1. Open admin panel  
2. Leave field empty
3. Click "Login"
4. **Expected**: Error message "Admin secret tidak boleh kosong" appears

---

### ✅ Test 4: Access Dashboard Features
1. Login with correct secret
2. Try each tab:
   - **Produk**: Load, add, edit, delete products
   - **Pesanan**: View and update order statuses
   - **Perusahaan**: View and edit company info
3. **Expected**: All API calls succeed with 200 responses

---

### ✅ Test 5: API Header Check
1. Login with correct secret
2. Open DevTools (F12) → Network tab
3. Click "Load Products" or similar action
4. Check request headers
5. **Expected**: Header `x-admin-secret: test-admin-secret-123` present

```
Headers should include:
x-admin-secret: test-admin-secret-123
```

---

### ✅ Test 6: Session Storage
1. Login successfully
2. Open DevTools → Application → Session Storage
3. **Expected**: Key `admin_secret` exists with correct value

---

### ✅ Test 7: Logout
1. Login successfully
2. Click "Logout" button
3. **Expected**: 
   - Page reloads
   - Session storage cleared
   - Back to login screen

```javascript
// Verify in console after logout:
sessionStorage.getItem('admin_secret')  // Should output: null
```

---

### ✅ Test 8: Browser Close Session
1. Login successfully
2. Check sessionStorage: `sessionStorage.getItem('admin_secret')` → has value
3. Close browser completely (not just tab)
4. Reopen browser to same URL
5. **Expected**: Login screen appears (sessionStorage auto-cleared)

---

### ✅ Test 9: API 401 Response
1. Login with valid secret
2. Manually change sessionStorage secret to wrong value:
   ```javascript
   sessionStorage.setItem('admin_secret', 'wrong-secret');
   ```
3. Click "Load Products" or any API call
4. **Expected**: 
   - Error alert: "Session expired. Silakan login kembali."
   - Redirect to login screen
   - sessionStorage cleared

---

### ✅ Test 10: Product Image Upload
1. Login with correct secret
2. Go to "Produk" tab → Add New Product
3. Fill in product details
4. Select an image file
5. Click "Simpan Produk"
6. **Expected**: 
   - Image uploads successfully
   - Product appears in products list
   - API headers include x-admin-secret

---

## Expected Responses

### Success (200)
```json
{
  "id": "prod-123",
  "name": "Tuna Segar",
  "price": 50000
}
```

### Auth Error (401)
```json
{
  "error": "Unauthorized: Invalid or missing admin secret"
}
```

### Other Error (500)
```json
{
  "error": "Database connection failed"
}
```

---

## Common Issues

### Issue: Login fails with correct secret
- ✅ Check ADMIN_SECRET environment variable is set
- ✅ Verify secret doesn't have extra spaces
- ✅ Check server is running on correct port
- ✅ Check API_URL in browser console: `API_URL` should be `http://localhost:3000`

### Issue: Dashboard loads but API calls fail
- ✅ Check x-admin-secret header in Network tab
- ✅ Verify ADMIN_SECRET matches what was entered in login
- ✅ Check server logs for auth errors

### Issue: Session not persisting
- ✅ This is CORRECT behavior - sessionStorage only lasts one session
- ✅ Close browser and reopen to verify auto-logout

### Issue: Image upload fails
- ✅ Check /uploads directory exists
- ✅ Check server has write permissions
- ✅ Check file size is reasonable

---

## Debugging

### Check admin secret in current session:
```javascript
sessionStorage.getItem('admin_secret')
```

### Check API URL:
```javascript
console.log('API_URL:', API_URL)
```

### Monitor API calls:
```javascript
// In browser console
fetch(`${API_URL}/api/admin/products`, {
    headers: {
        'x-admin-secret': sessionStorage.getItem('admin_secret')
    }
}).then(r => r.json()).then(console.log)
```

### Check server auth middleware:
```javascript
// In server.js logs, you should see:
// ✅ Auth passed
// or
// ❌ Auth failed: Unauthorized
```

---

## Success Criteria ✅

- [ ] Login form displays with Admin Secret input
- [ ] Valid secret allows dashboard access
- [ ] Invalid secret shows error
- [ ] sessionStorage stores admin_secret
- [ ] All API calls send x-admin-secret header
- [ ] API endpoints validate header correctly
- [ ] 401 responses redirect to login
- [ ] Logout clears sessionStorage
- [ ] Browser close clears session
- [ ] Product operations work (CRUD)
- [ ] Order operations work (status updates)
- [ ] Company info operations work (read/write)

---

**Ready to test!** 🎣
