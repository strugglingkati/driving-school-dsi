const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// دالة مشتركة لجلب البيانات لتقليل تكرار الكود
const getActiveCandidates = async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
            (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE candidate_id = c.id) as total_paid,
            (SELECT MAX(created_at) FROM payments WHERE candidate_id = c.id) as last_payment_date
            FROM candidates c 
            WHERE c.is_archived = 0 
            ORDER BY c.created_at DESC`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) { 
        console.error("Database Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
};

// --- المسارات (Routes) ---

// 1. المسار المطلوب من ScheduleManager (/)
router.get('/', getActiveCandidates);

// 2. المسار المطلوب من useCandidates.js (/all)
router.get('/all', getActiveCandidates);

// 3. مسار جلب المترشحين المؤرشفين
router.get('/archived', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM candidates WHERE is_archived = 1 ORDER BY updated_at DESC");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. إضافة مترشح جديد
router.post('/add', async (req, res) => {
    const { name, phone, license_type, total_price } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO candidates (name, phone, license_type, total_price, status) VALUES (?, ?, ?, ?, 'جديد')",
            [name, phone, license_type, total_price || 0]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. تحديث بيانات مترشح
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, license_type, total_price, status } = req.body;
    try {
        await db.query(
            "UPDATE candidates SET name = ?, phone = ?, license_type = ?, total_price = ?, status = ? WHERE id = ?",
            [name, phone, license_type, total_price, status, id]
        );
        res.json({ success: true, message: "تم التحديث" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. أرشفة / استعادة مترشح
router.put('/:id/archive', async (req, res) => {
    try {
        await db.query('UPDATE candidates SET is_archived = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "تمت الأرشفة" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/restore', async (req, res) => {
    try {
        await db.query('UPDATE candidates SET is_archived = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "تمت الاستعادة" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. حذف نهائي
router.delete('/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM candidates WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. الدفعات
router.get('/:id/payments', async (req, res) => {
    try {
        const [payments] = await db.query(
            "SELECT * FROM payments WHERE candidate_id = ? ORDER BY installment_number", 
            [req.params.id]
        );
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/payments/add', async (req, res) => {
    const { candidate_id, amount } = req.body;
    try {
        const [rows] = await db.query("SELECT MAX(installment_number) as last FROM payments WHERE candidate_id = ?", [candidate_id]);
        let next = (rows[0].last || 0) + 1;
        if (next > 6) return res.status(400).json({ error: "الحد الأقصى 6 دفعات" });
        await db.query("INSERT INTO payments (candidate_id, amount, installment_number) VALUES (?, ?, ?)", [candidate_id, amount, next]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. الإحصائيات العامة
router.get('/stats/summary', async (req, res) => {
    try {
        const [[{ totalCandidates }]] = await db.query("SELECT COUNT(*) as totalCandidates FROM candidates WHERE is_archived = 0");
        const [[{ totalMoney }]] = await db.query("SELECT SUM(amount) as totalMoney FROM payments");
        const [[{ graduated }]] = await db.query("SELECT COUNT(*) as graduated FROM candidates WHERE status = 'ناجح'");
        res.json({ totalCandidates: totalCandidates || 0, totalMoney: totalMoney || 0, graduated: graduated || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// مسار تجريبي
router.get('/test-c', (req, res) => {
    res.json({ message: "مسار المترشحين متصل بنجاح!" });
});
// تحديث حالة المترشح (جديد، تدريب، ناجح، راسب)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // الحالة الجديدة المرسلة من React
    
    try {
        const [result] = await db.query(
            "UPDATE candidates SET status = ? WHERE id = ?",
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "المترشح غير موجود" });
        }
        
        res.json({ success: true, message: "تم تحديث الحالة بنجاح" });
    } catch (err) {
        console.error("Error updating status:", err.message);
        res.status(500).json({ error: "خطأ في خادم قاعدة البيانات" });
    }
});
module.exports = router;