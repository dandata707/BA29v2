import React from 'react';
import { FilterState } from '../types.ts';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Mã phiếu */}
        <div className="md:col-span-4">
          <label htmlFor="filter-code-input" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Mã phiếu
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              id="filter-code-input"
              type="text"
              value={filters.code}
              onChange={(e) => onFilterChange({ ...filters, code: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 text-[14px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-colors"
              placeholder="Nhập mã phiếu"
            />
          </div>
        </div>

        {/* Trạng thái */}
        <div className="md:col-span-3">
          <label htmlFor="filter-status-select" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Trạng thái
          </label>
          <div className="relative">
            <select
              id="filter-status-select"
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full appearance-none pl-3.5 pr-9 py-2 text-[14px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 transition-colors cursor-pointer"
            >
              <option value="Tất cả trạng thái">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Nháp">Nháp</option>
              <option value="Từ chối">Từ chối</option>
              <option value="Đã cấp phát">Đã cấp phát</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Loại yêu cầu */}
        <div className="md:col-span-3">
          <label htmlFor="filter-type-select" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Loại yêu cầu
          </label>
          <div className="relative">
            <select
              id="filter-type-select"
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="w-full appearance-none pl-3.5 pr-9 py-2 text-[14px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 transition-colors cursor-pointer"
            >
              <option value="Tất cả loại yêu cầu">Tất cả loại yêu cầu</option>
              <option value="Cho cá nhân">Cho cá nhân</option>
              <option value="Cho nhân viên mới">Cho nhân viên mới</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Xóa bộ lọc */}
        <div className="md:col-span-2 flex items-center pb-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-[14px] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
