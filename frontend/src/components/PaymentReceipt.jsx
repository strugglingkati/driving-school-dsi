import React from 'react';

const PaymentReceipt = ({ candidate, payment }) => {
    return (
        <div className="p-4 border rounded-3 bg-white shadow-sm mx-auto" style={{ maxWidth: '400px', borderStyle: 'dashed !important' }}>
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-1">مدرسة تعليم السياقة</h4>
                <p className="text-muted small">وصل استلام مبلغ مالي</p>
            </div>

            <div className="text-end border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">{candidate.name}</span>
                    <span className="text-muted">:السيد(ة)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">{payment.amount} DH</span>
                    <span className="text-muted">:المبلغ المؤدى</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="font-monospace small">{new Date(payment.created_at).toLocaleString('ar-MA')}</span>
                    <span className="text-muted">:التاريخ</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-muted mb-0">شكراً لثقتكم بنا</p>
                <div className="mt-2" style={{ height: '50px' }}>
                    {/* مكان للختم أو التوقيع */}
                    <small className="text-decoration-underline text-secondary">توقيع الإدارة</small>
                </div>
            </div>
            
            <button 
                className="btn btn-dark w-100 mt-3 no-print btn-sm" 
                onClick={() => window.print()}
            >
                طبع الوصل الآن
            </button>
        </div>
    );
};

export default PaymentReceipt;