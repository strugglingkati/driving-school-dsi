import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Archive, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from './hooks/useToast';

import AddCandidate from './components/AddCandidate';
import CandidateList from './components/CandidateList';
import Dashboard from './components/Dashboard';
import ArchivePage from './components/ArchivePage';
import Toast from './components/Toast';
import Login from './components/Login';
import ScheduleManager from './components/ScheduleManager'; // تأكد من استيراد المكون الجديد
import { setAuthToken, logout as apiLogout } from './services/api';

function App() {
    const [stats, setStats] = useState({ totalCandidates: 0, totalMoney: 0, graduated: 0 });
    const [view, setView] = useState('home'); 
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('authUser') || 'null');
        if (token) setAuthToken(token);
        return token ? { token, user } : null;
    });
    const { toast, showToast, hideToast } = useToast();

    const refreshData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/candidates/stats/summary');
            setStats(res.data);
            if (window.refreshCandidateList) window.refreshCandidateList();
        } catch (err) {
            console.error("Error updating data:", err);
        }
    };

    const handleLogin = ({ token, user }) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        setAuthToken(token);
        setAuth({ token, user });
        refreshData();
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch {
            // ignore logout errors
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setAuthToken(null);
        setAuth(null);
    };

    useEffect(() => {
        refreshData();
        window.refreshStats = refreshData;
    }, []);

    if (!auth) {
        return <Login onLogin={handleLogin} showToast={showToast} />;
    }

    return (
        <div className="min-vh-100 bg-light pb-5" dir="rtl">
            {/* Navbar */}
            <nav className="navbar navbar-white bg-white shadow-sm mb-4">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold fs-4">
                        <LayoutDashboard size={28} />
                        <span>نظام مدرسة تعليم السياقة المطور</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button 
                            onClick={() => setView(view === 'home' ? 'archive' : 'home')} 
                            className={`btn btn-sm ${view === 'home' ? 'btn-outline-secondary' : 'btn-primary'} d-flex align-items-center gap-2 rounded-pill px-3`}
                        >
                            {view === 'home' ? <Archive size={18} /> : <LayoutDashboard size={18} />}
                            {view === 'home' ? 'الأرشيف' : 'الرئيسية'}
                        </button>
                        <button onClick={handleLogout} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 rounded-pill px-3">
                            تسجيل الخروج
                        </button>
                        <span className="text-muted small d-none d-md-block border-end pe-3">
                            {new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="container">
                {view === 'home' ? (
                    <>
                        {/* 1. لوحة الإحصائيات العلوية */}
                        <Dashboard stats={stats} />

                        <div className="row g-4 mt-2">
                            {/* 2. العمود الجانبي (الإضافة + المواعيد) */}
                            <div className="col-lg-4 order-lg-2">
                                {/* إضافة مترشح جديد */}
                                <div className="mb-4">
                                    <AddCandidate 
                                        onCandidateAdded={refreshData} 
                                        showToast={showToast} 
                                    />
                                </div>
                                
                                {/* نظام المواعيد (مثل بيرمينيو) */}
                                <ScheduleManager />
                            </div>

                            {/* 3. العمود الرئيسي (قائمة المترشحين) */}
                            <div className="col-lg-8 order-lg-1">
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                    <div className="card-header bg-white py-3 border-bottom-0">
                                        <h5 className="mb-0 fw-bold">إدارة المترشحين</h5>
                                    </div>
                                    <CandidateList showToast={showToast} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* واجهة الأرشيف */
                    <div className="animate__animated animate__fadeIn">
                        <ArchivePage onBack={() => setView('home')} />
                    </div>
                )}
            </div>

            {/* التنبيهات (Toast) */}
            {toast && <Toast {...toast} onClose={hideToast} />}
        </div>
    );
}

export default App;