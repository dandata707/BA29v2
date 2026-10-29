import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import { AssetCategory, AssetFormData, Supplier } from '../types/asset.ts';
import { 
  parseExcelFile, 
  downloadExcelTemplate, 
  SAMPLE_EXCEL_DATA, 
  mapExcelRowToFormData 
} from '../utils/excelHelper.ts';
import { formatVND, formatDateVN } from '../utils/assetRules.ts';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AssetCategory[];
  suppliers: Supplier[];
  onApplyFormData: (data: AssetFormData, sourceFileName?: string) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  categories,
  suppliers,
  onApplyFormData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<AssetFormData[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer, categories, suppliers);
        if (result.success && result.rows.length > 0) {
          setParsedRows(result.rows);
          setSelectedRowIndex(0);
        } else {
          setErrorMessage(result.errorMessage || 'Không tìm thấy dữ liệu hợp lệ trong file.');
          setParsedRows([]);
        }
      } catch (err: any) {
        setErrorMessage(`Lỗi xử lý file Excel: ${err.message || 'Định dạng không hỗ trợ'}`);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Không thể đọc file. Vui lòng thử lại.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCurrentRow = () => {
    if (parsedRows.length > 0 && parsedRows[selectedRowIndex]) {
      onApplyFormData(parsedRows[selectedRowIndex], fileName);
      onClose();
    }
  };

  const handleApplyPresetSample = (sampleIndex: number) => {
    const rawSample = SAMPLE_EXCEL_DATA[sampleIndex];
    if (rawSample) {
      const mapped = mapExcelRowToFormData(rawSample, categories, suppliers);
      onApplyFormData(mapped, `File_Mau_QLTS_${rawSample.categoryCodeOrName}.xlsx`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Nhập dữ liệu tự động từ file Excel
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  .xlsx / .xls / .csv
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tải lên file Excel để tự động điền toàn bộ các trường thông tin trong trang Thêm mới tài sản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50/60' 
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600 mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <div className="text-sm font-bold text-slate-800 mb-1">
              Kéo thả file Excel vào đây hoặc click để duyệt file
            </div>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Hệ thống tự động nhận diện các cột: Tên tài sản, Danh mục, Số serial, Nguyên giá, Ngày mua, Nhà cung cấp, Hạn bảo hành, Số hóa đơn...
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn file từ máy tính</span>
              </button>

              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tải file mẫu Excel chuẩn (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2. Parsed Rows Table (if a file has been uploaded) */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã đọc được {parsedRows.length} dòng dữ liệu từ file: <span className="font-mono text-emerald-700">{fileName}</span>
                </span>
                <span className="text-slate-500">
                  Chọn dòng cần điền vào biểu mẫu:
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">STT</th>
                      <th className="py-2.5 px-3">Tên tài sản</th>
                      <th className="py-2.5 px-3">Số Serial</th>
                      <th className="py-2.5 px-3">Nguyên giá</th>
                      <th className="py-2.5 px-3">Ngày nhận</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => {
                      const isSelected = selectedRowIndex === idx;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedRowIndex(idx)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 text-slate-900 max-w-xs truncate">
                            {row.tenTaiSan || '(Chưa có tên)'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {row.soSerial || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-800">
                            {formatVND(row.nguyenGia)}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {formatDateVN(row.ngayMuaNhan)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRowIndex(idx);
                                onApplyFormData(row, fileName);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              Điền dòng này
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Quick Sample Presets */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Hoặc chọn nhanh dữ liệu mẫu từ hóa đơn thực tế:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_EXCEL_DATA.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPresetSample(idx)}
                  className="p-3 text-left rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group cursor-pointer bg-white shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 truncate mr-2">
                      {sample.tenTaiSan}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0 font-bold">
                      {formatVND(sample.nguyenGia)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">S/N: {sample.soSerial || 'Không có serial'}</span>
                    <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Nạp dữ liệu <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Dữ liệu sau khi nạp sẽ được điền vào toàn bộ form để bạn kiểm tra trước khi bấm Lưu.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleApplyCurrentRow}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Điền dòng {selectedRowIndex + 1} vào form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
