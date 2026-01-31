// Admin company profile endpoint (GET, POST)
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

    if (req.method === 'GET') {
        try {
            const { data: companies, error } = await supabase
                .from('company')
                .select('*')
                .limit(1);

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            const company = companies && companies.length > 0 ? companies[0] : null;
            return res.status(200).json(company || {});
        } catch (err) {
            console.error('Error fetching company info:', err);
            return res.status(500).json({ error: 'Failed to fetch company info' });
        }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            const companyData = await readJsonBody(req);

            const { data: existingCompany } = await supabase
                .from('company')
                .select('id')
                .limit(1)
                .single();

            if (existingCompany) {
                const { data: updated, error } = await supabase
                    .from('company')
                    .update(companyData)
                    .eq('id', existingCompany.id)
                    .select();

                if (error) {
                    return res.status(500).json({ error: error.message });
                }

                return res.status(200).json(updated[0]);
            }

            const { data: created, error } = await supabase
                .from('company')
                .insert([companyData])
                .select();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(201).json(created[0]);
        } catch (err) {
            console.error('Error saving company info:', err);
            return res.status(500).json({ error: 'Failed to save company info' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
