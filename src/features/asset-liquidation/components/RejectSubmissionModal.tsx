import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, Send, Check } from 'lucide-react';
import { Submission } from '../types/asset';

interface RejectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onConfirmReject: (submissionId: string, reason: string) => void;
}

export const RejectSubmissionModal: React.FC<RejectSubmissionModalProps> = ({
  isOpen,
  onClose,
  submission,
  onConfirmReject,
}) => {
  if (!isOpen || !submission) return null;

  const [reason, setReason] = useState(
    'Cần bổ sung chứng thư thẩm định giá độc lập từ đơn vị có thẩm quyền theo quy định khoản 2 điều 15 và hình ảnh hiện trường chi tiết.'
  );

  const presets = [
    'Thiếu chứng thư thẩm định giá độc lập từ đơn vị có thẩm quyền theo quy định.',
    'Chưa có đầy đủ biên bản thẩm định hiện trạng có chữ ký xác nhận của đại diện đơn vị sử dụng tài sản.',
    'Hình ảnh chụp chi tiết hiện trạng thiết bị chưa rõ nét, cần bổ sung ảnh chụp chi tiết tem mác và tỷ lệ hư hỏng.',
    'Tờ trình chưa thống nhất phương án xử lý (bán đấu giá vs thanh lý phế liệu). Cần rà soát lại.',
    'Thiếu xác nhận về việc đã ghi giảm nguyên giá và trích khấu hao đến thời điểm hiện tại.',
  ];

  const handleApplyPreset = (text: string) => {
    setReason((prev) => (prev ? `${prev}\n- ${text}` : text));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do yêu cầu bổ sung!');
      return;
    }
    onConfirmReject(submission.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-300">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Yêu cầu trả bổ sung hồ sơ tờ trình
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Tờ trình: <span className="font-mono font-bold">{submission.code}</span> · {submission.department}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Submission summary banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Người lập tờ trình:</span>
              <span className="font-semibold text-slate-800">{submission.creatorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tổng giá trị còn lại:</span>
              <span className="font-mono font-bold text-blue-700">
                {submission.totalRemainingValue.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          {/* Quick preset templates */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Gợi ý lý do trả bổ sung nhanh (Click để chèn vào nội dung):
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left p-1.5 px-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{preset}</span>
                  <span className="text-amber-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                    + Thêm
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Reason Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-700 font-bold">
                Nội dung ý kiến chỉ đạo / Lý do trả bổ sung *
              </label>
              <span className="text-[10px] text-slate-400">{reason.length}/500 ký tự</span>
            </div>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập chi tiết các nội dung yêu cầu NVQLTS bổ sung trước khi phê duyệt..."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-amber-500 leading-relaxed font-normal"
              required
            />
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Khi xác nhận, Tờ trình sẽ đổi trạng thái thành <strong>&quot;Trả bổ sung&quot;</strong> (Chốt chặn 3), tự động gửi thông báo đến <strong>NVQLTS ({submission.creatorName})</strong> để chỉnh sửa hồ sơ và trình lại.
            </span>
          </div>

          {/* Action buttons */}
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
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xác nhận trả hồ sơ cho NVQLTS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
