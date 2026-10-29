import { TransferIcon } from './TransferIcon';
import React, { useMemo, useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { DEPARTMENT_MAP, EMPLOYEE_MAP } from '../data/mockData';
import { Asset } from '../types/transfer';

export const AssetCatalogView: React.FC = () => {
  const { assets, auditLogs, navigateTo } = useTransfer();
  const [activeTab, setActiveTab] = useState<'assets' | 'logs'>('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      // Dept filter
      if (deptFilter !== 'all' && a.ma_bo_phan_su_dung !== deptFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && a.trang_thai !== statusFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchId = a.id_tai_san?.toLowerCase().includes(q) || a.ma_tai_san?.toLowerCase().includes(q);
        const matchName = a.name?.toLowerCase().includes(q);
        const matchSerial = a.serialNumber?.toLowerCase().includes(q);
        const matchLocation = a.currentLocation?.toLowerCase().includes(q);
        const matchCustodian = a.custodianName?.toLowerCase().includes(q) || a.custodianCode?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchSerial && !matchLocation && !matchCustodian) {
          return false;
        }
      }
      return true;
    });
  }, [assets, deptFilter, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage, itemsPerPage]);

  const formatCurrency = (val?: number) => {
    if (!val) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  const getStatusBadge = (trangThai?: string, tinhTrang?: string) => {
    switch (trangThai) {
      case 'Đang sử dụng':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang sử dụng ({tinhTrang || 'Tốt'})
          </span>
        );
      case 'Sẵn sàng cấp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sẵn sàng cấp
          </span>
        );
      case 'Chưa cấp phát':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Chưa cấp phát
          </span>
        );
      case 'Đã thu hồi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Đã thu hồi ({tinhTrang})
          </span>
        );
      case 'Mất':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Mất
          </span>
        );
      case 'Đã thanh lý':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Đã thanh lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-700">
            {trangThai || 'Khác'}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
              Sổ theo dõi & Danh mục tài sản dùng chung (F06)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-blue-600 text-xs font-semibold">
              {assets.length} tài sản hệ thống
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Dữ liệu từ danh mục tài sản và danh sách nhân viên chung của hệ thống
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sổ tài sản hiện hành ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Nhật ký điều chuyển</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'assets' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <TransferIcon className="text-[#64748b] text-[18px] absolute left-3 top-2.5 pointer-events-none" name={"search"} />
              <input
                type="text"
                placeholder="Tìm mã tài sản, tên tài sản, số serial..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 text-xs bg-white rounded-lg border border-[#e2e8f0] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            {/* Department filter */}
            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 bg-white border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">Tất cả phòng ban</option>
                {[...new Set(assets.map(asset => asset.currentDepartment).filter(Boolean))].map(department => <option key={department} value={department}>{department}</option>)}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 bg-white border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                {[...new Set(assets.map(asset => asset.trang_thai))].map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          {/* Asset table */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-[#475569] border-b border-[#e2e8f0] font-semibold">
                  <tr>
                    <th className="py-3 px-3 w-16">ID</th>
                    <th className="py-3 px-3">Mã tài sản</th>
                    <th className="py-3 px-3">Tên tài sản</th>
                    <th className="py-3 px-3">Loại</th>
                    <th className="py-3 px-3">Số Seri</th>
                    <th className="py-3 px-3">Vị trí hiện tại</th>
                    <th className="py-3 px-3">Người sử dụng / Quản lý</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Nguyên giá</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">
                        Không tìm thấy tài sản nào phù hợp điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset) => (
                      <tr
                        key={asset.id_tai_san}
                        onClick={() => setSelectedAssetDetail(asset)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-semibold">
                          {asset.id_tai_san}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-600 group-hover:underline">
                          {asset.ma_tai_san}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#0f172a]">
                          {asset.ten_tai_san}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                            {asset.ma_loai}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {asset.so_seri || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-medium text-slate-700">
                            <TransferIcon className="text-[14px] text-blue-600" name={"location_on"} />
                            <span className="truncate max-w-[160px]">{asset.vi_tri}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{asset.custodianName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {asset.ma_nguoi_su_dung || asset.ma_nguoi_quan_ly || 'Quản lý tài sản'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(asset.trang_thai, asset.tinh_trang)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(asset.originalPrice)}
                        </td>
                        <td
                          className="py-3 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {asset.trang_thai !== 'Mất' && asset.trang_thai !== 'Đã thanh lý' ? (
<span className="text-xs text-slate-500">{asset.custodianName || "Chưa có người sử dụng"}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Khóa</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>-
                <strong>{Math.min(currentPage * itemsPerPage, filteredAssets.length)}</strong> trên tổng số{' '}
                <strong>{filteredAssets.length}</strong> tài sản
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <TransferIcon className="text-[14px]" name={"first_page"} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <TransferIcon className="text-[14px]" name={"chevron_left"} />
                </button>
                <span className="px-2 font-mono font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <TransferIcon className="text-[14px]" name={"chevron_right"} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <TransferIcon className="text-[14px]" name={"last_page"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0f172a]">
                Nhật ký điều chuyển tài sản & Lưu vết kiểm toán (BR09)
              </h3>
              <span className="text-[11px] text-[#64748b]">
                Tự động ghi nhận khi hoàn tất quy trình bàn giao (F06)
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có lịch sử điều chuyển nào được lưu.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">
                          {log.requestId}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-800">
                          {log.assetName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {log.assetId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
                        <span>
                          Từ: <strong>{log.fromLocation}</strong> ({log.fromCustodian})
                        </span>
                        <TransferIcon className="text-[14px] text-slate-400" name={"arrow_forward"} />
                        <span className="text-blue-600 font-semibold">
                          Đến: <strong>{log.toLocation}</strong> ({log.toCustodian})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Ghi chú: {log.notes}
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end text-[11px] text-slate-400 shrink-0">
                      <span className="font-medium text-slate-700">
                        Cán bộ thực hiện: {log.operator}
                      </span>
                      <span>Thời điểm: {log.completedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asset Full Details Modal (All 18 fields from specification) */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <TransferIcon className="text-blue-600 text-[22px]" name={"info"} />
                <h3 className="text-base font-bold text-slate-900">
                  Chi tiết hồ sơ tài sản: {selectedAssetDetail.ma_tai_san}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <TransferIcon className="text-[20px]" name={"close"} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Grid 18 fields */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">ID tài sản (id_tai_san):</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAssetDetail.id_tai_san}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mã tài sản (ma_tai_san):</span>
                  <span className="font-mono font-bold text-blue-600">{selectedAssetDetail.ma_tai_san}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Tên tài sản (ten_tai_san):</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedAssetDetail.ten_tai_san}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mã loại (ma_loai):</span>
                  <span className="font-mono">{selectedAssetDetail.ma_loai} ({selectedAssetDetail.category})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số seri (so_seri):</span>
                  <span className="font-mono font-semibold">{selectedAssetDetail.so_seri || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nguồn gốc (nguon_goc):</span>
                  <span>{selectedAssetDetail.nguon_goc}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày nhập (ngay_nhap):</span>
                  <span>{selectedAssetDetail.ngay_nhap}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nguyên giá (nguyen_gia_vnd):</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(selectedAssetDetail.originalPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tình trạng (tinh_trang):</span>
                  <span>{selectedAssetDetail.tinh_trang}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Trạng thái (trang_thai):</span>
                  <span>{selectedAssetDetail.trang_thai}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bộ phận sử dụng (ma_bo_phan):</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAssetDetail.ma_bo_phan_su_dung} - {DEPARTMENT_MAP[selectedAssetDetail.ma_bo_phan_su_dung] || ''}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Vị trí hiện tại (vi_tri):</span>
                  <span className="font-semibold text-blue-600">{selectedAssetDetail.vi_tri}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Người sử dụng (ma_nguoi_su_dung):</span>
                  <span>
                    {selectedAssetDetail.ma_nguoi_su_dung
                      ? `${EMPLOYEE_MAP[selectedAssetDetail.ma_nguoi_su_dung]?.ho_ten || ''} (${selectedAssetDetail.ma_nguoi_su_dung})`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Người quản lý (ma_nguoi_quan_ly):</span>
                  <span>
                    {selectedAssetDetail.ma_nguoi_quan_ly
                      ? `${EMPLOYEE_MAP[selectedAssetDetail.ma_nguoi_quan_ly]?.ho_ten || ''} (${selectedAssetDetail.ma_nguoi_quan_ly})`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Người ghi nhận (ma_nguoi_ghi_nhan):</span>
                  <span className="font-mono">{selectedAssetDetail.ma_nguoi_ghi_nhan || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nhà cung cấp (ma_nha_cung_cap):</span>
                  <span className="font-mono">{selectedAssetDetail.ma_nha_cung_cap || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số chứng từ (so_chung_tu):</span>
                  <span className="font-mono">{selectedAssetDetail.so_chung_tu || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Thông tin bổ sung (thong_tin_bo_sung):</span>
                  <p className="text-slate-700 italic">{selectedAssetDetail.thong_tin_bo_sung || 'Không có ghi chú'}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedAssetDetail(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
