// =====================================================
// API ENDPOINT: Admin Products Management
// =====================================================
// This endpoint handles all product operations
// SERVICE_ROLE_KEY is securely stored in environment variables
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service_role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const adminSecret = process.env.ADMIN_SECRET || 'default-secret-change-me';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== MIDDLEWARE =====
// Authentication middleware - check for admin secret
function authMiddleware(req, res, next) {
    const token = req.headers['x-admin-secret'];
    
    if (!token || token !== adminSecret) {
        return res.status(401).json({ 
            error: 'Unauthorized: Invalid or missing admin token' 
        });
    }
    
    next();
}

// ===== ROUTES =====

// GET /api/admin/products - List all products
async function getProducts(req, res) {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(products || []);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}

// GET /api/admin/products/:id - Get single product
async function getProduct(req, res) {
    try {
        const { id } = req.params;
        
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
}

// POST /api/admin/products - Create product
async function createProduct(req, res) {
    try {
        const {
            name,
            name_en,
            description,
            description_en,
            specifications,
            specifications_en,
            uses,
            uses_en,
            stock,
            price,
            available,
            image_url
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        const productData = {
            name,
            name_en: name_en || null,
            description: description || null,
            description_en: description_en || null,
            specifications: specifications || [],
            specifications_en: specifications_en || [],
            uses: uses || [],
            uses_en: uses_en || [],
            stock: stock || 0,
            price: price || 0,
            available: available !== false,
            image_url: image_url || null
        };

        const { data: product, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json(product[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
}

// PUT /api/admin/products/:id - Update product
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent updating sensitive fields
        delete updateData.id;
        delete updateData.created_at;

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!product || product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
}

// DELETE /api/admin/products/:id - Delete product
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
}

// PATCH /api/admin/products/:id/toggle-availability - Toggle product availability
async function toggleAvailability(req, res) {
    try {
        const { id } = req.params;

        // First fetch current product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('available')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Toggle availability
        const { data: updated, error } = await supabase
            .from('products')
            .update({ available: !product.available })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(updated[0]);
    } catch (err) {
        console.error('Error toggling availability:', err);
        res.status(500).json({ error: 'Failed to toggle availability' });
    }
}

// POST /api/admin/upload-product-image - Upload product image to Supabase Storage
async function uploadProductImage(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const fileName = req.body.fileName || `${Date.now()}_${file.originalname}`;
        const filePath = `products/${fileName}`;

        console.log('📤 Uploading image to Supabase:', filePath);

        // Read file from multer storage
        const fileBuffer = fs.readFileSync(file.path);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('product_images')
            .upload(filePath, fileBuffer, { 
                upsert: true,
                contentType: file.mimetype
            });

        if (error) {
            // Clean up uploaded file
            fs.unlinkSync(file.path);
            return res.status(500).json({ error: error.message });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(filePath);

        const imageUrl = publicUrlData.publicUrl;
        console.log('✅ Image uploaded:', imageUrl);

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.json({ imageUrl });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
}

// Export handlers
module.exports = {
    authMiddleware,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    uploadProductImage
};
