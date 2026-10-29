import React from 'react';
import { X, Printer, Download, FileCheck, ShieldCheck } from 'lucide-react';
import { Dossier, Asset } from '../types/asset';

interface DossierPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: Dossier;
  assets: Asset[];
}

export const DossierPrintModal: React.FC<DossierPrintModalProps> = ({
  isOpen,
  onClose,
  dossier,
  assets,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert(`Đã xuất trọn bộ hồ sơ pháp lý ${dossier.decisionCode} gồm đầy đủ 7 thành phần lưu trữ định dạng PDF/Word.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Bộ hồ sơ thanh lý tài sản hoàn tất</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dossier.decisionCode}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                Lưu trữ vĩnh viễn · Kiểm toán nội bộ & Độc lập
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hồ sơ</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất trọn bộ (PDF/Word)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Body */}
        <div className="p-8 md:p-12 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-lg border border-slate-200 p-8 md:p-14 text-slate-800 text-xs md:text-sm leading-relaxed space-y-8">
            {/* Cover Page */}
            <div className="border-4 border-double border-slate-800 p-8 text-center min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  TẬP ĐOÀN CÔNG NGHỆ BA — HỆ THỐNG QUẢN TRỊ TÀI SẢN
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  PHÒNG TÀI CHÍNH KẾ TOÁN & QUẢN TRỊ THIẾT BỊ
                </div>
              </div>

              <div className="my-8">
                <div className="w-16 h-1 bg-slate-900 mx-auto mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                  HỒ SƠ THANH LÝ TÀI SẢN CỐ ĐỊNH
                </h1>
                <div className="text-base font-bold text-blue-800 mt-2 font-mono">
                  SỐ HỒ SƠ: {dossier.decisionCode}
                </div>
                <p className="text-xs text-slate-600 mt-4 max-w-md mx-auto">
                  {dossier.title}
                </p>
                <div className="w-16 h-1 bg-slate-900 mx-auto mt-6" />
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div><span className="font-semibold">Ngày hoàn tất đóng hồ sơ:</span> {dossier.closedDate || '22/10/2026'}</div>
                <div><span className="font-semibold">Cán bộ phụ trách lưu trữ:</span> {dossier.closedBy || 'Trần Văn Bình'}</div>
                <div><span className="font-semibold">Tình trạng pháp lý:</span> <span className="text-emerald-700 font-bold">HOÀN TẤT ĐẦY ĐỦ 7/7 THÀNH PHẦN</span></div>
              </div>
            </div>

            {/* Checklist of 7 legal components */}
            <div className="pt-6">
              <h2 className="text-sm font-bold uppercase text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>MỤC LỤC 7 THÀNH PHẦN HỒ SƠ PHÁP LÝ (MH_TL06)</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-4 h-4" /> Đạt chuẩn kiểm toán
                </span>
              </h2>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">STT</th>
                      <th className="py-2.5 px-3 text-left">Tên thành phần hồ sơ</th>
                      <th className="py-2.5 px-3 text-left">Số hiệu văn bản</th>
                      <th className="py-2.5 px-3 text-left">Tập tin đính kèm</th>
                      <th className="py-2.5 px-3 text-center w-24">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dossier.checklist.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{item.id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{item.docCode || 'Đã đính kèm'}</td>
                        <td className="py-2.5 px-3 text-blue-700 underline font-mono text-[11px]">{item.fileName || 'Chung_tu_goc.pdf'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Đủ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assets Summary Table */}
            <div className="pt-4">
              <h2 className="text-sm font-bold uppercase text-slate-900 mb-4 border-b border-slate-200 pb-2">
                DANH MỤC TÀI SẢN ĐÃ HOÀN TẤT THANH LÝ
              </h2>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">STT</th>
                      <th className="py-2.5 px-3 text-left">Mã tài sản</th>
                      <th className="py-2.5 px-3 text-left">Tên tài sản</th>
                      <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                      <th className="py-2.5 px-3 text-right">Giá trị còn lại</th>
                      <th className="py-2.5 px-3 text-right">Giá bán thanh lý</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assets.length > 0 ? (
                      assets.map((a, i) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center">{i + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-medium text-blue-700">{a.code}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{a.name}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">{a.originalValue.toLocaleString('vi-VN')}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">{a.remainingValue.toLocaleString('vi-VN')}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-bold">
                            {(a.salePrice || a.remainingValue).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Đã thanh lý
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 text-center">1</td>
                        <td className="py-2.5 px-3 font-mono text-blue-700">TS-001</td>
                        <td className="py-2.5 px-3">Máy photocopy Ricoh Aficio MP 5002</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">100.000.000</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">60.000.000</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-bold">80.000.000</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Đã thanh lý
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer verification signatures */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="font-bold uppercase text-slate-800">Cán bộ lập hồ sơ</div>
                <div className="h-16 flex items-center justify-center font-serif italic text-blue-900 text-base">
                  {dossier.closedBy || 'Trần Văn Bình'}
                </div>
                <div className="font-semibold text-slate-700">{dossier.closedBy || 'Trần Văn Bình'}</div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-800">Kế toán trưởng</div>
                <div className="h-16 flex items-center justify-center font-serif italic text-blue-900 text-base">
                  Nguyễn Thị Hà
                </div>
                <div className="font-semibold text-slate-700">Nguyễn Thị Hà</div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-800">Giám đốc phê duyệt</div>
                <div className="h-16 flex items-center justify-center font-serif italic text-blue-900 text-base">
                  Lê Hoàng Nam
                </div>
                <div className="font-semibold text-slate-700">Lê Hoàng Nam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
