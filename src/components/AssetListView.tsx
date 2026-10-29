import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  QrCode, 
  Edit3, 
  Trash2, 
  History, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Boxes, 
  UserCheck, 
  Clock, 
  WifiOff, 
  FolderArchive,
  ArrowUpDown,
  FileQuestion
} from 'lucide-react';
import { Asset, AssetCategory } from '../types/asset.ts';
import { formatDateVN, formatVND, validateDateRange } from '../utils/assetRules.ts';

interface AssetListViewProps {
  assets: Asset[];
  categories: AssetCategory[];
  canViewDeleted: boolean;
  simulateNetworkError: boolean;
  onRetryNetwork: () => void;
  simulateEmptyState: boolean;
  onNavigateToCreate: () => void;
  onNavigateToEdit: (asset: Asset) => void;
  onOpenDeleteModal: (asset: Asset) => void;
  onOpenPrintQR: (assets: Asset[]) => void;
  onOpenAuditLog: (asset: Asset) => void;
}

export const AssetListView: React.FC<AssetListViewProps> = ({
  assets,
  categories,
  canViewDeleted,
  simulateNetworkError,
  onRetryNetwork,
  simulateEmptyState,
  onNavigateToCreate,
  onNavigateToEdit,
  onOpenDeleteModal,
  onOpenPrintQR,
  onOpenAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: 'ALL',
    status: 'ALL',
    from: '',
    to: '',
    includeDeleted: false
  });

  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(['ast-001', 'ast-002']);

  const [sortField, setSortField] = useState<'maTaiSan' | 'ngayMuaNhan' | 'nguyenGia'>('maTaiSan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchClick = () => {
    const dateCheck = validateDateRange(fromDate, toDate);
    if (!dateCheck.isValid) {
      setDateRangeError(dateCheck.errorMessage || 'Khoảng ngày không hợp lệ');
      return;
    }

    setDateRangeError(null);
    setAppliedFilters({
      search: searchTerm.trim(),
      category: selectedCategory,
      status: selectedStatus,
      from: fromDate,
      to: toDate,
      includeDeleted: canViewDeleted ? includeDeleted : false
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    setIncludeDeleted(false);
    setDateRangeError(null);
    setAppliedFilters({
      search: '',
      category: 'ALL',
      status: 'ALL',
      from: '',
      to: '',
      includeDeleted: false
    });
    setCurrentPage(1);
  };

  const handleRemoveSearchChip = () => {
    setSearchTerm('');
    setAppliedFilters((prev) => ({ ...prev, search: '' }));
  };

  const handleRemoveCategoryChip = () => {
    setSelectedCategory('ALL');
    setAppliedFilters((prev) => ({ ...prev, category: 'ALL' }));
  };

  const filteredAssets = useMemo(() => {
    if (simulateEmptyState) return [];

    return assets.filter((asset) => {
      if (asset.isDeleted && !appliedFilters.includeDeleted) {
        return false;
      }

      if (appliedFilters.search) {
        const query = appliedFilters.search.toLowerCase();
        const matchCode = asset.maTaiSan.toLowerCase().includes(query);
        const matchName = asset.tenTaiSan.toLowerCase().includes(query);
        const matchSerial = (asset.soSerial || '').toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchSerial) {
          return false;
        }
      }

      if (appliedFilters.category !== 'ALL' && asset.categoryId !== appliedFilters.category) {
        return false;
      }

      if (appliedFilters.status !== 'ALL' && asset.trangThai !== appliedFilters.status) {
        return false;
      }

      if (appliedFilters.from && asset.ngayMuaNhan < appliedFilters.from) {
        return false;
      }
      if (appliedFilters.to && asset.ngayMuaNhan > appliedFilters.to) {
        return false;
      }

      return true;
    });
  }, [assets, appliedFilters, simulateEmptyState]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let comp = 0;
      if (sortField === 'maTaiSan') {
        comp = a.maTaiSan.localeCompare(b.maTaiSan);
      } else if (sortField === 'ngayMuaNhan') {
        comp = a.ngayMuaNhan.localeCompare(b.ngayMuaNhan);
      } else if (sortField === 'nguyenGia') {
        comp = a.nguyenGia - b.nguyenGia;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [filteredAssets, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / pageSize));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  const isAllOnPageSelected = paginatedAssets.length > 0 && paginatedAssets.every((a) => selectedAssetIds.includes(a.id));

  const handleToggleSelectAll = () => {
    if (isAllOnPageSelected) {
      setSelectedAssetIds((prev) => prev.filter((id) => !paginatedAssets.some((a) => a.id === id)));
    } else {
      const pageIds = paginatedAssets.map((a) => a.id);
      setSelectedAssetIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAssetObjects = useMemo(() => {
    return assets.filter((a) => selectedAssetIds.includes(a.id) && !a.isDeleted);
  }, [assets, selectedAssetIds]);

  if (simulateNetworkError) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 flex items-center justify-between text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-bold text-red-900 text-sm">Lỗi kết nối máy chủ</div>
              <div className="text-red-700">
                Mã lỗi: <strong>ERR_NETWORK_TIMEOUT (504)</strong>. Vui lòng kiểm tra đường truyền mạng hoặc thử tải lại.
              </div>
            </div>
          </div>
          <button
            onClick={onRetryNetwork}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            Thử tải lại ngay
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không thể tải dữ liệu danh sách</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Đã xảy ra lỗi khi tải danh sách. Hệ thống không thể đồng bộ cơ sở dữ liệu thời gian thực.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onRetryNetwork}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tải lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalOriginalPrice = assets.reduce((sum, a) => sum + (a.isDeleted ? 0 : a.nguyenGia), 0);
  const inUseCount = assets.filter((a) => !a.isDeleted && a.trangThai === 'Đang sử dụng').length;
  const unassignedCount = assets.filter((a) => !a.isDeleted && a.trangThai === 'Chưa cấp phát').length;
  const totalQRPrinted = assets.reduce((sum, a) => sum + (a.isDeleted ? 0 : a.soLanInQR), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tổng nguyên giá tài sản
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
              {simulateEmptyState ? '0 ₫' : formatVND(totalOriginalPrice)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +4.2% so với tháng trước
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Đang sử dụng
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
              {simulateEmptyState ? '0' : `${inUseCount}/${assets.filter((a) => !a.isDeleted).length}`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {simulateEmptyState ? '0 thiết bị' : `${inUseCount} thiết bị đang khai thác`}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Chưa cấp phát
            </div>
            <div className="text-lg font-extrabold text-blue-600 mt-1 font-mono">
              {simulateEmptyState ? '0' : unassignedCount}
            </div>
            <div className="text-[11px] text-blue-600/80 font-medium mt-1">
              Sẵn sàng tạo phiếu bàn giao
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Đã in mã QR
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
              {simulateEmptyState ? '0' : `${totalQRPrinted} tem`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Chuẩn tem Code-128 / QR v3
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Action Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                Danh sách tài sản
              </h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                {filteredAssets.length} tài sản
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu, lọc điều kiện, cấp phát và quản lý tem nhãn QR tài sản công
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenPrintQR(selectedAssetObjects)}
              disabled={selectedAssetObjects.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>In QR ({selectedAssetObjects.length})</span>
            </button>

            <button
              onClick={onNavigateToCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới tài sản</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                placeholder="Tìm theo mã, tên hoặc số serial..."
                className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Category Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs shadow-2xs"
              >
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs shadow-2xs"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Chưa cấp phát">Chưa cấp phát</option>
                <option value="Đang sử dụng">Đang sử dụng</option>
                <option value="Đang sửa chữa / bảo trì">Đang bảo trì</option>
                <option value="Đã thanh lý">Đã thanh lý</option>
              </select>
            </div>

            {/* From Date */}
            <div className="lg:col-span-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                title="Từ ngày mua/nhận"
                className={`w-full px-2.5 py-2 bg-white rounded-xl border text-xs shadow-2xs ${
                  dateRangeError ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300'
                }`}
              />
            </div>

            {/* To Date */}
            <div className="lg:col-span-2">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                title="Đến ngày mua/nhận"
                className={`w-full px-2.5 py-2 bg-white rounded-xl border text-xs shadow-2xs ${
                  dateRangeError ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Sub Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-2 text-xs select-none ${
                canViewDeleted ? 'text-slate-700 cursor-pointer' : 'text-slate-400 cursor-not-allowed opacity-60'
              }`}>
                <input
                  type="checkbox"
                  disabled={!canViewDeleted}
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-medium">
                  <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
                  Hiển thị cả tài sản đã xóa (Lưu trữ)
                </span>
                {!canViewDeleted && (
                  <span className="text-[10px] text-slate-400">(Yêu cầu quyền chuyên biệt)</span>
                )}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Xóa bộ lọc</span>
              </button>

              <button
                onClick={handleSearchClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>

          {/* DATE RANGE ERROR BANNER */}
          {dateRangeError && (
            <div 
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Khoảng thời gian tra cứu không hợp lệ:</strong> {dateRangeError}. Hệ thống giữ lại kết quả tìm kiếm trước đó.
                </span>
              </div>
              <button
                onClick={() => setDateRangeError(null)}
                className="text-red-700 hover:text-red-900 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* APPLIED FILTER CHIPS */}
          {(appliedFilters.search || appliedFilters.category !== 'ALL' || appliedFilters.status !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <span className="font-semibold text-slate-500">Đang lọc:</span>
              
              {appliedFilters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                  Từ khóa: &ldquo;{appliedFilters.search}&rdquo;
                  <button onClick={handleRemoveSearchChip} className="hover:text-blue-900 ml-1">✕</button>
                </span>
              )}

              {appliedFilters.category !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                  Danh mục: {categories.find((c) => c.id === appliedFilters.category)?.name}
                  <button onClick={handleRemoveCategoryChip} className="hover:text-blue-900 ml-1">✕</button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-blue-600 underline font-medium ml-2 cursor-pointer"
              >
                Xóa tất cả điều kiện lọc
              </button>
            </div>
          )}
        </div>

        {/* Batch Selection Banner */}
        {selectedAssetIds.length > 0 && (
          <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-full">
                {selectedAssetIds.length}
              </span>
              <span>tài sản đang được chọn cho tác vụ in ấn / cấp phát</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenPrintQR(selectedAssetObjects)}
                className="font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                In QR tài sản đã chọn
              </button>
              <button
                onClick={() => setSelectedAssetIds([])}
                className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          {simulateEmptyState || filteredAssets.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <FileQuestion className="w-8 h-8" />
              </div>
              {appliedFilters.search || appliedFilters.category !== 'ALL' || appliedFilters.status !== 'ALL' ? (
                <div className="space-y-3 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-800">Không tìm thấy tài sản phù hợp</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Không có kết quả khớp với từ khóa hoặc tiêu chuẩn lọc đã chọn. Vui lòng thử từ khóa khác hoặc xóa bộ lọc.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-800">Chưa có tài sản nào</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hiện chưa có tài sản nào được ghi nhận. Dữ liệu tài sản sẽ tự động hiển thị khi được phân bổ vào đơn vị của bạn.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={onNavigateToCreate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Ghi nhận tài sản đầu tiên
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 select-none">
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    >
                      {isAllOnPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>

                  <th className="py-3 px-3">
                    <button
                      onClick={() => {
                        setSortField('maTaiSan');
                        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 cursor-pointer uppercase tracking-wider text-[11px]"
                    >
                      <span>Mã tài sản</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>

                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">Tên tài sản</th>
                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">Danh mục</th>
                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">Số Serial</th>
                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">Trạng thái</th>
                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">
                    <button
                      onClick={() => {
                        setSortField('ngayMuaNhan');
                        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                    >
                      <span>Ngày tạo</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3 px-3 uppercase tracking-wider text-[11px]">Người tạo</th>
                  <th className="py-3 px-3 text-right uppercase tracking-wider text-[11px]">
                    <button
                      onClick={() => {
                        setSortField('nguyenGia');
                        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="flex items-center gap-1 ml-auto hover:text-blue-600 cursor-pointer"
                    >
                      <span>Nguyên giá</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider text-[11px] w-28">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  const isDeleted = asset.isDeleted;

                  return (
                    <tr
                      key={asset.id}
                      className={`transition-colors ${
                        isDeleted 
                          ? 'bg-rose-50/40 text-slate-400 hover:bg-rose-50/60' 
                          : isSelected 
                            ? 'bg-blue-50/50 hover:bg-blue-50/80' 
                            : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => !isDeleted && handleToggleRow(asset.id)}
                          disabled={isDeleted}
                          className={isDeleted ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{asset.maTaiSan}</span>
                          {asset.soLanInQR > 0 && (
                            <span title={`Đã in ${asset.soLanInQR} lần`} className="text-[10px] bg-purple-50 text-purple-700 px-1 py-0.2 rounded border border-purple-200">
                              QR×{asset.soLanInQR}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800 max-w-xs">
                        <div className="truncate font-semibold" title={asset.tenTaiSan}>
                          {asset.tenTaiSan}
                        </div>
                        {isDeleted && (
                          <div className="text-[11px] text-red-600 mt-0.5">
                            Lý do xóa: {asset.lyDoXoa}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {asset.categoryName}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {asset.soSerial || <span className="text-slate-300">—</span>}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isDeleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Đã xóa (Lưu trữ)
                          </span>
                        ) : asset.trangThai === 'Chưa cấp phát' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                            Chưa cấp phát
                          </span>
                        ) : asset.trangThai === 'Đang sử dụng' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                            Đang sử dụng
                          </span>
                        ) : asset.trangThai === 'Đã thanh lý' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Đã thanh lý
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {asset.trangThai}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDateVN(asset.ngayMuaNhan)}
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap truncate max-w-[120px]" title={asset.nguoiGhiNhan}>
                        {asset.nguoiGhiNhan.split(' ')[0]} {asset.nguoiGhiNhan.split(' ')[1] || ''}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatVND(asset.nguyenGia)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isDeleted ? (
                          <span className="text-[11px] text-slate-400 font-italic">Chỉ xem</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onNavigateToEdit(asset)}
                              title="Sửa thông tin tài sản"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenPrintQR([asset])}
                              title="In tem nhãn QR"
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenDeleteModal(asset)}
                              title="Xóa tài sản"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenAuditLog(asset)}
                              title="Xem lịch sử kiểm toán"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!simulateEmptyState && filteredAssets.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                Hiển thị <strong>{Math.min(filteredAssets.length, (currentPage - 1) * pageSize + 1)}</strong> -{' '}
                <strong>{Math.min(filteredAssets.length, currentPage * pageSize)}</strong> trên{' '}
                <strong>{filteredAssets.length}</strong> bản ghi
              </span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value={10}>10 dòng / trang</option>
                <option value={25}>25 dòng / trang</option>
                <option value={50}>50 dòng / trang</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
