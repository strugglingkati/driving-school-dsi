const db = require('../config/db');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: missing token' });
    }

    try {
        // Validate token against database sessions
        const [sessions] = await db.query(
            'SELECT s.*, u.id as user_id, u.username, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
        }

        const session = sessions[0];
        req.token = token;
        req.user = {
            id: session.user_id,
            username: session.username,
            full_name: session.full_name,
            role: session.role
        };
        
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Token validation failed' });
    }
};

module.exports = { authenticate };