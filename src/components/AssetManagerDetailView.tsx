import { Header } from './Header';
import { allocationBreadcrumbs } from '../navigation/breadcrumbs';
import React, { useState, useMemo } from 'react';
import { RequestTicket, UserProfile } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { CreateHandoverModal } from './CreateHandoverModal.tsx';

interface AssetManagerDetailViewProps {
  ticket: RequestTicket | null;
  currentUser: UserProfile;
  onBack: () => void;
  onApprove: (ticket: RequestTicket) => void;
  onReject: (ticket: RequestTicket) => void;
  onOpenRoleSwitcher: () => void;
  onCreateHandoverForm?: (ticket: RequestTicket) => void;
  onOpenMobileSidebar?: () => void;
  onSelectTab?: (tab: string) => void;
}

type QuotaFilter = 'all' | 'exceeded' | 'within' | 'no_quota';

interface QuotaAssetDetail {
  id: string;
  category: string;
  description: string;
  requestedQty: number | string;
  quotaQty: number | string;
  allocatedQty: number | string;
  quotaStatus: 'Vượt định mức' | 'Trong định mức' | 'Chưa có định mức';
  notes: string;
  existingAssets?: Array<{
    code: string;
    allocatedDate: string;
    condition: string;
  }>;
}

export const AssetManagerDetailView: React.FC<AssetManagerDetailViewProps> = ({
  ticket,
  currentUser,
  onBack,
  onApprove,
  onReject,
  onOpenRoleSwitcher,
  onCreateHandoverForm,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  // Mobile sidebar state
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(true);

  // Handover modal state
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);

  // Filter state for assets table
  const [activeFilter, setActiveFilter] = useState<QuotaFilter>('all');
  const [priorityExceeded, setPriorityExceeded] = useState<boolean>(false);

  // Expanded sub-rows for existing assets (default row 1 expanded as in HTML)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'item_1': true,
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Build quota asset items based on ticket data or realistic default in code_5f8df6ee.html
  const assetItems: QuotaAssetDetail[] = useMemo(() => {
    if (!ticket) return [];

    // If ticket has specific items from creation, adapt them:
    if (ticket.items && ticket.items.length > 0) {
      return ticket.items.map((item, idx) => {
        // Map realistic quota behavior
        let quotaStatus: 'Vượt định mức' | 'Trong định mức' | 'Chưa có định mức' = 'Trong định mức';
        let quotaQty: number | string = 1;
        let allocatedQty: number | string = 0;
        let existingAssets: QuotaAssetDetail['existingAssets'] = undefined;

        if (idx === 0) {
          quotaStatus = 'Vượt định mức';
          quotaQty = 1;
          allocatedQty = 1;
          existingAssets = [
            { code: `TS-LT-01${idx + 4}`, allocatedDate: '05/03/2026', condition: 'Đang sử dụng' },
          ];
        } else if (idx === 1 && ticket.items!.length > 1) {
          quotaStatus = 'Vượt định mức';
          quotaQty = 2;
          allocatedQty = 1;
          existingAssets = [
            { code: `TS-MH-02${idx + 7}`, allocatedDate: '10/01/2026', condition: 'Đang sử dụng' },
          ];
        } else if (idx === ticket.items!.length - 1 && ticket.items!.length >= 4) {
          quotaStatus = 'Chưa có định mức';
          quotaQty = 'N/A';
          allocatedQty = 0;
        }

        return {
          id: `item_${idx + 1}`,
          category: item.category || item.name || 'Tài sản',
          description: item.specs || item.name || 'Cấu hình tiêu chuẩn',
          requestedQty: item.quantity,
          quotaQty,
          allocatedQty,
          quotaStatus,
          notes: item.notes || (idx === 0 ? 'Phục vụ dự án mới' : idx === 1 ? 'Cần thêm màn hình phụ' : 'N/A'),
          existingAssets,
        };
      });
    }

    // Default 5 comprehensive rows matching code_5f8df6ee.html faithfully
    return [
      {
        id: 'item_1',
        category: 'Laptop',
        description: 'RAM 16GB, SSD 512GB',
        requestedQty: 1,
        quotaQty: 1,
        allocatedQty: 1,
        quotaStatus: 'Vượt định mức',
        notes: 'Phục vụ dự án mới',
        existingAssets: [
          { code: 'TS-LT-014', allocatedDate: '05/03/2026', condition: 'Đang sử dụng' },
        ],
      },
      {
        id: 'item_2',
        category: 'Màn hình',
        description: '24 inch, Full HD',
        requestedQty: 2,
        quotaQty: 2,
        allocatedQty: 1,
        quotaStatus: 'Vượt định mức',
        notes: 'Cần thêm màn hình phụ',
        existingAssets: [
          { code: 'TS-MH-028', allocatedDate: '10/01/2026', condition: 'Đang sử dụng' },
        ],
      },
      {
        id: 'item_3',
        category: 'Bàn phím',
        description: 'Kết nối không dây',
        requestedQty: 1,
        quotaQty: 1,
        allocatedQty: 0,
        quotaStatus: 'Trong định mức',
        notes: 'N/A',
      },
      {
        id: 'item_4',
        category: 'Chuột',
        description: 'Kết nối Bluetooth',
        requestedQty: 1,
        quotaQty: 1,
        allocatedQty: 0,
        quotaStatus: 'Trong định mức',
        notes: 'N/A',
      },
      {
        id: 'item_5',
        category: 'Webcam',
        description: 'Full HD 1080p',
        requestedQty: 1,
        quotaQty: 'N/A',
        allocatedQty: 0,
        quotaStatus: 'Chưa có định mức',
        notes: 'Họp trực tuyến',
      },
    ];
  }, [ticket]);

  // Counts for tabs
  const countAll = assetItems.length;
  const countExceeded = assetItems.filter((i) => i.quotaStatus === 'Vượt định mức').length;
  const countWithin = assetItems.filter((i) => i.quotaStatus === 'Trong định mức').length;
  const countNoQuota = assetItems.filter((i) => i.quotaStatus === 'Chưa có định mức').length;

  // Filtered asset items
  const filteredAssets = useMemo(() => {
    let result = [...assetItems];
    if (activeFilter === 'exceeded') {
      result = result.filter((i) => i.quotaStatus === 'Vượt định mức');
    } else if (activeFilter === 'within') {
      result = result.filter((i) => i.quotaStatus === 'Trong định mức');
    } else if (activeFilter === 'no_quota') {
      result = result.filter((i) => i.quotaStatus === 'Chưa có định mức');
    }

    if (priorityExceeded) {
      result.sort((a, b) => {
        if (a.quotaStatus === 'Vượt định mức' && b.quotaStatus !== 'Vượt định mức') return -1;
        if (b.quotaStatus === 'Vượt định mức' && a.quotaStatus !== 'Vượt định mức') return 1;
        return 0;
      });
    }

    return result;
  }, [assetItems, activeFilter, priorityExceeded]);

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy thông tin phiếu yêu cầu.
        <button type="button" onClick={onBack} className="block mx-auto mt-4 text-blue-600 font-semibold underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const creatorName = ticket.creatorName || ticket.recipient || 'Nguyễn Minh Anh';
  const creatorCode = ticket.creatorCode || ticket.recipientCode || 'NV-0025';
  const creatorDept = ticket.creatorDepartment || ticket.department || 'Nhân sự';
  const creatorRole = ticket.creatorRole || 'Chuyên viên nhân sự';

  const recipientName = ticket.recipient || 'Nguyễn Minh Anh';
  const recipientCode = ticket.recipientCode || creatorCode;
  const recipientDept = ticket.department || creatorDept;
  const recipientRole = ticket.recipientRole || creatorRole;

  const reason = ticket.reason || 'Bổ sung thiết bị phục vụ triển khai dự án mới và họp trực tuyến.';
  const neededDate = ticket.neededDate || '25/10/2026';

  const isApproved =
    ticket.status === 'Đã duyệt' || ticket.status === 'Phê duyệt' || ticket.status === 'Đã cấp phát';
  const isRejected = ticket.status === 'Từ chối';
  const isRevoked = ticket.status === 'Đã thu hồi';

  return (
    <div className="bg-[#f8fafc] text-slate-800 antialiased font-sans flex h-full min-w-0 overflow-hidden">


      {/* BEGIN: MainContentArea with offset for fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* BEGIN: TopBar */}
        <Header currentUser={currentUser} onToggleMobileMenu={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher} breadcrumbs={allocationBreadcrumbs('detail', ticket.code, onBack)} />
        {/* END: TopBar */}

        {/* Main Content Container */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto" data-purpose="page-body">
          {/* Back link & Page Title & Code */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              <span>←</span>
              <span>Quay lại danh sách</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chi tiết phiếu yêu cầu cấp phát</h1>
                <p className="text-lg font-bold text-blue-600 mt-0.5">{ticket.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          </div>

          {/* Rejection Alert Notice if rejected */}
          {isRejected && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-rose-800 text-[13px]">Phiếu yêu cầu đã bị từ chối</h4>
                <p className="text-rose-700 mt-1 leading-relaxed">
                  <strong>Lý do từ chối:</strong> {ticket.rejectionReason || ticket.reason || 'Yêu cầu không phù hợp với định mức quy định.'}
                </p>
                {ticket.rejectedBy && (
                  <p className="text-rose-500 mt-1 text-[11px]">
                    Người từ chối: {ticket.rejectedBy} {ticket.rejectedDate ? `• ${ticket.rejectedDate}` : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Revoked Alert Notice if revoked */}
          {isRevoked && (
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
              <div className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-800 text-[13px]">Phiếu yêu cầu đã bị thu hồi</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Phiếu này đã được người tạo thu hồi. Phiếu chỉ ở chế độ xem và không thể phê duyệt hay từ chối.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: Thông tin chung */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" data-purpose="general-info-card">
            <div className="px-6 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Thông tin chung</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* Col 1: Người tạo phiếu */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-800">Người tạo phiếu</h3>
                <div className="space-y-1.5 text-slate-600 text-xs">
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="text-slate-800 font-medium">{creatorName}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Mã NV:</span>
                    <span className="text-slate-800 font-medium">{creatorCode}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Phòng ban:</span>
                    <span className="text-slate-800 font-medium">{creatorDept}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Chức danh:</span>
                    <span className="text-slate-800 font-medium">{creatorRole}</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Người nhận */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-8 border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800">Người nhận</h3>
                <div className="space-y-1.5 text-slate-600 text-xs">
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="text-slate-800 font-medium">{recipientName}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Mã NV:</span>
                    <span className="text-slate-800 font-medium">{recipientCode}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Phòng ban:</span>
                    <span className="text-slate-800 font-medium">{recipientDept}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Chức danh:</span>
                    <span className="text-slate-800 font-medium">{recipientRole}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner đáy card */}
            <div className="mx-6 mb-5 px-4 py-2.5 bg-blue-50/70 rounded-lg text-xs text-slate-700 flex items-center gap-2">
              <span className="text-slate-500">Định mức áp dụng:</span>
              <span className="font-bold text-slate-900">
                {ticket.standardPackage ? 'Định mức Tiêu chuẩn - Áp dụng năm 2026' : 'Nhóm chức danh Chuyên viên'}
              </span>
            </div>
          </section>

          {/* SECTION 2: Thông tin yêu cầu */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" data-purpose="request-info-card">
            <div className="px-6 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Thông tin yêu cầu</h2>
            </div>
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-800 shrink-0">Lý do yêu cầu</span>
                <span className="text-slate-600">{reason}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0 md:border-l md:pl-8 border-slate-100">
                <span className="font-semibold text-slate-800 shrink-0">Ngày cần sử dụng</span>
                <span className="text-slate-600">{neededDate}</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: Danh sách tài sản yêu cầu */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" data-purpose="assets-list-card">
            {/* Tiêu đề & Filter pills */}
            <div className="p-6 pb-4 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách tài sản yêu cầu</h2>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Tabs / Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả <span className="font-bold">({countAll})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('exceeded')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                      activeFilter === 'exceeded'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Vượt định mức <span className="font-bold">({countExceeded})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('within')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                      activeFilter === 'within'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Trong định mức <span className="font-bold">({countWithin})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('no_quota')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                      activeFilter === 'no_quota'
                        ? 'bg-amber-700 text-white'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    Chưa có định mức <span className="font-bold">({countNoQuota})</span>
                  </button>
                </div>

                {/* Sắp xếp / Priority toggle */}
                <button
                  type="button"
                  onClick={() => setPriorityExceeded(!priorityExceeded)}
                  className="flex items-center gap-1.5 text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                >
                  <svg className={`w-3.5 h-3.5 ${priorityExceeded ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-medium">Ưu tiên dòng vượt định mức</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" id="detail-assets-table">
                <thead className="bg-[#f8fafc]/90 text-[11px] font-semibold text-slate-700 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-center w-12" scope="col">STT</th>
                    <th className="py-2.5 px-4" scope="col">Loại tài sản</th>
                    <th className="py-2.5 px-4" scope="col">Mô tả</th>
                    <th className="py-2.5 px-4 text-center" scope="col">SL yêu cầu</th>
                    <th className="py-2.5 px-4 text-center" scope="col">Định mức</th>
                    <th className="py-2.5 px-4 text-center" scope="col">Đã cấp</th>
                    <th className="py-2.5 px-4 text-center" scope="col">Trạng thái định mức</th>
                    <th className="py-2.5 px-4" scope="col">Ghi chú</th>
                    <th className="py-2.5 px-4 text-center w-16" scope="col">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAssets.map((item, index) => {
                    const isExceeded = item.quotaStatus === 'Vượt định mức';
                    const isWithin = item.quotaStatus === 'Trong định mức';
                    const isNoQuota = item.quotaStatus === 'Chưa có định mức';
                    const isExpanded = Boolean(expandedRows[item.id]);

                    return (
                      <React.Fragment key={item.id}>
                        {/* Main Asset Row */}
                        <tr
                          className={`transition-colors ${
                            isExceeded
                              ? 'bg-red-50/70 hover:bg-red-100/50'
                              : isNoQuota
                              ? 'bg-amber-50/60 hover:bg-amber-100/40'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-500">{index + 1}</td>
                          <td className="py-3 px-4 font-normal text-slate-800">{item.category}</td>
                          <td className="py-3 px-4 text-slate-600">{item.description}</td>
                          <td className={`py-3 px-4 text-center font-bold ${isExceeded ? 'text-red-600' : 'text-slate-700'}`}>
                            {item.requestedQty}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-700">{item.quotaQty}</td>
                          <td className="py-3 px-4 text-center text-slate-700">{item.allocatedQty}</td>

                          {/* Quota Badge */}
                          <td className="py-3 px-4 text-center">
                            {isExceeded && (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-600">
                                Vượt định mức
                              </span>
                            )}
                            {isWithin && (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Trong định mức
                              </span>
                            )}
                            {isNoQuota && (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Chưa có định mức
                              </span>
                            )}
                          </td>

                          {/* Ghi chú */}
                          <td className="py-3 px-4 text-slate-600">{item.notes}</td>

                          {/* Chi tiết expand toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleRow(item.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                              title={isExpanded ? 'Thu gọn chi tiết' : 'Xem tài sản đang giữ'}
                            >
                              <svg
                                className={`w-4 h-4 mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Sub-row for Existing Assets */}
                        {isExpanded && (
                          <tr className="bg-white">
                            <td className="pt-0 pb-4 px-4" colSpan={9}>
                              <div className="ml-10 bg-white border border-slate-200/90 rounded-lg p-4 shadow-xs max-w-xl">
                                <h4 className="text-xs font-bold text-slate-800 mb-2">Tài sản đang giữ cùng loại</h4>
                                {item.existingAssets && item.existingAssets.length > 0 ? (
                                  <table className="w-full text-left text-xs border border-slate-200 rounded">
                                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                                      <tr>
                                        <th className="py-1.5 px-3 border-r border-slate-200">Mã tài sản</th>
                                        <th className="py-1.5 px-3 border-r border-slate-200">Ngày cấp</th>
                                        <th className="py-1.5 px-3">Tình trạng</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {item.existingAssets.map((ea, eIdx) => (
                                        <tr key={eIdx}>
                                          <td className="py-2 px-3 border-r border-slate-100 font-medium text-blue-600 hover:underline cursor-pointer">
                                            {ea.code}
                                          </td>
                                          <td className="py-2 px-3 border-r border-slate-100 text-slate-600">
                                            {ea.allocatedDate}
                                          </td>
                                          <td className="py-2 px-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                              {ea.condition}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    Người nhận hiện chưa giữ tài sản nào thuộc danh mục này trong kho công ty.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Note */}
            <div className="px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>
                Tổng {assetItems.length} dòng: {countWithin} trong định mức, {countExceeded} vượt định mức, {countNoQuota} chưa có định mức
              </span>
            </div>
          </section>

          {/* Action Footer buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 pb-12" data-purpose="action-buttons-bar">
            {/* Nút Quay lại */}
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Quay lại
            </button>

            {/* Chỉ hiển thị các nút thao tác khác khi phiếu không ở trạng thái Đã thu hồi */}
            {!isRevoked && (
              <>
                {/* Nút Từ chối: hiển thị khi chưa duyệt và chưa từ chối */}
                {!isApproved && !isRejected && (
                  <button
                    type="button"
                    onClick={() => onReject(ticket)}
                    className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                    id="openModalBtn"
                  >
                    Từ chối
                  </button>
                )}

                {/* Khi click Phê duyệt thì biến thành button Tạo biên bản */}
                {isApproved ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onCreateHandoverForm) {
                        onCreateHandoverForm(ticket);
                      } else {
                        setIsHandoverModalOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[#0062eb] hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer animate-in fade-in duration-150"
                    id="createHandoverBtn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Tạo biên bản</span>
                  </button>
                ) : isRejected ? (
                  <button
                    type="button"
                    onClick={() => onReject(ticket)}
                    className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Sửa lý do từ chối</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApprove(ticket)}
                    className="px-5 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
                    id="approveBtn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Phê duyệt</span>
                  </button>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {/* END: MainContentArea */}

      {/* Modal Tạo biên bản bàn giao tài sản */}
      <CreateHandoverModal
        ticket={ticket}
        isOpen={isHandoverModalOpen}
        currentUser={currentUser}
        onClose={() => setIsHandoverModalOpen(false)}
        onSuccess={(handoverCode) => {
          setIsHandoverModalOpen(false);
          // Toast or additional feedback can be handled in parent
        }}
      />
    </div>
  );
};
