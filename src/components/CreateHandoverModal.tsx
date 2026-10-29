import React, { useState } from 'react';
import { RequestTicket, UserProfile } from '../types.ts';

interface CreateHandoverModalProps {
  ticket: RequestTicket | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: (handoverCode: string) => void;
}

export const CreateHandoverModal: React.FC<CreateHandoverModalProps> = ({
  ticket,
  isOpen,
  currentUser,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !ticket) return null;

  const todayStr = (() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  })();

  const rawNum = ticket.code.replace(/\D/g, '') || '030';
  const handoverCode = `BBBG-2026-${rawNum}`;

  const [handoverDate, setHandoverDate] = useState<string>(todayStr);
  const [location, setLocation] = useState<string>('Phòng Quản lý Tài sản - Tầng 4');
  const [notes, setNotes] = useState<string>(`Bàn giao tài sản theo phiếu phê duyệt ${ticket.code}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(handoverCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-[620px] rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tạo biên bản bàn giao tài sản</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Căn cứ phiếu yêu cầu cấp phát: <span className="font-semibold text-blue-600">{ticket.code}</span>
            </p>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {/* General Information Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Số biên bản bàn giao:</span>
              <span className="font-bold text-slate-900 text-sm">{handoverCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Trạng thái phiếu:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Đã duyệt
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Bên giao (QL Tài sản):</span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Bên nhận (Người sử dụng):</span>
              <span className="font-semibold text-slate-800">
                {ticket.recipient} ({ticket.department || 'Bộ phận tiếp nhận'})
              </span>
            </div>
          </div>

          {/* Handover Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Ngày bàn giao thực tế <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Địa điểm bàn giao
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="Vị trí bàn giao"
              />
            </div>
          </div>

          {/* Assets Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Danh sách tài sản xuất kho bàn giao
            </label>
            <div className="border border-slate-200 rounded-lg overflow-auto text-xs max-h-40">
              <table className="w-full min-w-[800px] table-fixed text-left">
                <colgroup><col className="w-[170px]" /><col className="w-[230px]" /><col className="w-20" /><col className="w-[140px]" /><col className="w-[180px]" /></colgroup>
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Loại tài sản</th>
                    <th className="py-2 px-3">Tên tài sản</th>
                    <th className="py-2 px-3 text-center">Số lượng</th>
                    <th className="py-2 px-3">Tình trạng</th>
                    <th className="py-2 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ticket.items && ticket.items.length > 0 ? (
                    ticket.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-600"><span className="block truncate" title={item.category}>{item.category}</span></td>
                        <td className="py-2 px-3 font-medium text-slate-800"><span className="block truncate" title={item.name || item.category}>{item.name || item.category}</span></td>
                        <td className="py-2 px-3 text-center font-bold text-blue-600">{item.quantity}</td>
                        <td className="py-2 px-3 text-slate-500">Mới 100% / Xuất kho</td>
                        <td className="py-2 px-3 text-slate-500 whitespace-normal break-words">{item.notes || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="py-2 px-3 text-slate-600"><span className="block truncate" title="Thiết bị CNTT">Thiết bị CNTT</span></td>
                        <td className="py-2 px-3 font-medium text-slate-800"><span className="block truncate" title="Laptop Core i5 RAM 16GB">Laptop Core i5 RAM 16GB</span></td>
                        <td className="py-2 px-3 text-center font-bold text-blue-600">1</td>
                        <td className="py-2 px-3 text-slate-500">Mới 100% / Sẵn sàng bàn giao</td>
                        <td className="py-2 px-3 text-slate-500">—</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-600"><span className="block truncate" title="Thiết bị CNTT">Thiết bị CNTT</span></td>
                        <td className="py-2 px-3 font-medium text-slate-800"><span className="block truncate" title="Màn hình 24 inch Full HD">Màn hình 24 inch Full HD</span></td>
                        <td className="py-2 px-3 text-center font-bold text-blue-600">1</td>
                        <td className="py-2 px-3 text-slate-500">Mới 100% / Sẵn sàng bàn giao</td>
                        <td className="py-2 px-3 text-slate-500">—</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú biên bản
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Nhập ghi chú hoặc điều kiện bàn giao..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Xác nhận tạo biên bản</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
