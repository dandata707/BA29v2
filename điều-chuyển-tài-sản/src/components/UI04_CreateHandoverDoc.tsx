import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { FileAttachment } from '../types/transfer';

export const UI04_CreateHandoverDoc: React.FC = () => {
  const {
    requests,
    assets,
    selectedRequestId,
    navigateTo,
    createHandoverDocument,
    addToast,
  } = useTransfer();

  const request =
    requests.find((r) => r.id === selectedRequestId) || requests[0];
  const asset = assets.find((a) => a.id === request?.assetId);

  // Form states
  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} 14:30`;

  const [handoverDate, setHandoverDate] = useState<string>(defaultDate);
  const [handoverLocation, setHandoverLocation] = useState<string>(
    'Phòng họp 7.1 - Tầng 7, Khối Công nghệ'
  );
  const [accessories, setAccessories] = useState<string>(
    asset?.defaultAccessories ||
      'Bộ sạc Apple MagSafe 140W zin, cáp sạc bọc dù Type-C to MagSafe 3, túi chống sốc Tomtoc 16 inch màu đen, chuột Magic Mouse 2.'
  );
  const [confirmTerms, setConfirmTerms] = useState<boolean>(true);
  const [attachments, setAttachments] = useState<FileAttachment[]>([
    {
      id: 'att-doc-1',
      name: `Bien_ban_ban_giao_${asset?.id || 'TS-IT-0492'}_signed.pdf`,
      size: '2.4 MB',
      uploadTime: '14:30',
      type: 'pdf',
    },
  ]);

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-slate-600">Không tìm thấy thông tin yêu cầu.</p>
        <button
          onClick={() => navigateTo('list')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const nowTime = new Date();
    const timeStr = `${nowTime.getHours().toString().padStart(2, '0')}:${nowTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newAtt: FileAttachment = {
      id: 'att-ho-' + Date.now(),
      name: file.name,
      size: sizeMb,
      uploadTime: timeStr,
      type: 'pdf',
    };
    setAttachments((prev) => [...prev, newAtt]);
    addToast(`Đã đính kèm tệp ${file.name}`, 'success');
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    addToast('Đã xóa tệp đính kèm', 'info');
  };

  const handleCreateDocument = () => {
    if (!handoverDate.trim()) {
      addToast('Vui lòng chọn thời gian bàn giao!', 'warning');
      return;
    }
    if (!handoverLocation.trim()) {
      addToast('Vui lòng nhập địa điểm bàn giao!', 'warning');
      return;
    }
    if (!accessories.trim()) {
      addToast('Vui lòng nhập danh mục phụ kiện bàn giao kèm theo!', 'warning');
      return;
    }
    if (!confirmTerms) {
      addToast('Vui lòng tích xác nhận các điều khoản kiểm tra trước khi lập biên bản!', 'warning');
      return;
    }

    const doc = createHandoverDocument(request.id, {
      handoverDate,
      handoverLocation,
      accessories,
      attachments,
      termsAccepted: confirmTerms,
    });

    if (doc) {
      // Advance straight to UI05 for confirmation
      navigateTo('handover-confirm', request.id);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => navigateTo('list')}
            className="inline-flex items-center gap-1 text-[#424753] hover:text-primary transition-colors font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>Yêu cầu điều chuyển</span>
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => navigateTo('review', request.id)}
            className="text-[#424753] hover:text-primary transition-colors font-medium font-mono cursor-pointer"
          >
            Phiếu {request.id}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-primary font-bold">Lập biên bản bàn giao</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e2e7ff] text-slate-700 font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Biểu mẫu chuẩn 04B/TS-2026</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('review', request.id)}
            className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#131b2e] hover:bg-[#dae2fd] transition-colors cursor-pointer"
            title="Quay lại phiếu yêu cầu"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#131b2e]">
                Lập biên bản bàn giao tài sản
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#e2e7ff] text-primary font-bold">
                Biểu mẫu số 04B/TS-2026
              </span>
            </div>
            <p className="text-xs text-[#737784] mt-0.5">
              Thiết lập hồ sơ pháp lý bàn giao giữa bên giao và bên nhận trước khi tiến hành nghiệm thu thực tế
            </p>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-[#c2c6d5] shadow-xs p-6 md:p-8 space-y-6">
        {/* SECTION 1: THÔNG TIN CHUNG */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 bg-[#f2f3ff] px-4 py-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2766cc] text-white text-[11px] font-bold">
                01
              </span>
              <h3 className="text-sm font-bold text-[#131b2e]">
                Thông tin chung biên bản
              </h3>
            </div>
            <span className="text-[11px] text-[#737784]">
              Bắt buộc nhập các trường có dấu (*)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Field 1: Số biên bản */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#424753]">
                  Số biên bản
                </label>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded">
                  Tự động sinh
                </span>
              </div>
              <div className="relative">
                <input
                  className="w-full h-9.5 px-3 font-mono text-xs text-[#131b2e] bg-[#f2f3ff] rounded-lg border border-[#c2c6d5] focus:outline-none cursor-not-allowed select-all font-bold"
                  readOnly
                  type="text"
                  value={request.handoverDocId || 'BBBG-2026-0048'}
                />
                <span className="material-symbols-outlined text-[#737784] text-[16px] absolute right-2.5 top-2.5 pointer-events-none">
                  tag
                </span>
              </div>
            </div>

            {/* Field 2: Mã yêu cầu */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#424753]">
                  Mã yêu cầu điều chuyển
                </label>
              </div>
              <div className="flex items-center h-9.5 px-3 bg-[#f2f3ff] rounded-lg border border-[#c2c6d5] justify-between">
                <span className="font-mono text-xs text-primary font-bold">
                  {request.id}
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo('review', request.id)}
                  className="inline-flex items-center gap-0.5 text-[11px] text-[#424753] hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Xem phiếu</span>
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                </button>
              </div>
            </div>

            {/* Field 3: Thời gian bàn giao */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#131b2e] flex items-center gap-1">
                  <span>Thời gian bàn giao</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  className="w-full h-9.5 pl-3 pr-8 text-xs text-[#131b2e] bg-white rounded-lg border border-[#c2c6d5] focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  type="text"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  placeholder="yyyy-MM-dd HH:mm"
                />
                <span className="material-symbols-outlined text-[#737784] text-[18px] absolute right-2.5 top-2 pointer-events-none">
                  calendar_clock
                </span>
              </div>
            </div>

            {/* Field 4: Địa điểm bàn giao */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#131b2e] flex items-center gap-1">
                  <span>Địa điểm bàn giao</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  className="w-full h-9.5 pl-3 pr-8 text-xs text-[#131b2e] bg-white rounded-lg border border-[#c2c6d5] focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs truncate"
                  type="text"
                  value={handoverLocation}
                  onChange={(e) => setHandoverLocation(e.target.value)}
                  placeholder="Nhập phòng họp / khu vực bàn giao..."
                />
                <span className="material-symbols-outlined text-[#737784] text-[18px] absolute right-2.5 top-2 pointer-events-none">
                  meeting_room
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* SECTION 2: THÔNG TIN TÀI SẢN */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 bg-[#f2f3ff] px-4 py-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#6063ee] text-white text-[11px] font-bold">
                02
              </span>
              <h3 className="text-sm font-bold text-[#131b2e]">
                Thông tin tài sản điều chuyển
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#f2f3ff] p-4 rounded-xl border border-slate-100">
            {/* Visual asset thumbnail */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow-2xs border border-slate-100">
              <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-100 relative flex items-center justify-center group">
                <img
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  alt={asset?.name || 'Tài sản'}
                  src={
                    asset?.imageUrl ||
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
                  }
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#283044]/90 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                  MÃ: {asset?.id || request.assetId}
                </div>
              </div>
              <div className="flex items-center justify-between w-full mt-2 px-1">
                <span className="text-[11px] text-[#737784]">Số Serial</span>
                <span className="font-mono text-xs text-[#131b2e] font-bold">
                  {asset?.serialNumber || 'C02G901AMD6R'}
                </span>
              </div>
            </div>

            {/* Specifications block */}
            <div className="lg:col-span-9 flex flex-col justify-between space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Box: Định danh */}
                <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-slate-100 space-y-1">
                  <span className="text-[10px] text-[#737784] uppercase tracking-wider font-bold">
                    Tên tài sản
                  </span>
                  <p className="text-sm text-[#131b2e] font-bold leading-snug">
                    {asset?.name || request.assetName}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {asset?.specs?.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#eaedff] text-[#424753]"
                      >
                        {spec}
                      </span>
                    )) || (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#eaedff] text-[#424753]">
                        Cấu hình nguyên bản
                      </span>
                    )}
                  </div>
                </div>

                {/* Box: Tình trạng */}
                <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-slate-100 space-y-1">
                  <span className="text-[10px] text-[#737784] uppercase tracking-wider font-bold">
                    Tình trạng hiện tại
                  </span>
                  <div className="flex items-start gap-2 pt-0.5">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                      verified
                    </span>
                    <p className="text-xs text-[#131b2e] font-medium leading-relaxed">
                      {asset?.status || 'Tốt, 98% (Đã kiểm tra kỹ thuật)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phụ kiện kèm theo input */}
              <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#131b2e] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#737784]">
                      devices
                    </span>
                    <span>Phụ kiện kèm theo</span>
                    <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-[11px] text-[#737784]">
                    Kiểm tra đầy đủ trước khi xác nhận bàn giao
                  </span>
                </div>
                <textarea
                  className="w-full text-xs text-[#131b2e] bg-[#f2f3ff] rounded-lg p-2.5 border border-[#c2c6d5] focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors resize-none leading-relaxed"
                  rows={2}
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Ghi rõ sạc, cáp, hộp, bao đựng, chuột hoặc phụ kiện mở rộng..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* SECTION 3: CÁC BÊN THAM GIA BÀN GIAO */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 bg-[#f2f3ff] px-4 py-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#0071a2] text-white text-[11px] font-bold">
                03
              </span>
              <h3 className="text-sm font-bold text-[#131b2e]">
                Các bên tham gia bàn giao
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: BÊN GIAO */}
            <div className="bg-[#f2f3ff] p-5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      upload_file
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737784] uppercase tracking-wider font-bold block">
                      Bên giao tài sản
                    </span>
                    <h4 className="text-xs font-bold text-[#131b2e]">
                      Đại diện bên giao
                    </h4>
                  </div>
                </div>
              </div>

              {/* User details */}
              <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#2766cc] text-white flex items-center justify-center text-xs font-bold">
                    {request.requesterName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#131b2e] truncate">
                        {request.requesterName}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-[#424753] font-mono font-bold">
                        {request.requesterId}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737784] truncate">
                      {request.requesterRole}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] bg-[#f2f3ff] p-2 rounded">
                  <div>
                    <span className="text-[#737784] block">Bộ phận chuyển đi:</span>
                    <span className="text-[#131b2e] font-semibold truncate block">
                      {request.requesterDept}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737784] block">Vị trí hiện tại:</span>
                    <span className="text-[#131b2e] font-semibold truncate block">
                      {request.currentLocation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: BÊN NHẬN */}
            <div className="bg-[#f2f3ff] p-5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">
                      download_done
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737784] uppercase tracking-wider font-bold block">
                      Bên nhận tài sản
                    </span>
                    <h4 className="text-xs font-bold text-[#131b2e]">
                      Đại diện bên nhận
                    </h4>
                  </div>
                </div>
              </div>

              {/* User details */}
              <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#6063ee] text-white flex items-center justify-center text-xs font-bold">
                    {request.recipientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#131b2e] truncate">
                        {request.recipientName}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-[#424753] font-mono font-bold">
                        {request.recipientEmployeeId}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737784] truncate">
                      {request.recipientRole}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] bg-[#f2f3ff] p-2 rounded">
                  <div>
                    <span className="text-[#737784] block">Bộ phận tiếp nhận:</span>
                    <span className="text-[#131b2e] font-semibold truncate block">
                      {request.recipientDept}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737784] block">Vị trí lắp đặt:</span>
                    <span className="text-[#131b2e] font-semibold truncate block">
                      {request.destinationLocation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* SECTION 4: TÀI LIỆU XÁC NHẬN */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 bg-[#f2f3ff] px-4 py-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2766cc] text-white text-[11px] font-bold">
                04
              </span>
              <h3 className="text-sm font-bold text-[#131b2e]">
                Đính kèm biên bản / Tài liệu xác nhận
              </h3>
            </div>
            <span className="text-[11px] text-[#737784]">
              Hỗ trợ tệp định dạng PDF, DOCX, JPG, PNG tối đa 20MB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="border border-dashed border-[#c2c6d5] hover:border-primary bg-[#f2f3ff]/50 hover:bg-[#f2f3ff] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <div className="w-10 h-10 rounded-full bg-[#dae2fd] group-hover:bg-[#d8e2ff] flex items-center justify-center text-primary mb-2 transition-colors">
                <span className="material-symbols-outlined text-[24px]">
                  cloud_upload
                </span>
              </div>
              <p className="text-xs font-semibold text-[#131b2e] mb-0.5">
                <span className="text-primary hover:underline">
                  Chọn tệp từ máy tính
                </span>{' '}
                hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-[#737784]">
                Biên bản đã ký, phiếu kiểm kê hoặc ảnh chụp thực tế bàn giao
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.png"
                onChange={handleFileUpload}
              />
            </label>

            <div className="flex flex-col justify-center space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-[#f2f3ff] rounded-lg border border-[#c2c6d5]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        picture_as_pdf
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#131b2e] truncate">
                        {att.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#737784]">
                          {att.size}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Đã tải lên
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="w-7 h-7 rounded flex items-center justify-center text-[#737784] hover:bg-[#eaedff] hover:text-primary transition-colors cursor-pointer"
                      title="Xem trước"
                      type="button"
                      onClick={() => addToast(`Xem tệp: ${att.name}`, 'info')}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                    </button>
                    <button
                      className="w-7 h-7 rounded flex items-center justify-center text-[#737784] hover:bg-red-50 hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      title="Xóa tệp"
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-1 text-xs text-[#737784]">
                <span>Đã đính kèm {attachments.length} tệp tài liệu</span>
                <label className="text-primary cursor-pointer hover:underline flex items-center gap-0.5 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Thêm tệp khác</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* Additional terms checkbox & confirmation */}
        <div className="flex items-start gap-3 p-4 bg-[#f2f3ff] rounded-xl border border-slate-200">
          <input
            id="confirm-handover"
            type="checkbox"
            checked={confirmTerms}
            onChange={(e) => setConfirmTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-primary bg-white rounded accent-primary cursor-pointer"
          />
          <label
            htmlFor="confirm-handover"
            className="text-xs text-[#131b2e] leading-relaxed select-none cursor-pointer"
          >
            Tôi xác nhận các thông tin tài sản, hiện trạng máy móc và linh kiện phụ kiện kèm theo đã được kiểm tra thực tế đúng theo quy trình bàn giao nội bộ của doanh nghiệp (Quy tắc BR06).
          </label>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-[#737784]">
            Hệ thống sẽ chuyển trạng thái sang <strong>"Chờ xác nhận bàn giao"</strong> sau khi tạo.
          </div>

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => navigateTo('review', request.id)}
              className="h-9 px-4 rounded-lg text-xs font-semibold text-[#424753] hover:bg-[#eaedff] transition-colors cursor-pointer"
              type="button"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => addToast('Đã lưu nháp biên bản bàn giao thành công!', 'info')}
              className="h-9 px-4 rounded-lg text-xs font-semibold text-[#131b2e] bg-[#eaedff] hover:bg-[#dae2fd] transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu nháp</span>
            </button>
            <button
              onClick={handleCreateDocument}
              className="h-9 px-5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
              <span>Lập biên bản</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
