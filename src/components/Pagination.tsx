import React from 'react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <div className="text-[13px] text-slate-500">
        Hiển thị{' '}
        <span className="font-medium text-slate-700">
          {startItem}–{endItem}
        </span>{' '}
        trên <span className="font-medium text-slate-700">{totalItems}</span> phiếu
      </div>

      <div className="flex items-center gap-3">
        {/* Page Size Selector */}
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer"
          >
            <option value={6}>6 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center space-x-1 text-[13px]">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${
              currentPage <= 1
                ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
            }`}
            title="Trang trước"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Active / Other Pages */}
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[#0062eb] text-white font-semibold shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${
              currentPage >= totalPages
                ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
            }`}
            title="Trang kế tiếp"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
