import React from 'react';
import { AlertTriangle, X, ShieldAlert, ArrowLeft } from 'lucide-react';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onStay: () => void;
  onConfirmCancel: () => void;
  categoryName?: string;
  tempAssetCode?: string;
  filledCount: number;
  totalSections?: number;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onStay,
  onConfirmCancel,
  categoryName = 'Thiết bị CNTT / Laptop',
  tempAssetCode = 'TS-LAP-2026-DRAFT',
  filledCount = 3,
  totalSections = 3
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header with Close Button */}
        <div className="px-6 pt-5 pb-2 flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onStay}
            aria-label="Đóng hộp thoại"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-5 pt-2">
          <h3 id="cancel-modal-title" className="text-lg font-bold text-slate-900 mb-2">
            Hủy thêm mới tài sản?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Mọi dữ liệu chi tiết và chứng từ vừa thiết lập sẽ không được lưu vào hệ thống. Bạn có chắc chắn muốn rời đi?
          </p>

          {/* Form Progress Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Mã tài sản đang tạo:</span>
              <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {tempAssetCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Tiến độ nhập thông tin:</span>
              <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Đã nhập thông tin: {filledCount}/{totalSections} danh mục
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Nhóm thiết bị:</span>
              <span className="text-slate-700 truncate max-w-[200px]">{categoryName}</span>
            </div>
          </div>

          {/* Audit trail notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Nhật ký tác vụ</strong> sẽ tự động ghi nhận phiên thao tác hủy theo quy định kiểm soát GD_GN_07.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onStay}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Ở lại form
          </button>
          <button
            type="button"
            onClick={onConfirmCancel}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all cursor-pointer shadow-md shadow-red-600/20"
          >
            Đồng ý hủy
          </button>
        </div>
      </div>
    </div>
  );
};
