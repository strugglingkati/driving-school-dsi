import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Car, Plus, X } from 'lucide-react';
import axios from 'axios';

const ScheduleManager = () => {
    const [appointments, setAppointments] = useState([]);
    const [candidates, setCandidates] = useState([]); // أضفنا هذه الحالة لتخزين المترشحين
    const [showAddModal, setShowAddModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        candidate_id: '',
        instructor: 'المدرب العام',
        start: '',
        duration: '60'
    });

    // 1. جلب المواعيد
    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/appointments/all');
            setAppointments(res.data);
        } catch { 
            console.error("خطأ في جلب المواعيد"); 
        }
    };

    // 2. جلب المترشحين لتعبئة قائمة الاختيار (Select)
    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/candidates');
            // تأكد أن السيرفر يرسل المصفوفة مباشرة أو داخل res.data
            setCandidates(res.data);
        } catch (err) {
            console.error("خطأ في جلب قائمة المترشحين:", err);
        }
    };

    // استدعاء الدوال عند تحميل المكون
    useEffect(() => { 
        fetchAppointments(); 
        fetchCandidates(); 
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const startTime = new Date(bookingData.start);
            const endTime = new Date(startTime.getTime() + bookingData.duration * 60000);

            await axios.post('http://localhost:5000/api/appointments/add', {
                candidate_id: bookingData.candidate_id,
                instructor: bookingData.instructor,
                type: 'تطبيقي',
                start: bookingData.start,
                end: endTime.toISOString()
            });

            setShowAddModal(false);
            fetchAppointments();
            setBookingData({ candidate_id: '', instructor: 'المدرب العام', start: '', duration: '60' });
        } catch {
            alert("خطأ في الحجز، تأكد من ملء جميع الحقول");
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 text-end" dir="rtl">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                    <Calendar size={22} /> جدول حصص السياقة
                </h5>
                <button 
                    className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} /> حجز حصة
                </button>
            </div>

            {/* عرض المواعيد */}
            <div className="vstack gap-2">
                {appointments.length > 0 ? appointments.map((app) => (
                    <div key={app.id} className="p-3 rounded-3 border-end border-primary border-3 bg-light shadow-sm text-end">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold small text-dark">{app.candidate_name}</span>
                            <span className="badge bg-white text-primary border border-primary-subtle rounded-pill">
                                {new Date(app.start_time).toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <div className="text-muted x-small mt-1" style={{fontSize: '11px'}}>
                            <Car size={12} className="ms-1" /> مدرب: {app.instructor_name}
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-muted small py-3">لا توجد حصص محجوزة</p>
                )}
            </div>

            {/* نافذة الحجز (Modal) */}
            {showAddModal && (
                <div className="modal d-block bg-dark bg-opacity-50" style={{zIndex: 1050}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg text-end">
                            <form onSubmit={handleBooking}>
                                <div className="modal-header border-0 pb-0 flex-row-reverse">
                                    <h6 className="fw-bold mb-0">حجز حصة تطبيقية جديدة</h6>
                                    <button type="button" className="btn-close ms-0 me-auto" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3 text-end">
                                        <label className="form-label small fw-bold text-muted">اسم المترشح</label>
                                        <select 
                                            className="form-select bg-light border-0" 
                                            required
                                            value={bookingData.candidate_id}
                                            onChange={(e) => setBookingData({...bookingData, candidate_id: e.target.value})}
                                        >
                                            <option value="">-- اختر من القائمة --</option>
                                            {candidates.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-md-12 mb-3 text-end">
                                            <label className="form-label small fw-bold text-muted">التاريخ والوقت</label>
                                            <input 
                                                type="datetime-local" 
                                                className="form-control bg-light border-0 text-end" 
                                                required
                                                onChange={(e) => setBookingData({...bookingData, start: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3 text-end">
                                            <label className="form-label small fw-bold text-muted">اسم المدرب</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0 text-end" 
                                                value={bookingData.instructor}
                                                onChange={(e) => setBookingData({...bookingData, instructor: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="submit" className="btn btn-primary w-100 rounded-3 py-2 fw-bold shadow-sm">
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