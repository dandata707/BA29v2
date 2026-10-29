import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  Check, 
  AlertTriangle, 
  RotateCw, 
  FileText,
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Asset, QRLabelSize } from '../types/asset.ts';
import { formatDateVN } from '../utils/assetRules.ts';

interface PrintQRModalProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
  onPrintSuccess: (assetIds: string[], printType: 'printer' | 'pdf') => void;
  simulatePrinterError: boolean;
}

export const PrintQRModal: React.FC<PrintQRModalProps> = ({
  assets,
  isOpen,
  onClose,
  onPrintSuccess,
  simulatePrinterError
}) => {
  const [selectedAssetList, setSelectedAssetList] = useState<Asset[]>([]);
  const [labelSize, setLabelSize] = useState<QRLabelSize>('50x30');
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [zoomAsset, setZoomAsset] = useState<Asset | null>(null);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<{
    show: boolean;
    fileName: string;
    fileSize: string;
  } | null>(null);
  const [isRetryingPrinter, setIsRetryingPrinter] = useState(false);

  // Sync assets when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAssetList([...assets]);
    }
  }, [isOpen, assets]);

  // Generate real QR code data URLs
  useEffect(() => {
    if (!isOpen || selectedAssetList.length === 0) return;

    selectedAssetList.forEach(async (asset) => {
      try {
        const qrContent = `https://qlts.corp/qr/${asset.maTaiSan}`;
        const url = await QRCode.toDataURL(qrContent, {
          width: 180,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setQrCodeUrls((prev) => ({ ...prev, [asset.id]: url }));
      } catch (err) {
        console.error('Error generating QR:', err);
      }
    });
  }, [isOpen, selectedAssetList]);

  if (!isOpen) return null;

  const handleRemoveAsset = (idToRemove: string) => {
    setSelectedAssetList((prev) => prev.filter((a) => a.id !== idToRemove));
  };

  const handleExportPDF = () => {
    const today = new Date();
    const dateStamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const fileName = `tem-qr-${dateStamp}.pdf`;
    
    setPdfSuccessToast({
      show: true,
      fileName,
      fileSize: `${120 + selectedAssetList.length * 11} KB`
    });

    onPrintSuccess(selectedAssetList.map((a) => a.id), 'pdf');
  };

  const handlePrint = () => {
    if (simulatePrinterError) {
      setIsRetryingPrinter(true);
      setTimeout(() => {
        setIsRetryingPrinter(false);
      }, 1000);
      return;
    }

    onPrintSuccess(selectedAssetList.map((a) => a.id), 'printer');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  In tem nhận diện QR tài sản
                </h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  GD_GN_13
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tạo và xem trước tem nhãn chuẩn công nghiệp ISO/IEC 18004
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ In QR"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Settings and Selected Assets (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            {/* 1. Selected Asset List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tài sản chuẩn bị in ({selectedAssetList.length})
                </label>
                <span className="text-[11px] text-slate-500">Tối đa 100 tem/lượt</span>
              </div>

              {selectedAssetList.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Chưa có tài sản nào được chọn
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedAssetList.map((asset) => (
                    <div 
                      key={asset.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs transition-colors"
                    >
                      <div className="truncate mr-2">
                        <div className="font-mono font-bold text-blue-600 text-[11px]">
                          {asset.maTaiSan}
                        </div>
                        <div className="font-medium text-slate-800 truncate text-[11px]">
                          {asset.tenTaiSan}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Chuẩn in
                        </span>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          title="Bỏ tài sản này khỏi lượt in"
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Choose Label Standard Size */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Khổ tem chuẩn <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2.5">
                {/* 50x30 mm */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  labelSize === '50x30' 
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="labelSize"
                    value="50x30"
                    checked={labelSize === '50x30'}
                    onChange={() => setLabelSize('50x30')}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">50 × 30 mm</span>
                      <span className="text-[10px] font-semibold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        Khuyên dùng
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Phù hợp dán Laptop, màn hình, máy in, linh kiện và thiết bị cầm tay.
                    </div>
                  </div>
                </label>

                {/* 70x40 mm */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  labelSize === '70x40' 
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="labelSize"
                    value="70x40"
                    checked={labelSize === '70x40'}
                    onChange={() => setLabelSize('70x40')}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-xs">70 × 40 mm</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Khổ nhãn lớn cho bàn ghế, tủ kệ, thiết bị công nghiệp cỡ trung bình.
                    </div>
                  </div>
                </label>

                {/* A4 Decal 24 */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  labelSize === 'A4_24' 
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="labelSize"
                    value="A4_24"
                    checked={labelSize === 'A4_24'}
                    onChange={() => setLabelSize('A4_24')}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-xs">A4 (Decal bế sẵn)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      In bằng máy in văn phòng laser tiêu chuẩn (24 tem/trang A4).
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* QR Metadata Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Thông tin mã hóa định danh:
              </div>
              <div className="font-mono text-[10px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
                URL: https://qlts.corp/qr/{'{ma_ts}'}
              </div>
              <p className="text-[10px] text-slate-400">
                Định dạng tem Code-128 / QR v3. Cảnh báo bảo mật: Mã QR không chứa dữ liệu cá nhân nhạy cảm.
              </p>
            </div>
          </div>

          {/* Right Column: Live Label Preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-slate-100/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Vùng xem trước tem in
                </span>
                <span className="text-[10px] bg-slate-200 font-mono text-slate-700 px-1.5 py-0.5 rounded">
                  Tỷ lệ 100%
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Kích thước: {labelSize === '50x30' ? '50 × 30 mm' : labelSize === '70x40' ? '70 × 40 mm' : 'A4 (24 tem)'} (300 DPI)
              </span>
            </div>

            {/* Labels Canvas Preview Container */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-2">
              {selectedAssetList.map((asset) => {
                const qrUrl = qrCodeUrls[asset.id];
                return (
                  <div
                    key={asset.id}
                    className="relative bg-white rounded-xl shadow-md border-2 border-slate-300 p-4 transition-all hover:border-blue-400 group"
                    style={{
                      minHeight: labelSize === '50x30' ? '150px' : labelSize === '70x40' ? '190px' : '160px'
                    }}
                  >
                    {/* Zoom button on hover */}
                    <button
                      onClick={() => setZoomAsset(asset)}
                      title="Phóng to bản xem trước"
                      className="absolute top-2 right-2 p-1.5 bg-slate-100/90 text-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Industrial Label Layout */}
                    <div className="flex items-stretch gap-4 h-full">
                      {/* Left: QR Code */}
                      <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shrink-0 w-28">
                        {qrUrl ? (
                          <img src={qrUrl} alt={`QR Code ${asset.maTaiSan}`} className="w-24 h-24 object-contain" />
                        ) : (
                          <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                            Đang tạo QR...
                          </div>
                        )}
                        <span className="text-[9px] font-mono text-slate-400 mt-1">ISO/IEC 18004</span>
                      </div>

                      {/* Right: Asset metadata and Barcode */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          {/* Label Header */}
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
                            <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                              QLTS ENTERPRISE
                            </span>
                            <span className="text-[9px] font-medium text-slate-500">
                              {asset.categoryName}
                            </span>
                          </div>

                          {/* Asset Code */}
                          <div className="font-mono font-extrabold text-sm text-slate-900 tracking-tight">
                            {asset.maTaiSan}
                          </div>

                          {/* Asset Name */}
                          <div className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                            {asset.tenTaiSan}
                          </div>

                          {/* Serial & Date */}
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 mt-1">
                            <div>
                              <span className="text-slate-400">S/N: </span>
                              <span className="font-mono">{asset.soSerial || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Ngày: </span>
                              <span>{formatDateVN(asset.ngayMuaNhan)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Simulated Code-128 Barcode */}
                        <div className="mt-2 pt-1 border-t border-dashed border-slate-200">
                          <div className="h-4 flex items-end justify-between px-1 opacity-70">
                            {[1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2].map((height, i) => (
                              <div
                                key={i}
                                className="bg-slate-900"
                                style={{
                                  width: i % 2 === 0 ? '2px' : '1px',
                                  height: `${height * 3.5}px`
                                }}
                              />
                            ))}
                          </div>
                          <div className="text-center font-mono text-[8px] text-slate-500 tracking-widest">
                            *{asset.maTaiSan}*
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Printer Error Warning Banner */}
        {simulatePrinterError && (
          <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>Máy in Zebra ZD421: Mất kết nối / Hết giấy.</strong> Vui lòng kiểm tra cáp USB/mạng hoặc bổ sung cuộn decal nhiệt.
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              className="text-xs text-blue-600 font-semibold underline hover:text-blue-800 ml-3 shrink-0 cursor-pointer"
            >
              Chuyển sang Xuất PDF (A3)
            </button>
          </div>
        )}

        {/* Modal Bottom Actions Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Printer status text */}
          <div className="flex items-center gap-2 text-xs">
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Máy in mặc định:</span>
            <span className="font-medium text-slate-800">Zebra ZD421 (Thermal Transfer)</span>
            {simulatePrinterError ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-100/70 px-2 py-0.5 rounded font-semibold">
                ● Lỗi kết nối
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold">
                ● Sẵn sàng
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
            >
              Hủy
            </button>

            {/* Xuất PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-blue-700 text-xs font-semibold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất PDF</span>
            </button>

            {/* In tem / Thử in lại Button */}
            {simulatePrinterError ? (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all cursor-pointer shadow-md shadow-amber-600/20"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRetryingPrinter ? 'animate-spin' : ''}`} />
                <span>Thử in lại</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                disabled={selectedAssetList.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In {selectedAssetList.length} tem</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal Preview */}
      {zoomAsset && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setZoomAsset(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-blue-600" />
              Phóng to bản xem trước tem: {zoomAsset.maTaiSan}
            </h4>

            {qrCodeUrls[zoomAsset.id] && (
              <div className="p-6 bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col items-center">
                <img src={qrCodeUrls[zoomAsset.id]} alt="Zoom QR" className="w-48 h-48 object-contain mb-3" />
                <div className="font-mono text-base font-bold text-slate-900">
                  {zoomAsset.maTaiSan}
                </div>
                <div className="text-sm font-semibold text-slate-800 text-center mt-1">
                  {zoomAsset.tenTaiSan}
                </div>
                <div className="text-xs text-slate-500 mt-2 font-mono">
                  S/N: {zoomAsset.soSerial || 'N/A'} | Khổ: {labelSize}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Export Success Toast */}
      {pdfSuccessToast?.show && (
        <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Xuất PDF hoàn tất
                </span>
                <button
                  onClick={() => setPdfSuccessToast(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-xs text-white mt-1 font-medium">
                {pdfSuccessToast.fileName}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Dung lượng: {pdfSuccessToast.fileSize} • Đã kết xuất {selectedAssetList.length} tem QR
              </div>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => alert(`Mở xem tệp ${pdfSuccessToast.fileName}`)}
                  className="text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở tệp
                </button>
                <button
                  onClick={() => alert(`Đã lưu tệp vào thư mục Downloads`)}
                  className="text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  Hiển thị trong thư mục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
