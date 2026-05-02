import React, { useState } from 'react';
import { X, Printer, ArrowRight, History } from 'lucide-react';
import PaymentReceipt from './PaymentReceipt.jsx';

const HistoryModal = ({ candidate, history, onClose }) => {
    const [selectedPayment, setSelectedPayment] = useState(null);

    if (!candidate) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {selectedPayment ? (
                        /* واجهة معاينة الوصل */
                        <div className="modal-body p-4 text-center">
                            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                                <button 
                                    onClick={() => setSelectedPayment(null)} 
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                >
                                    <ArrowRight size={16} /> رجوع للسجل
                                </button>
                                <span className="fw-bold text-muted">وصل الاستلام</span>
                            </div>
                            <PaymentReceipt candidate={candidate} payment={selectedPayment} />
                        </div>
                    ) : (
                        /* واجهة جدول السجل */
                        <>
                            <div className="modal-header border-0 bg-light d-flex justify-content-between align-items-center px-4 py-3">
                                <button type="button" className="btn-close ms-0 me-auto" onClick={onClose}></button>
                                <div className="text-end">
                                    <h5 className="modal-title fw-bold text-primary d-flex align-items-center gap-2 justify-content-end">
                                        سجل المدفوعات <History size={20} />
                                    </h5>
                                    <small className="text-muted">{candidate.name}</small>
                                </div>
                            </div>

                            <div className="modal-body p-0">
                                <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                    <table className="table table-hover mb-0 text-end">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="py-3 px-4">المبلغ</th>
                                                <th className="py-3 text-center">التاريخ</th>
                                                <th className="py-3 text-center">الوصل</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.length > 0 ? history.map(h => (
                                                <tr key={h.id}>
                                                    <td className="py-3 px-4 fw-bold text-dark">{h.amount} DH</td>
                                                    <td className="py-3 text-center text-muted font-monospace small">
                                                        {new Date(h.created_at).toLocaleDateString('ar-MA')}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <button 
                                                            onClick={() => setSelectedPayment(h)}
                                                            className="btn btn-sm btn-light text-primary border-0"
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-5 text-muted small">لا توجد دفعات مسجلة بعد</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;