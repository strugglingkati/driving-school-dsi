import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Archive } from 'lucide-react';
import api from '../../../services/api';

const CandidateManager = ({ setLoading }) => {
    const [candidates, setCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        name_fr: '',
        national_id: '',
        phone: '',
        address: '',
        license_type: 'B',
        total_price: ''
    });
    const [editForm, setEditForm] = useState({
        id: null,
        name: '',
        name_fr: '',
        national_id: '',
        phone: '',
        address: '',
        license_type: 'B',
        total_price: '',
        status: ''
    });
    const [localLoading, setLocalLoading] = useState(false);
    const fetchInProgress = useRef(false);

    const fetchCandidates = async () => {
        if (fetchInProgress.current) return;
        fetchInProgress.current = true;
        setLocalLoading(true);
        try {
            const response = await api.get('/candidates/all');
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            fetchInProgress.current = false;
            setLocalLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const filteredCandidates = candidates.filter(candidate => {
        const term = searchTerm || '';
        const matchesSearch = 
            String(candidate.name || '').includes(term) ||
            String(candidate.national_id || '').includes(term) ||
            String(candidate.phone || '').includes(term);
        
        const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const resetAddForm = () => {
        setAddForm({
            name: '',
            name_fr: '',
            national_id: '',
            phone: '',
            address: '',
            license_type: 'B',
            total_price: ''
        });
    };

    const handleAddCandidateSubmit = async (e) => {
        e.preventDefault();
        if (localLoading) return;
        setLocalLoading(true);
        try {
            await api.post('/candidates/add', addForm);
            await fetchCandidates();
            setShowAddModal(false);
            resetAddForm();
        } catch (error) {
            console.error('Error adding candidate:', error);
            alert(error.response?.data?.error || 'فشل في إضافة المترشح');
        } finally {
            setLocalLoading(false);
        }
    };

    const handleEditCandidate = (candidate) => {
        setEditForm({
            id: candidate.id,
            name: candidate.name,
            name_fr: candidate.name_fr || '',
            national_id: candidate.national_id,
            phone: candidate.phone,
            address: candidate.address || '',
            license_type: candidate.license_type,
            total_price: candidate.total_price,
            status: candidate.status
        });
        setShowEditModal(true);
        setShowModal(false);
    };

    const handleEditCandidateSubmit = async (e) => {
        e.preventDefault();
        if (localLoading) return;
        setLocalLoading(true);
        try {
            await api.put(`/candidates/${editForm.id}`, editForm);
            await fetchCandidates();
            setShowEditModal(false);
            alert('تم تحديث بيانات المترشح بنجاح');
        } catch (error) {
            console.error('Error updating candidate:', error);
            alert(error.response?.data?.error || 'فشل في تحديث بيانات المترشح');
        } finally {
            setLocalLoading(false);
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المترشح؟')) return;
        if (localLoading) return;
        setLocalLoading(true);
        try {
            await api.delete(`/candidates/${candidateId}`);
            await fetchCandidates();
            setShowModal(false);
            alert('تم حذف المترشح بنجاح');
        } catch (error) {
            alert(error.response?.data?.error || 'فشل في حذف المترشح');
        } finally {
            setLocalLoading(false);
        }
    };

    const handleArchiveCandidate = async (candidateId) => {
        if (!window.confirm('هل تريد أرشفة هذا المترشح؟')) return;
        try {
            await api.put(`/candidates/${candidateId}/archive`);
            await fetchCandidates();
            setShowModal(false);
            alert('تم نقل المترشح إلى الأرشيف');
        } catch (error) {
            alert(error.response?.data?.error || 'فشل في أرشفة المترشح');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'جديد': 'info',
            'مرحلة الكود': 'warning',
            'مرحلة السياقة': 'primary',
            'جاهز للامتحان': 'success',
            'ناجح': 'success'
        };
        return colors[status] || 'secondary';
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: '#0066cc' }}>👥 إدارة المترشحين</h2>
                    <p className="text-muted">إدارة شاملة لجميع بيانات المترشحين والمتدربين</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} disabled={localLoading}>
                    <Plus size={18} className="ms-2" />
                    مترشح جديد
                </button>
            </div>

            {/* Search & Filter */}
            <div className="admin-card mb-4">
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-light"><Search size={18} /></span>
                            <input 
                                type="text" 
                                className="form-control border-0 bg-light"
                                placeholder="ابحث عن مترشح (الاسم، البطاقة الوطنية، الهاتف)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ textAlign: 'right' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <select 
                            className="form-select bg-light border-0"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ textAlign: 'right' }}
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="جديد">جديد</option>
                            <option value="مرحلة الكود">مرحلة الكود</option>
                            <option value="مرحلة السياقة">مرحلة السياقة</option>
                            <option value="جاهز للامتحان">جاهز للامتحان</option>
                            <option value="ناجح">ناجح</option>
                        </select>
                    </div>
                </div>
            </div>

            {localLoading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="mt-2 text-muted">جارٍ تحميل البيانات...</div>
                </div>
            ) : (
                <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>البطاقة الوطنية</th>
                            <th>الهاتف</th>
                            <th>صنف الرخصة</th>
                            <th>الحالة</th>
                            <th>الثمن الكلي</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map(candidate => {
                                const remaining = Math.max(0, Number(candidate.total_price) - Number(candidate.total_paid));
                                return (
                                <tr key={candidate.id}>
                                    <td className="fw-500">{candidate.name}</td>
                                    <td>{candidate.national_id}</td>
                                    <td>{candidate.phone}</td>
                                    <td className="text-center">
                                        <span className="badge bg-info">{candidate.license_type}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(candidate.status)}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="fw-600" style={{ color: '#0066cc' }}>
                                        {candidate.total_price} DH
                                    </td>
                                    <td className="fw-600" style={{ color: '#28a745' }}>
                                        {Number(candidate.total_paid || 0).toLocaleString('ar-MA')} DH
                                    </td>
                                    <td className="fw-600" style={{ color: remaining > 0 ? '#dc3545' : '#28a745' }}>
                                        {remaining.toLocaleString('ar-MA')} DH
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button 
                                                className="btn btn-sm action-btn view"
                                                title="عرض التفاصيل"
                                                onClick={() => {
                                                    setSelectedCandidate(candidate);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                className="btn btn-sm action-btn edit" 
                                                title="تعديل"
                                                onClick={() => handleEditCandidate(candidate)}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm action-btn delete"
                                                title="حذف"
                                                onClick={() => handleDeleteCandidate(candidate.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}
                                                title="أرشفة"
                                                onClick={() => handleArchiveCandidate(candidate.id)}
                                            >
                                                <Archive size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-4">
                                    <div className="empty-state">
                                        <p className="empty-state-text">لم يتم العثور على مترشحين</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            )}

            {/* Details Modal */}
            {showAddModal && (
                <div className="modal d-block show admin-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="admin-modal-content">
                            <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: 'white' }}>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                                <h5 className="modal-title fw-bold">إضافة مترشح جديد</h5>
                            </div>
                            <form onSubmit={handleAddCandidateSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الاسم الكامل (عربي)</label>
                                            <input 
                                                type="text" required
                                                placeholder="ادخل الاسم الكامل بالعربية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.name}
                                                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الاسم الكامل (فرنسي)</label>
                                            <input 
                                                type="text"
                                                placeholder="ادخل الاسم الكامل بالفرنسية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.name_fr}
                                                onChange={(e) => setAddForm({...addForm, name_fr: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">رقم البطاقة الوطنية</label>
                                            <input 
                                                type="text" required
                                                placeholder="رقم البطاقة الوطنية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.national_id}
                                                onChange={(e) => setAddForm({...addForm, national_id: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">رقم الهاتف</label>
                                            <input 
                                                type="text" required
                                                placeholder="رقم الهاتف"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.phone}
                                                onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">صنف الرخصة</label>
                                            <select 
                                                className="form-select border-0 bg-light py-2 text-end fw-bold rounded-3 shadow-none"
                                                value={addForm.license_type}
                                                onChange={(e) => setAddForm({...addForm, license_type: e.target.value})}
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">العنوان</label>
                                            <input 
                                                type="text"
                                                placeholder="العنوان"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.address}
                                                onChange={(e) => setAddForm({...addForm, address: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الثمن الكلي</label>
                                            <input 
                                                type="number" required
                                                placeholder="الثمن الكلي"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={addForm.total_price}
                                                onChange={(e) => setAddForm({...addForm, total_price: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        إغلاق
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        حفظ المترشح
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && selectedCandidate && (
                <div className="modal d-block show admin-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="admin-modal-content">
                            <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: 'white' }}>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                <h5 className="modal-title fw-bold">{selectedCandidate.name}</h5>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">البطاقة الوطنية</p>
                                        <p className="fw-500">{selectedCandidate.national_id}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">الهاتف</p>
                                        <p className="fw-500">{selectedCandidate.phone}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">صنف الرخصة</p>
                                        <p className="fw-500">{selectedCandidate.license_type}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">الحالة</p>
                                        <span className={`status-badge ${getStatusColor(selectedCandidate.status)}`}>
                                            {selectedCandidate.status}
                                        </span>
                                    </div>
                                    <div className="col-12">
                                        <p className="text-muted small mb-1">العنوان</p>
                                        <p className="fw-500">{selectedCandidate.address}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">الثمن الكلي</p>
                                        <p className="fw-600" style={{ color: '#0066cc', fontSize: '1.25rem' }}>
                                            {selectedCandidate.total_price} DH
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="text-muted small mb-1">المدفوع</p>
                                        <p className="fw-600" style={{ color: '#28a745', fontSize: '1.25rem' }}>
                                            {Number(selectedCandidate.total_paid || 0).toLocaleString('ar-MA')} DH
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                                >
                                    حذف
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={() => handleArchiveCandidate(selectedCandidate.id)}
                                >
                                    أرشفة
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    إغلاق
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleEditCandidate(selectedCandidate)}
                                >
                                    تعديل البيانات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="modal d-block show admin-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="admin-modal-content">
                            <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: 'white' }}>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                                <h5 className="modal-title fw-bold">تعديل بيانات المترشح</h5>
                            </div>
                            <form onSubmit={handleEditCandidateSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الاسم الكامل (عربي)</label>
                                            <input 
                                                type="text" required
                                                placeholder="ادخل الاسم الكامل بالعربية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الاسم الكامل (فرنسي)</label>
                                            <input 
                                                type="text"
                                                placeholder="ادخل الاسم الكامل بالفرنسية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.name_fr}
                                                onChange={(e) => setEditForm({...editForm, name_fr: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">رقم البطاقة الوطنية</label>
                                            <input 
                                                type="text" required
                                                placeholder="رقم البطاقة الوطنية"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.national_id}
                                                onChange={(e) => setEditForm({...editForm, national_id: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">رقم الهاتف</label>
                                            <input 
                                                type="text" required
                                                placeholder="رقم الهاتف"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">صنف الرخصة</label>
                                            <select 
                                                className="form-select border-0 bg-light py-2 text-end fw-bold rounded-3 shadow-none"
                                                value={editForm.license_type}
                                                onChange={(e) => setEditForm({...editForm, license_type: e.target.value})}
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">العنوان</label>
                                            <input 
                                                type="text"
                                                placeholder="العنوان"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الثمن الكلي</label>
                                            <input 
                                                type="number" required
                                                placeholder="الثمن الكلي"
                                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                                                value={editForm.total_price}
                                                onChange={(e) => setEditForm({...editForm, total_price: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">الحالة</label>
                                            <select 
                                                className="form-select border-0 bg-light py-2 text-end fw-bold rounded-3 shadow-none"
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                            >
                                                <option value="جديد">جديد</option>
                                                <option value="مرحلة الكود">مرحلة الكود</option>
                                                <option value="مرحلة السياقة">مرحلة السياقة</option>
                                                <option value="جاهز للامتحان">جاهز للامتحان</option>
                                                <option value="ناجح">ناجح</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        إلغاء
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={localLoading}>
                                        حفظ التعديلات
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateManager;
