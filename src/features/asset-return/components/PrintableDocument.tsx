import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { ReturnRecord } from '../types/asset';

export const PrintableDocument: React.FC<{ record: ReturnRecord; onClose: () => void }> = ({
  record,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="asset-return-print fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top actions bar (hidden in print) */}
        <div className="print:hidden px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Bản in biên bản thu hồi tài sản</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {record.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In ngay / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper printable layout (A4 aspect) */}
        <div className="p-10 text-slate-900 bg-white min-h-[700px] text-sm leading-relaxed font-serif print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4 mb-6 border-slate-300">
            <div className="text-center w-1/2">
              <p className="font-bold text-xs uppercase tracking-wider">CÔNG TY CỔ PHẦN CÔNG NGHỆ</p>
              <p className="text-xs font-semibold">PHÒNG HÀNH CHÍNH NHÂN SỰ</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Số: {record.id}</p>
            </div>
            <div className="text-center w-1/2">
              <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-xs font-semibold">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">
                Hà Nội, ngày {record.completedAt ? record.completedAt.split(' ')[0] : record.scheduledDate}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6 space-y-1">
            <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
              BIÊN BẢN THU HỒI VÀ TIẾP NHẬN TÀI SẢN
            </h1>
            <p className="text-xs italic text-slate-600">
              (V/v: Thu hồi trang thiết bị làm việc của nhân sự do {record.reason})
            </p>
          </div>

          {/* Participants */}
          <div className="space-y-3 mb-6 text-xs font-sans">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">I. BÊN BÀN GIAO (NHÂN VIÊN):</p>
                <p>Họ và tên: <strong className="text-slate-900">{record.employeeName}</strong></p>
                <p>Phòng ban / Bộ phận: {record.department}</p>
                <p>Email: {record.employeeEmail}</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">II. BÊN TIẾP NHẬN (HCNS):</p>
                <p>Đại diện: <strong className="text-slate-900">{record.receiverName || 'Phòng HCNS'}</strong></p>
                <p>Thời điểm tiếp nhận: {record.completedAt || record.scheduledDate}</p>
                <p>Lý do thu hồi: {record.reason}</p>
              </div>
            </div>
          </div>

          {/* Asset table */}
          <div className="mb-6">
            <p className="font-bold text-xs font-sans uppercase mb-2">
              III. DANH MỤC TRANG THIẾT BỊ BÀN GIAO & THU HỒI:
            </p>
            <table className="w-full text-xs border border-slate-300 border-collapse font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold text-left">
                  <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                  <th className="border border-slate-300 p-2">Mã tài sản</th>
                  <th className="border border-slate-300 p-2">Tên thiết bị & Serial</th>
                  <th className="border border-slate-300 p-2">Hiện trạng vật lý</th>
                  <th className="border border-slate-300 p-2">Trạng thái hoạt động</th>
                  <th className="border border-slate-300 p-2">Phụ kiện kèm theo</th>
                  <th className="border border-slate-300 p-2 text-center">Kết luận</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((item, index) => (
                  <tr key={item.assetId} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-bold">
                      {item.assetId}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <div className="font-medium text-slate-900">{item.assetName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SN: {item.serial}</div>
                    </td>
                    <td className="border border-slate-300 p-2">
                      {item.isLost ? (
                        <span className="text-red-600 font-medium">Báo mất tài sản</span>
                      ) : (
                        item.physicalCondition || 'Mới / Tốt'
                      )}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {item.isLost ? '-' : item.operatingStatus || 'Hoạt động bình thường'}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {item.isLost
                        ? '-'
                        : item.accessories && item.accessories.length > 0
                        ? item.accessories
                            .map((acc) => {
                              const q = item.accessoryQuantities?.[acc];
                              return q && q > 1 ? `${acc} (x${q})` : acc;
                            })
                            .join(', ')
                        : 'Đầy đủ theo máy'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {item.isLost ? (
                        <span className="text-red-600">MẤT</span>
                      ) : (
                        <span className="text-emerald-700">ĐÃ THU HỒI</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="text-xs font-sans space-y-1 mb-8 text-slate-700">
            <p>
              • Hai bên đã trực tiếp kiểm tra thực tế, đối chiếu tem mã QR thiết bị và thống nhất số liệu trên.
            </p>
            <p>
              • Tài sản đã được Phòng HCNS nhập kho an toàn, giải phóng trách nhiệm bảo quản của nhân sự.
            </p>
            <p>
              • Biên bản được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để theo dõi.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 text-center text-xs font-sans mt-10">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-900">ĐẠI DIỆN BÊN BÀN GIAO</p>
              <p className="text-[11px] text-slate-500 italic mb-16">(Ký và ghi rõ họ tên)</p>
              <p className="font-bold text-sm text-slate-900">{record.employeeName}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-900">ĐẠI DIỆN BÊN TIẾP NHẬN</p>
              <p className="text-[11px] text-slate-500 italic mb-16">(Ký số và đóng dấu xác nhận)</p>
              <p className="font-bold text-sm text-slate-900">{record.receiverName || 'Phòng HCNS'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
