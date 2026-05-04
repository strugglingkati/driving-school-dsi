import React from 'react';
import { LogOut, Menu, Bell, Search } from 'lucide-react';

const Header = ({ user, onLogout, sidebarOpen, setSidebarOpen }) => {
    return (
        <header 
            style={{
                background: 'white',
                borderBottom: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: '0',
                zIndex: 100
            }}
        >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left Side - Menu & Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        className="btn btn-link text-dark d-md-none"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="input-group" style={{ maxWidth: '300px', display: 'none' }}>
                        <span className="input-group-text border-0 bg-light"><Search size={18} /></span>
                        <input 
                            type="text" 
                            className="form-control border-0 bg-light"
                            placeholder="ابحث هنا..."
                            style={{ textAlign: 'right' }}
                        />
                    </div>
                </div>

                {/* Right Side - User Info & Notifications */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Notifications */}
                    <button className="btn btn-link text-dark position-relative">
                        <Bell size={20} />
                        <span 
                            className="badge bg-danger position-absolute"
                            style={{ top: '-5px', right: '-5px', fontSize: '0.65rem' }}
                        >
                            3
                        </span>
                    </button>

                    {/* User Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p className="mb-0 fw-600" style={{ color: '#333' }}>
                                {user?.full_name || 'المشرف'}
                            </p>
                            <small style={{ color: '#6c757d' }}>
                                {user?.role === 'admin' ? 'مشرف النظام' : 'مستخدم'}
                            </small>
                        </div>
                        <div 
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.125rem'
                            }}
                        >
                            {user?.full_name ? user.full_name[0] : 'A'}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button 
                        className="btn btn-outline-danger"
                        onClick={onLogout}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        <LogOut size={18} className="ms-2" />
                        <span>خروج</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
