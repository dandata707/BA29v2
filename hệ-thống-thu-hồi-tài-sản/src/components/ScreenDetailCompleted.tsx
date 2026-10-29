import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Printer,
  FileDown,
  Calendar,
  Clock,
  User,
  Mail,
  Box,
  Check,
  AlertTriangle,
  QrCode,
  Tag,
  Eye,
  FileText,
} from 'lucide-react';
import { ReturnRecord } from '../types/asset';
import { useApp } from '../context/AppContext';
import { PrintableDocument } from './PrintableDocument';

export const ScreenDetailCompleted: React.FC<{ record: ReturnRecord }> = ({ record }) => {
  const { setView } = useApp();
  const [showPrintModal, setShowPrintModal] = useState(false);

  const totalItems = record.items.length;
  const reclaimedCount = record.items.filter((i) => !i.isLost).length;

  const handlePrintPDF = () => {
    // Open print preview modal with browser print action
    setShowPrintModal(true);
  };

  const handleExportWord = () => {
    // Generate clean HTML-based .doc file that opens flawlessly in MS Word
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Biên bản thu hồi tài sản ${record.id}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; margin: 40px; }
        .header { text-align: center; font-weight: bold; margin-bottom: 25px; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        .signatures { margin-top: 40px; width: 100%; }
        .sig-col { width: 50%; text-align: center; vertical-align: top; }
      </style>
      </head>
      <body>
        <div class="header">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
          Độc lập - Tự do - Hạnh phúc<br>
          -------------------
        </div>
        <div class="title">BIÊN BẢN THU HỒI VÀ TIẾP NHẬN TÀI SẢN</div>
        <p style="text-align: center; font-style: italic;">Số: ${record.id} / Ngày hoàn tất: ${record.completedAt || record.scheduledDate}</p>

        <p><strong>Căn cứ:</strong> Quy chế quản lý và sử dụng tài sản doanh nghiệp.</p>
        <p>Hôm nay, đại diện hai bên tiến hành lập biên bản thu hồi tài sản gồm các nội dung sau:</p>

        <p><strong>1. Bên bàn giao (Nhân viên):</strong> ${record.employeeName}</p>
        <p>- Bộ phận / Phòng ban: ${record.department}</p>
        <p>- Email: ${record.employeeEmail}</p>
        <p>- Lý do thu hồi: ${record.reason}</p>

        <p><strong>2. Bên tiếp nhận:</strong> ${record.receiverName || 'Phòng HCNS'}</p>

        <p><strong>3. Danh mục tài sản thu hồi:</strong></p>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã tài sản</th>
              <th>Tên thiết bị & Serial</th>
              <th>Tình trạng vật lý</th>
              <th>Trạng thái hoạt động</th>
              <th>Phụ kiện kèm theo</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            ${record.items
              .map(
                (item, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${item.assetId}</strong></td>
                <td>${item.assetName} (SN: ${item.serial})</td>
                <td>${item.isLost ? 'Mất tài sản' : item.physicalCondition || 'Bình thường'}</td>
                <td>${item.isLost ? '-' : item.operatingStatus || 'Hoạt động tốt'}</td>
                <td>${
                  item.isLost
                    ? '-'
                    : item.accessories
                        ?.map((acc) => {
                          const q = item.accessoryQuantities?.[acc];
                          return q && q > 1 ? `${acc} (x${q})` : acc;
                        })
                        .join(', ') || 'Đầy đủ'
                }</td>
                <td>${item.isLost ? 'BÁO MẤT' : 'ĐÃ THU HỒI'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <p>Hai bên thống nhất đã kiểm tra đúng chủng loại, hiện trạng thực tế và ký xác nhận.</p>

        <table class="signatures" style="border: none;">
          <tr style="border: none;">
            <td class="sig-col" style="border: none;">
              <strong>BÊN BÀN GIAO</strong><br>
              <em>(Ký, ghi rõ họ tên)</em><br><br><br><br>
              <strong>${record.employeeName}</strong>
            </td>
            <td class="sig-col" style="border: none;">
              <strong>BÊN NHẬN BÀN GIAO</strong><br>
              <em>(Ký, đóng dấu đại diện HCNS)</em><br><br><br><br>
              <strong>${record.receiverName || 'Phòng HCNS'}</strong>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bien_ban_thu_hoi_${record.id.replace('/', '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* 1. Vùng tiêu đề (STT 1, 2, 3, 4, 5, 6) */}
      <div className="space-y-3">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Danh sách biên bản</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {record.id}
              </h2>
              {/* Badge Đã hoàn tất (STT 3: nền xanh lá, có chấm tròn) */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Đã hoàn tất
              </span>
            </div>
            {/* Thông tin tóm tắt (STT 4) */}
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{record.employeeName}</span>{' '}
              <span className="text-slate-300">·</span> {record.department}{' '}
              <span className="text-slate-300">·</span>{' '}
              <span className="italic text-slate-500">{record.reason}</span>
            </p>
          </div>

          {/* Nút In PDF & Xuất Word (STT 5, 6) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Nút In PDF (icon máy in màu đỏ) */}
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-red-500" />
              <span>In PDF</span>
            </button>

            {/* Nút Xuất Word (icon tài liệu màu xanh) */}
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>Xuất Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Khối thông tin biên bản (STT 7, 8, 9, 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Lịch bàn giao
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{record.scheduledDate}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Ngày hoàn tất
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{record.completedAt || `${record.scheduledDate} · 10:15`}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Người nhận tài sản
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{record.receiverName || 'Phòng HCNS'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Email nhân viên
          </span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{record.employeeEmail}</span>
          </div>
        </div>
      </div>

      {/* 3. Danh sách tài sản đã thu hồi (STT 11, 12, 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Danh sách tài sản đã thu hồi ({totalItems})
          </h3>

          {/* Badge tiến độ thu hồi (STT 12: nền xanh lá, có dấu tích) */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Đã thu hồi {reclaimedCount}/{totalItems} tài sản
          </span>
        </div>

        {/* Thẻ từng tài sản đã thu hồi (STT 13: chỉ xem, không chỉnh sửa) */}
        <div className="space-y-3">
          {record.items.map((item) => (
            <div
              key={item.assetId}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5"
            >
              {/* Header dòng tài sản (STT 13.1, 13.2, 13.3, 13.4) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {item.assetId}
                      </span>
                      {item.isLost ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" /> Mất tài sản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 stroke-[3]" /> Đã thu hồi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      {item.assetName} <span className="text-slate-300">·</span>{' '}
                      <span className="font-mono text-slate-500 text-[11px]">SN: {item.serial}</span>
                    </p>
                  </div>
                </div>

                {/* Nút "Mã QR đã khớp" (STT 13.4: Disabled nền xám nhạt) */}
                <div className="shrink-0 flex items-center">
                  <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200 flex items-center gap-1.5 select-none">
                    <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.isLost ? 'Miễn quét QR (Mất)' : 'Mã QR đã khớp'}</span>
                  </span>
                </div>
              </div>

              {/* Chi tiết hiện trạng (STT 13.5, 13.6, 13.7, 13.8) */}
              {item.isLost ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  <strong>Lý do báo mất:</strong> {item.lostReason}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Tình trạng vật lý (STT 13.5) */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Tình trạng ngoại hình
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-white text-slate-800 font-medium border border-slate-200">
                      {item.physicalCondition || 'Mới / Tốt'}
                    </span>
                  </div>

                  {/* Trạng thái hoạt động (STT 13.6) */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Trạng thái hoạt động
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-white text-slate-800 font-medium border border-slate-200">
                      {item.operatingStatus || 'Hoạt động bình thường'}
                      {item.operatingStatusOtherNote && ` (${item.operatingStatusOtherNote})`}
                    </span>
                  </div>

                  {/* Phụ kiện đi kèm bàn giao (STT 13.7) */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Phụ kiện đã bàn giao kèm
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.accessories && item.accessories.length > 0 ? (
                        item.accessories.map((acc) => {
                          const q = item.accessoryQuantities?.[acc];
                          return (
                            <span
                              key={acc}
                              className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium text-[11px] border border-slate-200 inline-flex items-center gap-1"
                            >
                              <span>{acc}</span>
                              {q && q > 1 && (
                                <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded text-[10px]">
                                  x{q}
                                </span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 italic">Không có phụ kiện kèm</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ghi chú hiện trạng (STT 13.8) */}
              {item.conditionNote && (
                <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 italic">
                  <strong>Ghi chú tình trạng:</strong> "{item.conditionNote}"
                </p>
              )}

              {/* Người bàn giao & Ngày nhận bàn giao (STT 13.9, 13.10) */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50">
                <span>
                  Người bàn giao: <strong className="text-slate-700">{record.employeeName}</strong>
                </span>
                <span>
                  Ngày nhận bàn giao:{' '}
                  <strong className="text-slate-700 font-mono">
                    {item.handedOverAt || record.completedAt?.split(' ')[0] || record.scheduledDate}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Khối chữ ký các bên (STT 14, 15) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 text-center">
          Xác nhận điện tử hai bên
        </h4>

        <div className="grid grid-cols-2 gap-8 text-center">
          {/* Cột trái: Bên bàn giao (nhân viên) (STT 14) */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
              Bên bàn giao (Nhân viên)
            </span>
            <div className="h-16 flex items-center justify-center">
              <div className="border border-emerald-300 bg-emerald-50/60 rounded-lg px-4 py-2 inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã xác nhận biên bản điện tử</span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900">{record.employeeName}</p>
          </div>

          {/* Cột phải: Bên nhận bàn giao (đại diện HCNS) (STT 15) */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
              Bên nhận bàn giao (Đại diện HCNS)
            </span>
            <div className="h-16 flex items-center justify-center">
              <div className="border border-blue-300 bg-blue-50/60 rounded-lg px-4 py-2 inline-flex items-center gap-1.5 text-xs text-blue-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Đã ký số duyệt tiếp nhận kho</span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900">{record.receiverName || 'Phòng HCNS'}</p>
          </div>
        </div>
      </div>

      {/* Print PDF Modal */}
      {showPrintModal && (
        <PrintableDocument
          record={record}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
