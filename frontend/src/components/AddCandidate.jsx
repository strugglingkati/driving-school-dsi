import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Banknote, IdCard, MapPin } from 'lucide-react';

const AddCandidate = ({ onCandidateAdded, showToast }) => {
    const [formData, setFormData] = useState({
        name: '',
        name_fr: '',
        national_id: '',
        phone: '',
        address: '',
        license_type: 'B',
        total_price: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/candidates/add', formData);
            showToast("تمت إضافة المترشح بنجاح", "success");
            setFormData({ name: '', name_fr: '', national_id: '', phone: '', address: '', license_type: 'B', total_price: '' });
            if (onCandidateAdded) onCandidateAdded();
        } catch (err) {
            showToast(err.response?.data?.error || "خطأ في إضافة المترشح", "error");
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4 text-end" dir="rtl">
                <div className="d-flex align-items-center gap-2 mb-4 justify-content-end text-primary">
                    <h5 className="fw-bold mb-0">إضافة مترشح جديد</h5>
                    <UserPlus size={24} />
                </div>

                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">الاسم الكامل (عربي)</label>
                        <input 
                            type="text" required
                            className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                            placeholder="محمد أمين"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">الاسم الكامل (فرنسي)</label>
                        <input 
                            type="text"
                            className="form-control border-0 bg-light py-2 px-3 text-end rounded-3 shadow-none"
                            placeholder="Mohamed Amine"
                            value={formData.name_fr}
                            onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted d-block">رقم البطاقة الوطنية</label>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-white text-muted"><IdCard size={18} /></span>
                            <input 
                                type="text"
                                className="form-control border-0 bg-light py-2 px-3 text-center rounded-start-3 shadow-none"
                                placeholder="AB123456"
                                value={formData.national_id}
                                onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted d-block">رقم الهاتف</label>
                        <input 
                            type="text"
                            className="form-control border-0 bg-light py-2 px-3 text-center font-monospace rounded-3 shadow-none"
                            placeholder="06XXXXXXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted d-block">صنف الرخصة</label>
                        <select 
                            className="form-select border-0 bg-light py-2 text-end fw-bold rounded-3 shadow-none"
                            value={formData.license_type}
                            onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">العنوان الكامل</label>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-white text-muted"><MapPin size={18} /></span>
                            <input 
                                type="text"
                                className="form-control border-0 bg-light py-2 px-3 text-end rounded-start-3 shadow-none"
                                placeholder="شارع الكرامة، الدار البيضاء"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-danger d-block">الثمن المتفق عليه (DH)</label>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-danger-subtle text-danger"><Banknote size={18}/></span>
                            <input 
                                type="number" required
                                className="form-control border-0 bg-danger-subtle py-2 px-3 text-center fw-bold text-danger rounded-start-3 font-monospace shadow-none"
                                placeholder="3500"
                                value={formData.total_price}
                                onChange={(e) => setFormData({...formData, total_price: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-3">
                            حفظ بيانات المترشح
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCandidate;