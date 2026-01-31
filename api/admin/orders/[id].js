/**
 * /api/admin/orders/[id] - PATCH update order status
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
 * Extract order ID from Vercel dynamic route
 */
function getId(req) {
    let id = req.query?.id;

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
 * PATCH /api/admin/orders/[id] - Update order status
 */
async function handlePatch(id, req, res) {
    try {
        const body = await parseBody(req);
        const { status } = body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase PATCH error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json(orders[0]);
    } catch (err) {
        console.error('Error updating order status:', err.message);
        return res.status(500).json({ error: 'Failed to update order status', details: err.message });
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

    // Only allow PATCH
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract ID
    const id = getId(req);
    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    return handlePatch(id, req, res);
}
