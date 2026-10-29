import React, { useEffect } from 'react';
import { X, Download, Printer, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  docType: 'DE_NGHI' | 'BIEN_BAN' | 'TO_TRINH' | 'QUYET_DINH' | 'HOP_DONG' | 'BAN_GIAO' | 'CUSTOM';
  docCode: string;
  metadata?: {
    date?: string;
    department?: string;
    creator?: string;
    signer?: string;
    totalAmount?: number;
    items?: Array<{ name: string; code: string; originalPrice: number; remainingPrice: number }>;
  };
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  docType,
  docCode,
  metadata = {},
}) => {
  const { logDocumentView, currentUser } = useAssetContext();

  useEffect(() => {
    if (isOpen) {
      logDocumentView(docTitle, docCode);
    }
  }, [isOpen, docCode, docTitle]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Đã tải xuống thành công tài liệu: ${docCode} (${docTitle})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{docTitle}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {docCode}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Người xem: {currentUser.name} ({currentUser.roleTitle})</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã ghi nhận Audit Log
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="In tài liệu"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Body */}
        <div className="p-8 md:p-12 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-md border border-slate-200 p-8 md:p-12 text-slate-800 text-sm leading-relaxed min-h-[700px] flex flex-col justify-between">
            <div>
              {/* Official Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                <div className="text-center font-bold text-xs uppercase tracking-wide">
                  <div>TẬP ĐOÀN CÔNG NGHỆ BA</div>
                  <div className="font-semibold text-slate-600">{metadata.department || 'PHÒNG QUẢN TRỊ TÀI SẢN'}</div>
                  <div className="text-slate-500 font-mono mt-1 font-normal text-[11px]">
                    Số: {docCode}
                  </div>
                </div>
                <div className="text-center text-xs">
                  <div className="font-bold uppercase tracking-wider">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-semibold italic text-slate-700">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1 italic">
                    Hà Nội, ngày {metadata.date || '22 tháng 10 năm 2026'}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-slate-900">
                  {docTitle}
                </h1>
                <div className="text-xs text-slate-500 mt-1 italic">
                  (V/v: Thanh lý tài sản cố định & công cụ dụng cụ theo quy định)
                </div>
              </div>

              {/* Body Content based on Doc Type */}
              <div className="space-y-4 text-xs md:text-sm">
                <p>
                  <span className="font-semibold">Kính gửi:</span> Ban Giám đốc Công ty & Hội đồng Quản trị Tài sản.
                </p>

                {docType === 'DE_NGHI' && (
                  <>
                    <p>
                      Căn cứ vào nhu cầu sử dụng thực tế và hiện trạng kỹ thuật của các trang thiết bị tại{' '}
                      <span className="font-semibold">{metadata.department || 'đơn vị'}</span>;
                    </p>
                    <p>
                      Bộ phận kính đề nghị Hội đồng Thẩm định tiến hành kiểm tra, đánh giá hiện trạng và lập thủ tục thanh lý cho các tài sản đã hư hỏng, không còn hiệu quả vận hành.
                    </p>
                  </>
                )}

                {docType === 'BIEN_BAN' && (
                  <>
                    <p>
                      Hôm nay, ngày {metadata.date || '21/10/2026'}, Hội đồng kiểm tra và thẩm định hiện trạng tài sản đã tiến hành kiểm tra thực tế đối với các tài sản đề nghị thanh lý.
                    </p>
                    <p>
                      <span className="font-semibold">Thành phần Hội đồng:</span>
                      <br />- Ông/Bà: {metadata.creator || 'Trần Văn Bình'} - Trưởng bộ phận Quản trị Tài sản (Chủ trì).
                      <br />- Ông/Bà: {metadata.signer || 'Nguyễn Minh Anh'} - Đại diện Bộ phận sử dụng tài sản.
                    </p>
                    <p>
                      <span className="font-semibold">Kết luận của Hội đồng:</span> Toàn bộ các tài sản được kiểm tra đều có tỷ lệ hư hỏng & hao mòn kỹ thuật vượt quá 60%, chi phí phục hồi vượt mức hiệu quả sử dụng. Thống nhất lập Tờ trình báo cáo Ban Giám đốc xem xét phê duyệt thanh lý.
                    </p>
                  </>
                )}

                {docType === 'TO_TRINH' && (
                  <>
                    <p>
                      Căn cứ Biên bản kiểm tra hiện trạng và kết quả thẩm định kỹ thuật ngày {metadata.date || '20/10/2026'};
                    </p>
                    <p>
                      Phòng Quản lý Tài sản kính trình Ban Giám đốc xem xét phê duyệt phương án thanh lý tài sản cho các thiết bị thuộc danh mục sau:
                    </p>
                  </>
                )}

                {docType === 'QUYET_DINH' && (
                  <>
                    <p className="font-bold text-center my-3 uppercase tracking-wide">QUYẾT ĐỊNH:</p>
                    <p>
                      <span className="font-semibold">Điều 1:</span> Phê duyệt thanh lý các tài sản cố định/công cụ dụng cụ theo đề nghị của Hội đồng thanh lý tài sản.
                    </p>
                    <p>
                      <span className="font-semibold">Điều 2:</span> Giao Phòng Quản trị Tài sản chịu trách nhiệm thực hiện bán thanh lý theo đúng quy định, nộp số tiền thu được về Quỹ công ty.
                    </p>
                    <p>
                      <span className="font-semibold">Điều 3:</span> Các bộ phận liên quan chịu trách nhiệm thi hành quyết định này kể từ ngày ký.
                    </p>
                  </>
                )}

                {docType === 'HOP_DONG' && (
                  <>
                    <p>
                      Hợp đồng mua bán thanh lý tài sản được ký kết giữa Bên bán (Tập đoàn Công nghệ BA) và Bên mua (Đơn vị trúng đấu giá/mua thanh lý) theo đúng nguyên tắc thỏa thuận dân sự và pháp luật hiện hành.
                    </p>
                    <p>
                      Tổng giá trị hợp đồng: <span className="font-bold text-blue-700 font-mono">{(metadata.totalAmount || 80000000).toLocaleString('vi-VN')} VNĐ</span>
                    </p>
                  </>
                )}

                {docType === 'BAN_GIAO' && (
                  <>
                    <p>
                      Biên bản ghi nhận việc bàn giao hiện vật tài sản thanh lý giữa đại diện Công ty và bên nhận mua theo đúng số lượng, quy cách và tình trạng thực tế đã cam kết.
                    </p>
                  </>
                )}

                {/* Items Table in Document */}
                <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-3 text-center w-10">STT</th>
                        <th className="py-2 px-3 text-left">Mã tài sản</th>
                        <th className="py-2 px-3 text-left">Tên tài sản</th>
                        <th className="py-2 px-3 text-right">Nguyên giá (VNĐ)</th>
                        <th className="py-2 px-3 text-right">Giá trị còn lại (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(metadata.items && metadata.items.length > 0) ? (
                        metadata.items.map((it, idx) => (
                          <tr key={it.code}>
                            <td className="py-2 px-3 text-center">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-medium text-blue-700">{it.code}</td>
                            <td className="py-2 px-3 font-medium">{it.name}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{it.originalPrice.toLocaleString('vi-VN')}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{it.remainingPrice.toLocaleString('vi-VN')}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <td className="py-2 px-3 text-center">1</td>
                            <td className="py-2 px-3 font-mono text-blue-700">TS-00128</td>
                            <td className="py-2 px-3">Máy in Canon LBP 2900</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">15.030.000</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">8.500.000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-center">2</td>
                            <td className="py-2 px-3 font-mono text-blue-700">TS-00076</td>
                            <td className="py-2 px-3">Máy tính để bàn Dell Optiplex</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">18.000.000</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">4.500.000</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Signatures & Digital Stamp */}
            <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="font-bold uppercase tracking-wider text-slate-800">
                  Người lập / Đại diện BPSDTS
                </div>
                <div className="text-slate-400 italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 text-lg">
                    {metadata.creator || 'Nguyễn Minh Anh'}
                  </span>
                </div>
                <div className="font-semibold text-slate-700">{metadata.creator || 'Nguyễn Minh Anh'}</div>
              </div>

              <div>
                <div className="font-bold uppercase tracking-wider text-slate-800">
                  Thủ trưởng đơn vị / Giám đốc
                </div>
                <div className="text-slate-400 italic text-[11px]">(Ký, đóng dấu duyệt)</div>
                <div className="h-20 flex items-center justify-center relative">
                  {/* Simulated Red Corporate Stamp */}
                  <div className="absolute w-20 h-20 rounded-full border-2 border-red-600/70 text-red-600 flex flex-col items-center justify-center text-[8px] font-bold uppercase rotate-[-12deg] pointer-events-none opacity-85 p-1 text-center">
                    <span>CÔNG TY CỔ PHẦN BA ASSET</span>
                    <span className="text-[7px] text-red-500">ĐÃ DUYỆT</span>
                  </div>
                  <span className="font-serif italic text-blue-900 text-lg relative z-10">
                    {metadata.signer || 'Lê Hoàng Nam'}
                  </span>
                </div>
                <div className="font-semibold text-slate-700">{metadata.signer || 'Lê Hoàng Nam'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
