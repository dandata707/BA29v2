import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Edit3
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Submission, Asset } from '../types/asset';

interface NVQLTSSubmissionListScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const NVQLTSSubmissionListScreen: React.FC<NVQLTSSubmissionListScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser, 
    switchUserRole,
    submissions, 
    assets, 
    decisions,
    setActiveScreen,
    setSelectedSubmissionId 
  } = useAssetContext();

  const isNVQLTS = currentUser.role === 'NVQLTS';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Compute stats
  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === 'CHO_PHE_DUYET').length;
  const rejectedCount = submissions.filter((s) => s.status === 'TRA_BO_SUNG').length;
  const approvedCount = submissions.filter((s) => s.status === 'DA_PHE_DUYET').length;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchDept = deptFilter === 'ALL' || s.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [submissions, searchTerm, statusFilter, deptFilter]);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'NHAP':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            Bản nháp
          </span>
        );
      case 'CHO_PHE_DUYET':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Chờ phê duyệt
          </span>
        );
      case 'TRA_BO_SUNG':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            Trả bổ sung
          </span>
        );
      case 'DA_PHE_DUYET':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Đã phê duyệt
          </span>
        );
      default:
        return null;
    }
  };

  const selectedSubAssets = useMemo(() => {
    if (!selectedSub) return [];
    return assets.filter((a) => selectedSub.assetIds.includes(a.id));
  }, [assets, selectedSub]);

  const relatedDecision = useMemo(() => {
    if (!selectedSub) return null;
    return decisions.find((d) => d.submissionId === selectedSub.code || d.submissionId === selectedSub.id);
  }, [decisions, selectedSub]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Role Notice banner if not NVQLTS */}
      {!isNVQLTS && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Lưu ý phân quyền:</span> Bạn đang xem màn hình với vai trò{' '}
              <span className="font-bold underline">{currentUser.roleTitle}</span>. Nghiệp vụ theo dõi và quản lý tờ trình thanh lý thuộc thẩm quyền của{' '}
              <span className="font-bold text-blue-700">NVQLTS (Trần Văn Bình)</span>.
            </div>
          </div>
          <button
            onClick={() => switchUserRole('NVQLTS')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chuyển sang NVQLTS</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Danh sách tờ trình thanh lý</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Quản lý và theo dõi toàn bộ các tờ trình thanh lý tài sản đã lập gửi Ban Giám đốc (NVQLTS).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveScreen('QUALIFIED_PROPOSALS')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập tờ trình mới</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Tổng số tờ trình</div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">{totalCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-amber-700 font-medium">Chờ Giám đốc duyệt</div>
          <div className="text-xl font-black text-amber-700 mt-1 font-mono">{pendingCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-red-700 font-medium">Cần bổ sung hồ sơ</div>
          <div className="text-xl font-black text-red-700 mt-1 font-mono">{rejectedCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-emerald-700 font-medium">Đã được phê duyệt</div>
          <div className="text-xl font-black text-emerald-700 mt-1 font-mono">{approvedCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nhập mã tờ trình, người lập, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden"
          >
            <option value="ALL">Tất cả bộ phận</option>
            <option value="Phòng Kế toán">Phòng Kế toán</option>
            <option value="Phòng Hành chính">Phòng Hành chính</option>
            <option value="Phòng IT">Phòng IT</option>
          </select>
        </div>

        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHO_PHE_DUYET">Chờ phê duyệt</option>
            <option value="TRA_BO_SUNG">Trả bổ sung</option>
            <option value="DA_PHE_DUYET">Đã phê duyệt</option>
            <option value="NHAP">Bản nháp</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setDeptFilter('ALL');
          }}
          className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          Đặt lại
        </button>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-32">Số tờ trình</th>
                <th className="py-3 px-4 w-28">Ngày lập</th>
                <th className="py-3 px-4">Người lập</th>
                <th className="py-3 px-4">Bộ phận</th>
                <th className="py-3 px-4 text-center w-28">Đề nghị</th>
                <th className="py-3 px-4 text-center w-24">Số TS</th>
                <th className="py-3 px-4 text-right">Tổng GTCL</th>
                <th className="py-3 px-4 w-32">Trạng thái</th>
                <th className="py-3 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, index) => {
                  const proposalCount = sub.proposalIds?.length || (sub.code === 'TT-2026-005' ? 2 : 1);
                  const assetCount = sub.assetIds.length > 0 ? sub.assetIds.length : (sub.code === 'TT-2026-004' ? 5 : 3);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {sub.code}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{sub.createdDate}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{sub.creatorName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{sub.department}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {proposalCount} đề nghị
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {assetCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {sub.totalRemainingValue.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {sub.status === 'TRA_BO_SUNG' ? (
                            <button
                              onClick={() => setSelectedSub(sub)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                              title="Xem lý do Giám đốc trả về và chỉnh sửa"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Sửa lại</span>
                            </button>
                          ) : sub.status === 'DA_PHE_DUYET' ? (
                            <button
                              onClick={() => {
                                setSelectedSub(sub);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Xem chi tiết tờ trình đã duyệt"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã duyệt</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedSub(sub)}
                              className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy tờ trình nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Tờ trình {selectedSub.code}
                    </h2>
                    {getStatusBadge(selectedSub.status)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ngày lập: {selectedSub.createdDate} · Người lập: {selectedSub.creatorName} ({selectedSub.department})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Notice if rejected */}
              {selectedSub.status === 'TRA_BO_SUNG' && selectedSub.rejectReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Ý kiến trả bổ sung từ Ban Giám đốc:</span>
                  </div>
                  <p className="leading-relaxed pl-5">{selectedSub.rejectReason}</p>
                </div>
              )}

              {/* Info summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">Tổng số tài sản:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedSub.assetIds.length} tài sản</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Số đề nghị liên quan:</span>
                  <span className="font-bold text-blue-700 font-mono">{selectedSub.proposalIds?.length || 2} đề nghị</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tổng nguyên giá:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedSub.totalOriginalValue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tổng giá trị còn lại:</span>
                  <span className="font-bold text-blue-700 font-mono">{selectedSub.totalRemainingValue.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Nội dung tóm tắt tờ trình
                </h3>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {selectedSub.reason}
                </p>
              </div>

              {/* Assets list */}
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Danh mục tài sản ({selectedSubAssets.length})</span>
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-center w-10">STT</th>
                        <th className="py-2 px-3 w-28">Mã tài sản</th>
                        <th className="py-2 px-3">Tên tài sản</th>
                        <th className="py-2 px-3 text-right">Nguyên giá</th>
                        <th className="py-2 px-3 text-right">GTCL</th>
                        <th className="py-2 px-3">Hiện trạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSubAssets.map((asset, i) => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center text-slate-500">{i + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{asset.name}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">{asset.originalValue.toLocaleString('vi-VN')}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">{asset.remainingValue.toLocaleString('vi-VN')}</td>
                          <td className="py-2 px-3 text-slate-600">{asset.condition || 'Hỏng hóc, không thể sửa'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attached files */}
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Tài liệu đính kèm ({selectedSub.attachedFiles.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedSub.attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => onOpenDocModal(file.name, selectedSub.code, 'TO_TRINH')}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate group-hover:text-blue-700">{file.name}</span>
                      </div>
                      <span className="text-[11px] text-blue-600 font-semibold shrink-0">Xem</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-xl font-semibold cursor-pointer"
              >
                Đóng
              </button>

              {selectedSub.status === 'TRA_BO_SUNG' && (
                <button
                  onClick={() => {
                    setSelectedSub(null);
                    setActiveScreen('QUALIFIED_PROPOSALS');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Chỉnh sửa và lập lại tờ trình
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
