// =====================================================
// ADMIN PANEL JAVASCRIPT - SUPABASE ORDERS MANAGEMENT
// =====================================================
// ⚠️  SECURITY WARNING - ADMIN PANEL PRIVATE
// This file uses SERVICE_ROLE_KEY - for LOCAL/INTERNAL use only
// DO NOT PUBLISH THIS TO PRODUCTION/PUBLIC WEB
// DO NOT COMMIT TO PUBLIC GITHUB REPOSITORY
// =====================================================

// Supabase Configuration
const SUPABASE_URL = 'https://pmegvhlyabddfxxoyjrq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZWd2aGx5YWJkZGZ4eG95anJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQyODQwOCwiZXhwIjoyMDg1MDA0NDA4fQ.oIrYBzBaHQAzEfwaEJ2hpuQLFgBVJJtdFWQxxLfRjAA';

// Initialize Supabase - will be set when window.supabase is available
let supabaseOrderClient = null;
function initSupabaseOrderClient() {
    if (window.supabase && !supabaseOrderClient) {
        supabaseOrderClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        console.warn('⚠️ ADMIN PANEL - Supabase Orders Client Initialized (SERVICE_ROLE_KEY Active)');
    }
}

// Use backend origin; if served via live-server (port 5500), target Flask at 5000 (localhost/127.0.0.1)
const API_URL = (window.location.port === '5500')
    ? (window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000' : 'http://localhost:5000')
    : window.location.origin;
let authToken = localStorage.getItem('adminToken');
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
    // Initialize Supabase client for orders management
    initSupabaseOrderClient();
    
    if (authToken) {
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
    const requestOtpForm = document.getElementById('requestOtpForm');
    if (requestOtpForm) requestOtpForm.addEventListener('submit', handleRequestOtp);
    const verifyOtpForm = document.getElementById('verifyOtpForm');
    if (verifyOtpForm) verifyOtpForm.addEventListener('submit', handleVerifyOtp);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
    document.getElementById('productImage').addEventListener('change', previewProductImage);
    document.getElementById('companyLogo').addEventListener('change', previewCompanyLogo);
});

// ===== LOGIN HANDLER =====
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('loginError', data.error, 'danger');
            return;
        }

        authToken = data.token;
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminUsername', data.username);

        showDashboard();
        loadProducts();
        loadCompanyInfo();
        loadOrders();
    } catch (error) {
        showAlert('loginError', 'Gagal terhubung ke server', 'danger');
    }
}

// ===== OTP FLOW =====
async function handleRequestOtp(e) {
    e.preventDefault();
    const username = document.getElementById('otpUsername').value.trim();
    const phone = document.getElementById('otpPhone').value.trim();

    try {
        const res = await fetch(`${API_URL}/api/admin/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, phone })
        });
        const data = await res.json();
        if (!res.ok) {
            showAlert('otpRequestError', data.error || `Gagal mengirim OTP (status ${res.status})`, 'danger');
            return;
        }
        // Tampilkan OTP (simulasi) dan autofill ke form verifikasi agar mudah dilanjutkan
        const otpMsg = `Kode OTP: ${data.otp} (simulasi, berlaku 10 menit)`;
        showAlert('otpRequestError', otpMsg, 'success');
        document.getElementById('verifyOtpUsername').value = username;
        if (data.otp) {
            const otpField = document.getElementById('otpCode');
            if (otpField) otpField.value = data.otp;
            console.log(otpMsg);
            alert(otpMsg);
        }
    } catch (err) {
        showAlert('otpRequestError', `Gagal mengirim OTP: ${err.message}. Pastikan server http://localhost:5000 sedang berjalan.`, 'danger');
    }
}

async function handleVerifyOtp(e) {
    e.preventDefault();
    const username = document.getElementById('verifyOtpUsername').value.trim();
    const otp = document.getElementById('otpCode').value.trim();
    const password = document.getElementById('newPassword').value.trim();

    try {
        const res = await fetch(`${API_URL}/api/admin/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, otp, password })
        });
        const data = await res.json();
        if (!res.ok) {
            showAlert('otpVerifyError', data.error, 'danger');
            return;
        }
        authToken = data.token;
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminUsername', username);
        showAlert('otpVerifyError', 'Password tersimpan. Anda sudah login.', 'success');
        showDashboard();
        loadProducts();
        loadCompanyInfo();
        loadOrders();
    } catch (err) {
        showAlert('otpVerifyError', 'Gagal verifikasi OTP', 'danger');
    }
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    authToken = null;
    location.reload();
}

// ===== UI HELPERS =====
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('adminUsername').textContent = localStorage.getItem('adminUsername') || 'Admin';
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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            throw new Error('Supabase client not available');
        }

        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading...</td></tr>';

        // Fetch products from Supabase
        const { data: products, error } = await supabaseOrderClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        console.log(`✅ Loaded ${products ? products.length : 0} products from Supabase`);

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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            throw new Error('Supabase client tidak tersedia');
        }

        // Fetch product from Supabase
        const { data, error } = await supabaseOrderClient
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        const product = data;
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

// ===== UPLOAD IMAGE TO SUPABASE STORAGE =====
async function uploadProductImage(file, productName) {
    if (!file) return null;
    
    try {
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${productName.replace(/\s+/g, '_')}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log('📤 Uploading image:', filePath);

        // Upload to Supabase Storage
        const { data, error } = await supabaseOrderClient.storage
            .from('product_images') // bucket name
            .upload(filePath, file, { upsert: true });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabaseOrderClient.storage
            .from('product_images')
            .getPublicUrl(filePath);

        const imageUrl = publicUrlData.publicUrl;
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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            throw new Error('Supabase client tidak tersedia');
        }

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

        let result;
        if (currentProductId) {
            // Update existing product
            console.log('🔄 Updating product:', currentProductId, productData);
            result = await supabaseOrderClient
                .from('products')
                .update(productData)
                .eq('id', currentProductId)
                .select();
        } else {
            // Insert new product
            console.log('✨ Creating new product:', productData);
            result = await supabaseOrderClient
                .from('products')
                .insert([productData])
                .select();
        }

        if (result.error) {
            throw result.error;
        }

        console.log(`✅ Product ${currentProductId ? 'updated' : 'created'}:`, result.data);
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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            throw new Error('Supabase client tidak tersedia');
        }

        const { error } = await supabaseOrderClient
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            console.error('Supabase client not available');
            const tbody = document.getElementById('ordersTable');
            if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Error: Supabase not initialized</td></tr>`;
            return;
        }

        const tbody = document.getElementById('ordersTable');
        const ordersError = document.getElementById('ordersError');
        
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:15px;">Loading...</td></tr>`;
        if (ordersError) ordersError.innerHTML = '';

        // Fetch orders from Supabase
        const { data, error } = await supabaseOrderClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

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

        console.log(`✅ Loaded ${data.length} orders from Supabase`);

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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            alert('Error: Supabase not initialized');
            return;
        }

        console.log(`Updating order ${orderId} status to: ${newStatus}`);

        const { data, error } = await supabaseOrderClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select();

        if (error) {
            throw error;
        }

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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        // Toggle availability and update in Supabase
        const { data, error } = await supabaseOrderClient
            .from('products')
            .update({ available: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('❌ Error toggling availability:', error);
            alert('Error: ' + error.message);
            return;
        }

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
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            console.warn('⚠️ Supabase client not available for company info');
            return;
        }

        // Fetch company info from Supabase (assuming table name is 'company')
        const { data: companies, error } = await supabaseOrderClient
            .from('company')
            .select('*')
            .limit(1);

        if (error) {
            console.warn('Company info not loaded:', error.message);
            return;
        }

        const company = companies && companies.length > 0 ? companies[0] : null;

        if (company) {
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
            
            console.log('✅ Company info loaded from Supabase');
        }
    } catch (error) {
        console.error('❌ Error loading company info:', error);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();

    try {
        // Initialize Supabase if not already done
        if (!supabaseOrderClient) {
            initSupabaseOrderClient();
        }

        if (!supabaseOrderClient) {
            alert('❌ Error: Supabase client tidak tersedia');
            return;
        }

        const companyData = {
            name: document.getElementById('companyName').value,
            description: document.getElementById('companyDescription').value,
            phone: document.getElementById('companyPhone').value,
            whatsapp: document.getElementById('companyWhatsapp').value,
            email: document.getElementById('companyEmail').value,
            address: document.getElementById('companyAddress').value,
            operating_hours: document.getElementById('companyHours').value
        };

        // Check if company record exists
        const { data: existingCompany } = await supabaseOrderClient
            .from('company')
            .select('id')
            .limit(1)
            .single();

        let result;
        if (existingCompany) {
            // Update existing record
            result = await supabaseOrderClient
                .from('company')
                .update(companyData)
                .eq('id', existingCompany.id)
                .select();
        } else {
            // Insert new record
            result = await supabaseOrderClient
                .from('company')
                .insert([companyData])
                .select();
        }

        if (result.error) {
            throw result.error;
        }

        console.log('✅ Company info saved to Supabase');
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
