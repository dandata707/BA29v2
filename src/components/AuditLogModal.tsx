import React from 'react';
import { History, X, Clock, User, ShieldCheck } from 'lucide-react';
import { Asset } from '../types/asset.ts';
import { formatDateTimeVN } from '../utils/assetRules.ts';

interface AuditLogModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ asset, isOpen, onClose }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Nhật ký kiểm toán & Lịch sử thay đổi
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã tài sản: <span className="font-bold text-slate-700">{asset.maTaiSan}</span> ({asset.tenTaiSan})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng nhật ký"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Theo <strong>BR_GN_12</strong>, mọi hành động thêm mới, sửa, xóa mềm và tạo tem đều được lưu vết thời gian, người thực hiện và dữ liệu đối chiếu bất biến.
            </span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pt-2">
            {asset.lichSu && asset.lichSu.length > 0 ? (
              asset.lichSu.map((log, idx) => (
                <div key={log.id || idx} className="relative pl-6">
                  {/* Circle dot on timeline */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    log.actionType === 'Tạo mới' ? 'bg-emerald-500' :
                    log.actionType === 'Xóa mềm' ? 'bg-red-500' :
                    log.actionType === 'Cập nhật thông tin' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        log.actionType === 'Tạo mới' ? 'bg-emerald-100 text-emerald-800' :
                        log.actionType === 'Xóa mềm' ? 'bg-red-100 text-red-800' :
                        log.actionType === 'Cập nhật thông tin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {log.actionType}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTimeVN(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {log.details}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.operatorName}
                      </span>
                      <span className="text-slate-400">
                        Vai trò: {log.operatorRole}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pl-6 text-xs text-slate-400">
                Chưa có bản ghi nhật ký nào.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Số phiên thao tác ghi nhận: <strong>{asset.lichSu?.length || 0}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
