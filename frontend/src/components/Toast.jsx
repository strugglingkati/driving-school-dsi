import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); // يختفي بعد 3 ثوانٍ
        return () => clearTimeout(timer);
    }, [onClose]);

    // تحديد لون الأيقونة والخلفية بناءً على النوع
    const isSuccess = type === 'success';
    
    return (
        <div 
            className={`position-fixed bottom-0 start-0 m-4 shadow-lg animate-slide-up z-index-master`}
            style={{ zIndex: 1080 }}
        >
            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} border-0 rounded-4 d-flex align-items-center gap-3 px-4 py-3 mb-0`}>
                {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <div className="fw-bold text-end pe-2" style={{ minWidth: '150px' }}>
                    {message}
                </div>
                <button 
                    onClick={onClose} 
                    className="btn-close ms-2 me-0" 
                    style={{ fontSize: '0.8rem' }}
                ></button>
            </div>
        </div>
    );
};

export default Toast;