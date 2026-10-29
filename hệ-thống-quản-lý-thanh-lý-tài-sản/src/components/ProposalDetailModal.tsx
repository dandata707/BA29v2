import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, Edit3 } from 'lucide-react';
import { Proposal, Asset } from '../types/asset';

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  assets: Asset[];
  onEditProposal?: (proposal: Proposal) => void;
  onViewDoc?: (docTitle: string, docCode: string) => void;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  isOpen,
  onClose,
  proposal,
  assets,
  onEditProposal,
  onViewDoc,
}) => {
  if (!isOpen || !proposal) return null;

  const proposalAssets = assets.filter((a) => proposal.assetIds.includes(a.id));
  const totalOriginal = proposalAssets.reduce((sum, a) => sum + a.originalValue, 0);
  const totalRemaining = proposalAssets.reduce((sum, a) => sum + a.remainingValue, 0);

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'NHAP':
        return <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-xs">Bản nháp</span>;
      case 'CHO_TIEP_NHAN':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-md text-xs">Chờ tiếp nhận</span>;
      case 'DANG_THAM_DINH':
        return <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-md text-xs">Đang thẩm định</span>;
      case 'DU_DIEU_KIEN':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-md text-xs">Đủ điều kiện lập tờ trình</span>;
      case 'BI_TRA_LAI':
        return <span className="bg-red-100 text-red-800 font-semibold px-2.5 py-1 rounded-md text-xs">Bị trả lại</span>;
      case 'DA_HOAN_TAT':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-md text-xs">Đã hoàn tất</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Chi tiết Đề nghị thanh lý</h2>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {proposal.code}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {proposal.status === 'BI_TRA_LAI' && onEditProposal && (
              <button
                onClick={() => {
                  onEditProposal(proposal);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa lại đề nghị</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Rejection Alert if rejected */}
          {proposal.rejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-xs text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-red-800">Lý do trả lại hồ sơ từ NVQLTS:</div>
                <div className="mt-1 leading-relaxed">{proposal.rejectReason}</div>
                <div className="mt-2 text-slate-600 italic">
                  Gợi ý: Nhấn nút &quot;Sửa lại đề nghị&quot; ở góc trên để bổ sung thông tin và gửi lại.
                </div>
              </div>
            </div>
          )}

          {/* V12: Visual Timeline Progress - Resolves Pain Point */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Trạng thái xử lý hồ sơ (Tiến trình điện tử)</span>
              <span className="text-blue-600 font-medium normal-case font-mono text-[11px]">
                Cập nhật tức thời
              </span>
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">1. Đã gửi đề nghị</div>
                  <div className="text-[11px] text-slate-500">{proposal.createdDate}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{proposal.creatorName}</div>
                </div>
              </div>

              <div className="hidden md:block w-8 h-0.5 bg-slate-300" />

              <div className="flex-1 flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    proposal.status !== 'NHAP'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">2. NVQLTS tiếp nhận</div>
                  <div className="text-[11px] text-slate-500">
                    {proposal.status === 'CHO_TIEP_NHAN' ? 'Đang chờ NVQLTS xử lý' : 'Đã tiếp nhận'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Phòng Quản lý Tài sản</div>
                </div>
              </div>

              <div className="hidden md:block w-8 h-0.5 bg-slate-300" />

              <div className="flex-1 flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    proposal.status === 'DU_DIEU_KIEN' || proposal.status === 'DA_HOAN_TAT'
                      ? 'bg-emerald-600 text-white'
                      : proposal.status === 'DANG_THAM_DINH'
                      ? 'bg-blue-600 text-white animate-pulse'
                      : proposal.status === 'BI_TRA_LAI'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">3. Thẩm định hiện trạng</div>
                  <div className="text-[11px] text-slate-500">
                    {proposal.status === 'BI_TRA_LAI'
                      ? 'Yêu cầu trả bổ sung'
                      : proposal.status === 'DU_DIEU_KIEN'
                      ? 'Đủ điều kiện thanh lý'
                      : proposal.status === 'DANG_THAM_DINH'
                      ? 'Đang kiểm tra thực tế'
                      : 'Chưa thực hiện'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Hội đồng thẩm định</div>
                </div>
              </div>

              <div className="hidden md:block w-8 h-0.5 bg-slate-300" />

              <div className="flex-1 flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    proposal.status === 'DA_HOAN_TAT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">4. Trình & Phê duyệt</div>
                  <div className="text-[11px] text-slate-500">
                    {proposal.status === 'DA_HOAN_TAT' ? 'Đã duyệt' : 'Dự kiến sau thẩm định'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Ban Giám đốc</div>
                </div>
              </div>
            </div>
          </div>

          {/* General Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Số đề nghị:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{proposal.code}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ngày lập:</span>
              <span className="font-semibold text-slate-800">{proposal.createdDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Phòng / Bộ phận:</span>
              <span className="font-semibold text-slate-800">{proposal.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Người đề nghị:</span>
              <span className="font-semibold text-slate-800">{proposal.creatorName}</span>
            </div>
            <div className="col-span-2 md:col-span-4 pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium">Lý do thanh lý:</span>
              <span className="text-slate-800 font-medium">{proposal.reason}</span>
            </div>
            {proposal.note && (
              <div className="col-span-2 md:col-span-4">
                <span className="text-slate-400 block font-medium">Ghi chú chi tiết:</span>
                <span className="text-slate-600">{proposal.note}</span>
              </div>
            )}
          </div>

          {/* V11: Assets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Danh mục tài sản trong đề nghị ({proposalAssets.length} tài sản)
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>Tổng nguyên giá: <strong className="font-mono text-slate-900">{totalOriginal.toLocaleString('vi-VN')} đ</strong></span>
                <span>·</span>
                <span>Tổng GTCL: <strong className="font-mono text-blue-700">{totalRemaining.toLocaleString('vi-VN')} đ</strong></span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3">Mã tài sản</th>
                    <th className="py-2.5 px-3">Tên tài sản</th>
                    <th className="py-2.5 px-3 text-center">Loại</th>
                    <th className="py-2.5 px-3 text-center">Năm SX</th>
                    <th className="py-2.5 px-3 text-center">Năm SD</th>
                    <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                    <th className="py-2.5 px-3 text-right">Giá trị còn lại</th>
                    <th className="py-2.5 px-3">Lý do thanh lý</th>
                    <th className="py-2.5 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {proposalAssets.length > 0 ? (
                    proposalAssets.map((asset, index) => (
                      <tr key={asset.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{asset.code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{asset.name}</td>
                        <td className="py-2.5 px-3 text-center font-medium text-slate-600">{asset.type}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{asset.manufactureYear || 2018}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{asset.usageYear || 2019}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{asset.originalValue.toLocaleString('vi-VN')} đ</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 font-semibold text-blue-700">{asset.remainingValue.toLocaleString('vi-VN')} đ</td>
                        <td className="py-2.5 px-3 text-slate-800">{asset.liquidationReason || 'Hết hạn sử dụng'}</td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{asset.note || '--'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-4 text-center text-slate-400">Không có tài sản trong đề nghị</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attached Files */}
          {proposal.attachedFiles && proposal.attachedFiles.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Tài liệu đính kèm
              </h3>
              <div className="flex flex-wrap gap-3">
                {proposal.attachedFiles.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onViewDoc?.(f.name, proposal.code)}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="font-medium text-slate-800 hover:text-blue-700">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.size} · Nhấp để xem</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
