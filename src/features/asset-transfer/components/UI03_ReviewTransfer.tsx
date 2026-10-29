import { SupplementForm } from './SupplementForm';
import { TransferIcon } from './TransferIcon';
import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';

export const UI03_ReviewTransfer: React.FC = () => {
  const {
    requests,
    assets,
    selectedRequestId,
    navigateTo,
    reviewRequest,
    currentUser,
    addToast,
  } = useTransfer();

  // Find request
  const request =
    requests.find((r) => r.id === selectedRequestId) || requests[0];
  const asset = assets.find((a) => a.id === request?.assetId);

  // Review states
  const [isDocComplete, setIsDocComplete] = useState<boolean>(
    request?.isDocComplete ?? true
  );
  const [isEligible, setIsEligible] = useState<boolean>(
    request?.isEligible ?? false
  );
  const [reviewNotes, setReviewNotes] = useState<string>(
    request?.reviewNotes || ''
  );

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Không tìm thấy thông tin yêu cầu điều chuyển.</p>
        <button
          onClick={() => navigateTo('list')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isHR = currentUser.systemRole === 'admin_hr';

  const formatCurrency = (val?: number) => {
    if (!val) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  const handleApprove = () => {
    if (!isHR) {
      addToast('Quy tắc BR03: Chỉ cán bộ Quản lý tài sản mới có quyền phê duyệt hồ sơ!', 'error');
      return;
    }
    if (!isDocComplete) {
      addToast('Quy tắc BR04: Vui lòng kiểm tra và xác nhận "Hồ sơ đầy đủ" trước khi duyệt!', 'warning');
      return;
    }
    if (!isEligible) {
      addToast('Quy tắc BR04: Vui lòng tích xác nhận "Tài sản đủ điều kiện điều chuyển" trước khi duyệt!', 'warning');
      return;
    }

    reviewRequest(request.id, 'approve', reviewNotes, isDocComplete, isEligible);
  };

  const handleRequestSupplement = () => {
    if (!isHR) {
      addToast('Quy tắc BR03: Chỉ cán bộ Quản lý tài sản mới có quyền xử lý yêu cầu!', 'error');
      return;
    }
    if (!reviewNotes.trim()) {
      addToast('Vui lòng nêu rõ các giấy tờ hoặc hạng mục cần bổ sung vào ô ghi chú!', 'warning');
      return;
    }

    reviewRequest(request.id, 'supplement', reviewNotes, isDocComplete, isEligible);
  };

  const handleReject = () => {
    if (!isHR) {
      addToast('Quy tắc BR03: Chỉ cán bộ Quản lý tài sản mới có quyền từ chối yêu cầu!', 'error');
      return;
    }
    if (!reviewNotes.trim()) {
      addToast('Vui lòng nhập lý do từ chối cụ thể vào ô ghi chú kiểm tra!', 'warning');
      return;
    }

    reviewRequest(request.id, 'reject', reviewNotes, isDocComplete, isEligible);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Navigation & Header Row */}
      <div className="flex flex-col gap-2 pb-4 mb-6 bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
        {/* Main Title Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('list')}
              className="w-9 h-9 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer"
              title="Quay lại danh sách"
              type="button"
            >
              <TransferIcon className="text-[20px]" name={"arrow_back"} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0f172a] font-mono">
                {request.id}
              </h2>
            </div>

            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                request.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : request.status === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : request.status === 'handover'
                  ? 'bg-purple-100 text-purple-800'
                  : request.status === 'supplement'
                  ? 'bg-amber-100 text-amber-800'
                  : request.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-[#eff6ff] text-[#475569]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  request.status === 'completed'
                    ? 'bg-emerald-600'
                    : request.status === 'approved'
                    ? 'bg-blue-600'
                    : request.status === 'handover'
                    ? 'bg-purple-600'
                    : request.status === 'supplement'
                    ? 'bg-amber-600'
                    : request.status === 'rejected'
                    ? 'bg-red-600'
                    : 'bg-slate-500'
                }`}
              />
              <span>
                {request.status === 'pending'
                  ? 'Chờ tiếp nhận'
                  : request.status === 'supplement'
                  ? 'Chờ bổ sung'
                  : request.status === 'approved'
                  ? 'Đã phê duyệt'
                  : request.status === 'handover'
                  ? 'Chờ xác nhận bàn giao'
                  : request.status === 'rejected'
                  ? 'Từ chối'
                  : 'Hoàn tất'}
              </span>
            </div>
          </div>

          {/* Quick Action to next stages */}
          <div className="flex items-center gap-2">
            {isHR && request.status === 'approved' && (
              <button
                onClick={() => navigateTo('handover-create', request.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                type="button"
              >
                <TransferIcon className="text-[18px]" name={"post_add"} />
                <span>Lập biên bản bàn giao</span>
              </button>
            )}

            {(request.status === 'handover' || request.status === 'completed') && (
              <button
                onClick={() => navigateTo('handover-confirm', request.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4648d4] hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                type="button"
              >
                <TransferIcon className="text-[18px]" name={"fact_check"} />
                <span>Xem biên bản & Xác nhận</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Notice if viewing as Requester */}
      {!isHR && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <TransferIcon className="text-amber-700 text-[20px]" name={"admin_panel_settings"} />
            <span>
              Bạn đang xem dưới vai trò <strong>{currentUser.name}</strong> (Người đề nghị). Chỉ cán bộ Quản lý tài sản mới có quyền duyệt, yêu cầu bổ sung hoặc lập biên bản (BR03).
            </span>
          </div>

        </div>
      )}

      {request.status === 'supplement' && request.requesterId === currentUser.id && <SupplementForm request={request} />}
      {/* Primary Detail Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Thông tin yêu cầu [2] */}
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 bg-[#f8fafc] px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <TransferIcon className="text-blue-600 text-[20px]" name={"assignment"} />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Thông tin yêu cầu
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Lập lúc {request.createdDate}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Mã yêu cầu</span>
                <span className="text-blue-600 font-mono font-bold w-2/3 text-right">
                  {request.id}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Người đề nghị</span>
                <span className="text-[#0f172a] font-semibold w-2/3 text-right">
                  {request.requesterName}{' '}
                  <span className="text-[#64748b] font-normal">({request.requesterId})</span> - {request.requesterDept}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Ngày đề nghị</span>
                <span className="text-[#0f172a] w-2/3 text-right">
                  {request.createdDate}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Vị trí nhận</span>
                <div className="w-2/3 text-right flex items-center justify-end gap-1 text-[#0f172a] font-semibold text-blue-600">
                  <TransferIcon className="text-[16px] text-blue-600" name={"location_on"} />
                  <span>{request.destinationLocation}</span>
                </div>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Dự kiến tiếp nhận</span>
                <span className="text-[#0f172a] font-semibold w-2/3 text-right">
                  {request.recipientName}{' '}
                  <span className="text-[#64748b] font-normal">({request.recipientEmployeeId})</span> - {request.recipientRole}
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-2 bg-[#f8fafc] p-3 rounded-lg border border-slate-100 mt-1">
                <span className="text-[#64748b] font-semibold">Lý do điều chuyển</span>
                <p className="text-[#0f172a] leading-relaxed">
                  {request.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments preview */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[#64748b] text-xs">
            <span className="flex items-center gap-1">
              <TransferIcon className="text-[16px]" name={"attach_file"} />
              <span>
                {request.attachments?.length || 0} tài liệu đính kèm
              </span>
            </span>

            {request.attachments?.length > 0 && (
              <div className="flex items-center gap-1.5">
                {request.attachments.map((att) => (
                  <span
                    key={att.id}
                    onClick={() => addToast(`Xem tệp: ${att.name}`, 'info')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-mono text-[11px]"
                  >
                    <TransferIcon className="text-[13px] text-red-500" name={"picture_as_pdf"} />
                    <span className="truncate max-w-[120px]">{att.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin tài sản [3] */}
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 bg-[#f8fafc] px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <TransferIcon className="text-blue-600 text-[20px]" name={"laptop_mac"} />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Thông tin tài sản đối chiếu (BR02)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#dbeafe] text-blue-600 text-[11px] font-semibold font-mono">
                {asset?.id || request.assetId}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Mã tài sản</span>
                <span className="text-[#0f172a] font-mono font-bold w-2/3 text-right">
                  {asset?.id || request.assetId}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Tên tài sản</span>
                <span className="text-[#0f172a] font-semibold w-2/3 text-right">
                  {asset?.name || request.assetName}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Tình trạng hiện tại</span>
                <div className="w-2/3 text-right">
                  <span className="inline-flex items-center gap-1 text-[#0f172a] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{asset?.status || 'Hoạt động tốt (98%)'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Vị trí hiện tại</span>
                <span className="text-[#0f172a] w-2/3 text-right">
                  {asset?.currentLocation || request.currentLocation}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f8fafc] transition-colors">
                <span className="text-[#64748b] w-1/3">Quản lý hiện tại</span>
                <span className="text-[#0f172a] font-semibold w-2/3 text-right">
                  {asset ? `${asset.custodianName} (${asset.custodianCode})` : request.requesterName}
                </span>
              </div>

              {/* Specs badges */}
              {asset?.specs && (
                <div className="pt-2">
                  <span className="text-[#64748b] font-semibold block mb-1.5">
                    Thông số kỹ thuật:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-[#64748b] text-xs bg-[#f8fafc] p-2.5 rounded-lg border border-slate-100">
            <span className="font-mono">
              S/N: {asset?.serialNumber || 'C02G41ABMD6M'}
            </span>
            <span className="text-slate-900 font-bold">
              Nguyên giá: {formatCurrency(asset?.originalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Card: Kết quả kiểm tra & Xử lý [4] */}
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-xs mb-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TransferIcon className="text-blue-600 text-[22px]" name={"fact_check"} />
            <h3 className="text-base font-bold text-[#0f172a]">
              Xử lý hồ sơ & Thẩm định điều kiện (Quản lý tài sản)
            </h3>
          </div>
          <span className="text-xs text-[#64748b]">
            Bắt buộc tích kiểm tra trước khi phê duyệt (BR04)
          </span>
        </div>

        {/* Checklist interactive items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Checkbox 1 */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#eff6ff] cursor-pointer transition-colors border border-slate-200">
            <input
              type="checkbox"
              checked={isDocComplete}
              onChange={(e) => setIsDocComplete(e.target.checked)}
              disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0f172a]">
                1. Hồ sơ đầy đủ
              </span>
              <span className="text-[11px] text-[#64748b] mt-0.5">
                Đã đính kèm phiếu yêu cầu điều chuyển tài sản và tài liệu căn cứ hợp lệ.
              </span>
            </div>
          </label>

          {/* Checkbox 2 */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#eff6ff] cursor-pointer transition-colors border border-slate-200">
            <input
              type="checkbox"
              checked={isEligible}
              onChange={(e) => setIsEligible(e.target.checked)}
              disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0f172a]">
                2. Đủ điều kiện điều chuyển
              </span>
              <span className="text-[11px] text-[#64748b] mt-0.5">
                Xác nhận tình trạng thiết bị hoạt động tốt, không vướng tranh chấp bảo hành hay khấu hao dở dang.
              </span>
            </div>
          </label>
        </div>

        {/* Textarea section for notes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold text-[#475569] flex items-center gap-1"
              htmlFor="review-notes"
            >
              <span>Lý do bổ sung / từ chối hoặc ghi chú phê duyệt</span>
              <span className="text-slate-400 font-normal">
                (Bắt buộc khi Yêu cầu bổ sung hoặc Từ chối)
              </span>
            </label>
            <span className="text-xs text-[#64748b] font-mono">
              {reviewNotes.length}/500 ký tự
            </span>
          </div>
          <textarea
            id="review-notes"
            maxLength={500}
            rows={3}
            disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full bg-[#f8fafc] rounded-lg p-3 text-xs text-[#0f172a] placeholder:text-[#64748b] border border-[#e2e8f0] focus:outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
            placeholder="Nhập nhận xét kiểm tra, yêu cầu tài liệu bổ sung hoặc lý do từ chối cụ thể nếu có..."
          />
        </div>

        {request.reviewedBy && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Người phê duyệt gần nhất: <strong>{request.reviewedBy}</strong>
            </span>
            <span className="font-mono text-slate-400">{request.reviewedAt}</span>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#e2e8f0] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            Thao tác bởi cán bộ: <strong>{currentUser.name}</strong> ({currentUser.department})
          </span>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Yêu cầu bổ sung */}
          <button
            onClick={handleRequestSupplement}
            disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#eff6ff] hover:bg-[#dbeafe] text-slate-800 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            type="button"
            title="Chuyển trạng thái yêu cầu sang Chờ bổ sung"
          >
            <TransferIcon className="text-[16px]" name={"edit_note"} />
            <span>Yêu cầu bổ sung</span>
          </button>

          {/* Từ chối */}
          <button
            onClick={handleReject}
            disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffdad6] hover:bg-red-200 text-[#93000a] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            type="button"
            title="Từ chối yêu cầu điều chuyển"
          >
            <TransferIcon className="text-[16px]" name={"cancel"} />
            <span>Từ chối</span>
          </button>

          {/* Phê duyệt */}
          <button
            onClick={handleApprove}
            disabled={!isHR || !['pending', 'supplement'].includes(request.status)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            type="button"
            title="Phê duyệt yêu cầu điều chuyển (yêu cầu đủ 2 điều kiện kiểm tra)"
          >
            <TransferIcon className="text-[18px]" name={"check_circle"} />
            <span>Phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
