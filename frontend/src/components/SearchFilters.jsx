// src/components/SearchFilters.jsx
import React from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';

const SearchFilters = ({ searchTerm, setSearchTerm, filterLicense, setFilterLicense, showOnlyDebt, setShowOnlyDebt }) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-center">
                {/* البحث بالاسم أو الهاتف */}
                <div className="col-md-5">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted">
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0 shadow-none" 
                            placeholder="ابحث بالاسم، رقم الهاتف أو رقم البطاقة الوطنية..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* الفلترة حسب صنف الرخصة */}
                <div className="col-md-3">
                    <div className="d-flex align-items-center gap-2">
                        <Filter size={18} className="text-muted" />
                        <select 
                            className="form-select shadow-none border-0 bg-light" 
                            value={filterLicense}
                            onChange={(e) => setFilterLicense(e.target.value)}
                        >
                            <option value="All">كل الأصناف</option>
                            <option value="B">صنف B</option>
                            <option value="A">صنف A</option>
                            <option value="C">صنف C</option>
                            <option value="D">صنف D</option>
                        </select>
                    </div>
                </div>

                {/* فلترة الديون المتأخرة */}
                <div className="col-md-4 text-start">
                    <div className="form-check form-switch d-inline-block">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch" 
                            id="debtSwitch"
                            checked={showOnlyDebt}
                            onChange={(e) => setShowOnlyDebt(e.target.checked)}
                        />
                        <label className="form-check-label fw-bold small me-2" htmlFor="debtSwitch">
                            <AlertCircle size={14} className="text-danger me-1" />
                            عرض المديونين فقط
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;