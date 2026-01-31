// Admin login endpoint (POST) - verify admin secret
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const token = req.headers['x-admin-secret'];

    if (!token || !adminSecret || token !== adminSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    return res.status(200).json({ ok: true });
}
