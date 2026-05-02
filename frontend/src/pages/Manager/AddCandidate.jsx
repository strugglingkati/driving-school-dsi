import React, { useState } from 'react';
import { registerCandidate } from '../../services/api';

const AddCandidate = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', license_type: 'B', total_price: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerCandidate(formData);
            alert("تم الحفظ بنجاح!");
        } catch {
            alert("فشل التسجيل");
        }
    };

    return (
        <div className="p-8 bg-white shadow-md rounded-lg max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">تسجيل مترشح جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="الاسم الكامل" className="w-full p-2 border rounded" 
                       onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="رقم الهاتف" className="w-full p-2 border rounded" 
                       onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    حفظ البيانات
                </button>
            </form>
        </div>
    );
};

export default AddCandidate;