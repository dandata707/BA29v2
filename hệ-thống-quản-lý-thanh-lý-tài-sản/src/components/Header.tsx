import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Map, 
  RotateCcw, 
  Check, 
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Building2,
  UserCheck,
  CheckCircle2,
  User,
  LogOut
} from 'lucide-react';
import { useAssetContext, ScreenType } from '../context/AssetContext';
import { ResetConfirmModal } from './ResetConfirmModal';

interface HeaderProps {
  onOpenFlowGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFlowGuide }) => {
  const { 
    currentUser, 
    switchUserRole, 
    activeScreen, 
    setActiveScreen, 
    notifications, 
    markNotificationAsRead 
  } = useAssetContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetSuccess = () => {
    setToastMessage('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const getBreadcrumb = () => {
    switch (activeScreen) {
      case 'OVERVIEW':
        return { section: 'Hướng dẫn làm việc', page: 'Tổng quan & Bản đồ luồng' };
      case 'PROPOSALS':
        return { section: 'Thanh lý tài sản', page: 'Danh sách đề nghị thanh lý' };
      case 'PROPOSAL_CREATE':
        return { section: 'Thanh lý tài sản', page: 'Lập đề nghị thanh lý tài sản' };
      case 'INSPECTIONS':
        return { section: 'Thanh lý tài sản', page: 'Danh sách chờ tiếp nhận & thẩm định' };
      case 'INSPECTION_DETAIL':
        return { section: 'Thanh lý tài sản', page: 'Tiếp nhận, kiểm tra và thẩm định' };
      case 'QUALIFIED_PROPOSALS':
        return { section: 'Thanh lý tài sản', page: 'Danh sách đề nghị đủ điều kiện lập tờ trình' };
      case 'SUBMISSION_CREATE':
        return { section: 'Thanh lý tài sản', page: 'Lập tờ trình thanh lý tài sản' };
      case 'SUBMISSION_LIST':
        return { section: 'Thanh lý tài sản', page: 'Phê duyệt thanh lý tài sản' };
      case 'EXECUTIONS':
        return { section: 'Thanh lý tài sản', page: 'Thực hiện thanh lý tài sản' };
      case 'DOSSIERS':
        return { section: 'Thanh lý tài sản', page: 'Đóng và lưu hồ sơ' };
      default:
        return { section: 'Thanh lý tài sản', page: 'Quản lý tài sản' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-500 min-w-0">
          <span className="text-slate-400">🏠</span>
          <span>/</span>
          <span className="text-slate-600 font-medium truncate hidden sm:inline">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="text-slate-900 font-semibold truncate">{breadcrumb.page}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Role Switcher for instant testing */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 px-2 uppercase tracking-wide">
              Vai trò:
            </span>
            <button
              onClick={() => switchUserRole('BPSDTS')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentUser.role === 'BPSDTS'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Bộ phận sử dụng tài sản (VD: Kế toán, Hành chính)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1. BPSDTS</span>
            </button>
            <button
              onClick={() => switchUserRole('NVQLTS')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentUser.role === 'NVQLTS'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Nhân viên quản lý tài sản"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. NVQLTS</span>
            </button>
            <button
              onClick={() => switchUserRole('GIAM_DOC')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentUser.role === 'GIAM_DOC'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Ban Giám đốc phê duyệt"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>3. Giám đốc</span>
            </button>
          </div>

          {/* User Flow Map Guide Trigger */}
          <button
            onClick={onOpenFlowGuide}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Xem bản đồ hướng dẫn 14 bước và 5 bảng view flow"
          >
            <Map className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Chỉ dẫn 14 bước</span>
          </button>

          {/* Quick Reset Mock Data Button on Header */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Đặt lại toàn bộ dữ liệu mẫu ban đầu để dễ thao tác lại"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Đặt lại dữ liệu</span>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Thông báo quy trình ({unreadCount} mới)
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">Đã cập nhật</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkScreen) {
                            setActiveScreen(n.linkScreen);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-blue-50/50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-blue-50/20 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Button & Dropdown Menu */}
          <div className="relative pl-1 border-l border-slate-200" ref={accountMenuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group"
              title="Tài khoản & Thao tác dữ liệu"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs relative">
                {currentUser.avatarText}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {currentUser.roleTitle}
                </div>
              </div>
            </button>

            {/* Account Menu Dropdown */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden animate-in fade-in duration-100">
                {/* Account Profile Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                      {currentUser.avatarText}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email || `${currentUser.id}@ba-asset.vn`}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {currentUser.department}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Role Switch in Account */}
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chuyển vai trò thử nghiệm:
                </div>
                <div className="space-y-0.5 mb-2">
                  <button
                    onClick={() => {
                      switchUserRole('BPSDTS');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'BPSDTS'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>1. Nguyễn Minh Anh (BPSDTS)</span>
                    {currentUser.role === 'BPSDTS' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('NVQLTS');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'NVQLTS'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>2. Trần Văn Bình (NVQLTS)</span>
                    {currentUser.role === 'NVQLTS' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('GIAM_DOC');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'GIAM_DOC'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>3. Lê Hoàng Nam (Giám đốc)</span>
                    {currentUser.role === 'GIAM_DOC' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>

                {/* Account Reset Action Section */}
                <div className="border-t border-slate-100 pt-2">
                  <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quản trị dữ liệu:
                  </div>
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      setIsResetModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 text-rose-800 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Đặt lại dữ liệu mẫu</div>
                        <div className="text-[10px] text-rose-600">Khôi phục 14 bước quy trình</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={handleResetSuccess}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-900 text-white text-xs font-semibold rounded-2xl shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
