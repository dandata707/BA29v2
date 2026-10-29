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
    setCurrentUser,
    availablePersonas,
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
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
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
      addToast('Quy tắc BR03: Chỉ cán bộ HCNS mới có quyền phê duyệt hồ sơ!', 'error');
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
      addToast('Quy tắc BR03: Chỉ cán bộ HCNS mới có quyền xử lý yêu cầu!', 'error');
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
      addToast('Quy tắc BR03: Chỉ cán bộ HCNS mới có quyền từ chối yêu cầu!', 'error');
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
      <div className="flex flex-col gap-2 pb-4 mb-6 bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#737784]">
            <button
              onClick={() => navigateTo('list')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                assignment_return
              </span>
              <span>Danh sách yêu cầu điều chuyển tài sản</span>
            </button>
            <span>/</span>
            <span className="text-[#131b2e] font-semibold">{request.id}</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Mã hệ thống: {request.id}
          </div>
        </div>

        {/* Main Title Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('list')}
              className="w-9 h-9 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex items-center justify-center transition-colors cursor-pointer"
              title="Quay lại danh sách"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#131b2e] font-mono">
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
                  : 'bg-[#eaedff] text-[#424753]'
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
            {request.status === 'approved' && (
              <button
                onClick={() => navigateTo('handover-create', request.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2766cc] hover:bg-primary text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  post_add
                </span>
                <span>Lập biên bản bàn giao (UI04)</span>
              </button>
            )}

            {(request.status === 'handover' || request.status === 'completed') && (
              <button
                onClick={() => navigateTo('handover-confirm', request.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4648d4] hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  fact_check
                </span>
                <span>Xem biên bản & Xác nhận (UI05)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Notice if viewing as Requester */}
      {!isHR && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[20px]">
              admin_panel_settings
            </span>
            <span>
              Bạn đang xem dưới vai trò <strong>{currentUser.name}</strong> (Người đề nghị). Chỉ cán bộ HCNS mới có quyền duyệt, yêu cầu bổ sung hoặc lập biên bản (BR03).
            </span>
          </div>
          <button
            onClick={() => {
              const hrUser = availablePersonas.find((p) => p.systemRole === 'admin_hr');
              if (hrUser) setCurrentUser(hrUser);
              addToast('Đã chuyển sang vai trò HCNS (Phạm Thị Lan)', 'info');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0 cursor-pointer"
          >
            Đổi sang vai trò HCNS
          </button>
        </div>
      )}

      {/* Primary Detail Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Thông tin yêu cầu [2] */}
        <div className="bg-white rounded-xl p-5 border border-[#c2c6d5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 bg-[#f2f3ff] px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  assignment
                </span>
                <h3 className="text-sm font-bold text-[#131b2e]">
                  Thông tin yêu cầu
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Lập lúc {request.createdDate}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Mã yêu cầu</span>
                <span className="text-primary font-mono font-bold w-2/3 text-right">
                  {request.id}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Người đề nghị</span>
                <span className="text-[#131b2e] font-semibold w-2/3 text-right">
                  {request.requesterName}{' '}
                  <span className="text-[#737784] font-normal">({request.requesterId})</span> - {request.requesterDept}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Ngày đề nghị</span>
                <span className="text-[#131b2e] w-2/3 text-right">
                  {request.createdDate}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Vị trí nhận</span>
                <div className="w-2/3 text-right flex items-center justify-end gap-1 text-[#131b2e] font-semibold text-primary">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    location_on
                  </span>
                  <span>{request.destinationLocation}</span>
                </div>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Dự kiến tiếp nhận</span>
                <span className="text-[#131b2e] font-semibold w-2/3 text-right">
                  {request.recipientName}{' '}
                  <span className="text-[#737784] font-normal">({request.recipientEmployeeId})</span> - {request.recipientRole}
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-2 bg-[#f2f3ff] p-3 rounded-lg border border-slate-100 mt-1">
                <span className="text-[#737784] font-semibold">Lý do điều chuyển</span>
                <p className="text-[#131b2e] leading-relaxed">
                  {request.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments preview */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[#737784] text-xs">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                attach_file
              </span>
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
                    <span className="material-symbols-outlined text-[13px] text-red-500">
                      picture_as_pdf
                    </span>
                    <span className="truncate max-w-[120px]">{att.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin tài sản [3] */}
        <div className="bg-white rounded-xl p-5 border border-[#c2c6d5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 bg-[#f2f3ff] px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  laptop_mac
                </span>
                <h3 className="text-sm font-bold text-[#131b2e]">
                  Thông tin tài sản đối chiếu (BR02)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-primary text-[11px] font-semibold font-mono">
                {asset?.id || request.assetId}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Mã tài sản</span>
                <span className="text-[#131b2e] font-mono font-bold w-2/3 text-right">
                  {asset?.id || request.assetId}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Tên tài sản</span>
                <span className="text-[#131b2e] font-semibold w-2/3 text-right">
                  {asset?.name || request.assetName}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Tình trạng hiện tại</span>
                <div className="w-2/3 text-right">
                  <span className="inline-flex items-center gap-1 text-[#131b2e] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{asset?.status || 'Hoạt động tốt (98%)'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Vị trí hiện tại</span>
                <span className="text-[#131b2e] w-2/3 text-right">
                  {asset?.currentLocation || request.currentLocation}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-[#f2f3ff] transition-colors">
                <span className="text-[#737784] w-1/3">Quản lý hiện tại</span>
                <span className="text-[#131b2e] font-semibold w-2/3 text-right">
                  {asset ? `${asset.custodianName} (${asset.custodianCode})` : request.requesterName}
                </span>
              </div>

              {/* Specs badges */}
              {asset?.specs && (
                <div className="pt-2">
                  <span className="text-[#737784] font-semibold block mb-1.5">
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

          <div className="mt-4 pt-3 flex items-center justify-between text-[#737784] text-xs bg-[#f2f3ff] p-2.5 rounded-lg border border-slate-100">
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
      <div className="bg-white rounded-xl p-6 border border-[#c2c6d5] shadow-xs mb-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              fact_check
            </span>
            <h3 className="text-base font-bold text-[#131b2e]">
              Xử lý hồ sơ & Thẩm định điều kiện (HCNS)
            </h3>
          </div>
          <span className="text-xs text-[#737784]">
            Bắt buộc tích kiểm tra trước khi phê duyệt (BR04)
          </span>
        </div>

        {/* Checklist interactive items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Checkbox 1 */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] cursor-pointer transition-colors border border-slate-200">
            <input
              type="checkbox"
              checked={isDocComplete}
              onChange={(e) => setIsDocComplete(e.target.checked)}
              disabled={!isHR || request.status === 'completed'}
              className="mt-0.5 w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#131b2e]">
                1. Hồ sơ đầy đủ
              </span>
              <span className="text-[11px] text-[#737784] mt-0.5">
                Đã đính kèm phiếu yêu cầu điều chuyển tài sản và tài liệu căn cứ hợp lệ.
              </span>
            </div>
          </label>

          {/* Checkbox 2 */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] cursor-pointer transition-colors border border-slate-200">
            <input
              type="checkbox"
              checked={isEligible}
              onChange={(e) => setIsEligible(e.target.checked)}
              disabled={!isHR || request.status === 'completed'}
              className="mt-0.5 w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#131b2e]">
                2. Đủ điều kiện điều chuyển
              </span>
              <span className="text-[11px] text-[#737784] mt-0.5">
                Xác nhận tình trạng thiết bị hoạt động tốt, không vướng tranh chấp bảo hành hay khấu hao dở dang.
              </span>
            </div>
          </label>
        </div>

        {/* Textarea section for notes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold text-[#424753] flex items-center gap-1"
              htmlFor="review-notes"
            >
              <span>Lý do bổ sung / từ chối hoặc ghi chú phê duyệt</span>
              <span className="text-slate-400 font-normal">
                (Bắt buộc khi Yêu cầu bổ sung hoặc Từ chối)
              </span>
            </label>
            <span className="text-xs text-[#737784] font-mono">
              {reviewNotes.length}/500 ký tự
            </span>
          </div>
          <textarea
            id="review-notes"
            maxLength={500}
            rows={3}
            disabled={!isHR || request.status === 'completed'}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full bg-[#f2f3ff] rounded-lg p-3 text-xs text-[#131b2e] placeholder:text-[#737784] border border-[#c2c6d5] focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
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
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#c2c6d5] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#737784]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>
            Thao tác bởi cán bộ: <strong>{currentUser.name}</strong> ({currentUser.department})
          </span>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Yêu cầu bổ sung */}
          <button
            onClick={handleRequestSupplement}
            disabled={!isHR || request.status === 'completed'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-slate-800 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            type="button"
            title="Chuyển trạng thái yêu cầu sang Chờ bổ sung"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Yêu cầu bổ sung</span>
          </button>

          {/* Từ chối */}
          <button
            onClick={handleReject}
            disabled={!isHR || request.status === 'completed'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffdad6] hover:bg-red-200 text-[#93000a] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            type="button"
            title="Từ chối yêu cầu điều chuyển"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            <span>Từ chối</span>
          </button>

          {/* Phê duyệt */}
          <button
            onClick={handleApprove}
            disabled={!isHR || request.status === 'completed'}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            type="button"
            title="Phê duyệt yêu cầu điều chuyển (yêu cầu đủ 2 điều kiện kiểm tra)"
          >
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            <span>Phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
