import { Header } from './Header';
import { allocationBreadcrumbs, assetBreadcrumbs } from '../navigation/breadcrumbs';
import React, { useState, useMemo, useEffect } from 'react';
import { RequestTicket, RequestStatus, RequestType, UserProfile } from '../types.ts';
import { AssetListView } from './AssetListView.tsx';
import { AssetCreateForm } from './AssetCreateForm.tsx';
import { AssetCreateSuccess } from './AssetCreateSuccess.tsx';
import { AssetEditForm } from './AssetEditForm.tsx';
import { DeleteAssetModal } from './DeleteAssetModal.tsx';
import { PrintQRModal } from './PrintQRModal.tsx';
import { AuditLogModal } from './AuditLogModal.tsx';
import { INITIAL_CATEGORIES, INITIAL_SUPPLIERS } from '../data/mockData.ts';
import { Asset } from '../types/asset.ts';
import { useAssetCatalog } from '../data/assetCatalog';

interface AssetManagerDashboardProps {
  currentMenu: string;
  tickets: RequestTicket[];
  currentUser: UserProfile;
  onOpenRoleSwitcher: () => void;
  onViewTicket: (ticket: RequestTicket) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onApproveTicket?: (ticket: RequestTicket) => void;
  onRejectTicket?: (ticket: RequestTicket) => void;
  onOpenMobileSidebar?: () => void;
  onSelectTab?: (tab: string) => void;
}

type TabStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã thu hồi' | 'Tất cả';

export const AssetManagerDashboard: React.FC<AssetManagerDashboardProps> = ({
  currentMenu,
  tickets,
  currentUser,
  onOpenRoleSwitcher,
  onViewTicket,
  onRefresh,
  isRefreshing = false,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  // Active Status Tab (default: "Chờ duyệt")
  const [activeTab, setActiveTab] = useState<TabStatus>('Chờ duyệt');

  // Filter states for ticket table
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Tất cả phòng ban');
  const [selectedType, setSelectedType] = useState<string>('Tất cả loại yêu cầu');

  // Sorting state for ticket table
  const [sortOrder, setSortOrder] = useState<'oldest_first' | 'newest_first'>('oldest_first');

  // Pagination states for ticket table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Mobile sidebar state
  const activeMenu = currentMenu === 'Cấp phát tài sản' ? 'Yêu cầu cấp phát' : currentMenu;
  const setActiveMenu = (menu: string) => onSelectTab?.(menu);

  // Asset Management module state inside AssetManagerDashboard
  const [assets, setAssets] = useAssetCatalog();

  const [assetViewMode, setAssetViewMode] = useState<'list' | 'create' | 'success' | 'edit'>('list');
  useEffect(() => { setAssetViewMode('list'); }, [currentMenu]);
  const [justCreatedAsset, setJustCreatedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Modals state for Asset Management
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [printingAssets, setPrintingAssets] = useState<Asset[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [inspectingAuditAsset, setInspectingAuditAsset] = useState<Asset | null>(null);

  // Tester simulation settings
  const [canViewDeleted, setCanViewDeleted] = useState(true);
  const [simulateNetworkError, setSimulateNetworkError] = useState(false);
  const [simulatePrinterError, setSimulatePrinterError] = useState(false);
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);

  const handleCreateSuccess = (newAsset: Asset, shouldAddAnother: boolean = false) => {
    setAssets((prev) => [newAsset, ...prev]);
    if (shouldAddAnother) {
      // Stay on create
    } else {
      setJustCreatedAsset(newAsset);
      setAssetViewMode('success');
    }
  };

  const handleEditSuccess = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setAssetViewMode('list');
  };

  const handleConfirmSoftDelete = (assetId: string, reason: string) => {
    const nowStr = new Date().toISOString();
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        return {
          ...a,
          isDeleted: true,
          lyDoXoa: reason,
          ngayXoa: nowStr,
          nguoiXoa: 'Nguyễn Văn An (NV-0248)',
          lichSu: [
            ...(a.lichSu || []),
            {
              id: `log-${Date.now()}`,
              assetId: a.id,
              timestamp: nowStr,
              operatorName: 'Nguyễn Văn An (NV-0248)',
              operatorRole: 'Nhân viên QLTS',
              actionType: 'Xóa mềm',
              details: `Xóa mềm tài sản khỏi danh mục hoạt động. Lý do: ${reason}`
            }
          ]
        };
      })
    );
    setDeletingAsset(null);
  };

  const handlePrintSuccess = (assetIds: string[], printType: 'printer' | 'pdf') => {
    const nowStr = new Date().toISOString();
    setAssets((prev) =>
      prev.map((a) => {
        if (!assetIds.includes(a.id)) return a;
        return {
          ...a,
          soLanInQR: (a.soLanInQR || 0) + 1,
          lichSu: [
            ...(a.lichSu || []),
            {
              id: `log-${Date.now()}-${a.id}`,
              assetId: a.id,
              timestamp: nowStr,
              operatorName: 'Nguyễn Văn An (NV-0248)',
              operatorRole: 'Nhân viên QLTS',
              actionType: printType === 'pdf' ? 'Tạo tem QR' : 'In tem QR',
              details: `Thực hiện ${printType === 'pdf' ? 'xuất tệp PDF' : 'gửi lệnh in tem'} chuẩn tem mã hóa ISO/IEC 18004`
            }
          ]
        };
      })
    );
    if (printType === 'printer') {
      setIsPrintModalOpen(false);
    }
  };

  // Tab counts for tickets
  const tabCounts = useMemo(() => {
    return {
      'Chờ duyệt': tickets.filter((t) => t.status === 'Chờ duyệt').length,
      'Đã duyệt': tickets.filter((t) => t.status === 'Đã duyệt' || t.status === 'Phê duyệt' || t.status === 'Đã cấp phát').length,
      'Từ chối': tickets.filter((t) => t.status === 'Từ chối').length,
      'Đã thu hồi': tickets.filter((t) => t.status === 'Đã thu hồi').length,
      'Tất cả': tickets.length,
    };
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (activeTab === 'Chờ duyệt' && ticket.status !== 'Chờ duyệt') return false;
      if (activeTab === 'Đã duyệt' && ticket.status !== 'Đã duyệt' && ticket.status !== 'Phê duyệt' && ticket.status !== 'Đã cấp phát') return false;
      if (activeTab === 'Từ chối' && ticket.status !== 'Từ chối') return false;
      if (activeTab === 'Đã thu hồi' && ticket.status !== 'Đã thu hồi') return false;

      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();
        const matchCode = ticket.code.toLowerCase().includes(query);
        const matchCreator = (ticket.creatorName || '').toLowerCase().includes(query);
        const matchCreatorCode = (ticket.creatorCode || '').toLowerCase().includes(query);
        const matchRecipient = (ticket.recipient || '').toLowerCase().includes(query);
        const matchRecipientCode = (ticket.recipientCode || '').toLowerCase().includes(query);
        if (!matchCode && !matchCreator && !matchCreatorCode && !matchRecipient && !matchRecipientCode) {
          return false;
        }
      }

      if (selectedDept !== 'Tất cả phòng ban') {
        const dept = ticket.department || ticket.creatorDepartment || '';
        if (dept !== selectedDept && !dept.includes(selectedDept)) return false;
      }

      if (selectedType !== 'Tất cả loại yêu cầu' && ticket.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [tickets, activeTab, searchTerm, selectedDept, selectedType]);

  // Sorted tickets
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      const parseDate = (dStr: string) => {
        const parts = dStr.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        }
        return 0;
      };
      const timeA = parseDate(a.createdDate);
      const timeB = parseDate(b.createdDate);
      if (sortOrder === 'oldest_first') {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });
  }, [filteredTickets, sortOrder]);

  // Paginated tickets
  const totalPages = Math.ceil(sortedTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTickets.slice(start, start + pageSize);
  }, [sortedTickets, currentPage, pageSize]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('Tất cả phòng ban');
    setSelectedType('Tất cả loại yêu cầu');
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Chờ duyệt':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#EA580C] min-w-[96px]">
            Chờ duyệt
          </span>
        );
      case 'Đã duyệt':
      case 'Phê duyệt':
      case 'Đã cấp phát':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#059669] min-w-[96px]">
            Đã duyệt
          </span>
        );
      case 'Từ chối':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#DC2626] min-w-[96px]">
            Từ chối
          </span>
        );
      case 'Đã thu hồi':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-slate-200 min-w-[96px]">
            Đã thu hồi
          </span>
        );
      case 'Nháp':
      default:
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 min-w-[96px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 antialiased font-sans flex h-full min-w-0 overflow-hidden">


      {/* BEGIN: MainContentArea */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* BEGIN: TopBar */}
        <Header currentUser={currentUser} onToggleMobileMenu={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher}
          breadcrumbs={activeMenu === 'Danh sách tài sản' ? assetBreadcrumbs(assetViewMode, editingAsset?.maTaiSan, () => setAssetViewMode('list')) : ['Cấp phát tài sản', 'Yêu cầu cấp phát'].includes(activeMenu) ? allocationBreadcrumbs('list', undefined, () => setActiveMenu('Yêu cầu cấp phát')) : [{ label: activeMenu }]} />
        {/* END: TopBar */}

        {/* Main Content Area */}
        {activeMenu === 'Danh sách tài sản' ? (
          <main className="flex-1 pb-12" data-purpose="asset-list-module-body">
            {assetViewMode === 'list' && (
              <AssetListView
                assets={assets}
                categories={INITIAL_CATEGORIES}
                canViewDeleted={canViewDeleted}
                simulateNetworkError={simulateNetworkError}
                onRetryNetwork={() => setSimulateNetworkError(false)}
                simulateEmptyState={simulateEmptyState}
                onNavigateToCreate={() => setAssetViewMode('create')}
                onNavigateToEdit={(asset) => {
                  setEditingAsset(asset);
                  setAssetViewMode('edit');
                }}
                onOpenDeleteModal={(asset) => setDeletingAsset(asset)}
                onOpenPrintQR={(selected) => {
                  setPrintingAssets(selected);
                  setIsPrintModalOpen(true);
                }}
                onOpenAuditLog={(asset) => setInspectingAuditAsset(asset)}
              />
            )}

            {assetViewMode === 'create' && (
              <AssetCreateForm
                categories={INITIAL_CATEGORIES}
                suppliers={INITIAL_SUPPLIERS}
                existingAssets={assets}
                onBack={() => setAssetViewMode('list')}
                onSaveSuccess={handleCreateSuccess}
              />
            )}

            {assetViewMode === 'success' && justCreatedAsset && (
              <AssetCreateSuccess
                asset={justCreatedAsset}
                onPrintQR={(asset) => {
                  setPrintingAssets([asset]);
                  setIsPrintModalOpen(true);
                }}
                onCreateAnother={() => setAssetViewMode('create')}
                onBackToList={() => setAssetViewMode('list')}
                onQuickAction={(action) => {
                  if (action === 'allocate') {
                    if (onSelectTab) onSelectTab('Bàn giao tài sản');
                  }
                }}
              />
            )}

            {assetViewMode === 'edit' && editingAsset && (
              <AssetEditForm
                asset={editingAsset}
                categories={INITIAL_CATEGORIES}
                suppliers={INITIAL_SUPPLIERS}
                existingAssets={assets}
                onBack={() => setAssetViewMode('list')}
                onSave={handleEditSuccess}
                onOpenAuditLog={() => setInspectingAuditAsset(editingAsset)}
              />
            )}

            {/* Modals */}
            <DeleteAssetModal
              asset={deletingAsset}
              isOpen={Boolean(deletingAsset)}
              onClose={() => setDeletingAsset(null)}
              onConfirmDelete={handleConfirmSoftDelete}
            />

            <PrintQRModal
              assets={printingAssets}
              isOpen={isPrintModalOpen}
              onClose={() => setIsPrintModalOpen(false)}
              onPrintSuccess={handlePrintSuccess}
              simulatePrinterError={simulatePrinterError}
            />

            <AuditLogModal
              asset={inspectingAuditAsset}
              isOpen={Boolean(inspectingAuditAsset)}
              onClose={() => setInspectingAuditAsset(null)}
            />
          </main>
        ) : (
          <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto" data-purpose="page-body">
            {/* Page Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách phiếu yêu cầu cấp phát</h1>
              <p className="text-sm text-slate-500">Tiếp nhận, xem xét và phê duyệt yêu cầu cấp phát tài sản.</p>
            </div>

            {/* BEGIN: FilterSection */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1" data-purpose="filter-bar">
              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="search-input">Tìm kiếm</label>
                <div className="relative rounded-lg shadow-none">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Mã phiếu, tên hoặc mã nhân viên"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="dept-select">Phòng ban</label>
                <div className="relative">
                  <select
                    id="dept-select"
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="Tất cả phòng ban">Tất cả phòng ban</option>
                    <option value="Kế toán">Kế toán</option>
                    <option value="Nhân sự">Nhân sự</option>
                    <option value="Công nghệ">Công nghệ</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Kinh doanh">Kinh doanh</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="type-select">Loại yêu cầu</label>
                <div className="relative">
                  <select
                    id="type-select"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="Tất cả loại yêu cầu">Tất cả loại yêu cầu</option>
                    <option value="Cho cá nhân">Cho cá nhân</option>
                    <option value="Cho nhân viên mới">Cho nhân viên mới</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex items-center h-10">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap focus:outline-none transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            </section>

            {/* BEGIN: ContentCard */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden" data-purpose="table-card-container">
              <div className="border-b border-slate-200 px-6 flex flex-wrap items-center justify-between gap-4">
                <nav aria-label="Tabs" className="flex space-x-6 text-sm font-medium overflow-x-auto scrollbar-none">
                  {(['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã thu hồi', 'Tất cả'] as TabStatus[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const count = tabCounts[tab];
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleTabChange(tab)}
                        className={`border-b-2 py-3.5 px-0.5 inline-flex items-center gap-2 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span>{tab}</span>
                        <span
                          className={`rounded-full text-xs font-semibold px-2 py-0.5 ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === 'oldest_first' ? 'newest_first' : 'oldest_first')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Đổi thứ tự sắp xếp theo ngày tạo"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{sortOrder === 'oldest_first' ? 'Ngày tạo: Cũ nhất trước' : 'Ngày tạo: Mới nhất trước'}</span>
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={onRefresh}
                    className="p-1.5 text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Làm mới"
                  >
                    <svg
                      className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* BEGIN: DataTable */}
              <div className="overflow-x-auto min-h-[320px]">
                <table className="w-full text-left text-sm" id="request-tickets-table">
                  <thead className="bg-[#f8fafc]/90 text-[13px] font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center w-12" scope="col">STT</th>
                      <th className="py-3 px-4" scope="col">Mã phiếu</th>
                      <th className="py-3 px-4" scope="col">Người tạo phiếu</th>
                      <th className="py-3 px-4" scope="col">Phòng ban</th>
                      <th className="py-3 px-4" scope="col">Loại yêu cầu</th>
                      <th className="py-3 px-4" scope="col">Người nhận tài sản</th>
                      <th
                        className="py-3 px-4 cursor-pointer group whitespace-nowrap"
                        scope="col"
                        onClick={() => setSortOrder(sortOrder === 'oldest_first' ? 'newest_first' : 'oldest_first')}
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>Ngày tạo</span>
                          <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </th>
                      <th className="py-3 px-4" scope="col">Ngày cần sử dụng</th>
                      <th className="py-3 px-4 text-center" scope="col">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                    {paginatedTickets.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">Không tìm thấy phiếu yêu cầu cấp phát nào phù hợp.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTickets.map((ticket, index) => {
                        const stt = (currentPage - 1) * pageSize + index + 1;
                        const creator = ticket.creatorName || ticket.recipient;
                        const dept = ticket.department || ticket.creatorDepartment || '—';

                        return (
                          <tr
                            key={ticket.id}
                            onClick={() => onViewTicket(ticket)}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-4 text-center text-slate-500 font-normal">{stt}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors">
                                {ticket.code}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-normal text-slate-800">{creator}</td>
                            <td className="py-3.5 px-4 font-normal text-slate-700">{dept}</td>
                            <td className="py-3.5 px-4 font-normal text-slate-700">{ticket.type}</td>
                            <td className="py-3.5 px-4 font-normal text-slate-800">{ticket.recipient}</td>
                            <td className="py-3.5 px-4 font-normal text-slate-600">{ticket.createdDate}</td>
                            <td className="py-3.5 px-4 font-normal text-slate-600">{ticket.neededDate}</td>
                            <td className="py-3.5 px-4 text-center">
                              {renderStatusBadge(ticket.status)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* BEGIN: Pagination */}
              <div className="px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600" data-purpose="table-pagination">
                <div>
                  <span>
                    Hiển thị{' '}
                    {sortedTickets.length === 0
                      ? 0
                      : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, sortedTickets.length)}`}{' '}
                    trên {sortedTickets.length} phiếu
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-slate-300 py-1 pl-3 pr-8 text-xs font-medium text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value={6}>6 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                  </div>

                  <div className="inline-flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`p-1 rounded-lg border border-slate-200 transition-colors ${
                        currentPage === 1
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 cursor-pointer'
                      }`}
                      title="Trang trước"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isActive = page === currentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'border border-transparent text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={`p-1 rounded-lg border border-slate-200 transition-colors ${
                        currentPage === totalPages || totalPages === 0
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 cursor-pointer'
                      }`}
                      title="Trang sau"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
};
