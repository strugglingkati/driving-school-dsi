import React from 'react';
import { Users, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';

const StatsCards = ({ totalCandidates, totalPayments, candidates }) => {
    
    // حساب الديون العالقة برمجياً: (مجموع الثمن الكلي لكل المترشحين - مجموع ما دفعوه)
    const totalDebt = candidates.reduce((sum, c) => {
        const remaining = (Number(c.total_price) || 0) - (Number(c.total_paid) || 0);
        return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    return (
        <div className="row g-3 mb-4 text-end">
            {/* بطاقة عدد المترشحين */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-5">
                    <div className="d-flex align-items-center justify-content-between flex-row-reverse">
                        <div className="bg-primary-subtle p-3 rounded-3 text-primary">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1 fw-bold">إجمالي المترشحين</p>
                            <h3 className="fw-black mb-0">{totalCandidates || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* بطاقة المداخيل (التي ذكرتها: 5746 DH) */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-5">
                    <div className="d-flex align-items-center justify-content-between flex-row-reverse">
                        <div className="bg-success-subtle p-3 rounded-3 text-success">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1 fw-bold">إجمالي المقبوضات</p>
                            <h3 className="fw-black mb-0 text-success font-monospace">
                                {Number(totalPayments).toLocaleString('fr-FR')} <small className="fs-6">DH</small>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* بطاقة الديون العالقة */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-danger border-5">
                    <div className="d-flex align-items-center justify-content-between flex-row-reverse">
                        <div className="bg-danger-subtle p-3 rounded-3 text-danger">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1 fw-bold">الديون العالقة</p>
                            <h3 className="fw-black mb-0 text-danger font-monospace">
                                {totalDebt.toLocaleString('fr-FR')} <small className="fs-6">DH</small>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;