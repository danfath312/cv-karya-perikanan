/**
 * /api/admin/products/[id]/toggle - PATCH toggle product availability
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
 * PATCH /api/admin/products/[id]/toggle - Toggle availability
 */
async function handlePatch(id, req, res) {
    try {
        const body = await parseBody(req);
        const hasExplicitAvailability = typeof body.available === 'boolean';

        let nextAvailability = body.available;
        if (!hasExplicitAvailability) {
            // Get current availability and toggle it
            const { data: existing, error: fetchError } = await supabase
                .from('products')
                .select('available')
                .eq('id', id)
                .single();

            if (fetchError || !existing) {
                return res.status(404).json({ error: 'Product not found' });
            }

            nextAvailability = !existing.available;
        }

        const { data: updated, error } = await supabase
            .from('products')
            .update({ available: nextAvailability })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase PATCH error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!updated || updated.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(updated[0]);
    } catch (err) {
        console.error('Error toggling availability:', err.message);
        return res.status(500).json({ error: 'Failed to toggle availability', details: err.message });
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

    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract ID
    const id = getId(req);
    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    return handlePatch(id, req, res);
}
