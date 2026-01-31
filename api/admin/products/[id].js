// Admin single product endpoint (GET, PUT, DELETE)
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
    return urlParts[urlParts.length - 1] || null;
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

    const id = getId(req);
    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    if (req.method === 'GET') {
        try {
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

            return res.status(200).json(product);
        } catch (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const updateData = await readJsonBody(req);

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

            return res.status(200).json(product[0]);
        } catch (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Failed to update product' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
