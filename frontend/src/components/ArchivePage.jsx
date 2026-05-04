// src/components/ArchivePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, Trash2, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ArchivePage = ({ onBack }) => {
    const [archived, setArchived] = useState([]);

    const fetchArchived = async () => {
        const res = await axios.get('http://localhost:5000/api/candidates/archived');
        setArchived(res.data);
    };

    const restoreCandidate = async (id) => {
        await axios.put(`http://localhost:5000/api/candidates/${id}/restore`);
        fetchArchived();
    };

    useEffect(() => { fetchArchived(); }, []);

    return (
        <div className="container py-4 text-end">
            <button className="btn btn-sm btn-outline-secondary mb-4 d-flex align-items-center gap-2 ms-auto" onClick={onBack}>
                <ArrowRight size={18} /> العودة للرئيسية
            </button>
            
            <h4 className="fw-bold mb-4">أرشيف المترشحين (الناجحين والقدامى)</h4>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="py-3 px-4">المترشح</th>
                                <th className="text-center">الهوية</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">المدفوع</th>
                                <th className="text-center">الباقي</th>
                                <th className="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archived.map(c => {
                                const remaining = (Number(c.total_price) || 0) - (Number(c.total_paid) || 0);
                                return (
                                    <tr key={c.id}>
                                        <td className="py-3 px-4">
                                            <div className="fw-bold">{c.name}</div>
                                            <small className="text-muted d-block">{c.address || 'بدون عنوان'}</small>
                                        </td>
                                        <td className="text-center text-muted">{c.national_id || '---'}</td>
                                        <td className="text-center"><StatusBadge status={c.status} /></td>
                                        <td className="text-center text-success fw-bold">{Number(c.total_paid || 0).toFixed(2)} DH</td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${remaining > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                {remaining.toFixed(2)} DH
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-light text-primary" title="استعادة" onClick={() => restoreCandidate(c.id)}>
                                                <RotateCcw size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;