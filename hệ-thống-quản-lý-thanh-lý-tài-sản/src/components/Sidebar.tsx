import React, { useState } from 'react';
import { 
  Home, 
  Trash2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  FilePlus2,
  FileCheck2,
  FileText,
  CheckCircle2,
  Briefcase,
  Archive,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { useAssetContext, ScreenType } from '../context/AssetContext';
import { UserRole } from '../types/asset';
import { ResetConfirmModal } from './ResetConfirmModal';

interface SidebarProps {
  onOpenFlowGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenFlowGuide }) => {
  const { 
    currentUser, 
    switchUserRole, 
    activeScreen, 
    setActiveScreen, 
    proposals, 
    submissions, 
    decisions, 
    dossiers 
  } = useAssetContext();

  const [isProcessOpen, setIsProcessOpen] = useState(true);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResetSuccess = () => {
    setToastMessage('Đã khôi phục dữ liệu mẫu thành công!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compute counts for badging
  const pendingInspectionsCount = proposals.filter((p) => p.status === 'CHO_TIEP_NHAN').length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'CHO_PHE_DUYET').length;
  const activeExecutionsCount = decisions.filter((d) => d.status === 'DANG_THUC_HIEN').length;
  const pendingDossiersCount = dossiers.filter((d) => d.status === 'DANG_THUC_HIEN').length;

  const navItems: Array<{
    id: ScreenType;
    label: string;
    icon: React.FC<{ className?: string }>;
    targetRole?: UserRole;
    screens: ScreenType[];
    badgeCount?: number;
  }> = [
    {
      id: 'PROPOSALS',
      label: 'Đề nghị thanh lý',
      icon: FilePlus2,
      targetRole: 'BPSDTS',
      screens: ['PROPOSALS', 'PROPOSAL_CREATE'],
    },
    {
      id: 'INSPECTIONS',
      label: 'Tiếp nhận & Thẩm định',
      icon: FileCheck2,
      targetRole: 'NVQLTS',
      screens: ['INSPECTIONS', 'INSPECTION_DETAIL'],
      badgeCount: pendingInspectionsCount,
    },
    {
      id: 'QUALIFIED_PROPOSALS',
      label: 'Lập tờ trình thanh lý',
      icon: FileText,
      targetRole: 'NVQLTS',
      screens: ['QUALIFIED_PROPOSALS', 'SUBMISSION_CREATE'],
    },
    {
      id: 'SUBMISSION_LIST',
      label: 'Phê duyệt tờ trình thanh lý',
      icon: CheckCircle2,
      targetRole: 'GIAM_DOC',
      screens: ['SUBMISSION_LIST'],
      badgeCount: pendingSubmissionsCount,
    },
    {
      id: 'EXECUTIONS',
      label: 'Thực hiện thanh lý',
      icon: Briefcase,
      targetRole: 'NVQLTS',
      screens: ['EXECUTIONS'],
      badgeCount: activeExecutionsCount,
    },
    {
      id: 'DOSSIERS',
      label: 'Đóng và lưu trữ hồ sơ',
      icon: Archive,
      targetRole: 'NVQLTS',
      screens: ['DOSSIERS'],
      badgeCount: pendingDossiersCount,
    },
  ];

  return (
    <aside className="w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Top Header / Brand */}
      <div>
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-900 tracking-tight">BA Asset</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              Quản lý tài sản
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
          {/* Section 1: Hướng dẫn làm việc */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Hướng dẫn làm việc
            </div>
            <button
              onClick={() => setActiveScreen('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeScreen === 'OVERVIEW'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Tổng quan quy trình</span>
            </button>
          </div>

          {/* Section 2: Quy trình thanh lý */}
          <div>
            <div 
              onClick={() => setIsProcessOpen(!isProcessOpen)}
              className="flex items-center justify-between px-3 mb-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Nghiệp vụ thanh lý</span>
              </div>
              {isProcessOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            {isProcessOpen && (
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.screens.includes(activeScreen);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'PROPOSALS') setActiveScreen('PROPOSALS');
                        else if (item.id === 'INSPECTIONS') setActiveScreen('INSPECTIONS');
                        else if (item.id === 'QUALIFIED_PROPOSALS') setActiveScreen('QUALIFIED_PROPOSALS');
                        else if (item.id === 'SUBMISSION_LIST') setActiveScreen('SUBMISSION_LIST');
                        else if (item.id === 'EXECUTIONS') setActiveScreen('EXECUTIONS');
                        else if (item.id === 'DOSSIERS') setActiveScreen('DOSSIERS');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-md" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.targetRole && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {item.targetRole === 'BPSDTS' ? 'BPSDTS' : item.targetRole === 'NVQLTS' ? 'NVQLTS' : 'Giám đốc/Quản lý'}
                              {currentUser.role === item.targetRole && ' (Bạn)'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Optional badge */}
                      {Boolean(item.badgeCount && item.badgeCount > 0) && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Profile & Role Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onOpenFlowGuide}
          className="w-full mb-3 flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 rounded-lg transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Sơ đồ luồng & Hướng dẫn nghiệp vụ</span>
        </button>

        {/* User Card with Switcher */}
        <div className="relative">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.avatarText}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.roleTitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsResetModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại dữ liệu mẫu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Role selection popup */}
          {showRoleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1">
                Chuyển vai trò thử nghiệm:
              </div>
              <button
                onClick={() => {
                  switchUserRole('BPSDTS');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                  currentUser.role === 'BPSDTS' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>1. Nguyễn Minh Anh (BPSDTS)</span>
              </button>
              <button
                onClick={() => {
                  switchUserRole('NVQLTS');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                  currentUser.role === 'NVQLTS' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>2. Trần Văn Bình (NVQLTS)</span>
              </button>
              <button
                onClick={() => {
                  switchUserRole('GIAM_DOC');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                  currentUser.role === 'GIAM_DOC' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>3. Lê Hoàng Nam (Giám đốc)</span>
              </button>

              {/* Reset Data Button inside account popup */}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setIsResetModalOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-rose-700 hover:bg-rose-50 transition-colors font-semibold group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600 group-hover:-rotate-90 transition-transform duration-300" />
                    <span>Đặt lại dữ liệu mẫu</span>
                  </div>
                  <span className="text-[10px] text-rose-500 font-normal">14 bước</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </aside>
  );
};
