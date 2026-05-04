const db = require('../config/db');

const addColumnIfMissing = async (table, column, definition) => {
    try {
        const [rows] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
        if (rows.length === 0) {
            await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`✅ Added column ${column} to ${table}`);
        }
    } catch (err) {
        console.warn(`⚠️ Could not ensure column ${column} on ${table}:`, err.message);
    }
};

const initDatabase = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'admin',
                is_active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_token (token),
                INDEX idx_expires (expires_at)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS candidates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(200) NOT NULL,
                name_fr VARCHAR(200) DEFAULT NULL,
                national_id VARCHAR(50) DEFAULT NULL,
                phone VARCHAR(30) DEFAULT NULL,
                address TEXT DEFAULT NULL,
                license_type VARCHAR(10) DEFAULT 'B',
                total_price DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'جديد',
                is_archived TINYINT DEFAULT 0,
                id_card_url VARCHAR(255) DEFAULT NULL,
                contract_url VARCHAR(255) DEFAULT NULL,
                tax_receipt_url VARCHAR(255) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await addColumnIfMissing('candidates', 'name_fr', 'VARCHAR(200) DEFAULT NULL');
        await addColumnIfMissing('candidates', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        await addColumnIfMissing('candidates', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        await db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                candidate_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                installment_number INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
                INDEX idx_candidate (candidate_id)
            )
        `);

        await addColumnIfMissing('payments', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        await addColumnIfMissing('payments', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        await db.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                candidate_id INT NOT NULL,
                instructor_name VARCHAR(100) DEFAULT NULL,
                lesson_type VARCHAR(50) DEFAULT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                status VARCHAR(50) DEFAULT 'scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
                INDEX idx_appointment_candidate (candidate_id),
                INDEX idx_appointment_start (start_time)
            )
        `);

        await addColumnIfMissing('appointments', 'candidate_id', 'INT NOT NULL');
        await addColumnIfMissing('appointments', 'instructor_name', 'VARCHAR(100) DEFAULT NULL');
        await addColumnIfMissing('appointments', 'lesson_type', 'VARCHAR(50) DEFAULT NULL');
        await addColumnIfMissing('appointments', 'start_time', 'DATETIME NOT NULL');
        await addColumnIfMissing('appointments', 'end_time', 'DATETIME NOT NULL');
        await addColumnIfMissing('appointments', 'status', "VARCHAR(50) DEFAULT 'scheduled'");
        await addColumnIfMissing('appointments', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        await db.query(`
            INSERT IGNORE INTO users (username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        `, ['admin', require('crypto').createHash('sha256').update('admin123' + 'salt123').digest('hex'), 'مشرف النظام', 'admin']);

        console.log('✅ Database initialization complete');
        await db.query('DELETE FROM sessions WHERE expires_at < NOW()');
        console.log('✅ Cleaned expired sessions');
    } catch (err) {
        console.error('Database init error:', err.message);
    }
};

module.exports = { initDatabase };
