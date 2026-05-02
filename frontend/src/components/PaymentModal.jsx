import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';

const PaymentModal = ({ candidate, amount, setAmount, onSubmit, onBack }) => {
    return (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header border-0 pb-0">
                        <button type="button" className="btn-close ms-0 me-auto" onClick={onBack}></button>
                    </div>
                    <div className="modal-body text-center p-4">
                        <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-block mb-3">
                            <CreditCard size={32} />
                        </div>
                        <h5 className="fw-bold mb-1 text-dark">تسجيل دفعة جديدة</h5>
                        <p className="text-muted small mb-4">للمترشح: <span className="text-primary fw-bold">{candidate.name}</span></p>

                        <form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <label className="form-label d-block text-end fw-bold small text-secondary">المبلغ بالدرهم (DH)</label>
                                <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-start-0 text-muted font-monospace">DH</span>
                                    <input 
                                        type="number" 
                                        className="form-control border-end-0 text-center fw-bold" 
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mt-2 text-end">
                                    <small className="text-muted">الباقي الحالي: <span className="text-danger fw-bold">{candidate.total_price - candidate.total_paid} DH</span></small>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-sm">
                                تأكيد العملية <ArrowRight size={18} className="ms-2" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;