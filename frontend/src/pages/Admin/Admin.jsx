import React, { useState } from 'react';
import { LogOut, Menu, X, LayoutDashboard, Users, DollarSign, FileText, Settings, Shield, Calendar } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CandidateManager from './components/CandidateManager';
import FinancialControl from './components/FinancialControl';
import DigitalArchive from './components/DigitalArchive';
import SecuritySettings from './components/SecuritySettings';
import ScheduleManager from '../../components/ScheduleManager';
import './Admin.css';

const Admin = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const sections = {
        dashboard: { name: 'لوحة التحكم', icon: LayoutDashboard, component: Dashboard },
        candidates: { name: 'إدارة المترشحين', icon: Users, component: CandidateManager },
        financial: { name: 'التحكم المالي', icon: DollarSign, component: FinancialControl },
        appointments: { name: 'جدولة الحصص', icon: Calendar, component: ScheduleManager },
        archive: { name: 'الأرشفة الرقمية', icon: FileText, component: DigitalArchive },
        settings: { name: 'الإعدادات والأمان', icon: Settings, component: SecuritySettings }
    };

    const ActiveComponent = sections[activeSection].component;

    return (
        <div className="admin-container d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar 
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sections={sections}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="admin-main flex-grow-1" style={{ marginRight: sidebarOpen ? '280px' : '0', width: sidebarOpen ? 'calc(100% - 280px)' : '100%' }}>
                {/* Header */}
                <Header 
                    user={user}
                    onLogout={onLogout}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Content Area */}
                <div className="admin-content p-4" style={{ maxWidth: '100%' }}>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">جاري التحميل...</span>
                            </div>
                        </div>
                    ) : (
                        <ActiveComponent setLoading={setLoading} onNavigate={setActiveSection} />
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Admin;
