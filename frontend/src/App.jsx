import React, { useEffect, useState } from 'react';
import { useToast } from './hooks/useToast';
import Login from './components/Login';
import Admin from './pages/Admin/Admin';
import { setAuthToken, logout as apiLogout, verifyToken } from './services/api';

function App() {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('authUser') || 'null');
        if (token) setAuthToken(token);
        return token ? { token, user } : null;
    });
    const [authChecking, setAuthChecking] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    const handleLogin = ({ token, user }) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        setAuthToken(token);
        setAuth({ token, user });
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
        showToast('تم تسجيل الخروج بنجاح', 'info');
    };

    useEffect(() => {
        const init = async () => {
            if (!auth) {
                setAuthChecking(false);
                return;
            }

            try {
                await verifyToken();
            } catch (err) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setAuthToken(null);
                setAuth(null);
                showToast('جلسة تسجيل الدخول انتهت، الرجاء إعادة الدخول', 'error');
            } finally {
                setAuthChecking(false);
            }
        };

        init();
    }, [auth]);

    if (authChecking) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" dir="rtl">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                    <div className="mt-3 fw-bold">جاري التحقق من جاهزية النظام...</div>
                </div>
            </div>
        );
    }

    if (!auth) {
        return <Login onLogin={handleLogin} showToast={showToast} />;
    }

    return (
        <Admin user={auth.user} onLogout={handleLogout} />
    );
}

export default App;