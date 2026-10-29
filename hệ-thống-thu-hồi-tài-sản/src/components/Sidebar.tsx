import React from 'react';
import { Package, FileText, CheckSquare, Layers, UserCheck, Shield, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setView,
    records,
    activeRole,
    setActiveRole,
    currentEmployee,
    employees,
    setCurrentEmployeeId,
    resetDemoData,
  } = useApp();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none">
      {/* 1. Header: Logo & Tên hệ thống (STT 1, 2, 3) */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
          {/* Logo hình hộp */}
          <Package className="w-5 h-5 text-slate-100" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
            Thu hồi tài sản
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-tight">
            Quản lý nội bộ
          </p>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Menu chính: Thu hồi tài sản (STT 4) */}
        <button
          onClick={() => setView('list')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'list' || currentView === 'create' || currentView === 'detail'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Thu hồi tài sản</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            {records.length}
          </span>
        </button>

        {/* Menu: Xác nhận biên bản (Góc nhìn Nhân viên - Màn hình 10) */}
        <button
          onClick={() => {
            setActiveRole('employee');
            setView('employee_confirm');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'employee_confirm'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Xác nhận bàn giao (M10)</span>
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Nhân viên
          </span>
        </button>

        {/* Menu: Danh sách tài sản */}
        <button
          onClick={() => setView('asset_inventory')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'asset_inventory'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Danh sách tài sản</span>
          </div>
        </button>

        {/* Phân hệ thông tin / chuyển đổi vai trò kiểm thử */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Chế độ xem (Phân quyền)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setActiveRole('nvqlts');
                if (currentView === 'employee_confirm') setView('list');
              }}
              className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'nvqlts'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>NVQLTS</span>
            </button>
            <button
              onClick={() => {
                setActiveRole('employee');
                setView('employee_confirm');
              }}
              className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'employee'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhân viên</span>
            </button>
          </div>

          {activeRole === 'employee' && (
            <div className="mt-2 px-1">
              <label className="text-[11px] text-slate-500 block mb-1">
                Mô phỏng tài khoản nhân viên:
              </label>
              <select
                value={currentEmployee.id}
                onChange={(e) => setCurrentEmployeeId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </nav>

      {/* 3. Footer: Nút Reset Demo & Thông tin người dùng đăng nhập (STT 5, 6, 7) */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={resetDemoData}
          title="Khôi phục dữ liệu mẫu ban đầu theo SRS"
          className="w-full text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 py-1.5 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đặt lại dữ liệu mẫu SRS</span>
        </button>

        {/* Khối người dùng: Avatar "HC", Phòng HCNS, Quản trị viên */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-tight shrink-0">
            {activeRole === 'nvqlts' ? 'HC' : currentEmployee.avatarText}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {activeRole === 'nvqlts' ? 'Phòng HCNS' : currentEmployee.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {activeRole === 'nvqlts' ? 'Quản trị viên' : currentEmployee.department}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
