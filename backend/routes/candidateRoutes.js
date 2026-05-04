const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// ─── دالة مشتركة ──────────────────────────────────────────────────────────────
const getActiveCandidates = async (req, res) => {
    try {
        const search = req.query.search || '';
        let params = [];
        let where = 'WHERE c.is_archived = 0';

        if (search.trim()) {
            where += ' AND (LOWER(c.name) LIKE ? OR LOWER(c.name_fr) LIKE ? OR c.national_id LIKE ? OR c.phone LIKE ?)';
            const q = `%${search.toLowerCase()}%`;
            params = [q, q, `%${search}%`, `%${search}%`];
        }

        const [rows] = await db.query(`
            SELECT c.*,
                IFNULL((SELECT SUM(amount) FROM payments WHERE candidate_id = c.id), 0) AS total_paid,
                (SELECT MAX(created_at) FROM payments WHERE candidate_id = c.id) AS last_payment_date
            FROM candidates c
            ${where}
            ORDER BY c.created_at DESC`, params);
        res.json(rows);
    } catch (err) {
        console.error('DB Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// ─── GET : مسارات ثابتة (يجب أن تأتي قبل /:id) ───────────────────────────────

router.get('/', getActiveCandidates);
router.get('/all', getActiveCandidates);

router.get('/archived', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*,
                IFNULL((SELECT SUM(amount) FROM payments WHERE candidate_id = c.id), 0) AS total_paid,
                (SELECT MAX(created_at) FROM payments WHERE candidate_id = c.id) AS last_payment_date
            FROM candidates c
            WHERE c.is_archived = 1
            ORDER BY c.updated_at DESC`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// الإحصائيات
router.get('/stats/summary', async (req, res) => {
    try {
        const [[{ totalCandidates }]] = await db.query("SELECT COUNT(*) as totalCandidates FROM candidates WHERE is_archived = 0");
        const [[{ totalMoney }]] = await db.query("SELECT IFNULL(SUM(amount),0) as totalMoney FROM payments");
        const [[{ graduated }]] = await db.query("SELECT COUNT(*) as graduated FROM candidates WHERE status = 'ناجح'");
        const [[{ dueAmount, overdueCount }]] = await db.query(`
            SELECT
                IFNULL(SUM(c.total_price - IFNULL(p.paid,0)),0) AS dueAmount,
                SUM(CASE WHEN c.total_price - IFNULL(p.paid,0) > 0
                         AND DATEDIFF(CURRENT_DATE, IFNULL(p.last_pay, c.created_at)) > 30
                    THEN 1 ELSE 0 END) AS overdueCount
            FROM candidates c
            LEFT JOIN (
                SELECT candidate_id, SUM(amount) AS paid, MAX(created_at) AS last_pay
                FROM payments GROUP BY candidate_id
            ) p ON p.candidate_id = c.id
            WHERE c.is_archived = 0`);
        res.json({ totalCandidates: totalCandidates||0, totalMoney: totalMoney||0,
                   graduated: graduated||0, dueAmount: dueAmount||0, overdueCount: overdueCount||0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (req, res) => {
    try {
        const [[{ totalCandidates }]] = await db.query("SELECT COUNT(*) as totalCandidates FROM candidates WHERE is_archived = 0");
        const [[{ activeCandidates }]] = await db.query("SELECT COUNT(*) as activeCandidates FROM candidates WHERE is_archived = 0 AND status != 'ناجح'");
        const [[{ totalRevenue }]] = await db.query("SELECT IFNULL(SUM(amount),0) as totalRevenue FROM payments");
        const [[{ pendingPayments }]] = await db.query(`
            SELECT IFNULL(SUM(c.total_price - IFNULL(p.paid,0)),0) AS pendingPayments
            FROM candidates c
            LEFT JOIN (SELECT candidate_id, SUM(amount) AS paid FROM payments GROUP BY candidate_id) p
            ON p.candidate_id = c.id WHERE c.is_archived = 0`);
        const [[{ upcomingAppointments }]] = await db.query(`
            SELECT COUNT(*) as upcomingAppointments FROM appointments
            WHERE start_time >= CURRENT_DATE AND status NOT IN ('cancelled','completed')`);
        const [[{ completedTests }]] = await db.query(`
            SELECT COUNT(*) as completedTests FROM candidates
            WHERE status = 'ناجح'
            AND MONTH(updated_at) = MONTH(CURRENT_DATE)
            AND YEAR(updated_at) = YEAR(CURRENT_DATE)`);
        res.json({ totalCandidates: totalCandidates||0, activeCandidates: activeCandidates||0,
                   totalRevenue: totalRevenue||0, pendingPayments: pendingPayments||0,
                   upcomingAppointments: upcomingAppointments||0, completedTests: completedTests||0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── مسارات الدفعات (sub-router) ────────────────────────────────────────────
const paymentsRouter = express.Router();

paymentsRouter.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*,
                c.name    AS candidate_name,
                c.national_id,
                c.license_type,
                c.phone,
                c.total_price,
                IFNULL((SELECT SUM(amount) FROM payments WHERE candidate_id = c.id), 0) AS total_paid
            FROM payments p
            JOIN candidates c ON c.id = p.candidate_id
            ORDER BY p.created_at DESC`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// تصدير / نسخ احتياطية
router.get('/backup/export', async (req, res) => {
    try {
        const [candidates] = await db.query('SELECT * FROM candidates');
        const [payments]   = await db.query('SELECT * FROM payments');
        res.json({ candidates, payments, exported_at: new Date().toISOString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/export', async (req, res) => {
    try {
        const [candidates] = await db.query(`
            SELECT c.id, c.name, c.national_id, c.phone, c.license_type, c.status, c.total_price,
                IFNULL(p.paid,0) AS total_paid, c.created_at, c.updated_at
            FROM candidates c
            LEFT JOIN (SELECT candidate_id, SUM(amount) AS paid FROM payments GROUP BY candidate_id) p
            ON p.candidate_id = c.id WHERE c.is_archived = 0 ORDER BY c.created_at DESC`);
        res.json({ report: candidates, generated_at: new Date().toISOString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/test-c', (req, res) => res.json({ message: 'مسار المترشحين متصل بنجاح!' }));

// ─── POST / PUT / DELETE : مسارات ثابتة ───────────────────────────────────────

router.post('/add', async (req, res) => {
    const { name, name_fr, national_id, phone, address, license_type,
            total_price, id_card_url, contract_url, tax_receipt_url, notes } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO candidates
             (name, name_fr, national_id, phone, address, license_type, total_price,
              status, id_card_url, contract_url, tax_receipt_url, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'جديد', ?, ?, ?, ?)`,
            [name, name_fr||null, national_id||null, phone||null, address||null,
             license_type, total_price||0, id_card_url||null, contract_url||null,
             tax_receipt_url||null, notes||null]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

paymentsRouter.post('/add', async (req, res) => {
    const { candidate_id, amount } = req.body;
    if (!candidate_id || !amount || Number(amount) <= 0)
        return res.status(400).json({ error: 'بيانات غير صالحة' });
    try {
        // Get candidate total price
        const [candidate] = await db.query('SELECT total_price FROM candidates WHERE id = ?', [candidate_id]);
        if (!candidate.length) return res.status(404).json({ error: 'المترشح غير موجود' });
        
        const totalPrice = Number(candidate[0].total_price);
        
        // Get current total paid
        const [paid] = await db.query(
            'SELECT IFNULL(SUM(amount), 0) as total_paid FROM payments WHERE candidate_id = ?',
            [candidate_id]);
        const totalPaid = Number(paid[0].total_paid);
        
        // Check if new payment would exceed total price
        if (totalPaid + Number(amount) > totalPrice) {
            const remaining = totalPrice - totalPaid;
            return res.status(400).json({ 
                error: `المبلغ يتجاوز الحد المسموح. المتبقي: ${remaining} DH` 
            });
        }
        
        // Add payment
        const [rows] = await db.query(
            'SELECT MAX(installment_number) AS last FROM payments WHERE candidate_id = ?',
            [candidate_id]);
        const next = (rows[0].last || 0) + 1;
        await db.query(
            'INSERT INTO payments (candidate_id, amount, installment_number) VALUES (?, ?, ?)',
            [candidate_id, amount, next]);
        res.json({ success: true, installment_number: next });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

paymentsRouter.put('/:paymentId', async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0)
        return res.status(400).json({ error: 'المبلغ غير صالح' });
    try {
        const [result] = await db.query(
            'UPDATE payments SET amount = ? WHERE id = ?',
            [Number(amount), req.params.paymentId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'الدفعة غير موجودة' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

paymentsRouter.delete('/:paymentId', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM payments WHERE id = ?', [req.params.paymentId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'الدفعة غير موجودة' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── مسار ثابت قبل router.use (للحصول على جميع الدفعات) ───────────────────────

router.get('/payments/all', async (req, res) => {
    try {
        const [payments] = await db.query(`
            SELECT p.id, p.candidate_id, p.amount, p.installment_number, p.created_at,
                   c.name as candidate_name, c.national_id, c.phone, c.license_type, c.total_price,
                   IFNULL((SELECT SUM(amount) FROM payments WHERE candidate_id = c.id), 0) as total_paid
            FROM payments p
            JOIN candidates c ON p.candidate_id = c.id
            ORDER BY p.created_at DESC`);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use('/payments', paymentsRouter);

// ─── مسارات /:id الديناميكية (يجب أن تأتي في الأخير) ─────────────────────────

router.get('/:id/payments', async (req, res) => {
    try {
        const [payments] = await db.query(
            'SELECT * FROM payments WHERE candidate_id = ? ORDER BY installment_number',
            [req.params.id]);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/archive', async (req, res) => {
    try {
        await db.query('UPDATE candidates SET is_archived = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'تمت الأرشفة' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/restore', async (req, res) => {
    try {
        await db.query('UPDATE candidates SET is_archived = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'تمت الاستعادة' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE candidates SET status = ? WHERE id = ?', [status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'المترشح غير موجود' });
        res.json({ success: true, message: 'تم تحديث الحالة' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, name_fr, national_id, phone, address, license_type,
            total_price, status, id_card_url, contract_url, tax_receipt_url, notes } = req.body;
    try {
        await db.query(
            `UPDATE candidates SET
                name=?, name_fr=?, national_id=?, phone=?, address=?,
                license_type=?, total_price=?, status=?,
                id_card_url=?, contract_url=?, tax_receipt_url=?, notes=?
             WHERE id=?`,
            [name, name_fr||null, national_id||null, phone||null, address||null,
             license_type, total_price, status,
             id_card_url||null, contract_url||null, tax_receipt_url||null, notes||null, id]);
        res.json({ success: true, message: 'تم التحديث' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
