const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration...');
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_path VARCHAR(500),
        price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Products table created');
    
    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Admins table created');
    
    // Create company table
    await client.query(`
      CREATE TABLE IF NOT EXISTS company (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        logo_path VARCHAR(500),
        description TEXT,
        phone VARCHAR(50),
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        operating_hours VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Company table created');
    
    // Insert default admin
    await client.query(`
      INSERT INTO admins (username, password, email) 
      VALUES ('admin', 'admin123', 'admin@karyaperikanan.com')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('✓ Default admin created');
    
    // Insert sample products
    await client.query(`
      INSERT INTO products (name, description, image_path, price, stock, available)
      VALUES 
        ('Sisik Ikan Kakap Merah', 'Sisik ikan kakap merah berkualitas tinggi untuk berbagai keperluan industri', 'images/sisik-kakap.jpg', 50000, 100, true),
        ('Sisik Ikan Nila', 'Sisik ikan nila premium dengan harga terjangkau', 'images/sisik-nila.jpg', 45000, 150, true),
        ('Kulit Ikan', 'Kulit ikan berkualitas untuk kerajinan dan industri', 'images/kulit-ikan.jpg', 35000, 200, true)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Sample products inserted');
    
    // Insert company info
    await client.query(`
      INSERT INTO company (id, name, logo_path, description, phone, whatsapp, email, address, operating_hours)
      VALUES (
        1,
        'CV Karya Perikanan Indonesia',
        'images/logo.png',
        'Perusahaan yang bergerak di bidang pengolahan hasil perikanan',
        '0812-3456-7890',
        '6281234567890',
        'info@karyaperikanan.com',
        'Jl. Perikanan No. 123, Jakarta',
        'Senin - Jumat: 08:00 - 17:00'
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Company info inserted');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Default credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
