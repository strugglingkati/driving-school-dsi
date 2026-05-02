import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock, User } from 'lucide-react';

const Login = ({ onLogin, showToast }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
            onLogin(response.data);
            showToast('تم تسجيل الدخول بنجاح', 'success');
        } catch (error) {
            showToast(error.response?.data?.error || 'فشل تسجيل الدخول', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" dir="rtl">
            <div className="card shadow-lg rounded-4 p-5" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle" style={{ width: '72px', height: '72px' }}>
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h4 className="fw-bold mt-3">تسجيل الدخول</h4>
                    <p className="text-muted small">أدخل بيانات اعتماد المسؤول للاستمرار.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-end">
                        <label className="form-label small fw-bold">اسم المستخدم</label>
                        <div className="input-group input-group-lg rounded-4 overflow-hidden bg-white shadow-sm">
                            <span className="input-group-text border-0 bg-white"><User size={18} /></span>
                            <input
                                type="text"
                                className="form-control border-0"
                                placeholder="admin"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4 text-end">
                        <label className="form-label small fw-bold">كلمة المرور</label>
                        <div className="input-group input-group-lg rounded-4 overflow-hidden bg-white shadow-sm">
                            <span className="input-group-text border-0 bg-white"><Lock size={18} /></span>
                            <input
                                type="password"
                                className="form-control border-0"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-4 shadow-sm" disabled={loading}>
                        {loading ? 'جاري التسجيل...' : 'دخول'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;