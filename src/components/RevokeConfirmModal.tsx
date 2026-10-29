import React, { useState } from 'react';
import { RequestTicket } from '../types.ts';

interface RevokeConfirmModalProps {
  ticket: RequestTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRevoke: (ticketId: number, note?: string) => void;
}

export const RevokeConfirmModal: React.FC<RevokeConfirmModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onConfirmRevoke,
}) => {
  const [revokeReason, setRevokeReason] = useState('Tôi không còn nhu cầu cấp phát tài sản này');

  if (!isOpen || !ticket) return null;

  const handleConfirm = () => {
    onConfirmRevoke(ticket.id, revokeReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="text-[17px] font-bold text-slate-900">Thu hồi phiếu yêu cầu?</h3>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
            Bạn có chắc chắn muốn thu hồi phiếu yêu cầu{' '}
            <strong className="text-slate-800 font-semibold">{ticket.code}</strong> không? Phiếu sẽ được thu hồi về trạng thái <strong>Nháp</strong> để bạn có thể chỉnh sửa và gửi duyệt lại khi cần.
          </p>

          <div className="mt-4">
            <label htmlFor="revoke-reason-input" className="block text-[12px] font-medium text-slate-700 mb-1.5">
              Lý do thu hồi phiếu
            </label>
            <textarea
              id="revoke-reason-input"
              rows={2}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              placeholder="Nhập lý do thu hồi phiếu..."
            />
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-[14px] font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Xác nhận thu hồi
          </button>
        </div>
      </div>
    </div>
  );
};
