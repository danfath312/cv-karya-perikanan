// =====================================================
// ADMIN PANEL JAVASCRIPT - API CLIENT
// =====================================================
// ✅ SECURITY: Admin Secret based login
// - Store admin secret in sessionStorage
// - Send via x-admin-secret header
// - No service_role in frontend
// =====================================================

// API Configuration
const API_URL = window.location.origin;

// Get admin secret from sessionStorage
let adminSecret = sessionStorage.getItem('admin_secret');
let currentProductId = null;

// Status options for orders
const ORDER_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
];

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    if (adminSecret) {
        showDashboard();
        loadProducts();
        loadCompanyInfo();
        loadOrders();
    } else {
        showLogin();
    }

    // Event Listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
    document.getElementById('productImage').addEventListener('change', previewProductImage);
    document.getElementById('companyLogo').addEventListener('change', previewCompanyLogo);
});

// ===== LOGIN HANDLER (ADMIN SECRET) =====
async function handleLogin(e) {
    e.preventDefault();
    const secret = document.getElementById('adminSecret').value.trim();

    if (!secret) {
        showAlert('loginError', 'Admin secret tidak boleh kosong', 'danger');
        return;
    }

    try {
        // Verify secret dengan API test call
        const response = await fetch(`${API_URL}/api/admin/products`, {
            headers: {
                'x-admin-secret': secret
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showAlert('loginError', 'Admin secret salah', 'danger');
                return;
            }
            throw new Error('Koneksi error');
        }

        // Jika valid, simpan ke sessionStorage
        sessionStorage.setItem('admin_secret', secret);
        adminSecret = secret;

        // Bersihkan form
        document.getElementById('loginForm').reset();

        // Tampilkan dashboard
        showDashboard();
        loadProducts();
        loadCompanyInfo();
        loadOrders();
    } catch (error) {
        showAlert('loginError', 'Gagal terhubung ke server: ' + error.message, 'danger');
    }
}

// ===== LOGOUT =====
function logout() {
    sessionStorage.removeItem('admin_secret');
    adminSecret = null;
    location.reload();
}

// ===== API CALL HELPER WITH AUTH ERROR HANDLING =====
async function apiCall(url, options = {}) {
    const headers = options.headers || {};
    headers['x-admin-secret'] = adminSecret;
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle auth failures
    if (response.status === 401 || response.status === 403) {
        console.warn('❌ Auth failed: Redirecting to login');
        showAlert('generalError', 'Session expired. Silakan login kembali.', 'danger');
        sessionStorage.removeItem('admin_secret');
        adminSecret = null;
        setTimeout(() => {
            showLogin();
            document.getElementById('loginForm').reset();
        }, 1500);
        return null;
    }
    
    return response;
}

// ===== UI HELPERS =====
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Mark button as active
    event.target.closest('.tab-button').classList.add('active');
}

function showAlert(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-${type}"><strong>${type === 'danger' ? '❌' : '✅'}</strong> ${message}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

// ===== PRODUCTS =====
async function loadProducts() {
    try {
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading...</td></tr>';

        // Fetch products from API
        const response = await fetch(`${API_URL}/api/admin/products`, {
            headers: {
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const products = await response.json();
        console.log(`✅ Loaded ${products ? products.length : 0} products from API`);

        tbody.innerHTML = '';

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">Belum ada produk</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${product.name || '-'}</strong></td>
                <td>${product.stock || 0} kg</td>
                <td>Rp ${(product.price || 0).toLocaleString('id-ID')}</td>
                <td>
                    <span class="status-badge ${product.available ? 'status-available' : 'status-unavailable'}">
                        ${product.available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="openEditProductModal('${product.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="toggleAvailability('${product.id}', ${product.available})">
                            ${product.available ? '<i class="fas fa-ban"></i> Disable' : '<i class="fas fa-check"></i> Enable'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ Error loading products:', error);
        document.getElementById('productsTable').innerHTML = '<tr><td colspan="5" style="text-align: center;">Error loading products: ' + error.message + '</td></tr>';
    }
}

function openAddProductModal() {
    currentProductId = null;
    document.getElementById('productModalTitle').textContent = 'Tambah Produk Baru';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('productFormError').innerHTML = '';
    document.getElementById('productModal').classList.add('active');
}

async function openEditProductModal(id) {
    currentProductId = id;
    try {
        // Fetch product from API
        const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
            headers: {
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load product');
        }

        const product = await response.json();
        console.log('📦 Loading product:', product);
        
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = product.name;
        document.getElementById('productNameEn').value = product.name_en || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productDescriptionEn').value = product.description_en || '';
        
        // Convert JSONB arrays to text (join with newline)
        const specifications = Array.isArray(product.specifications) ? product.specifications.join('\n') : (product.specifications || '');
        const specificationsEn = Array.isArray(product.specifications_en) ? product.specifications_en.join('\n') : (product.specifications_en || '');
        const uses = Array.isArray(product.uses) ? product.uses.join('\n') : (product.uses || '');
        const usesEn = Array.isArray(product.uses_en) ? product.uses_en.join('\n') : (product.uses_en || '');
        
        document.getElementById('productSpecifications').value = specifications;
        document.getElementById('productSpecificationsEn').value = specificationsEn;
        document.getElementById('productUses').value = uses;
        document.getElementById('productUsesEn').value = usesEn;
        
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productPrice').value = product.price || 0;
        document.getElementById('productAvailable').checked = product.available;
        
        console.log('✅ Product loaded:', { specifications, uses, specificationsEn, usesEn });

        // Show image if exists (image_url dari Supabase)
        if (product.image_url) {
            document.getElementById('imagePreview').innerHTML = `<img src="${product.image_url}" alt="${product.name}">`;
        } else {
            document.getElementById('imagePreview').innerHTML = '';
        }

        document.getElementById('productFormError').innerHTML = '';
        document.getElementById('productModal').classList.add('active');
    } catch (error) {
        console.error('❌ Error loading product:', error);
        showAlert('productFormError', 'Gagal memuat data produk: ' + error.message, 'danger');
    }
}

// ===== UPLOAD IMAGE TO BACKEND API =====
async function uploadProductImage(file, productName) {
    if (!file) return null;
    
    try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${productName.replace(/\s+/g, '_')}.${fileExt}`;

        console.log('📤 Uploading image:', fileName);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productName', productName);
        formData.append('fileName', fileName);

        // Send to backend API
        const response = await fetch(`${API_URL}/api/admin/upload-product-image`, {
            method: 'POST',
            headers: {
                'x-admin-secret': adminSecret
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload image');
        }

        const data = await response.json();
        const imageUrl = data.imageUrl;
        console.log('✅ Image uploaded:', imageUrl);
        return imageUrl;
    } catch (error) {
        console.error('❌ Image upload error:', error);
        throw new Error('Gagal upload gambar: ' + error.message);
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentProductId = null;
}

async function handleProductSubmit(e) {
    e.preventDefault();

    try {
        const name = document.getElementById('productName').value;
        const nameEn = document.getElementById('productNameEn').value;
        const description = document.getElementById('productDescription').value;
        const descriptionEn = document.getElementById('productDescriptionEn').value;
        const specificationsText = document.getElementById('productSpecifications').value;
        const specificationsEnText = document.getElementById('productSpecificationsEn').value;
        const usesText = document.getElementById('productUses').value;
        const usesEnText = document.getElementById('productUsesEn').value;
        const stock = parseInt(document.getElementById('productStock').value) || 0;
        const price = parseInt(document.getElementById('productPrice').value) || 0;
        const available = document.getElementById('productAvailable').checked;

        // Convert text (newline-separated) to JSONB arrays
        const specifications = specificationsText.split('\n').filter(s => s.trim()).map(s => s.trim());
        const specificationsEn = specificationsEnText.split('\n').filter(s => s.trim()).map(s => s.trim());
        const uses = usesText.split('\n').filter(s => s.trim()).map(s => s.trim());
        const usesEn = usesEnText.split('\n').filter(s => s.trim()).map(s => s.trim());

        // Handle image upload
        let imageUrl = null;
        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            console.log('📸 File selected for upload:', imageFile.name);
            imageUrl = await uploadProductImage(imageFile, name);
        }

        console.log('📝 Product data before save:', {
            name, nameEn, description, descriptionEn,
            specifications, specificationsEn, uses, usesEn,
            stock, price, available, imageUrl
        });

        const productData = {
            name: name,
            name_en: nameEn,
            description: description,
            description_en: descriptionEn,
            specifications: specifications,
            specifications_en: specificationsEn,
            uses: uses,
            uses_en: usesEn,
            stock: stock,
            price: price,
            available: available
        };

        // Add image_url if file was uploaded
        if (imageUrl) {
            productData.image_url = imageUrl;
        }

        let method = 'POST';
        let url = `${API_URL}/api/admin/products`;

        if (currentProductId) {
            // Update existing product
            method = 'PUT';
            url = `${API_URL}/api/admin/products/${currentProductId}`;
            console.log('🔄 Updating product:', currentProductId, productData);
        } else {
            // Insert new product
            console.log('✨ Creating new product:', productData);
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': adminSecret
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save product');
        }

        const result = await response.json();
        console.log(`✅ Product ${currentProductId ? 'updated' : 'created'}:`, result);
        showAlert('productFormError', currentProductId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan', 'success');
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showAlert('productFormError', 'Gagal menyimpan produk: ' + error.message, 'danger');
    }
}

async function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete product');
        }

        console.log(`✅ Product ${id} deleted`);
        alert('✅ Produk berhasil dihapus');
        loadProducts();
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('❌ Gagal menghapus produk: ' + error.message);
    }
}

// ===== ORDERS =====
async function loadOrders() {
    try {
        const tbody = document.getElementById('ordersTable');
        const ordersError = document.getElementById('ordersError');
        
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:15px;">Loading...</td></tr>`;
        if (ordersError) ordersError.innerHTML = '';

        // Fetch orders from API
        const response = await fetch(`${API_URL}/api/admin/orders`, {
            headers: {
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const data = await response.json();

        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:15px; color:#999;">Belum ada pesanan</td></tr>`;
            console.log('✅ No orders in database');
            return;
        }

        // Render orders to table
        tbody.innerHTML = data.map(order => `
            <tr>
                <td><small>${order.id || '-'}</small></td>
                <td><strong>${order.customer_name || '-'}</strong></td>
                <td><a href="https://wa.me/${(order.whatsapp || '').replace(/\D/g, '')}" target="_blank" style="color:#0066B3;">${order.whatsapp || '-'}</a></td>
                <td>${order.product || '-'}</td>
                <td>${order.quantity || 0} kg</td>
                <td><small>${order.address || '-'}</small></td>
                <td>
                    <select class="status-select" data-order-id="${order.id}" 
                            onchange="updateOrderStatus(${order.id}, this.value)"
                            style="padding:6px; border-radius:4px; border:1px solid #ddd; cursor:pointer;">
                        ${ORDER_STATUS_OPTIONS.map(status => `
                            <option value="${status.value}" ${order.status === status.value ? 'selected' : ''}>
                                ${status.label}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td><small>${formatOrderDate(order.created_at)}</small></td>
            </tr>
        `).join('');

        console.log(`✅ Loaded ${data.length} orders from API`);

    } catch (err) {
        console.error('❌ Error loading orders:', err);
        const tbody = document.getElementById('ordersTable');
        const ordersError = document.getElementById('ordersError');
        
        if (ordersError) {
            ordersError.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
        }
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:15px; color:#999;">Error loading orders</td></tr>`;
        }
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log(`Updating order ${orderId} status to: ${newStatus}`);

        const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': adminSecret
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update order status');
        }

        const data = await response.json();
        console.log(`✅ Order ${orderId} status updated to: ${newStatus}`, data);
        
        // Highlight the changed select for visual feedback
        const statusSelect = document.querySelector(`[data-order-id="${orderId}"]`);
        if (statusSelect) {
            statusSelect.style.background = '#d4edda';
            setTimeout(() => {
                statusSelect.style.background = 'white';
            }, 1500);
        }

        // Show success alert
        alert(`✅ Status pesanan #${orderId} berhasil diubah ke: ${newStatus}`);

    } catch (err) {
        console.error('❌ Error updating order status:', err);
        alert(`❌ Gagal update status: ${err.message}`);
        // Reload to show current state
        loadOrders();
    }
}

// Helper function to format date
function formatOrderDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

async function toggleAvailability(id, currentStatus) {
    try {
        // Toggle availability and update via API
        const response = await fetch(`${API_URL}/api/admin/products/${id}/toggle-availability`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to toggle availability');
        }

        const data = await response.json();
        console.log(`✅ Product ${id} availability toggled to: ${!currentStatus}`, data);
        loadProducts();
    } catch (error) {
        console.error('❌ Gagal update status:', error);
        alert('Gagal update status: ' + error.message);
    }
}

// ===== COMPANY INFO =====
async function loadCompanyInfo() {
    try {
        // Fetch company info from API
        const response = await fetch(`${API_URL}/api/admin/company`, {
            headers: {
                'x-admin-secret': adminSecret
            }
        });

        if (!response.ok) {
            console.warn('Company info not loaded: API error');
            return;
        }

        const company = await response.json();

        if (company && company.id) {
            document.getElementById('companyName').value = company.name || '';
            document.getElementById('companyDescription').value = company.description || '';
            document.getElementById('companyPhone').value = company.phone || '';
            document.getElementById('companyWhatsapp').value = company.whatsapp || '';
            document.getElementById('companyEmail').value = company.email || '';
            document.getElementById('companyAddress').value = company.address || '';
            document.getElementById('companyHours').value = company.operating_hours || '';

            if (company.logo_path) {
                document.getElementById('logoPreview').innerHTML = `<img src="${company.logo_path}" alt="Logo">`;
            }
            
            console.log('✅ Company info loaded from API');
        }
    } catch (error) {
        console.error('❌ Error loading company info:', error);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();

    try {
        const companyData = {
            name: document.getElementById('companyName').value,
            description: document.getElementById('companyDescription').value,
            phone: document.getElementById('companyPhone').value,
            whatsapp: document.getElementById('companyWhatsapp').value,
            email: document.getElementById('companyEmail').value,
            address: document.getElementById('companyAddress').value,
            operating_hours: document.getElementById('companyHours').value
        };

        const response = await fetch(`${API_URL}/api/admin/company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': adminSecret
            },
            body: JSON.stringify(companyData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save company info');
        }

        console.log('✅ Company info saved via API');
        alert('✅ Informasi perusahaan berhasil disimpan!');
        loadCompanyInfo();

        // Note: File upload for logo would need Supabase Storage implementation
        const logoFile = document.getElementById('companyLogo').files[0];
        if (logoFile) {
            console.warn('⚠️ Logo upload requires Supabase Storage setup (not implemented yet)');
        }

    } catch (error) {
        console.error('❌ Error saving company info:', error);
        alert('❌ Gagal menyimpan: ' + error.message);
    }
}

// ===== TRANSLATION FUNCTION (Indonesian to English) =====
async function translateProductField(sourceId, targetId, buttonElement) {
    const sourceField = document.getElementById(sourceId);
    const targetField = document.getElementById(targetId);
    const sourceText = sourceField.value;

    console.log('🔍 DEBUG:', { sourceId, targetId, sourceField, targetField, sourceText });

    if (!sourceText) {
        alert('Masukkan teks terlebih dahulu sebelum translate');
        return;
    }

    // Show loading state
    const button = buttonElement || event.target.closest('button');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';

    try {
        // Use backend endpoint on port 3000
        const response = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            body: JSON.stringify({
                text: sourceText,
                source: 'id',
                target: 'en'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Translation service error');
        }

        const data = await response.json();
        console.log('📝 Response data:', data);
        
        if (data.translatedText) {
            console.log('📌 Setting targetField.value to:', data.translatedText);
            targetField.value = data.translatedText;
            console.log('✅ Translation successful:', data.translatedText);
            console.log('✅ targetField.value after set:', targetField.value);
        } else {
            throw new Error(data.error || 'No translation returned');
        }
    } catch (error) {
        console.error('Translation error:', error);
        alert('Gagal translate. Silakan coba lagi atau masukkan manual.\nError: ' + error.message);
    } finally {
        // Restore button state
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// ===== IMAGE PREVIEW =====
function previewProductImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function previewCompanyLogo(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('logoPreview').innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}
