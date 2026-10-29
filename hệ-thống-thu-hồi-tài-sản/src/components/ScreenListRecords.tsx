import React from 'react';
import {
  Plus,
  Search,
  FileText,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecordStatus, ReturnRecord } from '../types/asset';

export const ScreenListRecords: React.FC = () => {
  const {
    records,
    statusFilter,
    setStatusFilter,
    searchKeyword,
    setSearchKeyword,
    setView,
    openRecordDetail,
    activeRole,
    currentEmployee,
  } = useApp();

  // Apply BR13: Nhân viên chỉ xem được biên bản của mình, NVQLTS xem tất cả
  const roleFilteredRecords =
    activeRole === 'employee'
      ? records.filter((r) => r.employeeId === currentEmployee.id || r.employeeEmail === currentEmployee.email)
      : records;

  // Calculate counts for chips
  const totalCount = roleFilteredRecords.length;
  const draftCount = roleFilteredRecords.filter((r) => r.status === 'draft').length;
  const pendingCount = roleFilteredRecords.filter((r) => r.status === 'pending_handoff').length;
  const inHandoffCount = roleFilteredRecords.filter((r) => r.status === 'in_handoff').length;
  const completedCount = roleFilteredRecords.filter((r) => r.status === 'completed').length;
  const cancelledCount = roleFilteredRecords.filter((r) => r.status === 'cancelled').length;

  // Apply search keyword and status filter
  const displayedRecords = roleFilteredRecords.filter((record) => {
    // Status filter
    if (statusFilter !== 'all' && record.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchKeyword.trim() !== '') {
      const q = searchKeyword.toLowerCase();
      const matchId = record.id.toLowerCase().includes(q);
      const matchName = record.employeeName.toLowerCase().includes(q);
      const matchDept = record.department.toLowerCase().includes(q);
      const matchReason = record.reason.toLowerCase().includes(q);
      const matchAsset = record.items.some(
        (it) => it.assetId.toLowerCase().includes(q) || it.assetName.toLowerCase().includes(q)
      );
      return matchId || matchName || matchDept || matchReason || matchAsset;
    }

    return true;
  });

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Nháp
          </span>
        );
      case 'pending_handoff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Chờ bàn giao
          </span>
        );
      case 'in_handoff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Đang bàn giao
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Đã hoàn tất
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* 1. Vùng tiêu đề & Nút Tạo mới (STT 1, 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Biên bản thu hồi tài sản
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === 'nvqlts'
              ? 'Quản lý toàn bộ danh sách biên bản thu hồi trang thiết bị công ty'
              : `Chế độ nhân viên (${currentEmployee.name}) - Xem và xác nhận biên bản được giao (BR13)`}
          </p>
        </div>

        {activeRole === 'nvqlts' && (
          <button
            onClick={() => setView('create')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo biên bản thu hồi</span>
          </button>
        )}
      </div>

      {/* 2. Vùng tìm kiếm và bộ lọc trạng thái (STT 3, 4) */}
      <div className="space-y-3">
        {/* Ô tìm kiếm (STT 3) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo mã biên bản, nhân viên, phòng ban hoặc mã tài sản..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Bộ lọc trạng thái (STT 4: Nút đang chọn nền đen chữ trắng) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'draft'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Nháp</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                statusFilter === 'draft' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {draftCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pending_handoff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending_handoff'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Chờ bàn giao</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                statusFilter === 'pending_handoff'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('in_handoff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'in_handoff'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Đang bàn giao</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                statusFilter === 'in_handoff' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {inHandoffCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'completed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Đã hoàn tất</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                statusFilter === 'completed' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {completedCount}
            </span>
          </button>

          {cancelledCount > 0 && (
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'cancelled'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Đã hủy</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  statusFilter === 'cancelled' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cancelledCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Danh sách thẻ biên bản (STT 5) */}
      <div className="space-y-3">
        {displayedRecords.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Không tìm thấy biên bản thu hồi nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchKeyword
                ? `Không có kết quả khớp với từ khóa "${searchKeyword}". Thử tìm kiếm với thông tin khác.`
                : 'Chưa có biên bản nào trong mục trạng thái này.'}
            </p>
            {activeRole === 'nvqlts' && (
              <button
                onClick={() => setView('create')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo biên bản mới
              </button>
            )}
          </div>
        ) : (
          displayedRecords.map((record) => {
            const totalItems = record.items.length;
            const receivedCount = record.items.filter(
              (i) => i.scanned || (i.isLost && i.lostReason)
            ).length;

            return (
              <div
                key={record.id}
                onClick={() => openRecordDetail(record.id)}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Cột trái: Icon tài liệu, Mã biên bản, Badge, Tên NV · Phòng ban · Lý do */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Icon biên bản (STT 5.1) */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    {/* Mã biên bản + Trạng thái badge (STT 5.2, 5.3) */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                        {record.id}
                      </span>
                      {getStatusBadge(record.status)}
                      {record.isSudden && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Đột xuất
                        </span>
                      )}
                    </div>

                    {/* Tên NV · Phòng ban · Lý do thu hồi (STT 5.4, 5.5, 5.6) */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-900">{record.employeeName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{record.department}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 italic">
                        {record.reason}
                        {record.status === 'completed' && (
                          <span className="text-emerald-700 font-medium not-italic ml-1">
                            ({receivedCount}/{totalItems} tài sản đã nhận)
                          </span>
                        )}
                        {record.status === 'in_handoff' && (
                          <span className="text-amber-700 font-medium not-italic ml-1">
                            ({receivedCount}/{totalItems} đã quét)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Danh sách mã tài sản nhỏ */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {record.items.map((it) => (
                        <span
                          key={it.assetId}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                        >
                          {it.assetId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Ngày biên bản & Mũi tên (STT 5.7, 5.8) */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{record.scheduledDate}</span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
