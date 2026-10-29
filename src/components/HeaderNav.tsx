import React, { useState } from 'react';
import { 
  ChevronRight, 
  Settings2, 
  RotateCcw, 
  WifiOff, 
  Printer, 
  FolderArchive, 
  EyeOff, 
  Check, 
  Sparkles,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface HeaderNavProps {
  breadcrumbs: Breadcrumb[];
  canViewDeleted: boolean;
  onToggleCanViewDeleted: () => void;
  simulateNetworkError: boolean;
  onToggleSimulateNetworkError: () => void;
  simulatePrinterError: boolean;
  onToggleSimulatePrinterError: () => void;
  simulateEmptyState: boolean;
  onToggleSimulateEmptyState: () => void;
  onResetData: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  breadcrumbs,
  canViewDeleted,
  onToggleCanViewDeleted,
  simulateNetworkError,
  onToggleSimulateNetworkError,
  simulatePrinterError,
  onToggleSimulatePrinterError,
  simulateEmptyState,
  onToggleSimulateEmptyState,
  onResetData
}) => {
  const [showSimPanel, setShowSimPanel] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                {crumb.onClick && !isLast ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right: User Role Badge & Tester Simulator Toggle */}
        <div className="flex items-center gap-3">
          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              AN
            </div>
            <div>
              <span className="font-bold text-slate-800 block leading-none">Nguyễn Văn An</span>
              <span className="text-[10px] text-blue-700 font-semibold">Nhân viên QLTS</span>
            </div>
          </div>

          {/* Tester Control Panel Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowSimPanel(!showSimPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showSimPanel 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Bảng Giả lập Kiểm thử</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Simulator Panel Dropdown */}
            {showSimPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Kịch bản kiểm thử (Tester)
                  </span>
                  <button
                    onClick={() => setShowSimPanel(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Toggle: Quyền xem tài sản đã xóa */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-slate-700">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cho phép xem hồ sơ đã xóa</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={canViewDeleted}
                      onChange={onToggleCanViewDeleted}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  {/* Toggle: Giả lập Lỗi kết nối 504 */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-slate-700">
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-3.5 h-3.5 text-red-500" />
                      <span>Giả lập Lỗi kết nối (HTTP 504)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={simulateNetworkError}
                      onChange={onToggleSimulateNetworkError}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </label>

                  {/* Toggle: Giả lập Lỗi máy in Zebra */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-slate-700">
                    <div className="flex items-center gap-2">
                      <Printer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Giả lập Lỗi máy in tem QR</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={simulatePrinterError}
                      onChange={onToggleSimulatePrinterError}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>

                  {/* Toggle: Giả lập Danh sách trống */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-slate-700">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Giả lập Cơ sở dữ liệu trống</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={simulateEmptyState}
                      onChange={onToggleSimulateEmptyState}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Reset Data Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowSimPanel(false);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Khôi phục dữ liệu gốc ban đầu</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
