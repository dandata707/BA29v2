import React, { useState, useRef, useEffect } from 'react';
import { RequestTicket } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { Pagination } from './Pagination.tsx';

interface RequestTableProps {
  tickets: RequestTicket[];
  totalTicketsCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onEditTicket: (ticket: RequestTicket) => void;
  onPrintTicket: (ticket: RequestTicket) => void;
  onRevokeTicket: (ticket: RequestTicket) => void;
  onViewRejectionReason: (ticket: RequestTicket) => void;
  onViewTicket: (ticket: RequestTicket) => void;
}

export const RequestTable: React.FC<RequestTableProps> = ({
  tickets,
  totalTicketsCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  isRefreshing = false,
  onEditTicket,
  onPrintTicket,
  onRevokeTicket,
  onViewRejectionReason,
  onViewTicket,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Toolbar */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[17px] font-bold text-slate-900">Danh sách phiếu</h2>
          <span className="px-2.5 py-0.5 text-[12px] font-medium bg-slate-100 text-slate-600 rounded-full">
            {totalTicketsCount} phiếu
          </span>
        </div>

        {/* Refresh Table Button */}
        <button
          type="button"
          onClick={onRefresh}
          className={`p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer ${
            isRefreshing ? 'animate-spin text-blue-600' : ''
          }`}
          title="Làm mới bảng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[13px] font-semibold text-slate-600">
              <th className="py-3.5 px-5">STT</th>
              <th className="py-3.5 px-5">Mã phiếu</th>
              <th className="py-3.5 px-5">Loại yêu cầu</th>
              <th className="py-3.5 px-5">Người nhận tài sản</th>
              <th className="py-3.5 px-5">Ngày tạo</th>
              <th className="py-3.5 px-5">Ngày cần sử dụng</th>
              <th className="py-3.5 px-5 text-center">Trạng thái</th>
              <th className="py-3.5 px-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[14px]">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 px-5 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-[14px] text-slate-500 font-medium">Không tìm thấy phiếu yêu cầu nào</p>
                    <p className="text-[12px] text-slate-400">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket, index) => (
                <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 text-slate-500 font-normal">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      type="button"
                      onClick={() => onViewTicket(ticket)}
                      className="text-blue-600 font-semibold hover:underline text-left cursor-pointer"
                    >
                      {ticket.code}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700">{ticket.type}</td>
                  <td className="py-3.5 px-5 text-slate-800 font-medium">{ticket.recipient}</td>
                  <td className="py-3.5 px-5 text-slate-600">{ticket.createdDate}</td>
                  <td className="py-3.5 px-5 text-slate-600">{ticket.neededDate}</td>
                  <td className="py-3.5 px-5 text-center">
                    {ticket.status === 'Từ chối' ? (
                      <button
                        type="button"
                        onClick={() => onViewRejectionReason(ticket)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                        title="Xem lý do từ chối"
                      >
                        <StatusBadge status={ticket.status} />
                      </button>
                    ) : (
                      <StatusBadge status={ticket.status} />
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === ticket.id ? null : ticket.id);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Thao tác"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="4" r="1.75" />
                        <circle cx="10" cy="10" r="1.75" />
                        <circle cx="10" cy="16" r="1.75" />
                      </svg>
                    </button>

                    {/* Dropdown Action Menu */}
                    {activeMenuId === ticket.id && (() => {
                      const isDraft = ticket.status === 'Nháp';
                      const isPending = ticket.status === 'Chờ duyệt';
                      const isRejected = ticket.status === 'Từ chối';

                      return (
                        <div
                          ref={menuRef}
                          className="absolute right-5 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-30 text-left text-[13px] animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                        >
                          <div className="py-1">
                            {/* 1. Sửa phiếu - Chỉ enable khi ở trạng thái Nháp */}
                            <button
                              type="button"
                              disabled={!isDraft}
                              onClick={() => {
                                if (isDraft) {
                                  setActiveMenuId(null);
                                  onEditTicket(ticket);
                                }
                              }}
                              className={`w-full px-3.5 py-2 flex items-center gap-2.5 transition-colors font-medium text-left ${
                                isDraft
                                  ? 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
                                  : 'text-slate-300 opacity-40 cursor-not-allowed'
                              }`}
                              title={isDraft ? 'Chỉnh sửa phiếu nháp' : 'Chỉ phiếu ở trạng thái Nháp mới được sửa'}
                            >
                              <svg className={`w-4 h-4 ${isDraft ? 'text-slate-400 group-hover:text-blue-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Sửa phiếu</span>
                            </button>

                            {/* 2. In phiếu */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onPrintTicket(ticket);
                              }}
                              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer text-left font-medium"
                            >
                              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              <span>In phiếu</span>
                            </button>

                            {/* 3. Thu hồi phiếu - Chỉ enable khi ở trạng thái Chờ duyệt */}
                            <button
                              type="button"
                              disabled={!isPending}
                              onClick={() => {
                                if (isPending) {
                                  setActiveMenuId(null);
                                  onRevokeTicket(ticket);
                                }
                              }}
                              className={`w-full px-3.5 py-2 flex items-center gap-2.5 transition-colors font-medium text-left ${
                                isPending
                                  ? 'text-slate-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer'
                                  : 'text-slate-300 opacity-40 cursor-not-allowed'
                              }`}
                              title={isPending ? 'Thu hồi phiếu đang chờ duyệt về trạng thái Nháp' : 'Chỉ phiếu ở trạng thái Chờ duyệt mới được thu hồi'}
                            >
                              <svg className={`w-4 h-4 ${isPending ? 'text-slate-400 group-hover:text-amber-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              <span>Thu hồi phiếu</span>
                            </button>
                          </div>

                          <div className="py-1">
                            {/* 4. Xem lý do từ chối - Chỉ enable khi ở trạng thái Từ chối */}
                            <button
                              type="button"
                              disabled={!isRejected}
                              onClick={() => {
                                if (isRejected) {
                                  setActiveMenuId(null);
                                  onViewRejectionReason(ticket);
                                }
                              }}
                              className={`w-full px-3.5 py-2 flex items-center gap-2.5 transition-colors font-medium text-left ${
                                isRejected
                                  ? 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                                  : 'text-slate-300 opacity-40 cursor-not-allowed'
                              }`}
                              title={isRejected ? 'Xem lý do từ chối phiếu' : 'Chỉ phiếu ở trạng thái Từ chối mới xem được lý do'}
                            >
                              <svg className={`w-4 h-4 ${isRejected ? 'text-rose-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Xem lý do từ chối</span>
                            </button>

                            {/* 5. Xem chi tiết - Luôn enable */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onViewTicket(ticket);
                              }}
                              className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer text-left font-medium"
                            >
                              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>Xem chi tiết</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar inside the Card Container */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalTicketsCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
