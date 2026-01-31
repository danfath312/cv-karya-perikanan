// Admin orders collection endpoint (GET)
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

export default async function handler(req, res) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(orders || []);
    } catch (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
