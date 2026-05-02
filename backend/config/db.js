const mysql = require('mysql2');
require('dotenv').config();

// طباعة للتحقق (اختياري يمكنك حذفه لاحقاً)
console.log("محاولة الاتصال بالمستخدم:", process.env.DB_USER || 'root (fallback)');

const pool = mysql.createPool({
    // نستخدم || لوضع قيمة احتياطية في حال فشل قراءة الـ .env
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'driving_school_dsi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();