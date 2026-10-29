import React from 'react';
import { RequestTicket } from '../types.ts';

interface PrintRequestModalProps {
  ticket: RequestTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintRequestModal: React.FC<PrintRequestModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-full">
        {/* Modal Top Control Bar (hidden in print) */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <h3 className="text-[15px] font-bold text-slate-800">Bản in phiếu yêu cầu cấp phát</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0062eb] hover:bg-blue-700 text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>In phiếu ngay</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 text-slate-900 bg-white space-y-6 text-[13px] leading-normal font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-4">
            <div>
              <p className="font-bold text-[14px] uppercase tracking-wide">CÔNG TY CỔ PHẦN CÔNG NGHỆ BA ASSET</p>
              <p className="text-slate-600 text-[12px]">Hệ thống Quản lý Tài sản Doanh nghiệp</p>
              <p className="text-slate-500 text-[11px]">Hotline: 1900 6868 | asset.flow@ba.com</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-base font-bold text-blue-800">{ticket.code}</p>
              <p className="text-slate-500 text-[11px]">Ngày lập: {ticket.createdDate}</p>
              <p className="text-slate-500 text-[11px]">Trạng thái: <strong className="text-slate-800">{ticket.status}</strong></p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h1 className="text-[20px] font-bold uppercase tracking-tight text-slate-900">
              PHIẾU YÊU CẦU CẤP PHÁT TÀI SẢN
            </h1>
            <p className="text-[12px] text-slate-500 italic mt-0.5">
              (Dành cho nhân viên đề xuất trang thiết bị làm việc)
            </p>
          </div>

          {/* Employee & Request Info */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[12px]">Họ tên người nhận:</span>{' '}
              <strong className="text-slate-800 font-semibold">{ticket.recipient}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[12px]">Loại yêu cầu:</span>{' '}
              <strong className="text-slate-800 font-semibold">{ticket.type}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[12px]">Bộ phận / Phòng ban:</span>{' '}
              <span className="text-slate-800">{ticket.department || 'Phòng Phát triển Phần mềm'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[12px]">Ngày cần sử dụng:</span>{' '}
              <strong className="text-slate-800 font-semibold">{ticket.neededDate}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[12px]">Mục đích sử dụng:</span>{' '}
              <span className="text-slate-800">{ticket.reason || 'Trang bị công cụ làm việc theo quy chế công ty'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Danh mục tài sản đề xuất cấp phát:</h4>
            <table className="w-full border-collapse border border-slate-300 text-left text-[12px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold">
                  <th className="p-2 border-r border-slate-300 w-10 text-center">STT</th>
                  <th className="p-2 border-r border-slate-300">Tên tài sản / Thiết bị</th>
                  <th className="p-2 border-r border-slate-300">Quy cách / Cấu hình</th>
                  <th className="p-2 border-r border-slate-300 w-20 text-center">Số lượng</th>
                  <th className="p-2 w-28 text-center">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {ticket.items && ticket.items.length > 0 ? (
                  ticket.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-medium text-slate-800">{item.name || item.category}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">{item.specs || 'Theo tiêu chuẩn công ty'}</td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-800">{String(item.quantity).replace('.', ',')}</td>
                      <td className="p-2 text-center text-slate-500">Mới 100%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400">Không có danh mục tài sản</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Signature Grid */}
          <div className="pt-6 grid grid-cols-4 gap-4 text-center text-[12px]">
            <div>
              <p className="font-semibold text-slate-800">Người đề nghị</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, họ tên)</p>
              <div className="h-16 flex items-end justify-center font-medium text-slate-700">
                {ticket.recipient}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Quản lý trực tiếp</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, họ tên)</p>
              <div className="h-16 flex items-end justify-center font-medium text-slate-400 italic text-[11px]">
                {ticket.status === 'Đã duyệt' || ticket.status === 'Đã cấp phát' ? 'Đã ký duyệt điện tử' : ''}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Bộ phận IT / Kho</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, họ tên)</p>
              <div className="h-16 flex items-end justify-center font-medium text-slate-400 italic text-[11px]">
                {ticket.status === 'Đã cấp phát' ? 'Đã bàn giao tài sản' : ''}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Ban Giám đốc</p>
              <p className="text-[11px] text-slate-400 italic">(Ký duyệt)</p>
              <div className="h-16 flex items-end justify-center font-medium text-slate-400 italic text-[11px]">
                {ticket.status === 'Đã cấp phát' ? 'Phê duyệt' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0062eb] hover:bg-blue-700 text-white rounded-lg text-[14px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>In phiếu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
