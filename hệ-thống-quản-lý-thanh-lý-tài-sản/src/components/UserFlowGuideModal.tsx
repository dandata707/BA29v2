import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert, ArrowRight, Eye, FileText, Check, Lock, ChevronRight } from 'lucide-react';
import { useAssetContext, ScreenType } from '../context/AssetContext';
import { UserRole } from '../types/asset';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserFlowGuideModal: React.FC<UserFlowGuideModalProps> = ({ isOpen, onClose }) => {
  const { setActiveScreen, switchUserRole, setSelectedProposalId, setSelectedSubmissionId, setSelectedDecisionId, setSelectedDossierId } = useAssetContext();
  const [activeTab, setActiveTab] = useState<'BANG1' | 'BANG2' | 'BANG3' | 'BANG4' | 'BANG5'>('BANG1');

  if (!isOpen) return null;

  const handleJump = (screen: ScreenType, role: UserRole, options?: { proposalId?: string; submissionId?: string; decisionId?: string; dossierId?: string }) => {
    switchUserRole(role);
    if (options?.proposalId) setSelectedProposalId(options.proposalId);
    if (options?.submissionId) setSelectedSubmissionId(options.submissionId);
    if (options?.decisionId) setSelectedDecisionId(options.decisionId);
    if (options?.dossierId) setSelectedDossierId(options.dossierId);
    setActiveScreen(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="text-base font-bold flex items-center gap-2">
              <span>🗺️ BẢNG CHỈ DẪN ĐƯỜNG ĐI MỞ RỘNG (14 BƯỚC & 5 BẢNG TRA CỨU)</span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Bản đồ luồng nghiệp vụ thanh lý tài sản cố định chuẩn hóa cho 3 tác nhân: BPSDTS, NVQLTS & Giám đốc
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Table Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('BANG1')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'BANG1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Bảng 1: Luồng chính (14 bước + 4 chốt chặn)
          </button>
          <button
            onClick={() => setActiveTab('BANG2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'BANG2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Bảng 2: Xem Tờ trình & Tài liệu (V1 - V9)
          </button>
          <button
            onClick={() => setActiveTab('BANG3')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'BANG3'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Bảng 3: Xem Chi tiết Đề nghị (V10 - V13)
          </button>
          <button
            onClick={() => setActiveTab('BANG4')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'BANG4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Bảng 4: Quyết định & Thực hiện (V14 - V20)
          </button>
          <button
            onClick={() => setActiveTab('BANG5')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'BANG5'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Bảng 5: Hồ sơ hoàn tất 7 thành phần (V21 - V24)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-160px)] space-y-6">
          {activeTab === 'BANG1' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">4 Chốt chặn then chốt (Guardrails):</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><span className="font-semibold">Chốt chặn 1 (Bước 4):</span> Sau khi gửi đề nghị, hệ thống khóa form, chuyển sang "Chờ tiếp nhận", bắn thông báo cho NVQLTS.</li>
                  <li><span className="font-semibold">Chốt chặn 2 (Bước 7):</span> Nút "Chuyển lập tờ trình" chỉ sáng khi đã lưu biên bản thẩm định và có ít nhất 1 tài sản đạt "Đủ điều kiện".</li>
                  <li><span className="font-semibold">Chốt chặn 3 (Bước 11):</span> Giám đốc phê duyệt ban hành Quyết định; nếu từ chối, tờ trình thành "Trả bổ sung" kèm lý do.</li>
                  <li><span className="font-semibold">Chốt chặn 4 (Bước 14):</span> Nút "Đóng và lưu hồ sơ" bị vô hiệu hóa (xám) nếu thiếu bất kỳ giấy tờ nào trong 7 thành phần hoặc còn tài sản chưa thanh lý.</li>
                </ul>
              </div>

              {/* Steps Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Bước</th>
                      <th className="py-2.5 px-3 w-20">Tác nhân</th>
                      <th className="py-2.5 px-3">Màn hình</th>
                      <th className="py-2.5 px-3">Hành động (Nút bấm)</th>
                      <th className="py-2.5 px-3">Màn hình tiếp theo</th>
                      <th className="py-2.5 px-3">Trạng thái đổi</th>
                      <th className="py-2.5 px-3 text-center w-24">Thử ngay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">1</td>
                      <td className="py-2.5 px-3 font-semibold text-purple-700">BPSDTS</td>
                      <td className="py-2.5 px-3">Danh sách Đề nghị</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">+ Tạo đề nghị mới</td>
                      <td className="py-2.5 px-3">Màn hình Lập đề nghị</td>
                      <td className="py-2.5 px-3">Đề nghị: Nháp</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('PROPOSAL_CREATE', 'BPSDTS')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 1
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">2-3</td>
                      <td className="py-2.5 px-3 font-semibold text-purple-700">BPSDTS</td>
                      <td className="py-2.5 px-3">Màn hình Lập đề nghị</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">+ Thêm tài sản &rarr; Tick & Thêm</td>
                      <td className="py-2.5 px-3">Grid Lập đề nghị</td>
                      <td className="py-2.5 px-3">Tài sản được đẩy vào Grid</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('PROPOSAL_CREATE', 'BPSDTS')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 2-3
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">4</td>
                      <td className="py-2.5 px-3 font-semibold text-purple-700">BPSDTS</td>
                      <td className="py-2.5 px-3">Màn hình Lập đề nghị</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Gửi đề nghị (Chốt chặn 1)</td>
                      <td className="py-2.5 px-3">DS Đề nghị</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-800">Chờ tiếp nhận (Khóa form)</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('PROPOSAL_CREATE', 'BPSDTS')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Bước 4
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">5</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">DS Chờ tiếp nhận</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Xử lý ngay &rarr;</td>
                      <td className="py-2.5 px-3">Tiếp nhận & Thẩm định</td>
                      <td className="py-2.5 px-3">Đang thẩm định</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('INSPECTIONS', 'NVQLTS')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 5
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">6</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Tiếp nhận & Thẩm định</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Nhập kết quả &rarr; Lưu biên bản</td>
                      <td className="py-2.5 px-3">Màn Thẩm định (mở nút)</td>
                      <td className="py-2.5 px-3">Sinh số BB thẩm định</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('INSPECTION_DETAIL', 'NVQLTS', { proposalId: 'TL-2026-025' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 6
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">7</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Tiếp nhận & Thẩm định</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">Chuyển lập tờ trình (Chốt chặn 2)</td>
                      <td className="py-2.5 px-3">DS Đề nghị đủ điều kiện</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Đủ ĐK: Chờ lập tờ trình</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('INSPECTION_DETAIL', 'NVQLTS', { proposalId: 'TL-2026-025' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 7
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">8</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">DS Đề nghị đủ điều kiện</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Tick 1 hoặc nhiều &rarr; Tạo tờ trình</td>
                      <td className="py-2.5 px-3">Lập tờ trình thanh lý</td>
                      <td className="py-2.5 px-3">Auto load TS & tính tổng tiền</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('QUALIFIED_PROPOSALS', 'NVQLTS')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 8
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">9</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Lập tờ trình thanh lý</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Gửi tờ trình (Góc phải)</td>
                      <td className="py-2.5 px-3">DS Tờ trình</td>
                      <td className="py-2.5 px-3">Tờ trình: Chờ phê duyệt</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_CREATE', 'NVQLTS')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 9
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">10</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">Giám đốc</td>
                      <td className="py-2.5 px-3">DS Tờ trình chờ duyệt</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Phê duyệt ngay</td>
                      <td className="py-2.5 px-3">Màn hình Phê duyệt</td>
                      <td className="py-2.5 px-3">Chờ phê duyệt (đang xem)</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'GIAM_DOC', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Bước 10
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">11</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">Giám đốc</td>
                      <td className="py-2.5 px-3">Màn hình Phê duyệt</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Chọn Phê duyệt/Từ chối (Chốt chặn 3)</td>
                      <td className="py-2.5 px-3">DS Tờ trình</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Đã phê duyệt / Trả bổ sung</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'GIAM_DOC', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Bước 11
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">12</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Menu Thực hiện thanh lý</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Click 1 Quyết định trên bảng</td>
                      <td className="py-2.5 px-3">Chi tiết Thực hiện</td>
                      <td className="py-2.5 px-3">Hiển thị TS & Form HĐ/BBBG</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('EXECUTIONS', 'NVQLTS', { decisionId: 'QD-2026-015' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 12
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">13</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Chi tiết Thực hiện</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">Tick TS &rarr; Xác nhận bán đợt này</td>
                      <td className="py-2.5 px-3">DS Quyết định</td>
                      <td className="py-2.5 px-3">TS được tick: Đã thanh lý</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('EXECUTIONS', 'NVQLTS', { decisionId: 'QD-2026-015' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Bước 13
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">14</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">NVQLTS</td>
                      <td className="py-2.5 px-3">Đóng và lưu hồ sơ</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Kiểm tra 7 mục &rarr; Đóng hồ sơ (Chốt chặn 4)</td>
                      <td className="py-2.5 px-3">DS Hồ sơ</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Hồ sơ: Hoàn tất</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('DOSSIERS', 'NVQLTS', { dossierId: 'dos-2026-015' })}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Bước 14
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BANG2' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Mục đích Bảng 2:</span> Luồng xem chi tiết Tờ trình & Tài liệu đính kèm (Read-only, 3 tabs Thông tin chung, Danh mục tài sản, Hồ sơ đính kèm với PDF preview và tự động ghi nhận Audit Log người xem + thời điểm).
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Mã</th>
                      <th className="py-2.5 px-3 w-20">Tác nhân</th>
                      <th className="py-2.5 px-3">Màn hình</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Kết quả hiển thị</th>
                      <th className="py-2.5 px-3 text-center w-24">Thử ngay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V1</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Danh sách Tờ trình</td>
                      <td className="py-2.5 px-3 font-semibold">Bấm nút Xem (con mắt)</td>
                      <td className="py-2.5 px-3">Mở Panel Chi tiết Tờ trình (Read-only)</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'NVQLTS', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V1
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V2-V4</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Panel Chi tiết Tờ trình</td>
                      <td className="py-2.5 px-3 font-semibold">Chuyển tab [Thông tin chung] / [Danh mục TS] / [Hồ sơ đính kèm]</td>
                      <td className="py-2.5 px-3">Xem các grid dữ liệu và file đính kèm</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'NVQLTS', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V2-4
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V5-V6</td>
                      <td className="py-2.5 px-3">NVQLTS / GĐ</td>
                      <td className="py-2.5 px-3">Tab Hồ sơ đính kèm</td>
                      <td className="py-2.5 px-3 font-semibold">Bấm link Đề nghị thanh lý.pdf / Biên bản kiểm tra.pdf</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Mở PDF Preview + Ghi Audit Log tự động</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'NVQLTS', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Thử V5-6
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V7-V9</td>
                      <td className="py-2.5 px-3">Giám đốc</td>
                      <td className="py-2.5 px-3">Danh sách Tờ trình chờ duyệt</td>
                      <td className="py-2.5 px-3 font-semibold">Xem &rarr; Bấm Phê duyệt ngay</td>
                      <td className="py-2.5 px-3">Mở form quyết định phê duyệt / trả hồ sơ</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('SUBMISSION_LIST', 'GIAM_DOC', { submissionId: 'TT-2026-005' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V7-9
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BANG3' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Mục đích Bảng 3:</span> BPSDTS theo dõi lại Đề nghị mình đã gửi (Read-only khi đang xử lý; timeline trạng thái minh bạch giải quyết pain point không biết hồ sơ ở đâu; nút "Sửa lại" khi hồ sơ bị trả lại).
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Mã</th>
                      <th className="py-2.5 px-3 w-20">Tác nhân</th>
                      <th className="py-2.5 px-3">Màn hình</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Kết quả hiển thị</th>
                      <th className="py-2.5 px-3 text-center w-24">Thử ngay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V10-V12</td>
                      <td className="py-2.5 px-3">BPSDTS</td>
                      <td className="py-2.5 px-3">Danh sách Đề nghị</td>
                      <td className="py-2.5 px-3 font-semibold">Bấm Xem (dòng TL-2026-025)</td>
                      <td className="py-2.5 px-3">Mở Modal Chi tiết Read-only + Timeline trực quan</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('PROPOSALS', 'BPSDTS', { proposalId: 'TL-2026-025' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V10-12
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V13</td>
                      <td className="py-2.5 px-3">BPSDTS</td>
                      <td className="py-2.5 px-3">Danh sách Đề nghị (ĐN bị trả lại TL-2026-022)</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-700">Bấm nút Sửa lại (màu đỏ/cam)</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Mở lại Form Lập đề nghị (ĐN về Nháp để chỉnh sửa gửi lại)</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('PROPOSALS', 'BPSDTS', { proposalId: 'TL-2026-022' })}
                          className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-medium hover:bg-amber-700 cursor-pointer"
                        >
                          Thử V13
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BANG4' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Mục đích Bảng 4:</span> NVQLTS xem lại Quyết định thanh lý và các đợt thanh lý (tabs Hợp đồng mua bán Đợt 1, Đợt 2, Biên bản bàn giao, Tài liệu đính kèm, nút Thực hiện thanh lý đợt mới).
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Mã</th>
                      <th className="py-2.5 px-3 w-20">Tác nhân</th>
                      <th className="py-2.5 px-3">Màn hình</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Kết quả hiển thị</th>
                      <th className="py-2.5 px-3 text-center w-24">Thử ngay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V14-V15</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Danh sách Quyết định</td>
                      <td className="py-2.5 px-3 font-semibold">Xem QĐ &rarr; Tab Hợp đồng mua bán</td>
                      <td className="py-2.5 px-3">Xem danh sách Hợp đồng phân chia theo từng đợt</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('EXECUTIONS', 'NVQLTS', { decisionId: 'QD-2026-015' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V14-15
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V16-V19</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Tab BBBG & Tài liệu đính kèm</td>
                      <td className="py-2.5 px-3 font-semibold">Bấm link xem file HĐ, BBBG, Quyết định</td>
                      <td className="py-2.5 px-3">Mở PDF Preview xem bản scan có chữ ký & tải về</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('EXECUTIONS', 'NVQLTS', { decisionId: 'QD-2026-015' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V16-19
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V20</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Chi tiết Quyết định</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">Thực hiện thanh lý đợt mới</td>
                      <td className="py-2.5 px-3 font-semibold">Mở Form nhập HĐ/BBBG đợt tiếp theo</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('EXECUTIONS', 'NVQLTS', { decisionId: 'QD-2026-015' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V20
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BANG5' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Mục đích Bảng 5:</span> Xem hồ sơ đã đóng (MH_TL06 Read-only, toàn bộ khóa, badge "Đã thanh lý", checklist 7 thành phần ĐỦ màu xanh, bấm In hồ sơ xuất trọn bộ văn bản pháp lý hoàn chỉnh phục vụ kiểm toán).
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Mã</th>
                      <th className="py-2.5 px-3 w-20">Tác nhân</th>
                      <th className="py-2.5 px-3">Màn hình</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Kết quả hiển thị</th>
                      <th className="py-2.5 px-3 text-center w-24">Thử ngay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V21</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">Menu Đóng & lưu hồ sơ</td>
                      <td className="py-2.5 px-3 font-semibold">Chọn hồ sơ hoàn tất (QĐ-2026-008)</td>
                      <td className="py-2.5 px-3">Mở MH_TL06 ở chế độ Read-only khóa form</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('DOSSIERS', 'NVQLTS', { dossierId: 'dos-008' })}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          Thử V21
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V22-V23</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">MH_TL06 (Hồ sơ hoàn tất)</td>
                      <td className="py-2.5 px-3 font-semibold">Xem Grid & Checklist 7 thành phần</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Tất cả 7 mục đều báo "Đủ" màu xanh, badge "Đã thanh lý"</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('DOSSIERS', 'NVQLTS', { dossierId: 'dos-008' })}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 cursor-pointer"
                        >
                          Thử V22-23
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">V24</td>
                      <td className="py-2.5 px-3">NVQLTS</td>
                      <td className="py-2.5 px-3">MH_TL06</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">Bấm nút "In hồ sơ / Xuất toàn bộ"</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">Xuất file trọn bộ 7 tài liệu kèm bìa hồ sơ lưu trữ</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleJump('DOSSIERS', 'NVQLTS', { dossierId: 'dos-008' })}
                          className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-medium hover:bg-emerald-800 cursor-pointer"
                        >
                          Thử V24
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
