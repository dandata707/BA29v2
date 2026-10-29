import React from 'react';
import { RequestStatus } from '../types.ts';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Chờ duyệt':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60">
          Chờ duyệt
        </span>
      );
    case 'Đã duyệt':
    case 'Phê duyệt':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60">
          Đã duyệt
        </span>
      );
    case 'Nháp':
      return (
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[12px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
          Nháp
        </span>
      );
    case 'Từ chối':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60">
          Từ chối
        </span>
      );
    case 'Đã cấp phát':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-teal-50 text-teal-600 border border-teal-200/60">
          Đã cấp phát
        </span>
      );
    case 'Đã thu hồi':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/80">
          Đã thu hồi
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
          {status}
        </span>
      );
  }
};
