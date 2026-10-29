import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Proposal } from '../types/asset';
import { ProposalDetailModal } from '../components/ProposalDetailModal';

interface ProposalListScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const ProposalListScreen: React.FC<ProposalListScreenProps> = ({ onOpenDocModal }) => {
  const { 
    proposals, 
    assets, 
    setActiveScreen, 
    setEditingProposalId, 
    setSelectedProposalId 
  } = useAssetContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);

  // Compute stat counts matching Image 21
  const pendingCount = proposals.filter((p) => p.status === 'CHO_TIEP_NHAN').length;
  const processingCount = proposals.filter((p) => p.status === 'DANG_THAM_DINH').length;
  const processedCount = proposals.filter((p) => p.status === 'DU_DIEU_KIEN' || p.status === 'DA_HOAN_TAT').length;

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'CHO_TIEP_NHAN'
          ? p.status === 'CHO_TIEP_NHAN'
          : statusFilter === 'DANG_THAM_DINH'
          ? p.status === 'DANG_THAM_DINH'
          : statusFilter === 'BI_TRA_LAI'
          ? p.status === 'BI_TRA_LAI'
          : statusFilter === 'DA_HOAN_TAT'
          ? p.status === 'DU_DIEU_KIEN' || p.status === 'DA_HOAN_TAT'
          : true;

      return matchSearch && matchStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  const handleEditProposal = (p: Proposal) => {
    setEditingProposalId(p.id);
    setActiveScreen('PROPOSAL_CREATE');
  };

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'NHAP':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            Bản nháp
          </span>
        );
      case 'CHO_TIEP_NHAN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Chờ tiếp nhận
          </span>
        );
      case 'DANG_THAM_DINH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Đang thẩm định
          </span>
        );
      case 'BI_TRA_LAI':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Bị trả lại
          </span>
        );
      case 'DU_DIEU_KIEN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đủ điều kiện
          </span>
        );
      case 'DA_HOAN_TAT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Đã thành công
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Title & Action - Step 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Danh sách Đề nghị thanh lý
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quản lý và theo dõi các đề nghị thanh lý tài sản do bộ phận bạn lập.
          </p>
        </div>

        {/* Step 1: BPSDTS bấm nút "+ Tạo đề nghị mới" */}
        <button
          onClick={() => {
            setEditingProposalId(null);
            setActiveScreen('PROPOSAL_CREATE');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo đề nghị mới</span>
        </button>
      </div>

      {/* 3 Metric Cards Matching Image 21 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Chờ tiếp nhận</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {pendingCount}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đang xử lý</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {processingCount}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đã được xử lý</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {processedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar Matching Image 21 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đề nghị, lý do, người lập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHO_TIEP_NHAN">Chờ tiếp nhận</option>
            <option value="DANG_THAM_DINH">Đang thẩm định</option>
            <option value="BI_TRA_LAI">Bị trả lại</option>
            <option value="DA_HOAN_TAT">Đã xử lý xong</option>
          </select>
        </div>

        <button
          onClick={() => {}}
          className="w-full md:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Proposals Data Table Matching Image 21 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-32">Mã Đề nghị</th>
                <th className="py-3 px-4 w-28">Ngày lập</th>
                <th className="py-3 px-4">Người lập</th>
                <th className="py-3 px-4">Bộ phận</th>
                <th className="py-3 px-4 text-center w-24">Số tài sản</th>
                <th className="py-3 px-4 w-36">Trạng thái</th>
                <th className="py-3 px-4 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.createdDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.creatorName}</td>
                    <td className="py-3 px-4 text-slate-600">{item.department}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                      {item.assetIds.length}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* V10: Xem chi tiết Read-only */}
                        <button
                          onClick={() => {
                            setSelectedProposalId(item.id);
                            setViewingProposal(item);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-medium border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                          title="Xem chi tiết đề nghị (Read-only)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        {/* V13: Đề nghị bị trả lại -> Nút "Sửa lại" màu đỏ/cam */}
                        {item.status === 'BI_TRA_LAI' && (
                          <button
                            onClick={() => handleEditProposal(item)}
                            className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                            title="Sửa lại đề nghị bị từ chối/trả lại"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa lại</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy đề nghị thanh lý nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Matching Image 21 */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị 1 – {filteredProposals.length} trên {proposals.length} đề nghị
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-400 hover:bg-slate-200 cursor-pointer disabled:opacity-40" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-6 h-6 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <button className="p-1 rounded text-slate-400 hover:bg-slate-200 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal View Detail Proposal (V10 - V12) */}
      <ProposalDetailModal
        isOpen={!!viewingProposal}
        onClose={() => setViewingProposal(null)}
        proposal={viewingProposal}
        assets={assets}
        onEditProposal={handleEditProposal}
        onViewDoc={(title, code) => onOpenDocModal(title, code, 'DE_NGHI')}
      />
    </div>
  );
};
