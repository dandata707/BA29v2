import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  PlusCircle, 
  List, 
  Share2, 
  FileSpreadsheet, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  QrCode,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { Asset } from '../types/asset.ts';
import { formatDateTimeVN } from '../utils/assetRules.ts';

interface AssetCreateSuccessProps {
  asset: Asset;
  onPrintQR: (asset: Asset) => void;
  onCreateAnother: () => void;
  onBackToList: () => void;
  onQuickAction: (actionType: 'allocate' | 'export_receipt' | 'share') => void;
}

export const AssetCreateSuccess: React.FC<AssetCreateSuccessProps> = ({
  asset,
  onPrintQR,
  onCreateAnother,
  onBackToList,
  onQuickAction
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(asset.maTaiSan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-in fade-in zoom-in-98 duration-200">
      {/* Toast Notification at top */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Đã ghi nhận thành công:</strong> Mã hồ sơ tài sản <strong>{asset.maTaiSan}</strong> đã được lưu trữ và sẵn sàng phục vụ cấp phát.
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-medium">
          GD_GN_06
        </span>
      </div>

      {/* Main Success Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 text-center relative">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Badge Hoàn tất */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hoàn tất thủ tục nhập kho
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Thêm mới tài sản thành công
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
          Hồ sơ thiết bị đã được định danh và lưu trữ đồng bộ vào hệ thống cơ sở dữ liệu Quản lý Tài sản Tập đoàn.
        </p>

        {/* Asset Code Block with Copy */}
        <div className="my-6 max-w-md mx-auto bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
            <span>Mã tài sản hệ thống cấp phát</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.2 rounded-full">
              Tự động sinh (BR_GN_01)
            </span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-black text-blue-600 tracking-wide select-all">
              {asset.maTaiSan}
            </span>
            <button
              onClick={handleCopyCode}
              title="Sao chép mã tài sản"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Đã sao chép mã vào clipboard!
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 text-left mb-8 max-w-2xl mx-auto shadow-2xs">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Tóm tắt hồ sơ thiết bị
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              ISO/IEC 18004
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Tên tài sản:</span>
              <span className="font-bold text-slate-900 text-sm leading-tight block">
                {asset.tenTaiSan}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Danh mục quản lý:</span>
              <span className="font-semibold text-slate-800">
                {asset.categoryName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Trạng thái định danh:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                {asset.trangThai}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Số serial / Số máy:</span>
              <span className="font-mono font-medium text-slate-800">
                {asset.soSerial || 'Không áp dụng'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Người thực hiện:
              </span>
              <span className="font-medium text-slate-800">
                {asset.nguoiGhiNhan}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Thời điểm ghi nhận:
              </span>
              <span className="font-medium text-slate-800">
                {formatDateTimeVN(asset.ngayGhiNhan)}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Vị trí lưu kho ban đầu:
              </span>
              <span className="font-medium text-slate-800">
                {asset.viTriLuuKho || 'Kho Tổng A – Tầng 2 (Kệ 04)'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => onPrintQR(asset)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            In tem nhãn QR
          </button>

          <button
            onClick={onCreateAnother}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Thêm tài sản khác
          </button>

          <button
            onClick={onBackToList}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
          >
            <List className="w-4 h-4 text-slate-500" />
            Về danh sách
          </button>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-slate-100 pt-6">
          <button
            onClick={() => onQuickAction('allocate')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600">
              Cấp phát ngay
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Bàn giao thiết bị trực tiếp cho nhân sự hoặc phòng ban chuyên môn.
            </div>
          </button>

          <button
            onClick={() => onQuickAction('export_receipt')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600">
              Xuất phiếu kho
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              In biên bản giao nhận thực tế và lưu trữ hồ sơ kế toán tài sản.
            </div>
          </button>

          <button
            onClick={() => onQuickAction('share')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-purple-600">
              Chia sẻ liên kết
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Gửi đường dẫn chi tiết hồ sơ tài sản cho kế toán phụ trách đối chiếu.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
