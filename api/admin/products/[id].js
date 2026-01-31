/**
 * /api/admin/products/[id] - GET, PUT, DELETE single product
 * Vercel Serverless Handler (ESM)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSecret = process.env.ADMIN_SECRET;

if (!supabaseUrl || !supabaseKey || !adminSecret) {
    console.error('❌ Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ADMIN_SECRET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check authorization
 */
function isAuthorized(req) {
    const token = req.headers['x-admin-secret'];
    return Boolean(token && adminSecret && token === adminSecret);
}

/**
 * Extract product ID from Vercel dynamic route
 * Vercel provides: req.query.id (as string or array)
 */
function getId(req) {
    // Vercel dynamic routes provide id via req.query
    let id = req.query?.id;

    // Handle array (shouldn't happen but just in case)
    if (Array.isArray(id)) {
        id = id[0];
    }

    return id || null;
}

/**
 * Parse JSON body safely
 */
async function parseBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (e) {
            return {};
        }
    }

    if (req.readable || req.on) {
        let rawBody = '';
        for await (const chunk of req) {
            rawBody += chunk;
        }
        try {
            return rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
            return {};
        }
    }

    return {};
}

/**
 * GET /api/admin/products/[id] - Get single product
 */
async function handleGet(id, res) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase GET error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (err) {
        console.error('Error fetching product:', err.message);
        return res.status(500).json({ error: 'Failed to fetch product', details: err.message });
    }
}

/**
 * PUT /api/admin/products/[id] - Update product
 */
async function handlePut(id, req, res) {
    try {
        const updateData = await parseBody(req);

        // Remove immutable fields
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        const { data: products, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase PUT error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(products[0]);
    } catch (err) {
        console.error('Error updating product:', err.message);
        return res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
}

/**
 * DELETE /api/admin/products/[id] - Delete product
 */
async function handleDelete(id, res) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase DELETE error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        return res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
}

/**
 * Main handler - Vercel Serverless
 */
export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Content-Type', 'application/json');

    // Auth check
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    // Extract ID
    const id = getId(req);
    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // Route by method
    if (req.method === 'GET') {
        return handleGet(id, res);
    }

    if (req.method === 'PUT') {
        return handlePut(id, req, res);
    }

    if (req.method === 'DELETE') {
        return handleDelete(id, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
