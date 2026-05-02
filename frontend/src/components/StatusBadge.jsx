// src/components/StatusBadge.jsx
const StatusBadge = ({ status }) => {
    const configs = {
        'جديد': { bg: '#e0f2fe', text: '#0369a1' },
        'كود': { bg: '#fef9c3', text: '#854d0e' },
        'سياقة': { bg: '#ffedd5', text: '#9a3412' },
        'جاهز': { bg: '#dcfce7', text: '#166534' },
        'ناجح': { bg: '#f0fdf4', text: '#15803d', border: '1px solid #bdf4d4' }
    };

    const style = configs[status] || configs['جديد'];

    return (
        <span className="badge rounded-pill px-3 py-2 fw-bold shadow-sm" style={{ backgroundColor: style.bg, color: style.text, border: style.border }}>
            {status}
        </span>
    );
};

export default StatusBadge;