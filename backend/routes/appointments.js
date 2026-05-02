const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// جلب المواعيد (حتى لو فارغة سيرجع [])
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, c.name as candidate_name 
            FROM appointments a 
            JOIN candidates c ON a.candidate_id = c.id
        `);
        res.json(rows); // سيرسل [] إذا كانت فارغة
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// أضف هذا فوق راوت /all
router.get('/test', (req, res) => {
    res.json({ message: "مسار المواعيد يعمل بنجاح!" });
});
// إضافة موعد جديد
router.post('/add', async (req, res) => {
    const { candidate_id, instructor, type, start, end } = req.body;
    try {
        await db.query(
            "INSERT INTO appointments (candidate_id, instructor_name, lesson_type, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
            [candidate_id, instructor, type, start, end]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; // ⚠️ تأكد من وجود هذا السطر