import React, { useState } from 'react';
import { Search, ArrowRight, Clock, Building2, User, FileText } from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';

export const InspectionListScreen: React.FC = () => {
  const { proposals, startInspection } = useAssetContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Proposals waiting for inspection
  const pendingProposals = proposals.filter((p) => p.status === 'CHO_TIEP_NHAN' || p.status === 'DANG_THAM_DINH');

  const filtered = pendingProposals.filter((p) => {
    return (
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Danh sách Đề nghị chờ tiếp nhận
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Chọn một đề nghị để bắt đầu quá trình kiểm tra thực tế và thẩm định tài sản (NVQLTS).
        </p>
      </div>

      {/* Filter Bar Matching Image 19 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã đề nghị, Bộ phận, Người lập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden">
            <option>Tất cả trạng thái</option>
            <option>Chờ tiếp nhận</option>
            <option>Đang thẩm định</option>
          </select>
        </div>

        <button className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm rounded-xl transition-colors cursor-pointer shrink-0">
          Tìm kiếm
        </button>
      </div>

      {/* Table Matching Image 19 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-32">Mã Đề nghị</th>
                <th className="py-3 px-4 w-28">Ngày gửi</th>
                <th className="py-3 px-4">Bộ phận đề nghị</th>
                <th className="py-3 px-4">Người lập</th>
                <th className="py-3 px-4 text-center w-24">Số tài sản</th>
                <th className="py-3 px-4 w-36">Trạng thái</th>
                <th className="py-3 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.sentDate || item.createdDate}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{item.department}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.creatorName}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {item.assetIds.length}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'CHO_TIEP_NHAN' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Chờ tiếp nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Đang thẩm định
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {/* Step 5: Bấm nút Xử lý ngay -> */}
                      <button
                        onClick={() => startInspection(item.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Xử lý ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Hiện không có đề nghị nào chờ tiếp nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
