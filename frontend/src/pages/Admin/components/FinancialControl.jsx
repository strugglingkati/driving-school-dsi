import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Printer, Search, X, RefreshCw } from 'lucide-react';
import api from '../../../services/api';

const fmt = (n) =>
    Number(n || 0).toLocaleString('ar-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const openInvoice = (payment) => {
    const remaining = Number(payment.total_price || 0) - Number(payment.total_paid || 0);
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>وصل دفع رقم ${String(payment.id).padStart(5, '0')}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Tahoma,Arial,sans-serif; font-size:14px; color:#333; background:#f5f5f5; }
  .page { max-width:420px; margin:24px auto; background:white; border-radius:12px; overflow:hidden;
          box-shadow:0 4px 20px rgba(0,0,0,.12); }
  .top-bar { background:#0066cc; color:white; padding:20px 24px; text-align:center; }
  .top-bar h1 { font-size:20px; font-weight:700; margin-bottom:4px; }
  .top-bar p { font-size:13px; opacity:.85; }
  .body { padding:24px; }
  .meta { display:flex; justify-content:space-between; font-size:13px; color:#555;
          border-bottom:1px dashed #ddd; padding-bottom:12px; margin-bottom:16px; }
  .section { background:#f8f9fa; border-radius:8px; padding:14px 16px; margin-bottom:14px; }
  .section h3 { font-size:12px; text-transform:uppercase; letter-spacing:.5px;
                color:#0066cc; font-weight:700; margin-bottom:10px; }
  .row { display:flex; justify-content:space-between; margin-bottom:7px; font-size:13px; }
  .row .lbl { color:#777; }
  .row .val { font-weight:600; }
  .amount-box { background:linear-gradient(135deg,#0066cc,#0052a3); color:white;
                border-radius:10px; padding:18px; text-align:center; margin-bottom:14px; }
  .amount-box .big { font-size:30px; font-weight:700; margin:4px 0; }
  .amount-box small { font-size:12px; opacity:.85; }
  .remaining-green { color:#22c55e; }
  .remaining-red { color:#ef4444; }
  .footer { border-top:1px dashed #ddd; padding:16px 24px; text-align:center; }
  .sign-line { height:50px; border-bottom:1px solid #333; margin:8px 48px 6px; }
  .footer p { font-size:12px; color:#888; }
  @media print { body { background:white; } .page { box-shadow:none; margin:0; border-radius:0; }
                 button { display:none!important; } }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar">
    <h1>مدرسة تعليم السياقة</h1>
    <p>وصل استلام مبلغ مالي</p>
  </div>
  <div class="body">
    <div class="meta">
      <span>رقم الوصل: <strong>#${String(payment.id).padStart(5, '0')}</strong></span>
      <span>التاريخ: <strong>${new Date(payment.created_at).toLocaleDateString('ar-MA')}</strong></span>
    </div>
    <div class="section">
      <h3>معلومات المترشح</h3>
      <div class="row"><span class="lbl">الاسم الكامل</span><span class="val">${payment.candidate_name}</span></div>
      <div class="row"><span class="lbl">رقم التعريف</span><span class="val">${payment.national_id || '—'}</span></div>
      <div class="row"><span class="lbl">الهاتف</span><span class="val">${payment.phone || '—'}</span></div>
      <div class="row"><span class="lbl">نوع الرخصة</span><span class="val">${payment.license_type || '—'}</span></div>
    </div>
    <div class="amount-box">
      <small>المبلغ المؤدى — الدفعة رقم ${payment.installment_number}</small>
      <div class="big">${fmt(payment.amount)} DH</div>
    </div>
    <div class="section">
      <h3>ملخص الحساب</h3>
      <div class="row"><span class="lbl">المبلغ الإجمالي</span><span class="val">${fmt(payment.total_price)} DH</span></div>
      <div class="row"><span class="lbl">المدفوع حتى الآن</span><span class="val remaining-green">${fmt(payment.total_paid)} DH</span></div>
      <div class="row"><span class="lbl">المتبقي</span>
        <span class="val ${remaining > 0 ? 'remaining-red' : 'remaining-green'}">${fmt(remaining)} DH</span>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>توقيع الإدارة</p>
    <div class="sign-line"></div>
    <p>شكراً لثقتكم بنا</p>
  </div>
</div>
<script>window.onload=()=>{ window.print(); window.onafterprint=()=>window.close(); };</script>
</body>
</html>`;
    const win = window.open('', '_blank', 'width=520,height=750');
    win.document.write(html);
    win.document.close();
};

const FinancialControl = () => {
    const [payments, setPayments] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState({ totalMoney: 0, dueAmount: 0, overdueCount: 0, totalCandidates: 0, graduated: 0 });
    const [search, setSearch] = useState('');
    const [dataLoading, setDataLoading] = useState(true);

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const [form, setForm] = useState({ candidate_id: '', amount: '' });
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Calculate remaining amount for selected candidate
    const getRemainingAmount = (candidateId) => {
        const candidate = candidates.find(c => c.id === Number(candidateId));
        if (!candidate) return 0;
        const totalPaid = payments
            .filter(p => p.candidate_id === Number(candidateId))
            .reduce((sum, p) => sum + Number(p.amount), 0);
        return Math.max(0, Number(candidate.total_price) - totalPaid);
    };

    const selectedCandidateRemaining = form.candidate_id ? getRemainingAmount(form.candidate_id) : 0;

    const fetchAll = useCallback(async () => {
        setDataLoading(true);
        setFetchError('');
        try {
            const paymentsRes = await api.get('/candidates/payments/all');
            setPayments(paymentsRes.data);
            
            const statsRes = await api.get('/candidates/stats/summary');
            setStats(statsRes.data);
        } catch (err) {
            console.error('FinancialControl fetch error:', err);
            const status = err.response?.status;
            const message = err.response?.data?.error || err.message;
            
            if (status === 401) {
                setFetchError('انتهت جلسة العمل — يرجى تسجيل الدخول من جديد');
            } else if (status === 404) {
                setFetchError(`خطأ 404: ${message} — تأكد من إعادة تشغيل السيرفر`);
            } else {
                setFetchError(`خطأ (${status || 'network error'}): ${message}`);
            }
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        api.get('/candidates/all').then(r => setCandidates(r.data)).catch(() => {});
    }, [fetchAll]);

    const openAdd = () => {
        setError('');
        setForm({ candidate_id: '', amount: '' });
        setAddModal(true);
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.post('/candidates/payments/add', {
                candidate_id: Number(form.candidate_id),
                amount: Number(form.amount),
            });
            setAddModal(false);
            setForm({ candidate_id: '', amount: '' });
            showSuccess('تمت إضافة الدفعة بنجاح');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (p) => {
        setError('');
        setEditAmount(String(p.amount));
        setEditModal(p);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.put(`/candidates/payments/${editModal.id}`, { amount: Number(editAmount) });
            setEditModal(null);
            showSuccess('تم تعديل الدفعة بنجاح');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء التعديل');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setError('');
        setSaving(true);
        try {
            await api.delete(`/candidates/payments/${deleteModal.id}`);
            setDeleteModal(null);
            showSuccess('تم حذف الدفعة بنجاح');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء الحذف');
        } finally {
            setSaving(false);
        }
    };

    const filtered = payments.filter(
        (p) =>
            !search ||
            p.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
            (p.national_id && p.national_id.includes(search))
    );

    return (
        <div dir="rtl">
            {/* Success Toast */}
            {successMsg && (
                <div
                    className="alert alert-success d-flex align-items-center mb-3 py-2"
                    style={{ borderRadius: 8, fontSize: 14 }}
                >
                    <span className="me-2">✅</span> {successMsg}
                </div>
            )}

            {/* Fetch Error Banner */}
            {fetchError && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between mb-3 py-2" style={{ borderRadius: 8, fontSize: 14 }}>
                    <span>⚠️ {fetchError}</span>
                    <button className="btn btn-sm btn-danger ms-3" onClick={fetchAll}>إعادة المحاولة</button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#0066cc' }}>💰 التحكم المالي</h2>
                    <p className="text-muted mb-0">تتبع المدفوعات والديون والإيرادات</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={fetchAll}
                        disabled={dataLoading}
                        title="تحديث البيانات"
                    >
                        <RefreshCw size={16} className={dataLoading ? 'spin' : ''} />
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>
                        <Plus size={18} className="me-1" />
                        دفعة جديدة
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid mb-4">
                <div className="admin-card" style={{ borderLeftColor: '#28a745' }}>
                    <p className="stat-label mb-1">إجمالي الإيرادات</p>
                    <p className="stat-value" style={{ color: '#28a745' }}>{fmt(stats.totalMoney)} DH</p>
                    <small className="text-muted">{payments.length} دفعة مسجلة</small>
                </div>
                <div className="admin-card" style={{ borderLeftColor: '#dc3545' }}>
                    <p className="stat-label mb-1">الديون العالقة</p>
                    <p className="stat-value" style={{ color: '#dc3545' }}>{fmt(stats.dueAmount)} DH</p>
                    <small className="text-muted">{stats.overdueCount} مترشح متأخر</small>
                </div>
                <div className="admin-card" style={{ borderLeftColor: '#0066cc' }}>
                    <p className="stat-label mb-1">إجمالي المترشحين</p>
                    <p className="stat-value" style={{ color: '#0066cc' }}>{stats.totalCandidates}</p>
                    <small className="text-muted">مترشح نشط</small>
                </div>
                <div className="admin-card" style={{ borderLeftColor: '#17a2b8' }}>
                    <p className="stat-label mb-1">الناجحون</p>
                    <p className="stat-value" style={{ color: '#17a2b8' }}>{stats.graduated || 0}</p>
                    <small className="text-muted">مترشح ناجح</small>
                </div>
            </div>

            {/* Payments Table */}
            <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold mb-0">📊 سجل الدفعات</h5>
                    <div className="input-group" style={{ maxWidth: 300 }}>
                        <span className="input-group-text bg-white">
                            <Search size={15} />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="بحث بالاسم أو رقم التعريف..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                                <X size={15} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>المترشح</th>
                                <th>رقم الدفعة</th>
                                <th>المبلغ</th>
                                <th>المتبقي</th>
                                <th>التاريخ</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status" />
                                        <div className="mt-2 text-muted small">جاري تحميل البيانات...</div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-5">
                                        {search ? 'لا توجد نتائج للبحث' : 'لا توجد دفعات مسجلة'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p, i) => {
                                    const remaining = Math.max(0, Number(p.total_price) - Number(p.total_paid));
                                    return (
                                    <tr key={p.id}>
                                        <td className="text-muted">{i + 1}</td>
                                        <td>
                                            <div className="fw-bold">{p.candidate_name}</div>
                                            {p.national_id && (
                                                <small className="text-muted">{p.national_id}</small>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{ background: '#e7f3ff', color: '#0066cc', fontWeight: 600 }}
                                            >
                                                دفعة {p.installment_number}
                                            </span>
                                        </td>
                                        <td className="fw-bold" style={{ color: '#28a745' }}>
                                            {fmt(p.amount)} DH
                                        </td>
                                        <td className="fw-bold" style={{ color: remaining > 0 ? '#dc3545' : '#28a745' }}>
                                            {fmt(remaining)} DH
                                        </td>
                                        <td className="text-muted">
                                            {new Date(p.created_at).toLocaleDateString('ar-MA')}
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn edit btn"
                                                title="تعديل المبلغ"
                                                onClick={() => openEdit(p)}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="action-btn btn"
                                                title="طباعة الفاتورة"
                                                style={{ background: '#fff8e1', color: '#f59e0b', border: '1px solid #f59e0b' }}
                                                onClick={() => openInvoice(p)}
                                            >
                                                <Printer size={14} />
                                            </button>
                                            <button
                                                className="action-btn delete btn"
                                                title="حذف الدفعة"
                                                onClick={() => { setError(''); setDeleteModal(p); }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add Modal ─────────────────────────────── */}
            {addModal && (
                <div
                    className="admin-modal"
                    onClick={(e) => e.target === e.currentTarget && setAddModal(false)}
                >
                    <div style={{ background: 'white', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">➕ تسجيل دفعة جديدة</h5>
                            <button className="btn-close" onClick={() => setAddModal(false)} />
                        </div>
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        {candidates.length === 0 && (
                            <div className="alert alert-warning py-2 small mb-3">
                                لا يوجد مترشحون مسجلون. أضف مترشحاً أولاً من قسم <strong>إدارة المترشحين</strong>.
                            </div>
                        )}
                        <form onSubmit={handleAdd}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">المترشح</label>
                                <select
                                    className="form-select"
                                    value={form.candidate_id}
                                    onChange={(e) => setForm((f) => ({ ...f, candidate_id: e.target.value, amount: '' }))}
                                    required
                                    autoFocus
                                    disabled={candidates.length === 0}
                                >
                                    <option value="">— اختر المترشح —</option>
                                    {candidates.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                            {c.national_id ? ` — ${c.national_id}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.candidate_id && (
                                <div className="alert alert-info py-2 mb-3 small">
                                    <strong>المتبقي:</strong> {fmt(selectedCandidateRemaining)} DH
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="form-label fw-bold">المبلغ (DH)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    min="1"
                                    step="0.01"
                                    max={selectedCandidateRemaining || undefined}
                                    value={form.amount}
                                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                    required
                                    disabled={!form.candidate_id || selectedCandidateRemaining === 0}
                                />
                                {selectedCandidateRemaining === 0 && form.candidate_id && (
                                    <small className="text-danger">✓ تم دفع المبلغ الكامل</small>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
                                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                                    تأكيد الدفعة
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setAddModal(false)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ─────────────────────────────── */}
            {editModal && (
                <div
                    className="admin-modal"
                    onClick={(e) => e.target === e.currentTarget && setEditModal(null)}
                >
                    <div style={{ background: 'white', borderRadius: 12, padding: 28, width: '100%', maxWidth: 440 }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="fw-bold mb-0">✏️ تعديل الدفعة</h5>
                            <button className="btn-close" onClick={() => setEditModal(null)} />
                        </div>
                        <p className="text-muted small mb-3">
                            المترشح: <strong>{editModal.candidate_name}</strong> — دفعة رقم{' '}
                            <strong>{editModal.installment_number}</strong>
                        </p>
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        <form onSubmit={handleEdit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold">المبلغ الجديد (DH)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg"
                                    min="1"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
                                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                                    حفظ التعديل
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditModal(null)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ─────────────────────────── */}
            {deleteModal && (
                <div
                    className="admin-modal"
                    onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 32,
                            width: '100%',
                            maxWidth: 400,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: 52 }} className="mb-3">⚠️</div>
                        <h5 className="fw-bold mb-2">تأكيد الحذف</h5>
                        <p className="text-muted mb-1">
                            هل تريد حذف دفعة بقيمة{' '}
                            <strong className="text-danger">{fmt(deleteModal.amount)} DH</strong>؟
                        </p>
                        <p className="text-muted mb-4">
                            للمترشح: <strong>{deleteModal.candidate_name}</strong>
                        </p>
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-danger px-4" onClick={handleDelete} disabled={saving}>
                                {saving && <span className="spinner-border spinner-border-sm me-2" />}
                                حذف نهائي
                            </button>
                            <button
                                className="btn btn-outline-secondary px-4"
                                onClick={() => setDeleteModal(null)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialControl;
