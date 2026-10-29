import { TransferIcon } from './TransferIcon';
import React from 'react';
import { useTransfer } from '../context/TransferContext';

export const HandoverPrintModal: React.FC = () => {
  const { printHandoverId, setPrintHandoverId, handovers, requests, assets } =
    useTransfer();

  if (!printHandoverId) return null;

  const handover = handovers[printHandoverId];
  const request = requests.find((r) => r.id === handover?.requestId);
  const asset = assets.find((a) => a.id === request?.assetId);
  if (!handover || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="asset-transfer-print fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Controls */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <TransferIcon className="text-blue-600 text-[20px]" name={"print"} />
            <h3 className="text-sm font-bold text-slate-800">
              Xem trước và In biểu mẫu bàn giao tài sản
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <TransferIcon className="text-[16px]" name={"print"} />
              <span>In biểu mẫu</span>
            </button>
            <button
              onClick={() => setPrintHandoverId(null)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              <TransferIcon className="text-[18px]" name={"close"} />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 text-[#0f172a] bg-white font-serif leading-relaxed text-sm">
          {/* Header */}
          <div className="text-center space-y-1 mb-8">
            <p className="font-bold text-xs text-slate-800">
              BIÊN BẢN ĐIỀU CHUYỂN TÀI SẢN
            </p>
            <p className="font-bold uppercase tracking-wider text-xs">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-semibold text-xs underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <p className="text-[11px] text-slate-500 italic pt-2">
              Ngày bàn giao: {handover.handoverDate}
            </p>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              BIÊN BẢN BÀN GIAO VÀ TIẾP NHẬN TÀI SẢN
            </h1>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Số: <strong className="font-mono">{handover.id}</strong> / Căn cứ phiếu điều chuyển: <strong className="font-mono">{request.id}</strong>
            </p>
            <p className="text-[11px] font-sans text-slate-400 italic">
              (Ban hành theo {handover?.formCode || 'Biểu mẫu số 04B/TS-2026'})
            </p>
          </div>

          {/* Basis */}
          <div className="mb-4 text-xs space-y-1 text-slate-700 italic">
            <p>- Căn cứ quy chế quản lý và sử dụng tài sản của đơn vị;</p>
            <p>- Căn cứ Phiếu yêu cầu điều chuyển số {request?.id} được phê duyệt ngày {request?.updatedDate};</p>
            <p>- Hôm nay, vào hồi {handover?.handoverDate || '14:30'}, tại {handover?.handoverLocation || 'Trụ sở văn phòng công ty'}; chúng tôi gồm có:</p>
          </div>

          {/* Parties */}
          <div className="space-y-3 mb-6 text-xs">
            {/* Sender */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold uppercase text-slate-900 mb-1">
                I. ĐẠI DIỆN BÊN GIAO (BỘ PHẬN CHUYỂN ĐI):
              </p>
              <div className="grid grid-cols-2 gap-2 pl-3">
                <p>Ông/Bà: <strong>{request?.requesterName}</strong></p>
                <p>Mã nhân viên: <strong>{request?.requesterId}</strong></p>
                <p>Chức vụ: {request?.requesterRole}</p>
                <p>Đơn vị / Phòng ban: {request?.requesterDept}</p>
              </div>
            </div>

            {/* Recipient */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold uppercase text-slate-900 mb-1">
                II. ĐẠI DIỆN BÊN NHẬN (BỘ PHẬN TIẾP NHẬN):
              </p>
              <div className="grid grid-cols-2 gap-2 pl-3">
                <p>Ông/Bà: <strong>{request?.recipientName}</strong></p>
                <p>Mã nhân viên: <strong>{request?.recipientEmployeeId}</strong></p>
                <p>Chức vụ: {request?.recipientRole}</p>
                <p>Đơn vị / Phòng ban: {request?.recipientDept}</p>
              </div>
            </div>

            {/* HR Witness */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold uppercase text-slate-900 mb-1">
                III. ĐẠI DIỆN BAN QUẢN LÝ TÀI SẢN (Quản lý tài sản CHỨNG KIẾN):
              </p>
              <div className="grid grid-cols-2 gap-2 pl-3">
                <p>Người thẩm định: <strong>{request.reviewedBy}</strong></p>
                <p>Ngày thẩm định: {request.reviewedAt}</p>
                <p>Chức vụ: Nhân viên quản lý tài sản</p>
              </div>
            </div>
          </div>

          {/* Asset details table */}
          <div className="mb-6">
            <p className="font-bold uppercase text-xs mb-2">
              IV. NỘI DUNG BÀN GIAO TÀI SẢN THỰC TẾ:
            </p>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-300 p-2 w-10">STT</th>
                  <th className="border border-slate-300 p-2">Mã tài sản</th>
                  <th className="border border-slate-300 p-2">Tên thiết bị & Thông số</th>
                  <th className="border border-slate-300 p-2">Số Serial / Thẻ</th>
                  <th className="border border-slate-300 p-2 w-16">Số lượng</th>
                  <th className="border border-slate-300 p-2">Tình trạng thực tế</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 text-center">01</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-center text-blue-600">
                    {asset?.id || request?.assetId}
                  </td>
                  <td className="border border-slate-300 p-2">
                    <p className="font-bold">{asset?.name || request?.assetName}</p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {asset?.specs?.join(', ') || 'Cấu hình tiêu chuẩn'}
                    </p>
                  </td>
                  <td className="border border-slate-300 p-2 font-mono text-center">
                    {asset?.serialNumber || '—'}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold">01</td>
                  <td className="border border-slate-300 p-2 text-center">
                    {asset?.tinh_trang || 'Tốt'} ({asset?.trang_thai || 'Đang sử dụng'})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Accessories */}
          <div className="mb-6 text-xs p-3 bg-slate-50 rounded border border-slate-200">
            <p className="font-bold mb-1">Linh kiện & Phụ kiện đi kèm:</p>
            <p className="text-slate-700 italic">
              {handover?.accessories || asset?.defaultAccessories || 'Đầy đủ cáp nguồn và phụ kiện tiêu chuẩn.'}
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN GIAO</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic font-bold text-blue-800 text-base">
                  {handover.senderConfirmed ? 'Đã xác nhận bàn giao' : ''}
                </span>
              </div>
              <p className="font-semibold">{request?.requesterName}</p>
            </div>

            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN NHẬN</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic font-bold text-indigo-800 text-base">
                  {handover.recipientConfirmed ? 'Đã xác nhận tiếp nhận' : ''}
                </span>
              </div>
              <p className="font-semibold">{request?.recipientName}</p>
            </div>

            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN Quản lý tài sản</p>
              <p className="text-[11px] text-slate-400 italic">(Xác nhận lưu hồ sơ)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic font-bold text-emerald-800 text-base">
                  {request.reviewedBy || ''}
                </span>
              </div>
              <p className="font-semibold">{request.reviewedBy || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
