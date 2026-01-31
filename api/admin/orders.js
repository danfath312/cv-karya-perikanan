/**
 * /api/admin/orders - GET orders list
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
 * GET /api/admin/orders
 */
async function handleGet(res) {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase GET error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(orders || []);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        return res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
}

/**
 * Main handler - Vercel Serverless
 */
export default async function handler(req, res) {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Auth check
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return handleGet(res);
}
