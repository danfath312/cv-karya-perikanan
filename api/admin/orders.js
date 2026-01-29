// =====================================================
// API ENDPOINT: Admin Orders Management
// =====================================================
// This endpoint handles all order operations
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

// GET /api/admin/orders - List all orders
async function getOrders(req, res) {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(orders || []);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}

// GET /api/admin/orders/:id - Get single order
async function getOrder(req, res) {
    try {
        const { id } = req.params;
        
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
}

// PUT /api/admin/orders/:id - Update order
async function updateOrder(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent updating sensitive fields
        delete updateData.id;
        delete updateData.created_at;

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!order || order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Failed to update order' });
    }
}

// PATCH /api/admin/orders/:id/status - Update order status
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
            });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!order || order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
}

// DELETE /api/admin/orders/:id - Delete order
async function deleteOrder(req, res) {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
}

// Export handlers
module.exports = {
    authMiddleware,
    getOrders,
    getOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder
};
