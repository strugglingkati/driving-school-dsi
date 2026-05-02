import React from 'react';
import { X, Wallet, History, Trash2, UserPen, Archive, CheckCircle2 } from 'lucide-react';

const CandidateMenu = ({ 
    candidate, onClose, onPayment, onViewHistory, 
    onEdit, onDelete, onArchive, onUpdateStatus 
}) => {
    if (!candidate) return null;

    const remaining = (Number(candidate.total_price) || 0) - (Number(candidate.total_paid) || 0);

    // قائمة الحالات المتاحة
    const statuses = ['جديد', 'كود', 'سياقة', 'جاهز', 'ناجح'];

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    {/* Header */}
                    <div className="modal-header bg-primary text-white border-0 p-3">
                        <div className="text-end w-100">
                            <h6 className="fw-bold mb-0">{candidate.name}</h6>
                            <small className="badge bg-white text-primary rounded-pill mt-1">الباقي: {remaining} DH</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white ms-0 me-auto" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-3 text-end">
                        {/* قسم تغيير الحالة السريع */}
                        <div className="mb-3 px-1">
                            <label className="small text-muted mb-2 d-block fw-bold">تحديث الحالة التعليمية:</label>
                            <div className="d-flex flex-wrap gap-1 justify-content-end">
                                {statuses.map((s) => (
    <button
        key={s}
        onClick={() => onUpdateStatus(candidate.id, s)}
        className={`btn btn-sm rounded-pill ${
            candidate.status === s ? 'btn-primary' : 'btn-outline-light text-dark'
        }`}
    >
        {s}
    </button>
))}
                            </div>
                        </div>

                        <hr className="my-2 opacity-50" />

                        {/* قائمة العمليات الرئيسية */}
                        <div className="list-group list-group-flush border-0">
                            <button onClick={onPayment} className="list-group-item list-group-item-action border-0 rounded-3 py-2 d-flex align-items-center justify-content-between mb-1 shadow-sm">
                                <Wallet size={18} className="text-success" /><span className="fw-bold">تسجيل دفعة</span>
                            </button>

                            <button onClick={onViewHistory} className="list-group-item list-group-item-action border-0 rounded-3 py-2 d-flex align-items-center justify-content-between mb-1 shadow-sm">
                                <History size={18} className="text-primary" /><span className="fw-bold">سجل الدفعات</span>
                            </button>

                            <button onClick={onEdit} className="list-group-item list-group-item-action border-0 rounded-3 py-2 d-flex align-items-center justify-content-between mb-1 shadow-sm">
                                <UserPen size={18} className="text-dark" /><span className="fw-bold">تعديل المعلومات</span>
                            </button>

                            {/* زر الأرشفة يظهر فقط للناجحين */}
                            {candidate.status === 'ناجح' && (
                                <button onClick={() => onArchive(candidate.id)} className="list-group-item list-group-item-action border-0 rounded-3 py-2 d-flex align-items-center justify-content-between mb-1 shadow-sm bg-light text-info">
                                    <Archive size={18} /><span className="fw-bold">نقل إلى الأرشيف</span>
                                </button>
                            )}

                            <div className="my-2 border-top"></div>

                            <button onClick={() => { if(window.confirm('هل أنت متأكد من الحذف النهائي؟')) onDelete(candidate.id) }} className="list-group-item list-group-item-action border-0 rounded-3 py-2 d-flex align-items-center justify-content-between text-danger shadow-sm">
                                <Trash2 size={18} /><span className="fw-bold">حذف نهائي</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateMenu;