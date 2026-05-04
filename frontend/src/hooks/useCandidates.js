// src/hooks/useCandidates.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCandidates = (showToast) => {
    const [candidates, setCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLicense, setFilterLicense] = useState('All');
    const [showOnlyDebt, setShowOnlyDebt] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);

    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/candidates/all');
            setCandidates(res.data);
            if (window.refreshStats) window.refreshStats();
        } catch { 
            if (showToast) showToast("فشل في جلب البيانات", "error"); 
        }
    };

  
    // 1. دالة تحديث حالة المترشح مع التحديث الفوري للواجهة
   const updateStatus = async (id, newStatus) => {
    try {
        // 1. تحديث السيرفر
        await axios.put(`http://localhost:5000/api/candidates/${id}/status`, { status: newStatus });

        // 2. تحديث المصفوفة الرئيسية فوراً (ليتغير الجدول)
        setCandidates(prev => prev.map(c => 
            c.id === id ? { ...c, status: newStatus } : c
        ));

        // 3. تحديث الكائن المختار (ليتغير المودال)
        setSelectedCandidate(prev => {
            if (prev && prev.id === id) {
                return { ...prev, status: newStatus };
            }
            return prev;
        });

        if (showToast) showToast(`تم التحديث إلى: ${newStatus}`, "success");
        
        // 4. إعادة جلب البيانات للتأكد من المزامنة
        fetchCandidates();
} catch { 
        if (showToast) showToast("فشل تحديث الحالة", "error");
    }
};
    // 2. دالة الأرشفة
    const archiveCandidate = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/candidates/${id}/archive`);
            if (showToast) showToast("تم نقل المترشح للأرشيف", "success");
            fetchCandidates();
        } catch { 
            if (showToast) showToast("فشل في أرشفة المترشح", "error"); 
        }
    };

    // 3. دالة الاستعادة من الأرشيف
    const restoreCandidate = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/candidates/${id}/restore`);
            if (showToast) showToast("تمت استعادة المترشح بنجاح", "success");
            fetchCandidates();
        } catch { 
            if (showToast) showToast("فشل في استعادة المترشح", "error"); 
        }
    };

    // منطق الفلترة والبحث
    const filteredCandidates = candidates.filter(c => {
        if (c.is_archived) return false;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            c.name?.toLowerCase().includes(searchLower) ||
            c.name_fr?.toLowerCase().includes(searchLower) ||
            c.national_id?.includes(searchTerm) ||
            c.phone?.includes(searchTerm);
        const matchesLicense = filterLicense === 'All' || c.license_type === filterLicense;
        const hasDebt = (Number(c.total_price) || 0) - (Number(c.total_paid) || 0) > 0;
        return matchesSearch && matchesLicense && (!showOnlyDebt || hasDebt);
    });

    useEffect(() => { 
        fetchCandidates();
        window.refreshCandidateList = fetchCandidates;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Return واحد فقط يحتوي على كل الدوال والقيم
    return {
        candidates: filteredCandidates,
        searchTerm, setSearchTerm,
        filterLicense, setFilterLicense,
        showOnlyDebt, setShowOnlyDebt,
        activeModal, setActiveModal,
        selectedCandidate, setSelectedCandidate,
        paymentHistory, setPaymentHistory,
        archiveCandidate,
        restoreCandidate,
        updateStatus, // تم إضافة الدالة هنا لتتمكن من استخدامها في المكونات
        refresh: fetchCandidates
    };
};