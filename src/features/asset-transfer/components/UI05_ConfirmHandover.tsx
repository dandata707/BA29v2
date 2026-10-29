import { TransferIcon } from './TransferIcon';
import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';

export const UI05_ConfirmHandover: React.FC = () => {
  const {
    currentUser,
    requests,
    handovers,
    selectedRequestId,
    navigateTo,
    updateHandoverSenderCheck,
    updateHandoverRecipientCheck,
    completeTransfer,
    setPrintHandoverId,
    addToast,
  } = useTransfer();

  const request =
    requests.find((r) => r.id === selectedRequestId) ||
    requests.find((r) => r.status === 'handover') ||
    requests[0];

  const handoverId = request?.handoverDocId || '';
  const handover = handovers[handoverId];

  const [senderCheck, setSenderCheck] = useState<boolean>(
    handover?.senderConfirmed ?? false
  );
  const [senderNotes, setSenderNotes] = useState<string>(
    handover?.senderNotes || ''
  );

  const [recipientCheck, setRecipientCheck] = useState<boolean>(
    handover?.recipientConfirmed ?? false
  );
  const [recipientNotes, setRecipientNotes] = useState<string>(
    handover?.recipientNotes || ''
  );

  if (!request || !handover) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Không tìm thấy thông tin biên bản.</p>
        <button
          onClick={() => navigateTo('list')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isCompleted = request.status === 'completed';
  const isManager = currentUser.systemRole === 'admin_hr';
  const canSender = !isManager && currentUser.id === request.requesterId && !handover.senderConfirmed && !isCompleted;
  const canRecipient = !isManager && currentUser.id === request.recipientEmployeeId && !handover.recipientConfirmed && !isCompleted;
  const canComplete = isManager && handover.senderConfirmed && handover.recipientConfirmed;

  const handleSaveNotes = () => {
    if (canSender) updateHandoverSenderCheck(handoverId, senderCheck, senderNotes);
    if (canRecipient) updateHandoverRecipientCheck(handoverId, recipientCheck, recipientNotes);

  };

  const handleComplete = () => {
    if (!canComplete) {
      addToast(
        'Quy tắc BR07: Cần đủ xác nhận của cả Bên giao và Bên nhận để hoàn tất điều chuyển!',
        'warning'
      );
      return;
    }

    if (canSender) updateHandoverSenderCheck(handoverId, senderCheck, senderNotes);
    if (canRecipient) updateHandoverRecipientCheck(handoverId, recipientCheck, recipientNotes);

    const res = completeTransfer(handoverId);
    if (res.success) {
      // Stay on page to show completed state
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-16">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('list')}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#eff6ff] border border-[#e2e8f0] flex items-center justify-center text-[#475569] transition-colors shadow-2xs cursor-pointer"
            title="Quay lại danh sách phiếu"
            type="button"
          >
            <TransferIcon className="text-[18px]" name={"arrow_back"} />
          </button>
          <span className="text-sm font-semibold">{request.id}</span>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={() => setPrintHandoverId(handoverId)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          title="In biên bản bàn giao mẫu 04B/TS-2026"
        >
          <TransferIcon className="text-[16px]" name={"print"} />
          <span>In biên bản mẫu 04B/TS</span>
        </button>
      </div>

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
            Ghi nhận xác nhận bàn giao và tiếp nhận
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Nghiệm thu thực tế tại hiện trường và ghi nhận chữ ký xác nhận của đại diện 2 bên
          </p>
        </div>
      </div>

      {/* Primary Summary Card: Attached Signed Document */}
      <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7ff]">
          <div className="flex items-center gap-2">
            <TransferIcon className="text-blue-600 text-[20px]" name={"attach_file"} />
            <h3 className="text-sm font-bold text-[#0f172a]">
              Biên bản bàn giao
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-[#e2e7ff] px-2.5 py-0.5 rounded-full">
            <TransferIcon className="text-[13px]" name={"verified"} />
            {handover.senderConfirmed && handover.recipientConfirmed ? 'Hai bên đã xác nhận' : 'Chờ xác nhận'}
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e7ff]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <TransferIcon className="text-[22px]" name={"picture_as_pdf"} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#0f172a] truncate">
                  Biên bản {handoverId}
                </p>
              </div>
              <p className="text-[11px] text-[#475569] truncate mt-0.5">
                Ngày lập: {handover.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPrintHandoverId(handoverId)}
              className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] text-xs font-semibold border border-[#e2e8f0] shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <TransferIcon className="text-[16px]" name={"visibility"} />
              <span>Xem trước</span>
            </button>

          </div>
        </div>
      </div>

      {/* Primary Summary Card: Ticket & Asset Details */}
      <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0 text-blue-600">
            <TransferIcon className="text-[22px]" name={"assignment_turned_in"} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-bold text-[#0f172a] tracking-tight font-mono">
                {handoverId}{' '}
                <span className="text-[#64748b] font-normal font-sans">
                  ({request.id})
                </span>
              </span>

              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Đã hoàn tất điều chuyển
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e1e0ff] text-[#07006c]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4648d4]" />
                  Chờ xác nhận bàn giao
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-[#475569] text-xs truncate flex-wrap">
              <span className="font-semibold text-[#0f172a]">
                {request.assetName}
              </span>
              <span className="text-[#e2e8f0]">·</span>
              <span className="px-1.5 py-0.2 bg-[#eff6ff] rounded text-[#475569] font-mono text-[11px] font-bold">
                {request.assetId}
              </span>
              <span className="text-[#e2e8f0]">·</span>
              <span>{request.currentLocation}</span>
              <TransferIcon className="text-[14px] text-[#64748b]" name={"trending_flat"} />
              <span className="text-blue-600 font-semibold">
                {request.destinationLocation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-0 md:pl-5 md:border-l md:border-slate-200 shrink-0 text-xs text-[#64748b]">
          <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center">
            <TransferIcon className="text-[16px] text-[#475569]" name={"calendar_today"} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-bold">
              Ngày lập biên bản
            </span>
            <span className="text-xs font-semibold text-[#0f172a]">
              {handover.handoverDate}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Info Banner */}
      <div className="bg-[#dbeafe] rounded-xl p-4 flex items-start gap-3 text-[#0f172a] border border-blue-200">
        <TransferIcon className="text-[20px] text-blue-600 shrink-0 mt-0.5" name={"info"} />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-blue-600">
            Chỉ hoàn tất điều chuyển khi cả hai bên đã xác nhận (BR07 & BR08)
          </h4>
          <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
            Cần đủ chữ ký xác nhận của đại diện Bên giao và Bên nhận kèm đánh giá tình trạng thực tế để hoàn tất quy trình cập nhật sổ tài sản và kích hoạt quyền quản lý mới cho đơn vị tiếp nhận.
          </p>
        </div>
      </div>

      {/* Main Transfer Execution Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Bên giao */}
        <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-blue-600 shrink-0">
                  <TransferIcon className="text-[20px]" name={"outbox"} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Bên giao ({request.requesterDept || 'Kho CNTT'})
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e2e7ff] text-blue-600 font-mono text-[11px] font-bold">
                <TransferIcon className="text-[13px]" name={"check_circle"} />
                Đã ký biên bản giấy
              </span>
            </div>

            {/* Custodian Preview Banner */}
            <div className="p-3 rounded-lg bg-[#f8fafc] flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {request.requesterName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0f172a] truncate">
                  {request.requesterName}
                </p>
                <p className="text-[11px] text-[#475569] truncate">
                  {request.requesterRole} · Mã NV: {request.requesterId}
                </p>
              </div>
              <TransferIcon className="text-[#64748b] text-[18px]" name={"badge"} />
            </div>

            {/* Form Section */}
            <div className="space-y-3 pt-1">
              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] transition-colors border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={handover.senderConfirmed || senderCheck}
                    disabled={!canSender}
                    onChange={(e) => setSenderCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 accent-blue-600 transition cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#0f172a] block">
                      Đã xác nhận bàn giao trên biên bản
                    </span>
                    <span className="text-[11px] text-[#475569] block mt-0.5 leading-relaxed">
                      Xác nhận đại diện Bên giao đã kiểm đếm đầy đủ hiện vật, linh kiện phụ kiện kèm theo và ký biên bản.
                    </span>
                  </div>
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Ghi chú sai lệch hoặc lưu ý khi xuất (nếu có)
                </label>
                <textarea
                  className="w-full p-2.5 text-xs bg-white rounded-lg text-[#0f172a] placeholder:text-[#64748b] border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs resize-none"
                  placeholder="Ghi nhận chi tiết nếu có trầy xước, thiếu cáp nguồn, cáp phụ kiện..."
                  rows={3}
                  disabled={!canSender}
                  value={senderNotes}
                  onChange={(e) => setSenderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Bên nhận */}
        <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-secondary shrink-0">
                  <TransferIcon className="text-[20px]" name={"move_to_inbox"} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Bên nhận ({request.recipientDept || 'Design Studio'})
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e2e7ff] text-blue-600 font-mono text-[11px] font-bold">
                <TransferIcon className="text-[13px]" name={"done_all"} />
                Đã ký giấy biên bản
              </span>
            </div>

            {/* Custodian Preview Banner */}
            <div className="p-3 rounded-lg bg-[#f8fafc] flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#6063ee] text-white flex items-center justify-center text-xs font-bold">
                {request.recipientName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0f172a] truncate">
                  {request.recipientName}
                </p>
                <p className="text-[11px] text-[#475569] truncate">
                  {request.recipientRole} · Mã NV: {request.recipientEmployeeId}
                </p>
              </div>
              <TransferIcon className="text-[#64748b] text-[18px]" name={"verified"} />
            </div>

            {/* Form Section */}
            <div className="space-y-3 pt-1">
              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] transition-colors border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={handover.recipientConfirmed || recipientCheck}
                    disabled={!canRecipient}
                    onChange={(e) => setRecipientCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 accent-blue-600 transition cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#0f172a] block">
                      Đã tiếp nhận và nghiệm thu tài sản
                    </span>
                    <span className="text-[11px] text-[#475569] block mt-0.5 leading-relaxed">
                      Đại diện Bên nhận đã nhận bàn giao hiện trường, kiểm tra hoạt động bình thường và nhận đủ bộ linh kiện.
                    </span>
                  </div>
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Ghi chú hiện trường nhận bàn giao (nếu có)
                </label>
                <textarea
                  className="w-full p-2.5 text-xs bg-white rounded-lg text-[#0f172a] placeholder:text-[#64748b] border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs resize-none"
                  placeholder="Ghi nhận tình trạng kiểm tra thực tế khi nhận, phân bổ cho vị trí máy trạm..."
                  rows={3}
                  disabled={!canRecipient}
                  value={recipientNotes}
                  onChange={(e) => setRecipientNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#e2e8f0] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          {isCompleted ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <TransferIcon className="text-[18px]" name={"verified"} />
              Hồ sơ điều chuyển đã hoàn tất và lưu vào Sổ theo dõi tài sản.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <TransferIcon className="text-[16px] text-blue-600" name={"rule"} />
              Cần xác nhận từ cả Bên giao & Bên nhận để kích hoạt nút hoàn tất
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 shrink-0">
          {(canSender || canRecipient) && <button
            onClick={handleSaveNotes}
            disabled={!(canSender || canRecipient)}
            className="h-9 px-4 rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] border border-[#e2e8f0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            type="button"
          >
            Lưu xác nhận
          </button>}

          {isManager && (isCompleted ? (
            <button
              onClick={() => navigateTo('asset-catalog')}
              className="h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              type="button"
            >
              <TransferIcon className="text-[18px]" name={"inventory_2"} />
              <span>Xem Sổ tài sản đã cập nhật</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`h-9 px-5 rounded-lg text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
                canComplete
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-400 opacity-60 cursor-not-allowed'
              }`}
              type="button"
              title={
                canComplete
                  ? 'Xác nhận hoàn tất cập nhật hồ sơ điều chuyển'
                  : 'Cần cả hai bên xác nhận để kích hoạt'
              }
            >
              <TransferIcon className="text-[18px]" name={"check_circle"} />
              <span>Hoàn tất điều chuyển</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
