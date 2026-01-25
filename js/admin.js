// =====================================================
// ADMIN PANEL JAVASCRIPT
// =====================================================

const API_URL = 'http://localhost:3000';
let authToken = localStorage.getItem('adminToken');
let currentProductId = null;

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
        loadProducts();
        loadCompanyInfo();
    } else {
        showLogin();
    }

    // Event Listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
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
    } catch (error) {
        showAlert('loginError', 'Gagal terhubung ke server', 'danger');
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
        const response = await fetch(`${API_URL}/api/products`);
        const products = await response.json();

        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${product.name}</strong></td>
                <td>${product.stock || 0} unit</td>
                <td>Rp ${(product.price || 0).toLocaleString('id-ID')}</td>
                <td>
                    <span class="status-badge ${product.available ? 'status-available' : 'status-unavailable'}">
                        ${product.available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="openEditProductModal(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="toggleAvailability(${product.id}, ${product.available})">
                            ${product.available ? '<i class="fas fa-ban"></i> Disable' : '<i class="fas fa-check"></i> Enable'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTable').innerHTML = '<tr><td colspan="5" style="text-align: center;">Error loading products</td></tr>';
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
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const product = await response.json();

        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productPrice').value = product.price || 0;
        document.getElementById('productAvailable').checked = product.available;

        if (product.image_path) {
            document.getElementById('imagePreview').innerHTML = `<img src="${product.image_path}" alt="${product.name}">`;
        }

        document.getElementById('productFormError').innerHTML = '';
        document.getElementById('productModal').classList.add('active');
    } catch (error) {
        showAlert('productFormError', 'Gagal memuat data produk', 'danger');
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentProductId = null;
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const price = parseInt(document.getElementById('productPrice').value) || 0;
    const available = document.getElementById('productAvailable').checked;
    const imageFile = document.getElementById('productImage').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('price', price);
    formData.append('available', available);
    if (imageFile) formData.append('image', imageFile);

    try {
        const method = currentProductId ? 'PUT' : 'POST';
        const url = currentProductId 
            ? `${API_URL}/api/products/${currentProductId}` 
            : `${API_URL}/api/products`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': authToken },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('productFormError', data.error, 'danger');
            return;
        }

        showAlert('productFormError', data.message, 'success');
        closeProductModal();
        loadProducts();
    } catch (error) {
        showAlert('productFormError', 'Gagal menyimpan produk: ' + error.message, 'danger');
    }
}

async function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authToken }
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Error: ' + data.error);
            return;
        }

        alert('Produk berhasil dihapus');
        loadProducts();
    } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
    }
}

async function toggleAvailability(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/api/products/${id}/availability`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({ available: !currentStatus })
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Error: ' + data.error);
            return;
        }

        loadProducts();
    } catch (error) {
        alert('Gagal update status: ' + error.message);
    }
}

// ===== COMPANY INFO =====
async function loadCompanyInfo() {
    try {
        const response = await fetch(`${API_URL}/api/company`);
        const company = await response.json();

        if (company.id) {
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
        }
    } catch (error) {
        console.error('Error loading company info:', error);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('companyName').value);
    formData.append('description', document.getElementById('companyDescription').value);
    formData.append('phone', document.getElementById('companyPhone').value);
    formData.append('whatsapp', document.getElementById('companyWhatsapp').value);
    formData.append('email', document.getElementById('companyEmail').value);
    formData.append('address', document.getElementById('companyAddress').value);
    formData.append('operating_hours', document.getElementById('companyHours').value);

    const logoFile = document.getElementById('companyLogo').files[0];
    if (logoFile) formData.append('logo', logoFile);

    try {
        const response = await fetch(`${API_URL}/api/company`, {
            method: 'PUT',
            headers: { 'Authorization': authToken },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Error: ' + data.error);
            return;
        }

        alert('✅ ' + data.message);
        loadCompanyInfo();
    } catch (error) {
        alert('Gagal menyimpan: ' + error.message);
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
