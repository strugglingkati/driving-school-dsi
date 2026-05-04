// src/components/Dashboard.jsx
import React from 'react';
import { Users, Wallet, GraduationCap, Activity, ShieldCheck, Download } from 'lucide-react';

const Dashboard = ({ stats }) => {
    const totalCandidates = stats.totalCandidates || 0;
    const totalMoney = stats.totalMoney || 0;
    const graduated = stats.graduated || 0;
    const dueAmount = stats.dueAmount || 0;
    const overdueCount = stats.overdueCount || 0;
    const inProgress = Math.max(totalCandidates - graduated, 0);
    const successRate = totalCandidates ? Math.round((graduated / totalCandidates) * 100) : 0;

    const downloadBackup = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/candidates/backup/export');
            const data = await response.json();
            const fileName = `backup-${new Date().toISOString().slice(0,10)}.json`;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('فشل تنزيل النسخة الاحتياطية');
        }
    };

    const cards = [
        {
            title: 'المترشحين النشطين',
            value: totalCandidates,
            icon: <Users size={24} />, 
            color: 'bg-primary',
            description: 'عدد المترشحين المسجلين حالياً'
        },
        {
            title: 'إجمالي المقبوضات',
            value: `${totalMoney.toLocaleString('fr-FR')} DH`,
            icon: <Wallet size={24} />,
            color: 'bg-success',
            description: 'المجموع الكلي للدفعات المستلمة'
        },
        {
            title: 'المديونية الإجمالية',
            value: `${dueAmount.toLocaleString('fr-FR')} DH`,
            icon: <ShieldCheck size={24} />,
            color: 'bg-danger',
            description: 'المبلغ المتبقي المستحق للمترشحين'
        },
        {
            title: 'متأخرون عن الدفع',
            value: overdueCount,
            icon: <Activity size={24} />,
            color: 'bg-warning',
            description: 'عدد المترشحين المتأخرين أكثر من 30 يوماً'
        }
    ];

    return (
        <div className="row g-4 mb-4 text-end">
            <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="row g-0 align-items-center">
                        <div className="col-lg-8 p-4">
                            <span className="badge bg-primary-subtle text-primary mb-3">لوحة تحكم المدرسة</span>
                            <h3 className="fw-bold mb-3">مرحباً بك في لوحة القيادة</h3>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="text-muted mb-0">احصل على نظرة سريعة على حالة المترشحين، الدفعات، ونسبة النجاح في النظام.</p>
                                <button onClick={downloadBackup} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 rounded-pill">
                                    <Download size={16} /> تحميل نسخة احتياطية
                                </button>
                            </div>
                            <div className="d-flex flex-wrap gap-3">
                                <div className="p-3 bg-light rounded-4 shadow-sm text-end" style={{minWidth: '180px'}}>
                                    <p className="text-muted small mb-1">المترشحون قيد المتابعة</p>
                                    <h4 className="fw-bold mb-0">{inProgress}</h4>
                                </div>
                                <div className="p-3 bg-light rounded-4 shadow-sm text-end" style={{minWidth: '180px'}}>
                                    <p className="text-muted small mb-1">نسبة النجاح</p>
                                    <h4 className="fw-bold mb-0">{successRate}%</h4>
                                </div>
                                <div className="p-3 bg-light rounded-4 shadow-sm text-end" style={{minWidth: '180px'}}>
                                    <p className="text-muted small mb-1">آخر تحديث</p>
                                    <h4 className="fw-bold mb-0">{new Date().toLocaleDateString('ar-MA')}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 bg-primary-subtle p-4 text-center">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{width: '96px', height: '96px'}}>
                                <Activity size={40} className="text-primary" />
                            </div>
                            <p className="text-muted mt-3">لوحة معلومات تفاعلية لتتبع مؤشرات الأداء الرئيسية.</p>
                            <div className="progress rounded-pill" style={{height: '10px'}}>
                                <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{width: `${successRate}%`}} aria-valuenow={successRate} aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <small className="text-primary fw-bold">نسبة النجاح {successRate}%</small>
                        </div>
                    </div>
                </div>
            </div>

            {cards.map((card, index) => (
                <div className="col-md-4" key={index}>
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4 text-end">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <p className="text-muted small mb-1">{card.title}</p>
                                    <h2 className="fw-bold mb-2">{card.value}</h2>
                                </div>
                                <div className={`p-3 rounded-4 text-white ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-muted small mb-0">{card.description}</p>
                        </div>
                    </div>
                </div>
            ))}

            <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-end">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h6 className="fw-bold mb-1">ملخص سريع</h6>
                            <p className="text-muted small mb-0">عرض أهداف الأداء والنقاط المهمة في النظام.</p>
                        </div>
                        <span className="badge bg-success text-white">محدث الآن</span>
                    </div>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="p-3 rounded-4 bg-light">
                                <p className="text-muted small mb-2">المدفوعات المستحقة</p>
                                <h5 className="fw-bold mb-0">{(totalMoney * 0.15).toLocaleString('fr-FR')} DH</h5>
                                <small className="text-success">زيادة بنسبة 8% عن الأسبوع الماضي</small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3 rounded-4 bg-light">
                                <p className="text-muted small mb-2">المترشحون في ملف الانتظار</p>
                                <h5 className="fw-bold mb-0">{Math.max(totalCandidates - graduated, 0)}</h5>
                                <small className="text-info">يمكن أرشفتهم بعد النجاح</small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3 rounded-4 bg-light">
                                <p className="text-muted small mb-2">الهدف الشهري</p>
                                <h5 className="fw-bold mb-0">{(totalCandidates + 10)} مترشح</h5>
                                <small className="text-danger">يبقى 10 مترشحين للوصول</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;