// Admin product image upload endpoint (POST)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import formidable from 'formidable';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const adminSecret = process.env.ADMIN_SECRET;

function isAuthorized(req) {
    const token = req.headers['x-admin-secret'];
    return Boolean(token && adminSecret && token === adminSecret);
}

function parseForm(req) {
    const form = formidable({ multiples: false, keepExtensions: true });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            return resolve({ fields, files });
        });
    });
}

function getFile(files) {
    const file = files?.file;
    if (Array.isArray(file)) return file[0];
    return file || null;
}

export default async function handler(req, res) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin secret' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let uploadedFile = null;

    try {
        const { fields, files } = await parseForm(req);
        const file = getFile(files);
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        uploadedFile = file;

        const originalName = file.originalFilename || file.newFilename || 'upload';
        const providedName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;
        const safeName = String(providedName || originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
        const ext = path.extname(safeName) || path.extname(originalName) || '';
        const finalName = safeName.endsWith(ext) ? safeName : `${safeName}${ext}`;
        const filePath = `products/${finalName}`;

        const fileBuffer = await fs.readFile(file.filepath);

        const { error } = await supabase.storage
            .from('product_images')
            .upload(filePath, fileBuffer, {
                upsert: true,
                contentType: file.mimetype || 'application/octet-stream'
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(filePath);

        return res.status(200).json({ imageUrl: publicUrlData.publicUrl });
    } catch (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
    } finally {
        if (uploadedFile?.filepath) {
            try {
                await fs.unlink(uploadedFile.filepath);
            } catch (cleanupError) {
                console.warn('Failed to clean up upload temp file:', cleanupError);
            }
        }
    }
}
