import React, { useMemo, useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { TransferRequest, TransferStatus } from '../types/transfer';

export const UI01_TransferList: React.FC = () => {
  const {
    requests,
    navigateTo,
    globalSearch,
    setGlobalSearch,
    currentUser,
  } = useTransfer();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Role / Only mine filter (QT2.1)
      if (onlyMine && req.requesterId !== currentUser.id) {
        return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      // 3. Search query
      const query = globalSearch.toLowerCase().trim();
      if (query) {
        const matchId = req.id.toLowerCase().includes(query);
        const matchAsset = req.assetName.toLowerCase().includes(query) || req.assetId.toLowerCase().includes(query);
        const matchRequester = req.requesterName.toLowerCase().includes(query) || req.requesterId.toLowerCase().includes(query);
        const matchDest = req.destinationLocation.toLowerCase().includes(query);
        if (!matchId && !matchAsset && !matchRequester && !matchDest) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, globalSearch, onlyMine, currentUser.id]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#eaedff] text-[#424753] text-[12px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#737784]" />
            <span>Chờ tiếp nhận</span>
          </span>
        );
      case 'supplement':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-amber-50 text-amber-800 text-[12px] font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Chờ bổ sung</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#dae2fd] text-[#004dac] text-[12px] font-medium border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2766cc]" />
            <span>Đã phê duyệt</span>
          </span>
        );
      case 'handover':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#e1e0ff] text-[#2f2ebe] text-[12px] font-medium border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4648d4]" />
            <span>Chờ xác nhận bàn giao</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[12px] font-medium border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
            <span>Từ chối</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-emerald-50 text-emerald-800 text-[12px] font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Hoàn tất</span>
          </span>
        );
    }
  };

  const getStatusIcon = (status: TransferStatus, assetName: string) => {
    if (assetName === 'Chưa có thông tin bổ sung') {
      return 'draft';
    }
    switch (status) {
      case 'pending':
        return 'description';
      case 'supplement':
        return 'assignment_late';
      case 'approved':
        return 'verified';
      case 'handover':
        return 'local_shipping';
      case 'rejected':
        return 'cancel';
      case 'completed':
        return 'task_alt';
    }
  };

  const handleCardClick = (req: TransferRequest) => {
    // Navigate to appropriate screen depending on current state or direct review
    if (req.status === 'handover' || req.status === 'completed') {
      navigateTo('handover-confirm', req.id);
    } else if (req.status === 'approved') {
      // If approved, can directly review or make handover
      navigateTo('review', req.id);
    } else {
      navigateTo('review', req.id);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'Tất cả trạng thái', dotColor: '' },
    { key: 'pending', label: 'Chờ tiếp nhận', dotColor: 'bg-[#737784]' },
    { key: 'supplement', label: 'Chờ bổ sung', dotColor: 'bg-amber-500' },
    { key: 'approved', label: 'Đã phê duyệt', dotColor: 'bg-[#2766cc]' },
    { key: 'handover', label: 'Chờ xác nhận bàn giao', dotColor: 'bg-[#6063ee]' },
    { key: 'completed', label: 'Hoàn tất', dotColor: 'bg-emerald-600' },
    { key: 'rejected', label: 'Từ chối', dotColor: 'bg-[#ba1a1a]' },
  ];

  const currentFilterLabel =
    filterOptions.find((o) => o.key === statusFilter)?.label || 'Tất cả trạng thái';

  return (
    <div className="flex flex-col w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#131b2e] tracking-tight">
              Danh sách yêu cầu điều chuyển tài sản
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-primary text-xs font-semibold">
              {filteredRequests.length} phiếu
            </span>
          </div>
          <p className="text-xs text-[#737784] mt-1">
            Theo dõi, xử lý và phê duyệt quy trình luân chuyển tài sản, thiết bị nội bộ công ty
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Toggle for Requester perspective (QT2.1 / A6) */}
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              onlyMine
                ? 'bg-[#dae2fd] text-primary border-primary'
                : 'bg-white text-slate-600 border-[#c2c6d5] hover:bg-slate-50'
            }`}
            title="Lọc chỉ hiển thị các yêu cầu do tài khoản hiện tại tạo (QT2.1)"
          >
            <span className="material-symbols-outlined text-[16px]">
              {onlyMine ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Chỉ phiếu của tôi</span>
          </button>

          {/* Create Request button */}
          <button
            onClick={() => navigateTo('create')}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#2766cc] text-white text-xs font-semibold hover:bg-primary transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tạo yêu cầu điều chuyển</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="w-full bg-white rounded-xl border border-[#c2c6d5] p-3 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined text-[#737784] text-[18px] absolute left-3 pointer-events-none">
              search
            </span>
            <input
              className="w-full h-9 pl-9 pr-9 text-xs bg-white text-[#131b2e] placeholder:text-[#737784] rounded-lg border border-[#c2c6d5] focus:outline-none focus:border-[#2766cc] focus:ring-1 focus:ring-[#2766cc] transition-colors"
              id="asset-transfer-search"
              placeholder="Tìm theo mã yêu cầu, mã tài sản, người đề nghị..."
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Status Filter Selector */}
          <div className="flex items-center gap-2 shrink-0 relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-9 px-3 bg-white border border-[#c2c6d5] rounded-lg flex items-center gap-2 text-xs font-medium text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              id="status-filter-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-[#737784] text-[16px]">
                filter_alt
              </span>
              <span>{`Trạng thái: ${currentFilterLabel}`}</span>
              <span className="material-symbols-outlined text-[#737784] text-[16px]">
                expand_more
              </span>
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div
                className="absolute right-0 top-11 w-64 bg-white border border-[#c2c6d5] rounded-xl shadow-xl z-30 py-1 animate-in fade-in zoom-in-95 duration-100"
                id="status-dropdown"
              >
                {filterOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setStatusFilter(opt.key);
                      setIsFilterOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#131b2e] hover:bg-[#eaedff] flex items-center justify-between cursor-pointer transition-colors"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      {opt.dotColor && (
                        <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                      )}
                      <span>{opt.label}</span>
                    </div>
                    {statusFilter === opt.key && (
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vertical List of Cards */}
      <div className="flex flex-col gap-3" id="transfer-cards-list">
        {paginatedRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#c2c6d5] p-12 text-center">
            <span className="material-symbols-outlined text-slate-300 text-[48px] mb-2">
              find_in_page
            </span>
            <p className="text-sm font-semibold text-slate-700">
              Không tìm thấy yêu cầu điều chuyển nào phù hợp
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setGlobalSearch('');
                setOnlyMine(false);
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium rounded-lg"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          paginatedRequests.map((req) => {
            const iconName = getStatusIcon(req.status, req.assetName);

            return (
              <div
                key={req.id}
                onClick={() => handleCardClick(req)}
                className="group relative bg-white rounded-xl border border-[#c2c6d5] p-4 hover:border-primary/60 hover:shadow-[0_4px_16px_rgba(39,102,204,0.12)] transition-all duration-150 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left Icon + Main Info */}
                  <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        req.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : req.status === 'supplement'
                          ? 'bg-amber-100 text-amber-700'
                          : req.status === 'handover'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-[#f2f3ff] text-[#424753] group-hover:bg-[#dae2fd] group-hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {iconName}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      {/* First Line */}
                      <div className="flex items-center gap-2.5 flex-wrap leading-tight">
                        <span className="text-sm font-bold text-[#131b2e] group-hover:text-primary transition-colors font-mono">
                          {req.id}
                        </span>
                        {getStatusBadge(req.status)}
                        {req.isDocComplete && req.isEligible && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="material-symbols-outlined text-[12px]">
                              check
                            </span>
                            Đủ điều kiện
                          </span>
                        )}
                        {req.handoverDocId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <span className="material-symbols-outlined text-[12px]">
                              badge
                            </span>
                            {req.handoverDocId}
                          </span>
                        )}
                      </div>

                      {/* Second Line */}
                      {req.assetName === 'Chưa có thông tin bổ sung' ? (
                        <p className="text-xs text-[#737784] italic truncate mt-1">
                          Chưa có thông tin bổ sung
                        </p>
                      ) : (
                        <p className="text-xs text-[#424753] truncate mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800">
                            {req.assetName}
                          </span>
                          <span className="text-[#c2c6d5]">·</span>
                          <span className="px-1.5 py-0.5 bg-[#eaedff] rounded text-[#424753] font-mono text-[11px] font-semibold">
                            {req.assetId}
                          </span>
                          <span className="text-[#c2c6d5]">·</span>
                          <span className="text-slate-600">{req.currentLocation}</span>
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            arrow_right_alt
                          </span>
                          <span className="text-primary font-medium">
                            {req.destinationLocation}
                          </span>
                        </p>
                      )}

                      {/* Third Line (Requester hint) */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>
                          Người đề nghị: <strong className="text-slate-600">{req.requesterName}</strong> ({req.requesterDept})
                        </span>
                        <span>•</span>
                        <span>
                          Tiếp nhận: <strong className="text-slate-600">{req.recipientName}</strong>
                        </span>
                        {req.reviewNotes && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700 truncate max-w-xs italic">
                              Ghi chú: {req.reviewNotes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Date + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-[#737784]">
                      <span className="material-symbols-outlined text-[16px]">
                        calendar_today
                      </span>
                      <span>{req.updatedDate || req.createdDate.split(' - ')[0]}</span>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-1.5">
                      {req.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('handover-create', req.id);
                          }}
                          className="px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 shadow-2xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            post_add
                          </span>
                          <span>Lập biên bản</span>
                        </button>
                      )}

                      {req.status === 'handover' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('handover-confirm', req.id);
                          }}
                          className="px-2.5 py-1 bg-[#4648d4] text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 shadow-2xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            fact_check
                          </span>
                          <span>Xác nhận giao</span>
                        </button>
                      )}

                      <span className="material-symbols-outlined text-[#737784] text-[20px] group-hover:text-primary group-hover:translate-x-1 transition-all">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-[#c2c6d5]">
        <div className="text-xs text-[#737784]">
          Hiển thị{' '}
          <strong className="text-slate-800">
            {filteredRequests.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
          </strong>{' '}
          trong tổng số <strong className="text-slate-800">{filteredRequests.length}</strong> yêu cầu
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-[#c2c6d5] flex items-center justify-center text-[#737784] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaedff] transition-colors"
            type="button"
            title="Trang đầu"
          >
            <span className="material-symbols-outlined text-[16px]">first_page</span>
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-[#c2c6d5] flex items-center justify-center text-[#737784] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaedff] transition-colors"
            type="button"
            title="Trang trước"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2766cc] text-white shadow-2xs'
                    : 'border border-[#c2c6d5] text-[#131b2e] hover:bg-[#eaedff]'
                }`}
                type="button"
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-[#c2c6d5] flex items-center justify-center text-[#131b2e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaedff] transition-colors"
            type="button"
            title="Trang kế"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-[#c2c6d5] flex items-center justify-center text-[#131b2e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaedff] transition-colors"
            type="button"
            title="Trang cuối"
          >
            <span className="material-symbols-outlined text-[16px]">last_page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
