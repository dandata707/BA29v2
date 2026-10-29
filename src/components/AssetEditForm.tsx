import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  History, 
  Save, 
  TrendingUp, 
  Calendar,
  Layers,
  Building,
  Info
} from 'lucide-react';
import { Asset, AssetCategory, Supplier, AssetFormData } from '../types/asset.ts';
import { 
  validateAssetForm, 
  formatVND, 
  formatDateVN, 
  parseNumber,
  getRemainingWarrantyMonths 
} from '../utils/assetRules.ts';

interface AssetEditFormProps {
  asset: Asset;
  categories: AssetCategory[];
  suppliers: Supplier[];
  existingAssets: Asset[];
  onBack: () => void;
  onSave: (updatedAsset: Asset) => void;
  onOpenAuditLog: () => void;
}

export const AssetEditForm: React.FC<AssetEditFormProps> = ({
  asset,
  categories,
  suppliers,
  existingAssets,
  onBack,
  onSave,
  onOpenAuditLog
}) => {
  const [formData, setFormData] = useState<AssetFormData>({
    categoryId: asset.categoryId,
    tenTaiSan: asset.tenTaiSan,
    soSerial: asset.soSerial || '',
    tinhTrangBanDau: asset.tinhTrangBanDau,
    nguonTaiSan: asset.nguonTaiSan,
    nhaCungCapId: asset.nhaCungCapId || '',
    nhaCungCapTen: asset.nhaCungCapTen || '',
    ngayMuaNhan: asset.ngayMuaNhan,
    nguyenGia: String(asset.nguyenGia),
    hanBaoHanh: asset.hanBaoHanh || '',
    soChungTu: asset.soChungTu || '',
    phuKienDiKem: asset.phuKienDiKem || '',
    viTriLuuKho: asset.viTriLuuKho || '',
    ghiChu: asset.ghiChu || ''
  });

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  const validationResult = useMemo(() => {
    return validateAssetForm(formData, selectedCategory, existingAssets, asset.id);
  }, [formData, selectedCategory, existingAssets, asset.id]);

  const changedFields = useMemo(() => {
    const list: string[] = [];
    if (formData.categoryId !== asset.categoryId) list.push('Danh mục');
    if (formData.tenTaiSan !== asset.tenTaiSan) list.push('Tên tài sản');
    if (formData.soSerial !== (asset.soSerial || '')) list.push('Số serial');
    if (formData.tinhTrangBanDau !== asset.tinhTrangBanDau) list.push('Tình trạng');
    if (formData.nguonTaiSan !== asset.nguonTaiSan) list.push('Nguồn tài sản');
    if (formData.nhaCungCapId !== (asset.nhaCungCapId || '')) list.push('Nhà cung cấp');
    if (formData.ngayMuaNhan !== asset.ngayMuaNhan) list.push('Ngày mua/nhận');
    if (parseNumber(formData.nguyenGia) !== asset.nguyenGia) list.push('Nguyên giá');
    if (formData.hanBaoHanh !== (asset.hanBaoHanh || '')) list.push('Hạn bảo hành');
    if (formData.soChungTu !== (asset.soChungTu || '')) list.push('Số chứng từ');
    if (formData.phuKienDiKem !== (asset.phuKienDiKem || '')) list.push('Phụ kiện');
    if (formData.viTriLuuKho !== (asset.viTriLuuKho || '')) list.push('Vị trí lưu kho');
    if (formData.ghiChu !== (asset.ghiChu || '')) list.push('Ghi chú');
    return list;
  }, [formData, asset]);

  const newPriceNum = parseNumber(formData.nguyenGia);
  const priceDiff = newPriceNum - asset.nguyenGia;
  const pricePercentDiff = asset.nguyenGia > 0 ? (priceDiff / asset.nguyenGia) * 100 : 0;

  const remainingWarrantyMonths = getRemainingWarrantyMonths(formData.hanBaoHanh);

  const handleFieldChange = (field: keyof AssetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validationResult.isValid) {
      setNotificationMsg(`Vui lòng khắc phục ${validationResult.errorCount} lỗi nhập liệu trước khi lưu.`);
      return;
    }

    if (changedFields.length === 0) {
      setNotificationMsg('Không có thay đổi nào so với dữ liệu gốc.');
      return;
    }

    const nowStr = new Date().toISOString();
    const updated: Asset = {
      ...asset,
      categoryId: formData.categoryId,
      categoryName: selectedCategory?.name || asset.categoryName,
      isITorElectronic: selectedCategory ? selectedCategory.isITorElectronic : asset.isITorElectronic,
      tenTaiSan: formData.tenTaiSan.trim(),
      soSerial: formData.soSerial.trim(),
      tinhTrangBanDau: formData.tinhTrangBanDau,
      nguonTaiSan: formData.nguonTaiSan,
      nhaCungCapId: formData.nhaCungCapId,
      nhaCungCapTen: suppliers.find((s) => s.id === formData.nhaCungCapId)?.name || formData.nhaCungCapTen,
      ngayMuaNhan: formData.ngayMuaNhan,
      nguyenGia: newPriceNum,
      hanBaoHanh: formData.hanBaoHanh || undefined,
      soChungTu: formData.soChungTu.trim() || undefined,
      phuKienDiKem: formData.phuKienDiKem.trim() || undefined,
      viTriLuuKho: formData.viTriLuuKho.trim() || undefined,
      ghiChu: formData.ghiChu.trim() || undefined,
      maTaiSan: asset.maTaiSan,
      trangThai: asset.trangThai,
      phienBan: (asset.phienBan || 1) + 1,
      nguoiCapNhat: 'Nguyễn Văn An (NV-0248)',
      ngayCapNhat: nowStr,
      lichSu: [
        ...(asset.lichSu || []),
        {
          id: `log-${Date.now()}`,
          assetId: asset.id,
          timestamp: nowStr,
          operatorName: 'Nguyễn Văn An (NV-0248)',
          operatorRole: 'Nhân viên QLTS',
          actionType: 'Cập nhật thông tin',
          details: `Cập nhật ${changedFields.length} trường: ${changedFields.join(', ')}`
        }
      ]
    };

    onSave(updated);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách tài sản
        </button>

        <button
          onClick={onOpenAuditLog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-blue-600" />
          Xem lịch sử thay đổi
        </button>
      </div>

      {/* Screen Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">
                Sửa thông tin tài sản
              </h2>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                Đang chỉnh sửa
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                GD_GN_08
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mã: <strong className="font-mono text-slate-800">{asset.maTaiSan}</strong> • Tên: {asset.tenTaiSan} • Phiên bản dữ liệu: v{asset.phienBan}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Người sửa cuối: <strong className="text-slate-700">{asset.nguoiCapNhat || asset.nguoiGhiNhan}</strong></div>
            <div className="text-[11px] text-slate-400">Thời điểm: {formatDateVN(asset.ngayCapNhat || asset.ngayGhiNhan)}</div>
          </div>
        </div>

        {/* Informational banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed mb-6">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            Theo <strong>BR_GN_07</strong>: Mã tài sản và Trạng thái sử dụng được giữ nguyên cố định. Chỉ các trường thông tin thay đổi mới được cập nhật và ghi vết vào nhật ký kiểm toán.
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Thông tin chung */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Thông tin chung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Mã tài sản */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mã tài sản <span className="text-slate-400 text-[11px]">(Cố định bất biến)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={asset.maTaiSan}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-600 font-mono font-bold cursor-not-allowed pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Trạng thái sử dụng */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Trạng thái hiện tại <span className="text-slate-400 text-[11px]">(Qua quy trình bàn giao/thu hồi)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={asset.trangThai}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-600 font-semibold cursor-not-allowed pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Danh mục tài sản */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Danh mục tài sản <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isITorElectronic ? '(Bắt buộc serial)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Số serial */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Số serial / Service Tag {selectedCategory?.isITorElectronic && <span className="text-red-500">*</span>}
                  </label>
                  {formData.soSerial !== asset.soSerial && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      Đã thay đổi
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.soSerial}
                  onChange={(e) => handleFieldChange('soSerial', e.target.value)}
                  placeholder="Nhập số serial từ tem thiết bị"
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono ${
                    hasAttemptedSubmit && validationResult.errors.soSerial
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.soSerial && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {validationResult.errors.soSerial}
                  </p>
                )}
              </div>

              {/* Tên tài sản */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Tên tài sản <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {formData.tenTaiSan !== asset.tenTaiSan && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        Đã thay đổi
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{formData.tenTaiSan.length}/200</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.tenTaiSan}
                  onChange={(e) => handleFieldChange('tenTaiSan', e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    hasAttemptedSubmit && validationResult.errors.tenTaiSan
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {formData.tenTaiSan !== asset.tenTaiSan && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Giá trị gốc: <span className="line-through">{asset.tenTaiSan}</span>
                  </div>
                )}
              </div>

              {/* Tình trạng ban đầu */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tình trạng thiết bị <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {(['Mới', 'Tốt', 'Đã qua sử dụng'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleFieldChange('tinhTrangBanDau', st)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        formData.tinhTrangBanDau === st
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st} {st === 'Mới' ? '(100%)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nguồn tài sản */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nguồn hình thành <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.nguonTaiSan}
                  onChange={(e) => handleFieldChange('nguonTaiSan', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="Mua mới tập trung">Mua mới tập trung</option>
                  <option value="Điều chuyển đến">Điều chuyển đến</option>
                  <option value="Tài trợ / Biếu tặng">Tài trợ / Biếu tặng</option>
                  <option value="Thu hồi tái cấp phát">Thu hồi tái cấp phát</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Nguồn gốc và giá trị */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              2. Nguồn gốc & Giá trị kế toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đơn vị cung cấp
                </label>
                <select
                  value={formData.nhaCungCapId}
                  onChange={(e) => handleFieldChange('nhaCungCapId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">-- Không có / Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ngày bàn giao / Nhập kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ngayMuaNhan}
                  onChange={(e) => handleFieldChange('ngayMuaNhan', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Nguyên giá (VND) <span className="text-red-500">*</span>
                  </label>
                  {newPriceNum !== asset.nguyenGia && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      Đã thay đổi
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.nguyenGia}
                  onChange={(e) => handleFieldChange('nguyenGia', e.target.value)}
                  placeholder="24500000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">{formatVND(newPriceNum)}</span>
                  {newPriceNum !== asset.nguyenGia && (
                    <span className={`font-semibold flex items-center gap-0.5 ${priceDiff > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      <TrendingUp className="w-3 h-3" />
                      {priceDiff > 0 ? `+${formatVND(priceDiff)}` : formatVND(priceDiff)} ({pricePercentDiff > 0 ? `+${pricePercentDiff.toFixed(2)}%` : `${pricePercentDiff.toFixed(2)}%`})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hạn bảo hành chính hãng
                </label>
                <input
                  type="date"
                  value={formData.hanBaoHanh}
                  onChange={(e) => handleFieldChange('hanBaoHanh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
                {remainingWarrantyMonths !== null && remainingWarrantyMonths > 0 && (
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                    ✓ Còn hiệu lực: {remainingWarrantyMonths} tháng
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Số hóa đơn / Hợp đồng
                </label>
                <input
                  type="text"
                  value={formData.soChungTu}
                  onChange={(e) => handleFieldChange('soChungTu', e.target.value)}
                  placeholder="HD-0012345"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin bổ sung */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              3. Thông tin bổ sung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Vị trí lưu kho / Bàn giao
                </label>
                <input
                  type="text"
                  value={formData.viTriLuuKho}
                  onChange={(e) => handleFieldChange('viTriLuuKho', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Phụ kiện đi kèm</label>
                  <span className="text-[11px] text-slate-400">{formData.phuKienDiKem.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  value={formData.phuKienDiKem}
                  onChange={(e) => handleFieldChange('phuKienDiKem', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Ghi chú nội bộ</label>
                  <span className="text-[11px] text-slate-400">{formData.ghiChu.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  value={formData.ghiChu}
                  onChange={(e) => handleFieldChange('ghiChu', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Feedback message banner if any */}
          {notificationMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
              <span>{notificationMsg}</span>
              <button 
                type="button" 
                onClick={() => setNotificationMsg(null)}
                className="text-amber-600 hover:text-amber-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {changedFields.length > 0 ? (
                <span className="font-semibold text-blue-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  {changedFields.length} trường đã thay đổi • chưa lưu vào cơ sở dữ liệu
                </span>
              ) : (
                <span className="text-slate-400">Chưa có thay đổi nào được chỉnh sửa</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
