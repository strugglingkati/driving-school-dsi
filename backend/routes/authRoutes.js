const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');

// Initialize users table on startup
const initUsersTable = async () => {
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
        console.log('✅ Users table ready');
        
        // Insert default admin if not exists
        await db.query(`
            INSERT IGNORE INTO users (username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        `, ['admin', hashPassword('admin123'), 'مشرف النظام', 'admin']);
    } catch (err) {
        console.error('Error initializing users table:', err.message);
    }
};

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password + 'salt123').digest('hex');
};

initUsersTable();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'بيانات الاعتماد غير صحيحة' });
        }

        const user = users[0];
        const passwordHash = hashPassword(password);

        if (user.password_hash !== passwordHash) {
            return res.status(401).json({ error: 'بيانات الاعتماد غير صحيحة' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token in database
        await db.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'خطأ في السيرفر' });
    }
});

router.post('/logout', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
        try {
            await db.query('DELETE FROM sessions WHERE token = ?', [token]);
        } catch {
            // ignore errors
        }
    }

    res.json({ success: true });
});

router.get('/verify', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }

    try {
        const [sessions] = await db.query(
            'SELECT s.*, u.username, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ error: 'Token invalid or expired' });
        }

        const session = sessions[0];
        res.json({
            valid: true,
            user: {
                id: session.user_id,
                username: session.username,
                full_name: session.full_name,
                role: session.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Token validation failed' });
    }
});

module.exports = router;