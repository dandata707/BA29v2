import React, { useEffect } from 'react';
import { RequestTicket } from '../types.ts';

interface RejectionReasonModalProps {
  ticket: RequestTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTicket?: (ticket: RequestTicket) => void;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  const rejectedBy = ticket.rejectedBy || 'Lê Hoàng Phúc';
  const rejectedDate = ticket.rejectedDate || `${ticket.createdDate || '20/10/2026'} · 15:30`;
  const rejectionReason =
    ticket.rejectionReason ||
    ticket.reason ||
    'Hiện tại kho chưa có máy tính xách tay đáp ứng cấu hình yêu cầu. Vui lòng trao đổi với bộ phận Quản lý tài sản để lựa chọn thiết bị phù hợp và lập phiếu yêu cầu mới.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200"
      data-purpose="rejection-reason-modal"
      id="rejectionModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Card Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-[500px] w-full p-6 sm:p-7 relative transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Close Button (X) */}
        <button
          aria-label="Đóng cửa sổ"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          onClick={onClose}
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 16 16">
            <line x1="2" x2="14" y1="2" y2="14" />
            <line x1="14" x2="2" y1="2" y2="14" />
          </svg>
        </button>

        {/* Modal Title & Header */}
        <div className="mb-5 pr-8">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mb-1">Lý do từ chối</h3>
          <p className="text-xs sm:text-sm text-[#475569]">Thông tin phản hồi cho phiếu yêu cầu cấp phát.</p>
        </div>

        {/* Divider line */}
        <hr className="border-t border-slate-100 mb-5" />

        {/* Meta Information Grid */}
        <div className="space-y-4">
          {/* Row 1: Mã phiếu & Trạng thái badge */}
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-xs text-slate-500 font-medium mb-0.5">Mã phiếu</span>
              <span className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">{ticket.code}</span>
            </div>
            <div>
              {/* Status Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
                Từ chối
              </span>
            </div>
          </div>

          {/* Row 2: Người từ chối & Thời điểm từ chối */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block text-xs text-slate-500 font-medium mb-0.5">Người từ chối</span>
              <span className="text-sm sm:text-base font-semibold text-[#0F172A]">{rejectedBy}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium mb-0.5">Thời điểm từ chối</span>
              <span className="text-sm sm:text-base font-semibold text-[#0F172A]">{rejectedDate}</span>
            </div>
          </div>

          {/* Rejection Reason Detail Box */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">Lý do từ chối</label>
            <div className="bg-[#F1F5F9] border border-slate-200/60 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
              {rejectionReason}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 sm:mt-7 flex justify-end">
          <button
            className="w-full sm:w-auto px-7 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1e40af] text-white font-medium text-sm rounded-lg shadow-sm shadow-blue-500/20 transition duration-150 ease-in-out text-center cursor-pointer"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

