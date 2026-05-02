// src/components/CandidateTable.jsx
import React from 'react';
import StatusBadge from './StatusBadge';

const CandidateTable = ({ candidates, onRowClick }) => (
    <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-end">
                <thead className="table-light">
                    <tr>
                        <th className="py-3 px-4">المترشح</th>
                        <th className="py-3 text-center">الصنف</th>
                        <th className="py-3 text-center">الحالة</th>
                        <th className="py-3 text-center text-success">المدفوع</th>
                        <th className="py-3 text-center text-danger">الباقي</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(c => {
                        const remaining = (Number(c.total_price) || 0) - (Number(c.total_paid) || 0);
                        // حساب أيام التأخير
const lastDate = c.last_payment_date || c.created_at;
const daysDiff = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
const isLate = remaining > 0 && daysDiff > 30;

// ثم داخل الخلية (td) الخاصة بالاسم:
<td className="py-3 px-4">
    <div className="d-flex align-items-center gap-2">
        {isLate && <AlertCircle size={16} className="text-danger shadow-sm" title="متأخر عن الدفع!" />}
        <div className="fw-bold text-dark">{c.name}</div>
    </div>
    <small className="text-muted font-monospace">{c.phone || '---'}</small>
</td>
                        return (
                            <tr key={c.id} onClick={() => onRowClick(c)} style={{ cursor: 'pointer' }}>
                                <td className="py-3 px-4">
                                    <div className="fw-bold text-dark">{c.name}</div>
                                    <small className="text-muted font-monospace">{c.phone || '---'}</small>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-light text-dark border">{c.license_type}</span>
                                </td>
                                <td className="text-center"><StatusBadge status={c.status || 'جديد'} /></td>
                                <td className="text-center text-success fw-bold">{c.total_paid} DH</td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill ${remaining > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                        {remaining} DH
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

export default CandidateTable;