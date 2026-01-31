// Admin toggle product availability endpoint (PATCH)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const adminSecret = process.env.ADMIN_SECRET;

function isAuthorized(req) {
    const token = req.headers['x-admin-secret'];
    return Boolean(token && adminSecret && token === adminSecret);
}

function getId(req) {
    const queryId = req.query?.id;
    if (Array.isArray(queryId)) return queryId[0];
    if (queryId) return queryId;

    const urlParts = (req.url || '').split('/');
    return urlParts[urlParts.length - 2] || null;
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') return JSON.parse(req.body);

    let rawBody = '';
    for await (const chunk of req) {
        rawBody += chunk;
    }
    if (!rawBody) return {};
    return JSON.parse(rawBody);
}

export default async function handler(req, res) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const id = getId(req);
    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const body = await readJsonBody(req);
        const hasExplicitAvailability = typeof body.available === 'boolean';

        let nextAvailability = body.available;
        if (!hasExplicitAvailability) {
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
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(updated[0]);
    } catch (err) {
        console.error('Error toggling availability:', err);
        return res.status(500).json({ error: 'Failed to toggle availability' });
    }
}
