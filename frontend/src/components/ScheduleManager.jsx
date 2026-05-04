import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, X, Trash2 } from 'lucide-react';
import api from '../services/api';

const ScheduleManager = () => {
    const [appointments, setAppointments] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [bookingData, setBookingData] = useState({
        candidate_id: '',
        instructor: '',
        start: '',
        duration: '60',
    });

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await api.get('/appointments/all');
            setAppointments(res.data);
        } catch (err) {
            console.error('خطأ في جلب المواعيد:', err);
        }
    }, []);

    const fetchCandidates = useCallback(async () => {
        try {
            const res = await api.get('/candidates/all');
            setCandidates(res.data);
        } catch (err) {
            console.error('خطأ في جلب المترشحين:', err);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchAppointments(), fetchCandidates()]).finally(() => setLoading(false));
    }, [fetchAppointments, fetchCandidates]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const startTime = new Date(bookingData.start);
            const endTime = new Date(startTime.getTime() + Number(bookingData.duration) * 60000);
            await api.post('/appointments/add', {
                candidate_id: bookingData.candidate_id,
                instructor: bookingData.instructor || 'المدرب العام',
                type: 'تطبيقي',
                start: bookingData.start,
                end: endTime.toISOString(),
            });
            setShowAddModal(false);
            setBookingData({ candidate_id: '', instructor: '', start: '', duration: '60' });
            fetchAppointments();
        } catch (err) {
            setError(err.response?.data?.error || 'خطأ في الحجز، تأكد من ملء جميع الحقول');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل تريد حذف هذا الموعد؟')) return;
        try {
            await api.delete(`/appointments/${id}`);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            alert(err.response?.data?.error || 'فشل في حذف الموعد');
        }
    };

    const openAdd = () => {
        setError('');
        setBookingData({ candidate_id: '', instructor: '', start: '', duration: '60' });
        setShowAddModal(true);
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 text-end" dir="rtl">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                        <Calendar size={22} /> جدول حصص السياقة
                    </h5>
                    <div className="small text-muted mt-1">
                        {loading ? 'جارٍ التحميل...' : `${appointments.length} موعد مسجل`}
                    </div>
                </div>
                <button
                    className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                    onClick={openAdd}
                    disabled={loading || candidates.length === 0}
                >
                    <Plus size={18} className="me-1" /> حجز حصة
                </button>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            ) : appointments.length === 0 ? (
                <p className="text-center text-muted small py-3">لا توجد حصص محجوزة</p>
            ) : (
                <div className="vstack gap-2">
                    {appointments.map((app) => (
                        <div
                            key={app.id}
                            className="p-3 rounded-3 border-end border-primary border-3 bg-light shadow-sm d-flex justify-content-between align-items-center"
                        >
                            <button
                                className="btn btn-sm btn-outline-danger"
                                title="حذف الموعد"
                                onClick={() => handleDelete(app.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                            <div className="text-end">
                                <div className="fw-bold small text-dark">{app.candidate_name}</div>
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                    مدرب: {app.instructor_name} •{' '}
                                    {new Date(app.start_time).toLocaleString('ar-MA', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal d-block bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg text-end">
                            <form onSubmit={handleBooking}>
                                <div className="modal-header border-0 pb-0">
                                    <h6 className="fw-bold mb-0 w-100 text-end">📅 حجز حصة جديدة</h6>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    {error && (
                                        <div className="alert alert-danger py-2 small mb-3">{error}</div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">المترشح</label>
                                        <select
                                            className="form-select bg-light border-0"
                                            required
                                            value={bookingData.candidate_id}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, candidate_id: e.target.value })
                                            }
                                        >
                                            <option value="">-- اختر المترشح --</option>
                                            {candidates.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                    {c.national_id ? ` — ${c.national_id}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">اسم المدرب</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light border-0 text-end"
                                            placeholder="المدرب العام"
                                            value={bookingData.instructor}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, instructor: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">التاريخ والوقت</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control bg-light border-0"
                                            required
                                            value={bookingData.start}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, start: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">مدة الحصة</label>
                                        <select
                                            className="form-select bg-light border-0"
                                            value={bookingData.duration}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, duration: e.target.value })
                                            }
                                        >
                                            <option value="30">30 دقيقة</option>
                                            <option value="60">ساعة واحدة</option>
                                            <option value="90">ساعة ونصف</option>
                                            <option value="120">ساعتان</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 rounded-3 py-2 fw-bold"
                                        disabled={saving}
                                    >
                                        {saving && <span className="spinner-border spinner-border-sm me-2" />}
                                        تأكيد الحجز
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManager;
