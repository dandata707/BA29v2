import React, { useState, useEffect, useRef } from 'react';
import { RequestTicket } from '../types.ts';

interface RejectTicketActionModalProps {
  ticket: RequestTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (ticketId: number, reason: string) => void;
}

export const RejectTicketActionModal: React.FC<RejectTicketActionModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectReason('');
      setErrorMsg('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setErrorMsg('Vui lòng nhập lý do từ chối yêu cầu cấp phát!');
      textareaRef.current?.focus();
      return;
    }
    onConfirmReject(ticket.id, rejectReason.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-purpose="reject-modal-dialog"
      id="rejectModal"
    >
      {/* Lớp backdrop làm mờ nền tối nhẹ */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        id="modalBackdrop"
        onClick={onClose}
      />

      {/* Hộp thoại Modal trung tâm */}
      <div className="relative bg-white w-full max-w-[560px] rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header (Tiêu đề + Nút đóng '✕') */}
        <div className="px-7 py-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Từ chối yêu cầu cấp phát</h3>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            id="closeModalBtn"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form className="p-7 space-y-4" id="rejectForm" onSubmit={handleSubmit}>
          <div>
            {/* Label bắt buộc với dấu sao đỏ */}
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="rejectReason">
              Lý do từ chối <span className="text-red-500 font-bold">*</span>
            </label>

            {/* Vùng nhập lý do và bộ đếm ký tự */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                className={`w-full text-sm text-slate-800 placeholder-slate-400 rounded-xl border ${
                  errorMsg
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                } focus:ring-1 p-3.5 pb-7 transition resize-none outline-none`}
                id="rejectReason"
                maxLength={500}
                name="rejectReason"
                placeholder="Nhập lý do từ chối yêu cầu cấp phát tài sản..."
                rows={5}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              {/* Đếm ký tự (0/500) ở góc phải dưới textarea */}
              <div
                className="absolute bottom-2.5 right-3.5 text-xs text-slate-400 pointer-events-none select-none"
                id="charCount"
              >
                {rejectReason.length}/500
              </div>
            </div>

            {/* Dòng chú thích trợ giúp / Lỗi validation */}
            {errorMsg ? (
              <p className="mt-2 text-xs text-red-600 font-medium">{errorMsg}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Vui lòng nhập lý do để người yêu cầu có thể điều chỉnh.
              </p>
            )}
          </div>

          {/* Modal Footer: Hủy và Xác nhận từ chối */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-6">
            <button
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
              id="cancelModalBtn"
              type="button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="px-5 py-2.5 bg-[#d33a3a] hover:bg-[#b92c2c] text-white rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 cursor-pointer"
              type="submit"
            >
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
