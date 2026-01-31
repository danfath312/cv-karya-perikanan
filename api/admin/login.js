/**
 * /api/admin/login - POST verify admin secret
 * Vercel Serverless Handler (ESM)
 */

const adminSecret = process.env.ADMIN_SECRET;

if (!adminSecret) {
    console.error('❌ Missing env var: ADMIN_SECRET');
}

/**
 * POST /api/admin/login - Verify admin secret
 */
export default async function handler(req, res) {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = req.headers['x-admin-secret'];

        // Validate token
        if (!token || !adminSecret || token !== adminSecret) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
        }

        // Success - return ok status
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Error in login handler:', err.message);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}
