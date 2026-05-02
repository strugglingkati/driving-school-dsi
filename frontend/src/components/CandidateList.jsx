import React, { useState } from 'react';
import axios from 'axios';
import { useCandidates } from '../hooks/useCandidates';

import SearchFilters from './SearchFilters';
import CandidateTable from './CandidateTable';
import CandidateMenu from './CandidateMenu';
import PaymentModal from './PaymentModal';
import HistoryModal from './HistoryModal';
import EditCandidateModal from './EditCandidateModal';

const CandidateList = ({ showToast }) => {
    const [amount, setAmount] = useState('');
    
    // استخراج الدوال الجديدة (updateStatus, archiveCandidate) من الـ Hook
    const { 
        candidates, searchTerm, setSearchTerm, filterLicense, setFilterLicense,
        showOnlyDebt, setShowOnlyDebt, activeModal, setActiveModal,
        selectedCandidate, setSelectedCandidate, paymentHistory, setPaymentHistory, 
        refresh, updateStatus, archiveCandidate 
    } = useCandidates(showToast);

    // دالة موحدة للتعامل مع العمليات (Pay, Update, Delete)
    const handleAction = async (type, payload) => {
        try {
            const baseUrl = 'http://localhost:5000/api/candidates';
            
            if (type === 'pay') {
                await axios.post(`${baseUrl}/payments/add`, payload);
            } else if (type === 'update') {
                await axios.put(`${baseUrl}/${payload.id}`, payload.data);
            } else if (type === 'delete') {
                await axios.delete(`${baseUrl}/${payload}`);
            }
            
            showToast("تمت العملية بنجاح");
            setActiveModal(null);
            refresh(); // تحديث القائمة والإحصائيات
        } catch { 
            showToast("فشل في تنفيذ العملية", "error"); 
        }
    };

    const fetchHistory = async (candidate) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/candidates/${candidate.id}/payments`);
            setPaymentHistory(res.data);
            setSelectedCandidate(candidate);
            setActiveModal('history');
} catch { 
            showToast("خطأ في جلب السجل", "error");
        }
    };

    return (
        <div className="mt-4 text-end" dir="rtl">
            <SearchFilters 
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterLicense={filterLicense} setFilterLicense={setFilterLicense}
                showOnlyDebt={showOnlyDebt} setShowOnlyDebt={setShowOnlyDebt}
            />
            
            <CandidateTable 
                candidates={candidates} 
                onRowClick={(c) => { setSelectedCandidate(c); setActiveModal('menu'); }} 
            />

            {/* مودال القائمة (المنيو) - أضفنا onUpdateStatus و onArchive */}
           {activeModal === 'menu' && (
    <CandidateMenu 
        // مرر selectedCandidate القادم من الـ Hook وليس أي شيء آخر
        candidate={selectedCandidate} 
        onClose={() => setActiveModal(null)}
        onUpdateStatus={updateStatus} // الدالة القادمة من الـ Hook
        onArchive={archiveCandidate}
        onPayment={() => setActiveModal('payment')}
        onViewHistory={() => fetchHistory(selectedCandidate)}
        onEdit={() => setActiveModal('edit')}
        onDelete={(id) => handleAction('delete', id)}
    />
)}

            {activeModal === 'payment' && (
                <PaymentModal 
                    candidate={selectedCandidate} 
                    amount={amount} setAmount={setAmount}
                    onSubmit={(e) => { 
                        e.preventDefault(); 
                        handleAction('pay', {candidate_id: selectedCandidate.id, amount}); 
                        setAmount(''); // تصفير الحقل بعد الدفع
                    }} 
                    onBack={() => setActiveModal('menu')} 
                />
            )}

            {activeModal === 'history' && (
                <HistoryModal 
                    candidate={selectedCandidate} 
                    history={paymentHistory} 
                    onClose={() => setActiveModal('menu')} 
                />
            )}

            {activeModal === 'edit' && (
                <EditCandidateModal 
                    candidate={selectedCandidate} 
                    onClose={() => setActiveModal(null)}
                    onUpdate={(id, data) => handleAction('update', {id, data})} 
                />
            )}
        </div>
    );
};

export default CandidateList;