import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Asset } from '../types/asset.ts';
import { checkSoftDeleteEligibility } from '../utils/assetRules.ts';

interface DeleteAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (assetId: string, reason: string) => void;
  onNavigateToDisposal?: () => void;
}

export const DeleteAssetModal: React.FC<DeleteAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirmDelete,
  onNavigateToDisposal
}) => {
  const [reason, setReason] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  if (!isOpen || !asset) return null;

  // Check eligibility under BR_GN_08
  const eligibility = checkSoftDeleteEligibility(asset);
  const isReasonValid = reason.trim().length > 0 && reason.length <= 500;
  const showReasonError = hasAttemptedSubmit && !isReasonValid;

  const handleConfirm = () => {
    setHasAttemptedSubmit(true);
    if (!isReasonValid) return;
    onConfirmDelete(asset.id, reason.trim());
    setReason('');
    setHasAttemptedSubmit(false);
  };

  const handleClose = () => {
    setReason('');
    setHasAttemptedSubmit(false);
    onClose();
  };

  // CASE 1: Cannot Delete
  if (!eligibility.canDelete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
        <div 
          role="dialog"
          aria-modal="true"
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transform animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Không thể xóa tài sản
                </h3>
                <span className="inline-block text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-0.5">
                  Mã thông báo hệ thống: {eligibility.errorCode || 'ERR_ASSET_IN_USE'}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Đóng thông báo"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 text-sm text-slate-600">
            <p className="leading-relaxed">
              Tài sản đã phát sinh giao dịch hoặc đang ở trạng thái sử dụng, không thể xóa trực tiếp. Vui lòng dùng nghiệp vụ{' '}
              <button 
                onClick={onNavigateToDisposal}
                className="text-blue-600 font-semibold underline hover:text-blue-700 cursor-pointer"
              >
                Thanh lý
              </button>{' '}
              để tiếp tục.
            </p>

            {/* Target Asset Detail */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mã tài sản:</span>
                <span className="font-mono font-bold text-slate-800">{asset.maTaiSan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tên tài sản:</span>
                <span className="font-semibold text-slate-800 text-right">{asset.tenTaiSan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                  {asset.trangThai}
                </span>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Quy định kế toán & QLTS:</strong> Tài sản đã có lịch sử bàn giao, cấp phát, khấu hao hoặc nhật ký bảo trì không thể xóa vĩnh viễn khỏi hệ thống để bảo toàn trọn vẹn hồ sơ kiểm toán.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onNavigateToDisposal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              <span>Đi tới Thanh lý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Can Soft Delete
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transform animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xóa tài sản
              </h3>
              <p className="text-xs text-slate-500">
                Xác nhận gỡ bỏ định danh tài sản khỏi danh mục hoạt động
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Đóng hộp thoại xóa"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Asset info summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Mã tài sản:</span>
              <span className="font-mono font-bold text-slate-800">{asset.maTaiSan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tên tài sản:</span>
              <span className="font-semibold text-slate-800">{asset.tenTaiSan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Trạng thái:</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {asset.trangThai}
              </span>
            </div>
          </div>

          {/* Soft delete notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Tài sản sẽ được chuyển sang trạng thái <strong>&ldquo;Đã xóa&rdquo;</strong> và không hiển thị trong danh sách mặc định. Mã tài sản sẽ không được cấp lại. Số serial được giải phóng.
            </div>
          </div>

          {/* Reason textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="delete-reason" className="font-semibold text-slate-700">
                Lý do xóa <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] ${reason.length > 500 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                {reason.length}/500
              </span>
            </div>
            <textarea
              id="delete-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xóa (ví dụ: Nhập trùng với mã TS-FUR-2026-00086, ghi nhận nhầm hóa đơn...)"
              className={`w-full px-3 py-2.5 text-xs rounded-xl border transition-all ${
                showReasonError
                  ? 'border-red-500 ring-2 ring-red-100 focus:border-red-600 bg-red-50/30'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {showReasonError && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <span>✕</span> Vui lòng nhập lý do xóa
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-slate-400">
              Thông tin lý do là bắt buộc để lưu trữ biên bản kiểm toán tài sản công.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={reason.trim() === ''}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
              reason.trim() === ''
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 cursor-pointer'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};
