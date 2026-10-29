import { TransferIcon } from './TransferIcon';
import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { INITIAL_LOCATIONS, INITIAL_RECIPIENTS } from '../data/mockData';
import { FileAttachment } from '../types/transfer';

export const UI02_CreateTransfer: React.FC = () => {
  const { eligibleAssets: assets, currentUser, createRequest, navigateTo, addToast } = useTransfer();

  // Selected asset
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<string>('');
  const [recipientEmployeeId, setRecipientEmployeeId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Attachments
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{
    assetId?: string;
    destinationLocation?: string;
    recipientEmployeeId?: string;
    reason?: string;
  }>({});

  // Current selected asset object
  const currentAsset = assets.find((a) => a.id === selectedAssetId);

  // Available locations (excluding current location)
  const availableDestinations = [...new Set([...INITIAL_LOCATIONS, ...assets.map(asset => asset.currentLocation).filter(Boolean)])].filter(
    (loc) => loc !== currentAsset?.currentLocation
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'xlsx'];
    if (!extension || !allowed.includes(extension)) {
      addToast('Chỉ chấp nhận tệp định dạng .PDF, .DOCX, .XLSX!', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('Dung lượng tệp vượt quá 15MB!', 'error');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const newAtt: FileAttachment = {
      id: 'att-' + Date.now(),
      name: file.name,
      size: sizeMb,
      uploadTime: timeStr,
      type: extension as 'pdf' | 'docx' | 'xlsx',
    };

    setAttachments((prev) => [...prev, newAtt]);
    addToast(`Đã tải lên tệp ${file.name}`, 'success');
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    addToast('Đã xóa tệp đính kèm', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!selectedAssetId) {
      newErrors.assetId = 'Vui lòng chọn tài sản';
    }
    if (!destinationLocation) {
      newErrors.destinationLocation = 'Vui lòng chọn vị trí nhận';
    }
    if (!recipientEmployeeId) {
      newErrors.recipientEmployeeId = 'Vui lòng chọn nhân sự phụ trách tiếp nhận tài sản';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Vui lòng nhập chi tiết lý do điều chuyển';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }

    const selectedRecipient = INITIAL_RECIPIENTS.find(
      (r) => r.id === recipientEmployeeId
    );

    const created = createRequest({
      assetId: selectedAssetId,
      destinationLocation,
      recipientEmployeeId,
      recipientName: selectedRecipient?.name || 'Chưa cập nhật',
      recipientRole: selectedRecipient?.role || 'Nhân viên',
      recipientDept: selectedRecipient?.dept || 'Phòng ban',
      reason,
      attachments,
    });

    // Navigate to ticket detail
    if (created) navigateTo('review', created.id);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Indicator & Navigation Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-1 text-[#64748b]">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-[#eff6ff] px-2 py-0.5 rounded">
            TẠO YÊU CẦU ĐIỀU CHUYỂN
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('list')}
              className="w-9 h-9 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] flex items-center justify-center text-[#475569] transition-colors cursor-pointer"
              title="Quay lại danh sách"
              type="button"
            >
              <TransferIcon className="text-[20px]" name={"arrow_back"} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
                Tạo yêu cầu điều chuyển
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Lập phiếu đề xuất điều chuyển trang thiết bị giữa các phòng ban hoặc chi nhánh nội bộ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card Container */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 md:p-8 max-w-5xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Field 1: Mã tài sản */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                  htmlFor="asset-code"
                >
                  <span>Mã tài sản</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
              </div>

              <div className="relative flex items-center">
                <TransferIcon className="text-[#64748b] text-[18px] absolute left-3 pointer-events-none" name={"search"} />
                <select
                  id="asset-code"
                  className={`w-full h-9.5 pl-9 pr-9 text-xs bg-white rounded-lg text-[#0f172a] font-mono border ${
                    errors.assetId
                      ? 'border-[#ba1a1a] bg-red-50/30 ring-1 ring-red-300'
                      : 'border-[#e2e8f0]'
                  } focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-all cursor-pointer`}
                  value={selectedAssetId}
                  onChange={(e) => {
                    setSelectedAssetId(e.target.value);
                    setErrors((err) => ({ ...err, assetId: undefined }));
                  }}
                >
                  <option value="">-- Chọn tài sản trong danh mục kiểm kê --</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.id} — {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.assetId ? (
                <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
                  <TransferIcon className="text-[14px]" name={"error"} />
                  <span>{errors.assetId}</span>
                </p>
              ) : (
                <p className="text-[11px] text-[#64748b]">
                  Dữ liệu tự động truy xuất từ Danh mục tài sản công ty (BR02)
                </p>
              )}
            </div>

            {/* Field 2: Tên tài sản (readonly) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                  htmlFor="asset-name"
                >
                  <span>Tên tài sản</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full h-9.5 px-3 text-xs bg-[#f8fafc] rounded-lg text-[#0f172a] font-medium border border-[#e2e8f0] cursor-not-allowed select-none truncate"
                  id="asset-name"
                  readOnly
                  type="text"
                  value={currentAsset?.name || 'Chưa chọn tài sản'}
                />
                <TransferIcon className="text-[#64748b] text-[16px] absolute right-3 pointer-events-none" name={"lock"} />
              </div>
              <p className="text-[11px] text-[#64748b]">
                {currentAsset ? `S/N: ${currentAsset.serialNumber} • ${currentAsset.status}` : 'Tự động hiển thị'}
              </p>
            </div>

            {/* Field 3: Vị trí hiện tại (readonly) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                  htmlFor="current-location"
                >
                  <span>Vị trí hiện tại</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full h-9.5 px-3 text-xs bg-[#f8fafc] rounded-lg text-[#0f172a] font-medium border border-[#e2e8f0] cursor-not-allowed select-none truncate"
                  id="current-location"
                  readOnly
                  type="text"
                  value={currentAsset?.currentLocation || 'Kho HC-02'}
                />
                <TransferIcon className="text-[#64748b] text-[16px] absolute right-3 pointer-events-none" name={"warehouse"} />
              </div>
              <p className="text-[11px] text-[#64748b]">
                Người quản lý hiện tại: {currentAsset?.custodianName} ({currentAsset?.custodianCode})
              </p>
            </div>

            {/* Field 4: Vị trí nhận * */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                  htmlFor="destination-location"
                >
                  <span>Vị trí nhận</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <select
                  className={`w-full h-9.5 pl-3 pr-9 text-xs bg-white rounded-lg text-[#0f172a] border ${
                    errors.destinationLocation
                      ? 'border-[#ba1a1a] bg-red-50/30'
                      : 'border-[#e2e8f0]'
                  } focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs cursor-pointer`}
                  id="destination-location"
                  value={destinationLocation}
                  onChange={(e) => {
                    setDestinationLocation(e.target.value);
                    setErrors((err) => ({ ...err, destinationLocation: undefined }));
                  }}
                >
                  <option value="">Chọn phòng ban / địa điểm nhận...</option>
                  {availableDestinations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <TransferIcon className="text-[#64748b] text-[18px] absolute right-2.5 pointer-events-none" name={"expand_more"} />
              </div>
              {errors.destinationLocation ? (
                <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
                  <TransferIcon className="text-[14px]" name={"error"} />
                  <span>{errors.destinationLocation}</span>
                </p>
              ) : (
                <p className="text-[11px] text-[#64748b]">
                  Địa bàn bàn giao thực tế của tài sản (khác vị trí hiện tại)
                </p>
              )}
            </div>

            {/* Field 5: Người dự kiến tiếp nhận */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                      htmlFor="assigned-custodian"
                    >
                      <span>Người dự kiến tiếp nhận</span>
                      <span className="text-[#ba1a1a]">*</span>
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <select
                      className={`w-full h-9.5 pl-3 pr-9 text-xs rounded-lg text-[#0f172a] border ${
                        errors.recipientEmployeeId
                          ? 'bg-[#ffdad6]/40 border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                          : 'bg-white border-[#e2e8f0] focus:ring-1 focus:ring-blue-600'
                      } focus:outline-none shadow-2xs cursor-pointer`}
                      id="assigned-custodian"
                      value={recipientEmployeeId}
                      onChange={(e) => {
                        setRecipientEmployeeId(e.target.value);
                        setErrors((err) => ({ ...err, recipientEmployeeId: undefined }));
                      }}
                    >
                      <option value="">Chọn nhân sự tiếp nhận tài sản...</option>
                      {INITIAL_RECIPIENTS.filter(rec => rec.id !== currentUser.id).map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          {rec.id}: {rec.name} ({rec.role} - {rec.dept})
                        </option>
                      ))}
                    </select>
                    <TransferIcon
                      className={`text-[18px] absolute right-2.5 pointer-events-none ${
                        errors.recipientEmployeeId ? 'text-[#ba1a1a]' : 'text-[#64748b]'
                      }`}
                      name={errors.recipientEmployeeId ? 'warning' : 'expand_more'}
                    />
                  </div>

                  {errors.recipientEmployeeId && (
                    <div className="flex items-center gap-1 text-[#ba1a1a] text-xs mt-0.5">
                      <TransferIcon className="text-[14px]" name={"error"} />
                      <span>{errors.recipientEmployeeId}</span>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-col justify-center p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <TransferIcon className="text-blue-600 text-[16px]" name={"info"} />
                    <span>Quy định tiếp nhận</span>
                  </div>
                  Nhân sự nhận sẽ chịu trách nhiệm bảo quản thiết bị sau khi ký biên bản bàn giao tại bước nghiệm thu hiện trường.
                </div>
              </div>
            </div>

            {/* Field 6: Lý do điều chuyển */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#0f172a] flex items-center gap-1"
                  htmlFor="transfer-reason"
                >
                  <span>Lý do điều chuyển</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
              </div>
              <div className="relative">
                <textarea
                  className={`w-full min-h-[110px] p-3 text-xs bg-white rounded-lg text-[#0f172a] placeholder:text-[#64748b] border ${
                    errors.reason ? 'border-[#ba1a1a]' : 'border-[#e2e8f0]'
                  } focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs resize-none`}
                  id="transfer-reason"
                  maxLength={500}
                  placeholder="Nhập chi tiết mục đích và căn cứ điều chuyển tài sản..."
                  rows={4}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrors((err) => ({ ...err, reason: undefined }));
                  }}
                />
                <div className="absolute bottom-2 right-3 font-mono text-[11px] text-[#64748b] pointer-events-none">
                  {reason.length}/500
                </div>
              </div>
              {errors.reason ? (
                <p className="text-xs text-[#ba1a1a]">{errors.reason}</p>
              ) : (
                <p className="text-[11px] text-[#64748b]">
                  Cần nêu rõ lý do: luân chuyển nhân sự, tăng cường dự án, hoặc thay thế thiết bị hỏng.
                </p>
              )}
            </div>

            {/* Field 7: Tài liệu / Phiếu đính kèm */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0f172a] flex items-center gap-1">
                  <span>Tài liệu / Phiếu đính kèm</span>
                  <span className="text-[11px] text-[#64748b] font-normal">(Tùy chọn)</span>
                </label>
                <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  <TransferIcon className="text-[16px]" name={"upload_file"} />
                  <span>Tải tệp lên</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.xlsx"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {attachments.length === 0 ? (
                <label className="border border-dashed border-[#e2e8f0] hover:border-blue-600 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#f8fafc] hover:bg-[#eff6ff]/30">
                  <TransferIcon className="text-[24px] text-slate-400 mb-1" name={"attach_file"} />
                  <span className="text-xs font-semibold text-blue-600">
                    Chọn tệp từ máy tính
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Chấp nhận định dạng .PDF, .DOCX, .XLSX (tối đa 15MB).
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.xlsx"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                          <TransferIcon className="text-[20px]" name={att.type === 'pdf'
                              ? 'picture_as_pdf'
                              : att.type === 'docx'
                              ? 'description'
                              : 'table_view'} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#0f172a] truncate">
                              {att.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-blue-600 border border-blue-200 font-mono font-bold uppercase">
                              ĐÃ TẢI LÊN
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748b]">
                            {att.size} • Tải lên lúc {att.uploadTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-white transition-colors cursor-pointer"
                          title="Xem trước / Tải xuống"
                          type="button"
                          onClick={() =>
                            addToast(`Đang mở xem tệp ${att.name}`, 'info')
                          }
                        >
                          <TransferIcon className="text-[18px]" name={"download"} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa tệp đính kèm"
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <TransferIcon className="text-[18px]" name={"delete"} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <TransferIcon className="text-[16px]" name={"verified_user"} />
              <span>Hệ thống áp dụng chuẩn quy tắc kiểm tra BR01</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => navigateTo('list')}
                className="px-4 py-2 h-9 rounded-lg text-xs font-semibold text-[#475569] bg-[#eff6ff] hover:bg-[#dbeafe] transition-colors shadow-2xs cursor-pointer"
                type="button"
              >
                Hủy
              </button>
              <button
                className="px-5 py-2 h-9 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                type="submit"
              >
                <TransferIcon className="text-[18px]" name={"send"} />
                <span>Gửi yêu cầu</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
