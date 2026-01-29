// =====================================================
// API ENDPOINT: Admin Company Information Management
// =====================================================
// This endpoint handles company profile operations
// SERVICE_ROLE_KEY is securely stored in environment variables
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service_role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const adminSecret = process.env.ADMIN_SECRET || 'default-secret-change-me';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== MIDDLEWARE =====
// Authentication middleware - check for admin secret
function authMiddleware(req, res, next) {
    const token = req.headers['x-admin-secret'];
    
    if (!token || token !== adminSecret) {
        return res.status(401).json({ 
            error: 'Unauthorized: Invalid or missing admin token' 
        });
    }
    
    next();
}

// ===== ROUTES =====

// GET /api/admin/company - Get company info
async function getCompanyInfo(req, res) {
    try {
        const { data: companies, error } = await supabase
            .from('company')
            .select('*')
            .limit(1);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const company = companies && companies.length > 0 ? companies[0] : null;
        res.json(company || {});
    } catch (err) {
        console.error('Error fetching company info:', err);
        res.status(500).json({ error: 'Failed to fetch company info' });
    }
}

// POST/PUT /api/admin/company - Create or update company info
async function saveCompanyInfo(req, res) {
    try {
        const companyData = req.body;

        // First try to get existing company record
        const { data: existingCompany, error: fetchError } = await supabase
            .from('company')
            .select('id')
            .limit(1)
            .single();

        if (existingCompany) {
            // Update existing record
            const { data: updated, error } = await supabase
                .from('company')
                .update(companyData)
                .eq('id', existingCompany.id)
                .select();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.json(updated[0]);
        } else {
            // Insert new record
            const { data: created, error } = await supabase
                .from('company')
                .insert([companyData])
                .select();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.status(201).json(created[0]);
        }
    } catch (err) {
        console.error('Error saving company info:', err);
        res.status(500).json({ error: 'Failed to save company info' });
    }
}

// Export handlers
module.exports = {
    authMiddleware,
    getCompanyInfo,
    saveCompanyInfo
};
