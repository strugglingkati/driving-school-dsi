const db = require('../config/db');

const initDatabase = async () => {
    try {
        // Sessions table for storing active tokens
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
        
        console.log('✅ Sessions table ready');
        
        // Clean up expired sessions
        await db.query('DELETE FROM sessions WHERE expires_at < NOW()');
        console.log('✅ Cleaned expired sessions');
        
    } catch (err) {
        console.error('Database init error:', err.message);
    }
};

module.exports = { initDatabase };
