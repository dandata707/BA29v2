import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    availablePersonas,
    currentView,
    navigateTo,
    requests,
    addToast,
  } = useTransfer();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Stats for badge
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <aside className="w-[230px] shrink-0 border-r border-[#c2c6d5] bg-white flex flex-col justify-between select-none">
      <div className="p-4">
        {/* Logo and Brand */}
        <div
          onClick={() => navigateTo('list')}
          className="flex items-center gap-3 pb-5 border-b border-[#c2c6d5] cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#283044] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#faf8ff] text-[20px]">
              swap_horiz
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#131b2e] truncate leading-tight group-hover:text-primary transition-colors">
              Điều chuyển tài sản
            </h1>
            <p className="text-[11px] text-[#424753] truncate leading-tight mt-0.5">
              Quản lý nội bộ
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-4">
          <button
            onClick={() => navigateTo('list')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              currentView === 'list' || currentView === 'review' || currentView === 'handover-confirm'
                ? 'bg-[#dae2fd] text-[#004dac]'
                : 'text-[#424753] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
              <span>Yêu cầu điều chuyển</span>
            </div>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#004dac] text-white text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('create')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              currentView === 'create'
                ? 'bg-[#dae2fd] text-[#004dac]'
                : 'text-[#424753] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            <span>Tạo yêu cầu mới</span>
          </button>

          <button
            onClick={() => navigateTo('asset-catalog')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              currentView === 'asset-catalog'
                ? 'bg-[#dae2fd] text-[#004dac]'
                : 'text-[#424753] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              inventory_2
            </span>
            <span>Sổ theo dõi tài sản</span>
          </button>

          <button
            onClick={() => navigateTo('reports')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              currentView === 'reports'
                ? 'bg-[#dae2fd] text-[#004dac]'
                : 'text-[#424753] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              analytics
            </span>
            <span>Báo cáo thống kê</span>
          </button>
        </nav>
      </div>

      {/* Role / Persona Switcher at Bottom */}
      <div className="p-3 border-t border-[#c2c6d5] bg-[#faf8ff] relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-[#737784] uppercase tracking-wider">
            Vai trò trải nghiệm
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
              currentUser.systemRole === 'admin_hr'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {currentUser.systemRole === 'admin_hr' ? 'HCNS' : 'ĐỀ NGHỊ'}
          </span>
        </div>

        <div
          onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#eaedff] cursor-pointer transition-colors"
          title="Nhấp để đổi tài khoản kiểm thử quyền hạn"
        >
          <div className="w-8 h-8 rounded-full bg-[#283044] text-[#eef0ff] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentUser.avatarText}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#131b2e] truncate">
              {currentUser.department}
            </p>
            <p className="text-[11px] text-[#424753] truncate">
              {currentUser.name} ({currentUser.roleTitle})
            </p>
          </div>
          <button className="text-[#737784] hover:text-[#131b2e]" type="button">
            <span className="material-symbols-outlined text-[18px]">
              unfold_more
            </span>
          </button>
        </div>

        {/* Dropdown Menu */}
        {isPersonaMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-white border border-[#c2c6d5] rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[11px] font-semibold text-[#737784] border-b border-slate-100 mb-1">
              Chọn vai trò mô phỏng (BR03):
            </div>
            {availablePersonas.map((persona) => {
              const isSelected = persona.id === currentUser.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => {
                    setCurrentUser(persona);
                    setIsPersonaMenuOpen(false);
                    addToast(`Đã chuyển vai trò: ${persona.name} (${persona.systemRoleLabel})`, 'info');
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-xs ${
                    isSelected ? 'bg-[#dae2fd] text-primary font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {persona.avatarText}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{persona.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {persona.systemRoleLabel}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
