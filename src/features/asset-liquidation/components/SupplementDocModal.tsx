import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

interface SupplementDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossierCode: string;
  item: {
    id: number;
    name: string;
    docCode?: string;
    fileName?: string;
    date?: string;
  } | null;
  onSave: (data: { docCode: string; fileName: string; date: string; note?: string }) => void;
}

export const SupplementDocModal: React.FC<SupplementDocModalProps> = ({
  isOpen,
  onClose,
  dossierCode,
  item,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const defaultDocCode =
    item.docCode ||
    (item.id === 6
      ? `HĐMB-${dossierCode.replace('QĐ-', '')}`
      : item.id === 7
      ? `BBBG-${dossierCode.replace('QĐ-', '')}`
      : `TL-${dossierCode.replace('QĐ-', '')}`);

  const defaultFileName =
    item.fileName ||
    (item.id === 6
      ? `HopDongMuaBan-${dossierCode.replace('QĐ-', '')}.pdf`
      : item.id === 7
      ? `BienBanBanGiao-${dossierCode.replace('QĐ-', '')}.pdf`
      : `TaiLieu-${item.id}.pdf`);

  const [docCode, setDocCode] = useState(defaultDocCode);
  const [docDate, setDocDate] = useState('22/10/2026');
  const [fileName, setFileName] = useState(defaultFileName);
  const [fileSize, setFileSize] = useState('1.9 MB');
  const [note, setNote] = useState('');
  const [isUploaded, setIsUploaded] = useState(true);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setIsUploaded(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docCode.trim()) {
      alert('Vui lòng nhập số hiệu tài liệu!');
      return;
    }
    onSave({
      docCode,
      fileName,
      date: docDate,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {item.id}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Bổ sung tài liệu vào hồ sơ
              </h3>
              <p className="text-xs text-blue-700 font-semibold mt-0.5">
                {item.name} · {dossierCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Số hiệu / Mã văn bản *
              </label>
              <input
                type="text"
                value={docCode}
                onChange={(e) => setDocCode(e.target.value)}
                placeholder="VD: HĐMB-2026-015"
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ngày ký / ban hành *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Tệp tài liệu đính kèm (PDF / Bản scan có dấu ký) *
            </label>

            <label className="block border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/30">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleSimulateFileSelect}
              />
              <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="font-semibold text-slate-700">
                Nhấn để chọn tệp hoặc kéo thả vào đây
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Định dạng hỗ trợ: PDF, DOCX, Ảnh chụp công chứng (tối đa 15MB)
              </div>
            </label>

            {isUploaded && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900 truncate">{fileName}</span>
                  <span className="text-emerald-600 text-[11px] shrink-0 font-mono">({fileSize})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Đã đính kèm
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Ghi chú bổ sung (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đã bổ sung bản scan có đầy đủ chữ ký của hai bên..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-[11px] text-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Sau khi bổ sung, mục này trong checklist sẽ chuyển sang trạng thái <strong>&quot;Đủ&quot;</strong>. Khi hoàn tất đủ các thành phần, nút <strong>Đóng và lưu hồ sơ</strong> sẽ được mở khóa.
            </span>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu và bổ sung vào hồ sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
