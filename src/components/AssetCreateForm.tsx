import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Save, 
  PlusCircle, 
  AlertCircle, 
  Info, 
  Check, 
  Calendar, 
  Building, 
  Layers, 
  FileText,
  Clock,
  User,
  FileSpreadsheet,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Asset, AssetCategory, Supplier, AssetFormData } from '../types/asset.ts';
import { 
  validateAssetForm, 
  generateAssetCode, 
  formatVND, 
  parseNumber,
  formatDateVN
} from '../utils/assetRules.ts';
import { CancelConfirmModal } from './CancelConfirmModal.tsx';
import { ExcelImportModal } from './ExcelImportModal.tsx';

interface AssetCreateFormProps {
  categories: AssetCategory[];
  suppliers: Supplier[];
  existingAssets: Asset[];
  onBack: () => void;
  onSaveSuccess: (newAsset: Asset, shouldAddAnother?: boolean) => void;
}

export const AssetCreateForm: React.FC<AssetCreateFormProps> = ({
  categories,
  suppliers,
  existingAssets,
  onBack,
  onSaveSuccess
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const getInitialFormData = (): AssetFormData => ({
    categoryId: categories.length > 0 ? categories[0].id : '',
    tenTaiSan: '',
    soSerial: '',
    tinhTrangBanDau: 'Mới',
    nguonTaiSan: 'Mua mới tập trung',
    nhaCungCapId: '',
    nhaCungCapTen: '',
    ngayMuaNhan: todayStr,
    nguyenGia: '',
    hanBaoHanh: '',
    soChungTu: '',
    phuKienDiKem: '',
    viTriLuuKho: 'Kho Tổng A – Tầng 2 (Kệ 04)',
    ghiChu: ''
  });

  const [formData, setFormData] = useState<AssetFormData>(getInitialFormData);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'manual' | 'excel'>('manual');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [importedFrom, setImportedFrom] = useState<{ fileName: string; timestamp: string } | null>(null);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  const handleApplyExcelData = (data: AssetFormData, sourceFileName?: string) => {
    setFormData(data);
    setHasAttemptedSubmit(false);
    setInputMode('excel');
    setImportedFrom({
      fileName: sourceFileName || 'Dữ liệu Excel',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });
    setSuccessToast(`Đã tự động điền thông tin từ file Excel (${sourceFileName || 'Dữ liệu mẫu'}).`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleResetToClean = () => {
    setFormData(getInitialFormData());
    setImportedFrom(null);
    setInputMode('manual');
    setHasAttemptedSubmit(false);
  };

  const previewCode = useMemo(() => {
    const catCode = selectedCategory?.code || 'GEN';
    const year = new Date().getFullYear();
    const nextIndex = existingAssets.filter((a) => a.categoryId === formData.categoryId).length + 1;
    return generateAssetCode(catCode, year, nextIndex);
  }, [selectedCategory, existingAssets, formData.categoryId]);

  const validationResult = useMemo(() => {
    return validateAssetForm(formData, selectedCategory, existingAssets);
  }, [formData, selectedCategory, existingAssets]);

  const isFormDirty = useMemo(() => {
    return (
      formData.tenTaiSan.trim() !== '' ||
      formData.soSerial.trim() !== '' ||
      formData.nguyenGia.trim() !== '' ||
      formData.soChungTu.trim() !== '' ||
      formData.phuKienDiKem.trim() !== '' ||
      formData.ghiChu.trim() !== ''
    );
  }, [formData]);

  const filledSectionsCount = useMemo(() => {
    let count = 0;
    if (formData.categoryId && formData.tenTaiSan) count++;
    if (formData.nguonTaiSan && formData.ngayMuaNhan && formData.nguyenGia) count++;
    if (formData.viTriLuuKho || formData.phuKienDiKem || formData.ghiChu) count++;
    return Math.max(1, count);
  }, [formData]);

  const handleFieldChange = (field: keyof AssetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    handleFieldChange('nguyenGia', rawVal);
  };

  const executeSave = (shouldAddAnother: boolean) => {
    setHasAttemptedSubmit(true);

    if (!validationResult.isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nowStr = new Date().toISOString();
    const numPrice = parseNumber(formData.nguyenGia);
    const chosenSupplier = suppliers.find((s) => s.id === formData.nhaCungCapId);

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      maTaiSan: previewCode,
      tenTaiSan: formData.tenTaiSan.trim(),
      categoryId: formData.categoryId,
      categoryName: selectedCategory?.name || 'Chung',
      isITorElectronic: selectedCategory?.isITorElectronic || false,
      soSerial: formData.soSerial.trim(),
      tinhTrangBanDau: formData.tinhTrangBanDau,
      nguonTaiSan: formData.nguonTaiSan,
      nhaCungCapId: formData.nhaCungCapId || undefined,
      nhaCungCapTen: chosenSupplier?.name || undefined,
      ngayMuaNhan: formData.ngayMuaNhan,
      nguyenGia: numPrice,
      hanBaoHanh: formData.hanBaoHanh || undefined,
      soChungTu: formData.soChungTu.trim() || undefined,
      phuKienDiKem: formData.phuKienDiKem.trim() || undefined,
      viTriLuuKho: formData.viTriLuuKho.trim() || 'Kho Tổng A – Tầng 2 (Kệ 04)',
      donViQuanLy: 'Phòng Hành chính - Quản trị Tòa nhà',
      ghiChu: formData.ghiChu.trim() || undefined,
      trangThai: 'Chưa cấp phát',
      isDeleted: false,
      nguoiGhiNhan: 'Nguyễn Văn An (NV-0248)',
      ngayGhiNhan: nowStr,
      phienBan: 1,
      soLanInQR: 0,
      hasTransactionHistory: false,
      lichSu: [
        {
          id: `log-${Date.now()}`,
          assetId: `asset-${Date.now()}`,
          timestamp: nowStr,
          operatorName: 'Nguyễn Văn An (NV-0248)',
          operatorRole: 'Nhân viên QLTS',
          actionType: 'Tạo mới',
          details: `Ghi nhận tài sản mới: ${formData.tenTaiSan.trim()} (${previewCode})`
        }
      ]
    };

    if (shouldAddAnother) {
      onSaveSuccess(newAsset, true);
      setFormData(getInitialFormData());
      setHasAttemptedSubmit(false);
      setSuccessToast(`Đã lưu thành công tài sản ${newAsset.maTaiSan}. Biểu mẫu đã sẵn sàng cho lượt tiếp theo.`);
      setTimeout(() => setSuccessToast(null), 4000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSaveSuccess(newAsset, false);
    }
  };

  const handleCancelClick = () => {
    if (isFormDirty) {
      setShowCancelModal(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancelClick}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách tài sản
        </button>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          Biểu mẫu: GD_GN_04
        </span>
      </div>

      {/* Screen Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="pb-4 mb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Thêm mới tài sản
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ghi nhận thông tin tài sản sau khi đối chiếu thực tế với hóa đơn tài chính hoặc phiếu giao hàng bàn giao.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nhập dữ liệu từ Excel</span>
            </button>
          </div>
        </div>

        {/* 2 Options Switcher */}
        <div className="mb-5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'manual'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Nhập thủ công</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('excel');
                setShowExcelModal(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'excel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>2. Nhập từ file Excel / Mẫu</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold ml-0.5">
                Nhanh
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 px-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Có thể tải file Excel lên hoặc chọn từ hóa đơn mẫu để tự động điền</span>
          </div>
        </div>

        {/* Excel Imported Banner */}
        {importedFrom && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">
                  Đã tự động điền dữ liệu từ file Excel: <span className="font-mono text-emerald-800">{importedFrom.fileName}</span>
                </div>
                <div className="text-[11px] text-emerald-700/80">
                  Nạp lúc {importedFrom.timestamp} • Toàn bộ các trường đã được điền sẵn.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExcelModal(true)}
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Đổi dòng / File khác
              </button>
              <button
                type="button"
                onClick={handleResetToClean}
                className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại trắng</span>
              </button>
            </div>
          </div>
        )}

        {/* Notice */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed mb-6">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Thông báo hệ thống:</strong> Mã tài sản do hệ thống tự sinh sau khi lưu hồ sơ theo định dạng quy chuẩn <code>[DM]-[YYYY]-[INDEX]</code> và trạng thái ban đầu của tài sản luôn là <strong>&ldquo;Chưa cấp phát&rdquo;</strong> (BR_GN_01 & BR_GN_05).
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 font-bold p-1">
              ✕
            </button>
          </div>
        )}

        {/* ERROR SUMMARY BANNER */}
        {hasAttemptedSubmit && !validationResult.isValid && (
          <div 
            id="validation-error-summary"
            role="alert"
            className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-900 shadow-sm animate-in shake duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-red-900 text-sm">
                    Không thể lưu hồ sơ tài sản
                  </h4>
                  <span className="font-mono text-[11px] font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded">
                    Mã lỗi: VAL_ERR_REQ
                  </span>
                </div>
                <p className="mt-1 text-red-700 leading-relaxed">
                  Thiếu thông tin bắt buộc hoặc một số trường chưa hợp lệ. Vui lòng kiểm tra <strong>{validationResult.errorCount} lỗi</strong> được đánh dấu viền đỏ bên dưới:
                </p>
                <div className="flex items-center gap-4 mt-2 font-medium text-red-800">
                  {validationResult.errorsByCategory.generalInfo > 0 && (
                    <span className="bg-red-100/80 px-2 py-0.5 rounded">
                      Nhóm Thông tin chung: {validationResult.errorsByCategory.generalInfo} mục chưa hoàn tất
                    </span>
                  )}
                  {validationResult.errorsByCategory.originAndValue > 0 && (
                    <span className="bg-red-100/80 px-2 py-0.5 rounded">
                      Nhóm Nguồn gốc & Giá trị: {validationResult.errorsByCategory.originAndValue} mục chưa hoàn tất
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={(e) => { e.preventDefault(); executeSave(false); }} className="space-y-6">
          {/* GROUP 1: Thông tin chung */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                1. Thông tin chung
              </h3>
              {hasAttemptedSubmit && validationResult.errorsByCategory.generalInfo > 0 && (
                <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  {validationResult.errorsByCategory.generalInfo} mục chưa hoàn tất
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Mã tài sản */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mã tài sản <span className="text-slate-400 text-[11px]">(Hệ thống tự cấp phát sau khi lưu)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={previewCode}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono font-bold cursor-not-allowed pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Quy cách mã: <code>[DM]-[YYYY]-[INDEX]</code>. Ví dụ: {previewCode}
                </span>
              </div>

              {/* Trạng thái ban đầu */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Trạng thái cấp phát ban đầu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="Chưa cấp phát"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-blue-700 font-bold cursor-not-allowed pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Trạng thái sẽ chuyển sang &ldquo;Đang sử dụng&rdquo; khi tạo phiếu bàn giao thiết bị.
                </span>
              </div>

              {/* Danh mục tài sản */}
              <div>
                <label htmlFor="form-category" className="font-semibold text-slate-700 block mb-1">
                  Danh mục tài sản <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-category"
                  value={formData.categoryId}
                  onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-white ${
                    hasAttemptedSubmit && validationResult.errors.categoryId
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="">-- Chọn danh mục tài sản --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isITorElectronic ? '(Nhóm IT & Điện tử: Bắt buộc serial)' : ''}
                    </option>
                  ))}
                </select>
                {hasAttemptedSubmit && validationResult.errors.categoryId && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.categoryId}
                  </p>
                )}
              </div>

              {/* Tên tài sản */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="form-asset-name" className="font-semibold text-slate-700">
                    Tên tài sản <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[11px] ${formData.tenTaiSan.length > 200 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                    {formData.tenTaiSan.length}/200
                  </span>
                </div>
                <input
                  id="form-asset-name"
                  type="text"
                  value={formData.tenTaiSan}
                  onChange={(e) => handleFieldChange('tenTaiSan', e.target.value)}
                  placeholder="Ví dụ: Laptop Dell Latitude 5440 i7-1355U / 16GB"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    hasAttemptedSubmit && validationResult.errors.tenTaiSan
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.tenTaiSan && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.tenTaiSan}
                  </p>
                )}
              </div>

              {/* Số serial */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="form-serial" className="font-semibold text-slate-700">
                    Số serial / Số máy {selectedCategory?.isITorElectronic && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {selectedCategory?.isITorElectronic ? 'Bắt buộc đối với nhóm IT' : 'Tùy chọn'}
                  </span>
                </div>
                <input
                  id="form-serial"
                  type="text"
                  value={formData.soSerial}
                  onChange={(e) => handleFieldChange('soSerial', e.target.value)}
                  placeholder="Nhập số serial từ tem sản phẩm (ví dụ: SN-DL5440-88213)"
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono ${
                    hasAttemptedSubmit && validationResult.errors.soSerial
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.soSerial && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.soSerial}
                  </p>
                )}
              </div>

              {/* Tình trạng ban đầu */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tình trạng ban đầu <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {(['Mới', 'Tốt', 'Đã qua sử dụng'] as const).map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => handleFieldChange('tinhTrangBanDau', condition)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        formData.tinhTrangBanDau === condition
                          ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/50'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GROUP 2: Nguồn gốc và giá trị */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                2. Nguồn gốc & Giá trị kế toán
              </h3>
              {hasAttemptedSubmit && validationResult.errorsByCategory.originAndValue > 0 && (
                <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  {validationResult.errorsByCategory.originAndValue} mục chưa hoàn tất
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Nguồn tài sản */}
              <div>
                <label htmlFor="form-origin" className="font-semibold text-slate-700 block mb-1">
                  Nguồn tài sản <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-origin"
                  value={formData.nguonTaiSan}
                  onChange={(e) => handleFieldChange('nguonTaiSan', e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-white ${
                    hasAttemptedSubmit && validationResult.errors.nguonTaiSan
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="Mua mới tập trung">Mua mới tập trung</option>
                  <option value="Điều chuyển đến">Điều chuyển đến</option>
                  <option value="Tài trợ / Biếu tặng">Tài trợ / Biếu tặng</option>
                  <option value="Thu hồi tái cấp phát">Thu hồi tái cấp phát</option>
                </select>
              </div>

              {/* Nhà cung cấp */}
              <div>
                <label htmlFor="form-supplier" className="font-semibold text-slate-700 block mb-1">
                  Nhà cung cấp / Đối tác giao dịch
                </label>
                <select
                  id="form-supplier"
                  value={formData.nhaCungCapId}
                  onChange={(e) => handleFieldChange('nhaCungCapId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">-- Chọn hoặc để trống nếu chưa xác định --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (MST: {s.taxCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày mua/nhận */}
              <div>
                <label htmlFor="form-buy-date" className="font-semibold text-slate-700 block mb-1">
                  Ngày mua/nhận <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-buy-date"
                  type="date"
                  max={todayStr}
                  value={formData.ngayMuaNhan}
                  onChange={(e) => handleFieldChange('ngayMuaNhan', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-white ${
                    hasAttemptedSubmit && validationResult.errors.ngayMuaNhan
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.ngayMuaNhan && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.ngayMuaNhan}
                  </p>
                )}
              </div>

              {/* Nguyên giá */}
              <div>
                <label htmlFor="form-price" className="font-semibold text-slate-700 block mb-1">
                  Nguyên giá (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-price"
                  type="text"
                  value={formData.nguyenGia}
                  onChange={handlePriceInput}
                  placeholder="Ví dụ: 24500000 hoặc 0"
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono ${
                    hasAttemptedSubmit && validationResult.errors.nguyenGia
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.nguyenGia ? (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.nguyenGia}
                  </p>
                ) : (
                  formData.nguyenGia !== '' && (
                    <span className="text-[11px] font-semibold text-slate-700 mt-1 block">
                      Định dạng hiển thị: <strong>{formatVND(formData.nguyenGia)}</strong>
                    </span>
                  )
                )}
              </div>

              {/* Hạn bảo hành */}
              <div>
                <label htmlFor="form-warranty" className="font-semibold text-slate-700 block mb-1">
                  Hạn bảo hành
                </label>
                <input
                  id="form-warranty"
                  type="date"
                  min={formData.ngayMuaNhan}
                  value={formData.hanBaoHanh}
                  onChange={(e) => handleFieldChange('hanBaoHanh', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-white ${
                    hasAttemptedSubmit && validationResult.errors.hanBaoHanh
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {hasAttemptedSubmit && validationResult.errors.hanBaoHanh && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <span>✕</span> {validationResult.errors.hanBaoHanh}
                  </p>
                )}
              </div>

              {/* Số chứng từ */}
              <div>
                <label htmlFor="form-invoice" className="font-semibold text-slate-700 block mb-1">
                  Số chứng từ / Số hóa đơn GTGT
                </label>
                <input
                  id="form-invoice"
                  type="text"
                  value={formData.soChungTu}
                  onChange={(e) => handleFieldChange('soChungTu', e.target.value)}
                  placeholder="Ví dụ: HD-2024-00918 hoặc BBGN/05"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* GROUP 3: Thông tin bổ sung */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                3. Thông tin bổ sung (Tùy chọn)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor="form-storage-loc" className="font-semibold text-slate-700 block mb-1">
                  Vị trí lưu kho ban đầu
                </label>
                <input
                  id="form-storage-loc"
                  type="text"
                  value={formData.viTriLuuKho}
                  onChange={(e) => handleFieldChange('viTriLuuKho', e.target.value)}
                  placeholder="Ví dụ: Kho Tổng A – Tầng 2 (Kệ 04)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đơn vị quản lý trực tiếp
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="Phòng Hành chính - Quản trị Tòa nhà"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="form-accessories" className="font-semibold text-slate-700">
                    Phụ kiện đi kèm
                  </label>
                  <span className={`text-[11px] ${formData.phuKienDiKem.length > 500 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                    {formData.phuKienDiKem.length}/500
                  </span>
                </div>
                <textarea
                  id="form-accessories"
                  rows={2}
                  value={formData.phuKienDiKem}
                  onChange={(e) => handleFieldChange('phuKienDiKem', e.target.value)}
                  placeholder="Ví dụ: Sạc 65W Type-C, Túi chống sốc, Chuột không dây"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="form-notes" className="font-semibold text-slate-700">
                    Ghi chú bổ sung
                  </label>
                  <span className={`text-[11px] ${formData.ghiChu.length > 500 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                    {formData.ghiChu.length}/500
                  </span>
                </div>
                <textarea
                  id="form-notes"
                  rows={2}
                  value={formData.ghiChu}
                  onChange={(e) => handleFieldChange('ghiChu', e.target.value)}
                  placeholder="Ghi chú về bảo quản, tình trạng thẩm định hoặc hướng dẫn cấp phát..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Metadata Footer Box */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Người ghi nhận: <strong>Nguyễn Văn An (NV-0248)</strong>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Thời gian khởi tạo: {formatDateVN(new Date().toISOString())} (Tự động)
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Các trường có dấu (<span className="text-red-500 font-bold">*</span>) là thông tin bắt buộc
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={() => executeSave(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-600 bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lưu & Thêm tài sản khác</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu tài sản</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <CancelConfirmModal
        isOpen={showCancelModal}
        onStay={() => setShowCancelModal(false)}
        onConfirmCancel={() => {
          setShowCancelModal(false);
          onBack();
        }}
        categoryName={selectedCategory?.name}
        tempAssetCode={previewCode}
        filledCount={filledSectionsCount}
      />

      {/* Excel Autofill Modal */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        categories={categories}
        suppliers={suppliers}
        onApplyFormData={handleApplyExcelData}
      />
    </div>
  );
};
