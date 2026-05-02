import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, DollarSign, Award } from 'lucide-react';

const Stats = () => {
    const [stats, setStats] = useState({ totalCandidates: 0, totalMoney: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await axios.get('http://localhost:5000/api/candidates/stats/summary');
            setStats(res.data);
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // تحديث كل 5 ثواني
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-6">
            <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-80">إجمالي المترشحين</p>
                    <h3 className="text-3xl font-bold">{stats.totalCandidates}</h3>
                </div>
                <Users size={40} className="opacity-30" />
            </div>
            
            <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-80">إجمالي المداخيل</p>
                    <h3 className="text-3xl font-bold">{stats.totalMoney} درهم</h3>
                </div>
                <DollarSign size={40} className="opacity-30" />
            </div>
        </div>
    );
};

export default Stats;