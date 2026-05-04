import React, { useState, useEffect } from 'react';
import { Lock, Download, Shield, Key, RefreshCw } from 'lucide-react';
import api from '../../../services/api';

const SecuritySettings = () => {
    const [passwordForm, setPasswordForm] = useState({ current: '', newPassword: '', confirm: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    const [backupLoading, setBackupLoading] = useState(false);

    useEffect(() => {
        api.get('/auth/users')
            .then(r => setUsers(r.data))
            .catch(err => console.error('Failed to load users:', err))
            .finally(() => setUsersLoading(false));
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirm) {
            setPwError('كلمة المرور الجديدة وتأكيدها غير متطابقتان');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPwError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setPwLoading(true);
        try {
            await api.post('/auth/change-password', {
                current: passwordForm.current,
                newPassword: passwordForm.newPassword,
            });
            setPwSuccess('تم تغيير كلمة المرور بنجاح');
            setPasswordForm({ current: '', newPassword: '', confirm: '' });
            setTimeout(() => setPwSuccess(''), 4000);
        } catch (err) {
            setPwError(err.response?.data?.error || 'حدث خطأ أثناء تغيير كلمة المرور');
        } finally {
            setPwLoading(false);
        }
    };

    const handleBackupDownload = async () => {
        setBackupLoading(true);
        try {
            const res = await api.get('/candidates/backup/export');
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('فشل في تحميل النسخة الاحتياطية');
        } finally {
            setBackupLoading(false);
        }
    };

    return (
        <div dir="rtl">
            <div className="mb-4">
                <h2 className="fw-bold" style={{ color: '#0066cc' }}>🔒 الإعدادات والأمان</h2>
                <p className="text-muted">إدارة الحسابات والنسخ الاحتياطية والأمان</p>
            </div>

            {/* ── Change Password ─────────────────────────── */}
            <div className="admin-card mb-4">
                <h5 className="fw-bold mb-3">🔑 تغيير كلمة المرور</h5>
                {pwError && <div className="alert alert-danger py-2 small mb-3">{pwError}</div>}
                {pwSuccess && <div className="alert alert-success py-2 small mb-3">✅ {pwSuccess}</div>}
                <form onSubmit={handleChangePassword}>
                    <div className="row g-3">
                        <div className="col-md-12">
                            <label className="form-label fw-bold small">كلمة المرور الحالية</label>
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-light"><Lock size={16} /></span>
                                <input
                                    type="password"
                                    className="form-control border-0 bg-light"
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    required
                                    style={{ textAlign: 'right' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">كلمة المرور الجديدة</label>
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-light"><Key size={16} /></span>
                                <input
                                    type="password"
                                    className="form-control border-0 bg-light"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{ textAlign: 'right' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">تأكيد كلمة المرور</label>
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-light"><Key size={16} /></span>
                                <input
                                    type="password"
                                    className="form-control border-0 bg-light"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    required
                                    style={{ textAlign: 'right' }}
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                                {pwLoading && <span className="spinner-border spinner-border-sm me-2" />}
                                تحديث كلمة المرور
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Users ─────────────────────────────────── */}
            <div className="admin-card mb-4">
                <h5 className="fw-bold mb-3">👥 حسابات المسؤولين</h5>
                {usersLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>اسم المستخدم</th>
                                    <th>الاسم الكامل</th>
                                    <th>الصلاحية</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الإنشاء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-3">
                                            لا يوجد مستخدمون
                                        </td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="fw-bold">{u.username}</td>
                                        <td>{u.full_name || '—'}</td>
                                        <td>
                                            <span className="badge bg-primary">{u.role}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                                                {u.is_active ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(u.created_at).toLocaleDateString('ar-MA')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Backup ─────────────────────────────────── */}
            <div className="admin-card">
                <h5 className="fw-bold mb-2">💾 النسخ الاحتياطية</h5>
                <p className="text-muted small mb-4">
                    تحميل نسخة احتياطية شاملة من قاعدة البيانات (المترشحون + الدفعات) بصيغة JSON
                </p>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="text-center p-4" style={{ border: '1px solid #e9ecef', borderRadius: 8 }}>
                            <Shield size={40} style={{ color: '#28a745', marginBottom: 12 }} />
                            <p className="fw-bold mb-1">نسخة احتياطية كاملة</p>
                            <small className="text-muted d-block mb-3">
                                جميع بيانات المترشحين والدفعات
                            </small>
                            <button
                                className="btn btn-success w-100"
                                onClick={handleBackupDownload}
                                disabled={backupLoading}
                            >
                                {backupLoading ? (
                                    <span className="spinner-border spinner-border-sm me-2" />
                                ) : (
                                    <Download size={16} className="me-2" />
                                )}
                                تحميل النسخة الاحتياطية
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="text-center p-4" style={{ border: '1px solid #e9ecef', borderRadius: 8 }}>
                            <RefreshCw size={40} style={{ color: '#0066cc', marginBottom: 12 }} />
                            <p className="fw-bold mb-1">تاريخ آخر نسخة</p>
                            <small className="text-muted d-block mb-3">
                                {new Date().toLocaleDateString('ar-MA')} — {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                            <div className="alert alert-info py-2 small mb-0">
                                يُنصح بالنسخ الاحتياطي اليومي لحماية بياناتك
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
