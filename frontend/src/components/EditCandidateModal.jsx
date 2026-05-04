import React, { useState, useEffect } from 'react';
import { Save, UserPen, Banknote, GraduationCap, IdCard, MapPin } from 'lucide-react';

const EditCandidateModal = ({ candidate, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({ 
        name: '',
        name_fr: '',
        national_id: '',
        phone: '',
        address: '',
        license_type: '',
        total_price: '',
        status: '' 
    });

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name,
                name_fr: candidate.name_fr || '',
                national_id: candidate.national_id || '',
                phone: candidate.phone || '',
                address: candidate.address || '',
                license_type: candidate.license_type || 'B',
                total_price: candidate.total_price || '',
                status: candidate.status || 'جديد'
            });
        }
    }, [candidate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(candidate.id, formData);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header border-0 bg-light p-4">
                        <button type="button" className="btn-close ms-0 me-auto shadow-none" onClick={onClose}></button>
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                             تعديل ملف المترشح <UserPen size={20} className="text-primary" />
                        </h5>
                    </div>

                    <div className="modal-body p-4 text-end">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted">الاسم الكامل (عربي)</label>
                                    <input type="text" required className="form-control border-0 bg-light py-2 text-end"
                                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-bold text-muted">الاسم الكامل (فرنسي)</label>
                                    <input type="text" className="form-control border-0 bg-light py-2 text-end"
                                        value={formData.name_fr} onChange={(e) => setFormData({...formData, name_fr: e.target.value})} />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label small fw-bold text-muted">رقم البطاقة الوطنية</label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 bg-white text-muted"><IdCard size={18} /></span>
                                        <input type="text" className="form-control border-0 bg-light py-2 text-center rounded-start-3 shadow-none"
                                            value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} />
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label small fw-bold text-muted">رقم الهاتف</label>
                                    <input type="text" className="form-control border-0 bg-light py-2 text-center font-monospace"
                                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label small fw-bold text-muted">صنف الرخصة</label>
                                    <select className="form-select border-0 bg-light py-2 text-end"
                                        value={formData.license_type} onChange={(e) => setFormData({...formData, license_type: e.target.value})}>
                                        <option value="A">A</option> <option value="B">B</option>
                                        <option value="C">C</option> <option value="D">D</option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">العنوان الكامل</label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 bg-white text-muted"><MapPin size={18} /></span>
                                        <input type="text" className="form-control border-0 bg-light py-2 text-end"
                                            value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted d-flex align-items-center justify-content-end gap-2">
                                        حالة المترشح الحالية <GraduationCap size={16} className="text-info" />
                                    </label>
                                    <select className="form-select border-0 bg-info-subtle py-2 text-end fw-bold"
                                        value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                        <option value="جديد">جديد</option>
                                        <option value="مرحلة الكود">مرحلة الكود</option>
                                        <option value="مرحلة السياقة">مرحلة السياقة</option>
                                        <option value="جاهز للامتحان">جاهز للامتحان</option>
                                        <option value="ناجح">ناجح</option>
                                    </select>
                                </div>

                                <div className="col-12 mt-4 p-3 bg-danger-subtle rounded-3 text-center">
                                    <label className="form-label small fw-bold text-danger d-flex align-items-center justify-content-center gap-2">
                                        تعديل الثمن الكلي <Banknote size={16} />
                                    </label>
                                    <input type="number" required className="form-control border-0 py-2 text-center fw-bold text-danger font-monospace fs-4 bg-transparent shadow-none"
                                        value={formData.total_price} onChange={(e) => setFormData({...formData, total_price: e.target.value})} />
                                </div>
                            </div>

                            <div className="d-flex gap-2 flex-row-reverse mt-4">
                                <button type="submit" className="btn btn-primary flex-grow-1 fw-bold py-2 shadow-sm border-0">
                                    حفظ التغييرات <Save size={18} className="ms-2" />
                                </button>
                                <button type="button" className="btn btn-light py-2 px-4 border" onClick={onClose}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCandidateModal;