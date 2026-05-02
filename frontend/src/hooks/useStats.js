// src/hooks/useStats.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useStats = () => {
    const [stats, setStats] = useState({ totalCandidates: 0, totalMoney: 0, graduated: 0 });

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/candidates/stats/summary');
            setStats(res.data);
        } catch (err) { console.error("Error fetching stats", err); }
    };

    useEffect(() => {
        fetchStats();
        // جعل الدالة متاحة عالمياً لتحديث الإحصائيات عند أي عملية دفع أو أرشفة
        window.refreshStats = fetchStats;
    }, []);

    return stats;
};