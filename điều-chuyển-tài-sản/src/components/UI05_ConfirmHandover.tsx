import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';

export const UI05_ConfirmHandover: React.FC = () => {
  const {
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

  const handoverId = request?.handoverDocId || 'BB-2026-0045';
  const handover = handovers[handoverId] || {
    id: handoverId,
    requestId: request?.id || 'DC-2026-0009',
    formCode: 'Biểu mẫu số 04B/TS-2026',
    handoverDate: '15/10/2026 14:30',
    handoverLocation: 'Tầng 6 - Design Studio',
    accessories: '03 Chân đế xoay đa hướng, 03 Cáp nguồn zin, 03 Cáp Type-C Thunderbolt 4.',
    termsAccepted: true,
    createdAt: '15/10/2026 14:30',
    senderConfirmed: true,
    senderNotes: 'Đại diện Kho CNTT đã kiểm đếm đầy đủ kèm phụ kiện chuẩn.',
    senderName: request?.requesterName || 'Nguyễn Văn An',
    senderCode: request?.requesterId || 'NV-0142',
    senderRole: request?.requesterRole || 'Quản lý thiết bị',
    senderDept: request?.requesterDept || 'Kho CNTT',
    recipientConfirmed: true,
    recipientNotes: 'Đại diện Design Studio đã nhận bàn giao hiện trường, nghiệm thu đạt chuẩn.',
    recipientName: request?.recipientName || 'Trần Thị Mai',
    recipientCode: request?.recipientEmployeeId || 'NV-0289',
    recipientRole: request?.recipientRole || 'Trưởng nhóm Design',
    recipientDept: request?.recipientDept || 'Design Studio',
    attachments: [
      {
        id: 'att-signed-sample',
        name: `Bien_ban_ban_giao_${handoverId}_signed.pdf`,
        size: '2.8 MB',
        uploadTime: '15:10',
        type: 'pdf',
      },
    ],
  };

  const [senderCheck, setSenderCheck] = useState<boolean>(
    handover.senderConfirmed
  );
  const [senderNotes, setSenderNotes] = useState<string>(
    handover.senderNotes || ''
  );

  const [recipientCheck, setRecipientCheck] = useState<boolean>(
    handover.recipientConfirmed
  );
  const [recipientNotes, setRecipientNotes] = useState<string>(
    handover.recipientNotes || ''
  );

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Không tìm thấy thông tin biên bản.</p>
        <button
          onClick={() => navigateTo('list')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isCompleted = request.status === 'completed';
  const canComplete = senderCheck && recipientCheck;

  const handleSaveNotes = () => {
    updateHandoverSenderCheck(handoverId, senderCheck, senderNotes);
    updateHandoverRecipientCheck(handoverId, recipientCheck, recipientNotes);
    addToast('Đã lưu ghi nhận xác nhận bàn giao tạm thời!', 'info');
  };

  const handleComplete = () => {
    if (!canComplete) {
      addToast(
        'Quy tắc BR07: Cần đủ xác nhận của cả Bên giao và Bên nhận để hoàn tất điều chuyển!',
        'warning'
      );
      return;
    }

    updateHandoverSenderCheck(handoverId, senderCheck, senderNotes);
    updateHandoverRecipientCheck(handoverId, recipientCheck, recipientNotes);

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
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#eaedff] border border-[#c2c6d5] flex items-center justify-center text-[#424753] transition-colors shadow-2xs cursor-pointer"
            title="Quay lại danh sách phiếu"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          <div className="flex items-center gap-2 text-xs text-[#737784]">
            <button
              onClick={() => navigateTo('list')}
              className="hover:text-[#131b2e] cursor-pointer"
            >
              Danh sách yêu cầu điều chuyển tài sản
            </button>
            <span>/</span>
            <button
              onClick={() => navigateTo('review', request.id)}
              className="hover:text-[#131b2e] font-mono cursor-pointer"
            >
              {request.id}
            </button>
            <span>/</span>
            <span className="text-[#131b2e] font-semibold">Xác nhận bàn giao</span>
          </div>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={() => setPrintHandoverId(handoverId)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c2c6d5] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          title="In biên bản bàn giao mẫu 04B/TS-2026"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          <span>In biên bản mẫu 04B/TS</span>
        </button>
      </div>

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#131b2e] tracking-tight">
            Ghi nhận xác nhận bàn giao và tiếp nhận
          </h2>
          <p className="text-xs text-[#737784] mt-0.5">
            Nghiệm thu thực tế tại hiện trường và ghi nhận chữ ký xác nhận của đại diện 2 bên
          </p>
        </div>
      </div>

      {/* Primary Summary Card: Attached Signed Document */}
      <div className="bg-white rounded-xl p-5 border border-[#c2c6d5] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              attach_file
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">
              Tệp đính kèm biên bản (Đã ký nhận)
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-[#e2e7ff] px-2.5 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            Đã ký xác nhận
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                picture_as_pdf
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#131b2e] truncate">
                  Bien_ban_ban_giao_{handoverId}_signed.pdf
                </p>
              </div>
              <p className="text-[11px] text-[#424753] truncate mt-0.5">
                2.8 MB • Đã ký số & tải lên lúc {handover.createdAt} • Đã xác thực đầy đủ 2 bên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPrintHandoverId(handoverId)}
              className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-[#131b2e] text-xs font-semibold border border-[#c2c6d5] shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                visibility
              </span>
              <span>Xem trước</span>
            </button>
            <button
              onClick={() =>
                addToast(
                  `Đang tải xuống biên bản bàn giao: Bien_ban_ban_giao_${handoverId}_signed.pdf`,
                  'info'
                )
              }
              className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-[#131b2e] text-xs font-semibold border border-[#c2c6d5] shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Summary Card: Ticket & Asset Details */}
      <div className="bg-white rounded-xl p-5 border border-[#c2c6d5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center shrink-0 text-primary">
            <span className="material-symbols-outlined text-[22px]">
              assignment_turned_in
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-bold text-[#131b2e] tracking-tight font-mono">
                {handoverId}{' '}
                <span className="text-[#737784] font-normal font-sans">
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

            <div className="flex items-center gap-2 mt-1 text-[#424753] text-xs truncate flex-wrap">
              <span className="font-semibold text-[#131b2e]">
                {request.assetName}
              </span>
              <span className="text-[#c2c6d5]">·</span>
              <span className="px-1.5 py-0.2 bg-[#eaedff] rounded text-[#424753] font-mono text-[11px] font-bold">
                {request.assetId}
              </span>
              <span className="text-[#c2c6d5]">·</span>
              <span>{request.currentLocation}</span>
              <span className="material-symbols-outlined text-[14px] text-[#737784]">
                trending_flat
              </span>
              <span className="text-primary font-semibold">
                {request.destinationLocation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-0 md:pl-5 md:border-l md:border-slate-200 shrink-0 text-xs text-[#737784]">
          <div className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#424753]">
              calendar_today
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#737784] uppercase tracking-wider font-bold">
              Ngày lập biên bản
            </span>
            <span className="text-xs font-semibold text-[#131b2e]">
              {handover.handoverDate}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Info Banner */}
      <div className="bg-[#dae2fd] rounded-xl p-4 flex items-start gap-3 text-[#131b2e] border border-blue-200">
        <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
          info
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-primary">
            Chỉ hoàn tất điều chuyển khi cả hai bên đã xác nhận (BR07 & BR08)
          </h4>
          <p className="text-[11px] text-[#424753] mt-0.5 leading-relaxed">
            Cần đủ chữ ký xác nhận của đại diện Bên giao và Bên nhận kèm đánh giá tình trạng thực tế để hoàn tất quy trình cập nhật sổ tài sản và kích hoạt quyền quản lý mới cho đơn vị tiếp nhận.
          </p>
        </div>
      </div>

      {/* Main Transfer Execution Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Bên giao */}
        <div className="bg-white rounded-xl p-6 border border-[#c2c6d5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    outbox
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#131b2e]">
                    Bên giao ({request.requesterDept || 'Kho CNTT'})
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e2e7ff] text-primary font-mono text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]">
                  check_circle
                </span>
                Đã ký biên bản giấy
              </span>
            </div>

            {/* Custodian Preview Banner */}
            <div className="p-3 rounded-lg bg-[#f2f3ff] flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {request.requesterName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#131b2e] truncate">
                  {request.requesterName}
                </p>
                <p className="text-[11px] text-[#424753] truncate">
                  {request.requesterRole} · Mã NV: {request.requesterId}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#737784] text-[18px]">
                badge
              </span>
            </div>

            {/* Form Section */}
            <div className="space-y-3 pt-1">
              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] transition-colors border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={senderCheck}
                    disabled={isCompleted}
                    onChange={(e) => setSenderCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-primary accent-primary transition cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#131b2e] block">
                      Đã xác nhận bàn giao trên biên bản
                    </span>
                    <span className="text-[11px] text-[#424753] block mt-0.5 leading-relaxed">
                      Xác nhận đại diện Bên giao đã kiểm đếm đầy đủ hiện vật, linh kiện phụ kiện kèm theo và ký biên bản.
                    </span>
                  </div>
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-[#424753] mb-1">
                  Ghi chú sai lệch hoặc lưu ý khi xuất (nếu có)
                </label>
                <textarea
                  className="w-full p-2.5 text-xs bg-white rounded-lg text-[#131b2e] placeholder:text-[#737784] border border-[#c2c6d5] focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-none"
                  placeholder="Ghi nhận chi tiết nếu có trầy xước, thiếu cáp nguồn, cáp phụ kiện..."
                  rows={3}
                  disabled={isCompleted}
                  value={senderNotes}
                  onChange={(e) => setSenderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Bên nhận */}
        <div className="bg-white rounded-xl p-6 border border-[#c2c6d5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    move_to_inbox
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#131b2e]">
                    Bên nhận ({request.recipientDept || 'Design Studio'})
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e2e7ff] text-primary font-mono text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]">
                  done_all
                </span>
                Đã ký giấy biên bản
              </span>
            </div>

            {/* Custodian Preview Banner */}
            <div className="p-3 rounded-lg bg-[#f2f3ff] flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#6063ee] text-white flex items-center justify-center text-xs font-bold">
                {request.recipientName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#131b2e] truncate">
                  {request.recipientName}
                </p>
                <p className="text-[11px] text-[#424753] truncate">
                  {request.recipientRole} · Mã NV: {request.recipientEmployeeId}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#737784] text-[18px]">
                verified
              </span>
            </div>

            {/* Form Section */}
            <div className="space-y-3 pt-1">
              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] transition-colors border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recipientCheck}
                    disabled={isCompleted}
                    onChange={(e) => setRecipientCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-primary accent-primary transition cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#131b2e] block">
                      Đã tiếp nhận và nghiệm thu tài sản
                    </span>
                    <span className="text-[11px] text-[#424753] block mt-0.5 leading-relaxed">
                      Đại diện Bên nhận đã nhận bàn giao hiện trường, kiểm tra hoạt động bình thường và nhận đủ bộ linh kiện.
                    </span>
                  </div>
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-[#424753] mb-1">
                  Ghi chú hiện trường nhận bàn giao (nếu có)
                </label>
                <textarea
                  className="w-full p-2.5 text-xs bg-white rounded-lg text-[#131b2e] placeholder:text-[#737784] border border-[#c2c6d5] focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-none"
                  placeholder="Ghi nhận tình trạng kiểm tra thực tế khi nhận, phân bổ cho vị trí máy trạm..."
                  rows={3}
                  disabled={isCompleted}
                  value={recipientNotes}
                  onChange={(e) => setRecipientNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#c2c6d5] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#737784]">
          {isCompleted ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
              Hồ sơ điều chuyển đã hoàn tất và lưu vào Sổ theo dõi tài sản.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                rule
              </span>
              Cần xác nhận từ cả Bên giao & Bên nhận để kích hoạt nút hoàn tất
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleSaveNotes}
            disabled={isCompleted}
            className="h-9 px-4 rounded-lg bg-white hover:bg-slate-50 text-[#131b2e] border border-[#c2c6d5] text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            type="button"
          >
            Lưu ghi nhận
          </button>

          {isCompleted ? (
            <button
              onClick={() => navigateTo('asset-catalog')}
              className="h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
              <span>Xem Sổ tài sản đã cập nhật</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`h-9 px-5 rounded-lg text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
                canComplete
                  ? 'bg-primary hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-400 opacity-60 cursor-not-allowed'
              }`}
              type="button"
              title={
                canComplete
                  ? 'Xác nhận hoàn tất cập nhật hồ sơ điều chuyển'
                  : 'Cần cả hai bên xác nhận để kích hoạt'
              }
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>Hoàn tất điều chuyển</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
