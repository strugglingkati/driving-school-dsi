import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, RotateCcw, Trash2, Search, X } from 'lucide-react';
import api from '../../../services/api';

const fmt = (n) => Number(n || 0).toLocaleString('ar-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DocBadge = ({ url, label }) =>
    url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="badge me-1" style={{ background: '#d4edda', color: '#155724', textDecoration: 'none' }}>
            ✅ {label}
        </a>
    ) : (
        <span className="badge me-1" style={{ background: '#f8d7da', color: '#721c24' }}>❌ {label}</span>
    );

const DigitalArchive = () => {
    const [archived, setArchived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchArchived = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/candidates/archived');
            setArchived(res.data);
        } catch (err) {
            console.error('Archive fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchArchived(); }, [fetchArchived]);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleRestore = async (id, name) => {
        if (!window.confirm(`هل تريد استعادة المترشح "${name}"؟`)) return;
        try {
            await api.put(`/candidates/${id}/restore`);
            showSuccess(`تمت استعادة "${name}" بنجاح`);
            fetchArchived();
        } catch (err) {
            alert(err.response?.data?.error || 'فشل في الاستعادة');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`هل تريد حذف المترشح "${name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
        try {
            await api.delete(`/candidates/${id}`);
            showSuccess(`تم حذف "${name}" نهائياً`);
            fetchArchived();
        } catch (err) {
            alert(err.response?.data?.error || 'فشل في الحذف');
        }
    };

    const filtered = archived.filter(
        (c) =>
            !search ||
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.national_id?.includes(search)
    );

    return (
        <div dir="rtl">
            {successMsg && (
                <div className="alert alert-success py-2 small mb-3" style={{ borderRadius: 8 }}>
                    ✅ {successMsg}
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#0066cc' }}>📁 الأرشيف الرقمي</h2>
                    <p className="text-muted mb-0">المترشحون المؤرشفون — يمكن استعادتهم أو حذفهم نهائياً</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={fetchArchived} disabled={loading} title="تحديث">
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid mb-4">
                <div className="admin-card" style={{ borderLeftColor: '#6c757d' }}>
                    <p className="stat-label mb-1">إجمالي المؤرشفين</p>
                    <p className="stat-value" style={{ color: '#6c757d' }}>{archived.length}</p>
                    <small className="text-muted">مترشح مؤرشف</small>
                </div>
                <div className="admin-card" style={{ borderLeftColor: '#28a745' }}>
                    <p className="stat-label mb-1">الناجحون</p>
                    <p className="stat-value" style={{ color: '#28a745' }}>
                        {archived.filter((c) => c.status === 'ناجح').length}
                    </p>
                    <small className="text-muted">أتموا التدريب</small>
                </div>
                <div className="admin-card" style={{ borderLeftColor: '#0066cc' }}>
                    <p className="stat-label mb-1">إجمالي ما دُفع</p>
                    <p className="stat-value" style={{ color: '#0066cc', fontSize: '1.4rem' }}>
                        {fmt(archived.reduce((s, c) => s + Number(c.total_paid || 0), 0))} DH
                    </p>
                    <small className="text-muted">من المترشحين المؤرشفين</small>
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold mb-0">📋 قائمة المؤرشفين ({filtered.length})</h5>
                    <div className="input-group" style={{ maxWidth: 280 }}>
                        <span className="input-group-text bg-white"><Search size={15} /></span>
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
                                <th>الاسم</th>
                                <th>رقم التعريف</th>
                                <th>الحالة</th>
                                <th>المبلغ / المدفوع</th>
                                <th>الوثائق</th>
                                <th>تاريخ الأرشفة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-5">
                                        {search ? 'لا توجد نتائج' : 'الأرشيف فارغ'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="fw-bold">{c.name}</div>
                                            {c.name_fr && <small className="text-muted">{c.name_fr}</small>}
                                        </td>
                                        <td className="text-muted">{c.national_id || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${c.status === 'ناجح' ? 'active' : 'inactive'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ color: '#0066cc', fontWeight: 600 }}>
                                                {fmt(c.total_price)} DH
                                            </div>
                                            <small style={{ color: '#28a745' }}>
                                                مدفوع: {fmt(c.total_paid)} DH
                                            </small>
                                        </td>
                                        <td>
                                            <DocBadge url={c.id_card_url} label="بطاقة" />
                                            <DocBadge url={c.contract_url} label="عقد" />
                                            <DocBadge url={c.tax_receipt_url} label="ضريبة" />
                                        </td>
                                        <td className="text-muted small">
                                            {c.updated_at
                                                ? new Date(c.updated_at).toLocaleDateString('ar-MA')
                                                : '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm me-1"
                                                style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}
                                                title="استعادة المترشح"
                                                onClick={() => handleRestore(c.id, c.name)}
                                            >
                                                <RotateCcw size={14} className="me-1" />
                                                استعادة
                                            </button>
                                            <button
                                                className="btn btn-sm action-btn delete"
                                                title="حذف نهائي"
                                                onClick={() => handleDelete(c.id, c.name)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DigitalArchive;
