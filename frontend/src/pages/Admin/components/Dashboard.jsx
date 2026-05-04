import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, Calendar, FileCheck } from 'lucide-react';
import api from '../../../services/api';

const Dashboard = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        totalCandidates: 0,
        activeCandidates: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        upcomingAppointments: 0,
        completedTests: 0
    });
    const [loading, setLoading] = useState(true);

    const handleQuickAction = (action) => {
        if (!onNavigate) return;

        switch (action) {
            case 'newCandidate':
                onNavigate('candidates');
                break;
            case 'addPayment':
                onNavigate('financial');
                break;
            case 'bookAppointment':
                onNavigate('appointments');
                break;
            case 'uploadDocuments':
                onNavigate('archive');
                break;
            case 'downloadReport':
                onNavigate('financial');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        api.get('/candidates/stats')
            .then(r => setStats(r.data))
            .catch(err => console.error('Stats error:', err))
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            title: 'إجمالي المترشحين',
            value: stats.totalCandidates,
            icon: Users,
            color: 'info',
            change: '+2 هذا الأسبوع'
        },
        {
            title: 'المترشحون النشطون',
            value: stats.activeCandidates,
            icon: TrendingUp,
            color: 'success',
            change: `${Math.round((stats.activeCandidates / stats.totalCandidates * 100) || 0)}% نسبة النشاط`
        },
        {
            title: 'إجمالي الإيرادات',
            value: `${stats.totalRevenue.toLocaleString()} DH`,
            icon: DollarSign,
            color: 'primary',
            change: '+15% عن الشهر السابق'
        },
        {
            title: 'الدفعات المعلقة',
            value: `${stats.pendingPayments.toLocaleString()} DH`,
            icon: AlertCircle,
            color: 'warning',
            change: 'تحتاج متابعة عاجلة'
        },
        {
            title: 'المواعيد القادمة',
            value: stats.upcomingAppointments,
            icon: Calendar,
            color: 'info',
            change: 'اليوم والأسبوع القادم'
        },
        {
            title: 'الاختبارات المنجزة',
            value: stats.completedTests,
            icon: FileCheck,
            color: 'success',
            change: 'هذا الشهر'
        }
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div>
            {/* Title */}
            <div className="mb-4">
                <h2 className="fw-bold" style={{ color: '#0066cc' }}>📊 لوحة التحكم الرئيسية</h2>
                <p className="text-muted">ملخص شامل لأنشطة المدرسة والمترشحين</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    const colorClass = {
                        'primary': '#0066cc',
                        'success': '#28a745',
                        'warning': '#ffc107',
                        'info': '#17a2b8',
                        'danger': '#dc3545'
                    }[card.color];

                    return (
                        <div key={index} className="admin-card" style={{ borderLeftColor: colorClass }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <p className="stat-label mb-2">{card.title}</p>
                                    <p className="stat-value" style={{ color: colorClass }}>
                                        {card.value}
                                    </p>
                                    <small style={{ color: '#6c757d' }}>{card.change}</small>
                                </div>
                                <Icon size={32} style={{ color: colorClass, opacity: 0.2 }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts & Reports Section */}
            <div className="mt-5 row g-4">
                {/* Recent Activity */}
                <div className="col-lg-6">
                    <div className="admin-card">
                        <h5 className="fw-bold mb-3">🔔 النشاطات الأخيرة</h5>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #e9ecef' }}>
                                <p className="mb-1 fw-500">تم إضافة مترشح جديد</p>
                                <small className="text-muted">أحمد علي - منذ 2 ساعة</small>
                            </div>
                            <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #e9ecef' }}>
                                <p className="mb-1 fw-500">دفعة مالية استلمت</p>
                                <small className="text-muted">2,000 DH من فاطمة محمود - منذ 4 ساعات</small>
                            </div>
                            <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #e9ecef' }}>
                                <p className="mb-1 fw-500">موعد جديد مجدول</p>
                                <small className="text-muted">اختبار عملي - مع محمد خالد - اليوم الساعة 10:30</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-lg-6">
                    <div className="admin-card">
                        <h5 className="fw-bold mb-3">⚡ الإجراءات السريعة</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button type="button" className="btn btn-outline-primary w-100" onClick={() => handleQuickAction('newCandidate')}>
                                ➕ مترشح جديد
                            </button>
                            <button type="button" className="btn btn-outline-success w-100" onClick={() => handleQuickAction('addPayment')}>
                                💰 إضافة دفعة
                            </button>
                            <button type="button" className="btn btn-outline-info w-100" onClick={() => handleQuickAction('bookAppointment')}>
                                📅 حجز موعد
                            </button>
                            <button type="button" className="btn btn-outline-warning w-100" onClick={() => handleQuickAction('uploadDocuments')}>
                                📁 رفع وثائق
                            </button>
                            <button type="button" className="btn btn-outline-secondary w-100 col-12" onClick={() => handleQuickAction('downloadReport')}>
                                📊 تحميل تقرير
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performers & Alerts */}
            <div className="mt-4 row g-4">
                {/* Alerts */}
                <div className="col-lg-6">
                    <div className="admin-card" style={{ borderLeftColor: '#dc3545' }}>
                        <h5 className="fw-bold mb-3">⚠️ التنبيهات المهمة</h5>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <div className="alert alert-warning mb-3" role="alert">
                                <strong>تنبيه مالي:</strong> يوجد 5 مترشحين بديون معلقة أكثر من شهر
                            </div>
                            <div className="alert alert-info mb-3" role="alert">
                                <strong>موعد اقتراب:</strong> فحوصات تقنية لـ 3 سيارات في الأسبوع القادم
                            </div>
                            <div className="alert alert-danger mb-0" role="alert">
                                <strong>انتهاء رخصة:</strong> رخصة مدرب تنتهي في 15 يوماً
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="col-lg-6">
                    <div className="admin-card">
                        <h5 className="fw-bold mb-3">🖥️ حالة النظام</h5>
                        <div>
                            <div className="mb-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>تخزين قاعدة البيانات</span>
                                    <span className="badge bg-success">65%</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>استخدام الذاكرة</span>
                                    <span className="badge bg-info">42%</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar bg-info" style={{ width: '42%' }}></div>
                                </div>
                            </div>
                            <div className="mb-0">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>سرعة الاتصال</span>
                                    <span className="badge bg-success">الممتاز</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar bg-success" style={{ width: '95%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
