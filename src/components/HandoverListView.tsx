import { Header } from './Header';
import { handoverBreadcrumbs } from '../navigation/breadcrumbs';
import { useWorkspaceNavigation } from '../navigation/WorkspaceNavigation';
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HandoverProtocol, HandoverStatus, UserProfile } from '../types.ts';
import { Printer } from 'lucide-react';
import { canEditHandover } from '../utils/handoverRules';
import { downloadHandoverDocument } from '../utils/handoverDocument';

interface HandoverListViewProps {
  handovers: HandoverProtocol[];
  currentUser: UserProfile;
  onViewHandover: (protocol: HandoverProtocol) => void;
  onRefresh: () => void;
  onOpenRoleSwitcher: () => void;
  onOpenMobileSidebar?: () => void;
}

type TabFilter = 'Tất cả' | 'Nháp' | 'Chờ ký' | 'Hoàn tất';

export const HandoverListView: React.FC<HandoverListViewProps> = ({
  handovers,
  currentUser,
  onViewHandover,
  onRefresh,
  onOpenRoleSwitcher,
  onOpenMobileSidebar,
}) => {
  const navigation = useWorkspaceNavigation();
  const isEmployee = currentUser.role === 'employee';

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabFilter>('Tất cả');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Active open dropdown menu per row
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  useEffect(() => {
    if (!activeMenuId) return;
    const close = () => setActiveMenuId(null);
    const onOutside = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.('[data-handover-actions]')) close();
    };
    document.addEventListener('pointerdown', onOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [activeMenuId]);

  // Word export feedback
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState('');

  const handlePrintProtocol = async (protocol: HandoverProtocol) => {
    if (exportingId) return;
    setActiveMenuId(null);
    setExportingId(protocol.id);
    setExportError('');
    try {
      await downloadHandoverDocument(protocol, `${import.meta.env.BASE_URL}templates/bien-ban-ban-giao-tai-san.docx`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Không tạo được file Word. Vui lòng thử lại.');
    } finally {
      setExportingId(null);
    }
  };

  // Filter list by role first: Employee only sees handovers assigned to them or created for them
  const roleFilteredHandovers = useMemo(() => {
    if (isEmployee) {
      return handovers.filter(
        (h) =>
          h.receiverName === currentUser.name ||
          h.receiverCode === currentUser.code ||
          h.senderName === currentUser.name
      );
    }
    return handovers;
  }, [handovers, currentUser, isEmployee]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      'Tất cả': roleFilteredHandovers.length,
      'Nháp': roleFilteredHandovers.filter((h) => h.status === 'Nháp').length,
      'Chờ ký': roleFilteredHandovers.filter((h) => h.status === 'Chờ ký').length,
      'Hoàn tất': roleFilteredHandovers.filter((h) => h.status === 'Hoàn tất').length,
    };
  }, [roleFilteredHandovers]);

  // Filtered handovers
  const filteredHandovers = useMemo(() => {
    return roleFilteredHandovers.filter((item) => {
      // Tab filter
      if (activeTab === 'Nháp' && item.status !== 'Nháp') return false;
      if (activeTab === 'Chờ ký' && item.status !== 'Chờ ký') return false;
      if (activeTab === 'Hoàn tất' && item.status !== 'Hoàn tất') return false;

      // Status dropdown filter
      if (selectedStatus === 'draft' && item.status !== 'Nháp') return false;
      if (selectedStatus === 'pending' && item.status !== 'Chờ ký') return false;
      if (selectedStatus === 'completed' && item.status !== 'Hoàn tất') return false;

      // Search term (mã biên bản, bên giao, bên nhận)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();
        const matchCode = item.code.toLowerCase().includes(query);
        const matchSender = item.senderName.toLowerCase().includes(query);
        const matchReceiver = item.receiverName.toLowerCase().includes(query);
        if (!matchCode && !matchSender && !matchReceiver) return false;
      }

      // Department filter
      if (selectedDept !== '') {
        const deptMap: Record<string, string> = {
          hc: 'Phòng Hành chính',
          kd: 'Phòng Kinh doanh',
          ns: 'Phòng Nhân sự',
          cn: 'Phòng Công nghệ',
          kt: 'Phòng Kế toán',
        };
        const expectedDept = deptMap[selectedDept] || '';
        if (
          expectedDept &&
          !item.senderDept.includes(expectedDept) &&
          !item.receiverDept.includes(expectedDept)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [roleFilteredHandovers, activeTab, selectedStatus, searchTerm, selectedDept]);

  // Sorted handovers
  const sortedHandovers = useMemo(() => {
    return [...filteredHandovers].sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.code.localeCompare(a.code);
      } else if (sortOrder === 'oldest') {
        return a.code.localeCompare(b.code);
      } else if (sortOrder === 'val_high') {
        return b.totalValueNumber - a.totalValueNumber;
      } else if (sortOrder === 'val_low') {
        return a.totalValueNumber - b.totalValueNumber;
      }
      return 0;
    });
  }, [filteredHandovers, sortOrder]);

  // Paginated handovers
  const totalPages = Math.ceil(sortedHandovers.length / pageSize) || 1;
  const paginatedHandovers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedHandovers.slice(start, start + pageSize);
  }, [sortedHandovers, currentPage, pageSize]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedStatus('');
    setActiveTab('Tất cả');
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: HandoverStatus) => {
    switch (status) {
      case 'Chờ ký':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ ký
          </span>
        );
      case 'Hoàn tất':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Hoàn tất
          </span>
        );
      case 'Nháp':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Nháp
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#f0f4f9]">
      {/* Top Header Navigation */}
      <Header currentUser={currentUser} onToggleMobileMenu={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher} breadcrumbs={handoverBreadcrumbs(undefined, undefined, () => navigation?.navigate('Yêu cầu cấp phát'))} />

      {/* Body Content */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {exportError && <div role="alert" className="mb-4 px-4 py-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">{exportError}</div>}
        {exportingId && <div role="status" className="mb-4 text-xs text-blue-600">Đang tạo file Word biên bản bàn giao…</div>}
        <div className="max-w-[1180px] mx-auto space-y-6">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {isEmployee ? 'Biên bản bàn giao tài sản của tôi' : 'Danh sách biên bản bàn giao'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isEmployee
                  ? 'Theo dõi, kiểm tra và ký nhận các biên bản bàn giao tài sản được cấp cho bạn.'
                  : 'Quản lý, theo dõi tiến độ lập và ký nhận biên bản bàn giao tài sản.'}
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Input */}
              <div className="md:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <input
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Tìm kiếm mã biên bản, người giao, người nhận..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Dropdown: Phòng ban */}
              <div>
                <select
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả phòng ban</option>
                  <option value="hc">Phòng Hành chính</option>
                  <option value="kd">Phòng Kinh doanh</option>
                  <option value="ns">Phòng Nhân sự</option>
                  <option value="cn">Phòng Công nghệ</option>
                  <option value="kt">Phòng Kế toán</option>
                </select>
              </div>

              {/* Dropdown: Trạng thái & Reset */}
              <div className="flex items-center gap-2">
                <select
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="draft">Nháp</option>
                  <option value="pending">Chờ ký</option>
                  <option value="completed">Hoàn tất</option>
                </select>
                <button
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer"
                  title="Xóa bộ lọc"
                  type="button"
                  onClick={handleClearFilters}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Status Tabs & Quick Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit text-xs font-semibold select-none">
              {(['Tất cả', 'Nháp', 'Chờ ký', 'Hoàn tất'] as TabFilter[]).map((tab) => {
                const isActive = activeTab === tab;
                const count = tabCounts[tab];
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Sort */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Sắp xếp:</span>
              <select
                className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Ngày lập: Mới nhất trước</option>
                <option value="oldest">Ngày lập: Cũ nhất trước</option>
                <option value="val_high">Giá trị: Cao đến thấp</option>
                <option value="val_low">Giá trị: Thấp đến cao</option>
              </select>
            </div>
          </div>

          {/* Data Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-3 text-center w-12 font-bold" scope="col">STT</th>
                    <th className="py-3.5 px-4 font-bold" scope="col">Mã biên bản</th>
                    <th className="py-3.5 px-4 font-bold" scope="col">Bên giao</th>
                    <th className="py-3.5 px-4 font-bold" scope="col">Bên nhận</th>
                    <th className="py-3.5 px-3 text-center font-bold" scope="col">Số lượng TS</th>
                    <th className="py-3.5 px-4 text-right font-bold" scope="col">Tổng giá trị</th>
                    <th className="py-3.5 px-4 text-center font-bold" scope="col">Ngày lập</th>
                    <th className="py-3.5 px-4 text-center font-bold" scope="col">Trạng thái</th>
                    <th className="py-3.5 px-3 text-center w-28 font-bold" scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedHandovers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-xs font-medium text-slate-600">Không tìm thấy biên bản bàn giao nào phù hợp.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedHandovers.map((item, index) => {
                      const stt = (currentPage - 1) * pageSize + index + 1;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => onViewHandover(item)}
                        >
                          <td className="py-3 px-3 text-center font-medium text-slate-500">{stt}</td>
                          <td className="py-3 px-4 font-semibold text-blue-600 font-mono hover:underline">
                            {item.code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{item.senderName}</div>
                            <div className="text-[11px] text-slate-400">{item.senderDept}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{item.receiverName}</div>
                            <div className="text-[11px] text-slate-400">{item.receiverDept}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-medium">{item.totalQuantity} tài sản</td>
                          <td className="py-3 px-4 text-right font-semibold font-mono text-slate-900">
                            {formatMoney(item.totalValueNumber)} đ
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600">{item.createdDate}</td>
                          <td className="py-3 px-4 text-center">{renderStatusBadge(item.status)}</td>

                          {/* Action Column */}
                          <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <div className="inline-block relative">
                                <button
                                  className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                                  onClick={event => {
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const height = 12 + 36 * (2 + Number(canEditHandover(item, currentUser)));
                                    setMenuPosition({ left: Math.max(8, Math.min(rect.right - 176, window.innerWidth - 184)), top: rect.bottom + height + 4 <= window.innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - height - 4) });
                                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                  }}
                                  type="button"
                                  aria-label="Thao tác biên bản"
                                  aria-expanded={activeMenuId === item.id}
                                  data-handover-actions
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                  </svg>
                                </button>

                                {activeMenuId === item.id && createPortal(
                                  <div data-handover-actions style={menuPosition} className="fixed w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-left text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onViewHandover(item);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                                    >
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                      </svg>
                                      <span>Xem chi tiết</span>
                                    </button>

                                    <button type="button" onClick={() => handlePrintProtocol(item)} disabled={Boolean(exportingId)} className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left disabled:opacity-50 disabled:cursor-wait">
                                      <Printer className="w-4 h-4 text-slate-400" />
                                      <span>In biên bản</span>
                                    </button>

                                    {canEditHandover(item, currentUser) && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            onViewHandover(item);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                                        >
                                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                          </svg>
                                          <span>Sửa biên bản</span>
                                        </button>
                                      </>
                                    )}
                                  </div>, document.body
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span>
                  Hiển thị <strong className="text-slate-800">{paginatedHandovers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedHandovers.length)}</strong> trên <strong className="text-slate-800">{sortedHandovers.length}</strong> biên bản
                </span>
                <span className="text-slate-300">|</span>
                <select
                  className="text-xs py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={6}>6 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={25}>25 / trang</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={currentPage === 1}
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                      p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={currentPage === totalPages}
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};
