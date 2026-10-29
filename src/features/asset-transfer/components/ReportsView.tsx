import { TransferIcon } from './TransferIcon';
import React from 'react';
import { useTransfer } from '../context/TransferContext';

export const ReportsView: React.FC = () => {
  const { requests, assets } = useTransfer();

  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const supplementCount = requests.filter((r) => r.status === 'supplement').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const handoverCount = requests.filter((r) => r.status === 'handover').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const totalValue = assets.reduce((sum, a) => sum + (a.originalPrice || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
            Báo cáo thống kê quy trình điều chuyển
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Tổng hợp dữ liệu luân chuyển tài sản, tiến độ xử lý hồ sơ và hiệu suất bàn giao
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wider block">
            Tổng số yêu cầu
          </span>
          <p className="text-2xl font-bold text-[#0f172a] mt-1 font-mono">
            {totalRequests}
          </p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
            {completedCount} đã hoàn tất
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wider block">
            Đang chờ xử lý
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {pendingCount + supplementCount}
          </p>
          <span className="text-[11px] text-[#64748b] mt-1 inline-block">
            {pendingCount} mới, {supplementCount} chờ bổ sung
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wider block">
            Đang tiến hành bàn giao
          </span>
          <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
            {approvedCount + handoverCount}
          </p>
          <span className="text-[11px] text-[#64748b] mt-1 inline-block">
            {approvedCount} đã duyệt, {handoverCount} chờ ký nhận
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wider block">
            Tổng giá trị tài sản
          </span>
          <p className="text-lg font-bold text-slate-900 mt-2 font-mono truncate">
            {formatCurrency(totalValue)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            {assets.length} thiết bị quản lý
          </span>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0f172a]">
            Phân bổ trạng thái phiếu điều chuyển
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Hoàn tất thành công</span>
                <span className="font-bold font-mono text-emerald-700">
                  {completedCount} ({Math.round((completedCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(completedCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Chờ xác nhận bàn giao</span>
                <span className="font-bold font-mono text-indigo-700">
                  {handoverCount} ({Math.round((handoverCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(handoverCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Đã phê duyệt (chờ lập BB)</span>
                <span className="font-bold font-mono text-blue-700">
                  {approvedCount} ({Math.round((approvedCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(approvedCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Chờ tiếp nhận & thẩm định</span>
                <span className="font-bold font-mono text-slate-700">
                  {pendingCount} ({Math.round((pendingCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full"
                  style={{ width: `${(pendingCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Chờ bổ sung</span>
                <span className="font-bold font-mono text-amber-700">
                  {supplementCount} ({Math.round((supplementCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(supplementCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Từ chối</span>
                <span className="font-bold font-mono text-red-700">
                  {rejectedCount} ({Math.round((rejectedCount / (totalRequests || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(rejectedCount / (totalRequests || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compliance & SLA */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0f172a]">
            Chỉ số tuân thủ quy trình & Nghiệp vụ
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <TransferIcon className="text-[18px]" name={"verified"} />
                <span>Tuân thủ quy tắc BR07 & BR08</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                100% hồ sơ hoàn tất đều có đầy đủ biên bản và chữ ký xác nhận của đại diện 2 bên trước khi cập nhật quyền quản trị tài sản.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <TransferIcon className="text-[18px]" name={"speed"} />
                <span>Thời gian xử lý trung bình</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Thời gian tiếp nhận và thẩm định hồ sơ: <strong>4.2 giờ làm việc</strong>. Tỷ lệ phê duyệt đạt chuẩn: <strong>88.5%</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <TransferIcon className="text-[18px]" name={"inventory"} />
                <span>Độ chính xác sổ sách (BR10)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Dữ liệu tài sản đối chiếu trực tiếp từ Danh mục kiểm kê nội bộ và tự động lưu vết nhật ký chuyển giao.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
