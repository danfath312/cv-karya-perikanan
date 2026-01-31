/**
 * /api/admin/products - GET list, POST create
 * Vercel Serverless Handler (ESM)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSecret = process.env.ADMIN_SECRET;

// Validate env vars on startup
if (!supabaseUrl || !supabaseKey || !adminSecret) {
    console.error('❌ Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ADMIN_SECRET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check authorization via x-admin-secret header
 */
function isAuthorized(req) {
    const token = req.headers['x-admin-secret'];
    if (!token || !adminSecret || token !== adminSecret) {
        return false;
    }
    return true;
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

    // Stream body if needed
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
 * GET /api/admin/products - List all products
 */
async function handleGet(req, res) {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase GET error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(products || []);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        return res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
}

/**
 * POST /api/admin/products - Create new product
 */
async function handlePost(req, res) {
    try {
        const body = await parseBody(req);
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
        } = body;

        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        const productData = {
            name,
            name_en: name_en || null,
            description: description || null,
            description_en: description_en || null,
            specifications: Array.isArray(specifications) ? specifications : [],
            specifications_en: Array.isArray(specifications_en) ? specifications_en : [],
            uses: Array.isArray(uses) ? uses : [],
            uses_en: Array.isArray(uses_en) ? uses_en : [],
            stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
            price: Number.isFinite(Number(price)) ? Number(price) : 0,
            available: available !== false,
            image_url: image_url || null
        };

        const { data: products, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        if (error) {
            console.error('Supabase POST error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(products[0] || {});
    } catch (err) {
        console.error('Error creating product:', err.message);
        return res.status(500).json({ error: 'Failed to create product', details: err.message });
    }
}

/**
 * Main handler - Vercel Serverless
 * @param {*} req - Vercel request object
 * @param {*} res - Vercel response object
 */
export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Content-Type', 'application/json');

    // Auth check
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    // Route by method
    if (req.method === 'GET') {
        return handleGet(req, res);
    }

    if (req.method === 'POST') {
        return handlePost(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
