import React from 'react';
import { X, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, sections, sidebarOpen, setSidebarOpen }) => {
    return (
        <>
            {/* Sidebar */}
            <div 
                className="sidebar"
                style={{
                    position: 'fixed',
                    right: sidebarOpen ? '0' : '-280px',
                    top: '0',
                    width: '280px',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                    color: 'white',
                    transition: 'right 0.3s ease',
                    zIndex: 1000,
                    overflowY: 'auto',
                    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)'
                }}
            >
                {/* Close Button (Mobile) */}
                <button 
                    className="btn btn-link text-white d-md-none"
                    onClick={() => setSidebarOpen(false)}
                    style={{ 
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 1001
                    }}
                >
                    <X size={24} />
                </button>

                {/* Sidebar Header */}
                <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                    <h5 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
                        🎓 مدرسة السياقة
                    </h5>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }} className="mb-0 mt-1">
                        لوحة تحكم الإدارة
                    </p>
                </div>

                {/* Navigation Items */}
                <nav style={{ padding: '1rem 0' }}>
                    {Object.entries(sections).map(([key, section]) => {
                        const Icon = section.icon;
                        const isActive = activeSection === key;
                        
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveSection(key);
                                    setSidebarOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    padding: '1rem 1.5rem',
                                    textAlign: 'right',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    borderRight: isActive ? '4px solid white' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem'
                                }}
                                className="nav-item"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Icon size={18} />
                                    <span className="fw-500">{section.name}</span>
                                </div>
                                {isActive && <ChevronRight size={18} />}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div 
                    style={{ 
                        position: 'absolute',
                        bottom: '1.5rem',
                        left: '0',
                        right: '0',
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                        fontSize: '0.875rem',
                        opacity: 0.9,
                        textAlign: 'center'
                    }}
                >
                    <p className="mb-1">نسخة 1.0.0</p>
                    <p className="mb-0">© 2026 جميع الحقوق محفوظة</p>
                </div>
            </div>

            {/* Sidebar Toggle Button (for collapsed state) */}
            {!sidebarOpen && (
                <button 
                    className="btn btn-primary"
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        zIndex: 999,
                        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none'
                    }}
                >
                    ☰
                </button>
            )}
        </>
    );
};

export default Sidebar;
