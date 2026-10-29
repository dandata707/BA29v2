import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Send,
  FileText,
  Trash2,
  Calendar,
  User,
  Mail,
  Box,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Play,
  BellRing,
} from 'lucide-react';
import { ReturnRecord } from '../types/asset';
import { useApp } from '../context/AppContext';

export const ScreenDetailPending: React.FC<{ record: ReturnRecord }> = ({ record }) => {
  const { setView, sendNotificationToEmployee, startHandoffProcess, cancelReturnRecord } = useApp();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Modal cảnh báo khi nhân viên chưa xác nhận
  const [showUnconfirmedDialog, setShowUnconfirmedDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState<
    'nhân viên mang tài sản đến trực tiếp' | 'không truy cập được hệ thống' | 'khác'
  >('nhân viên mang tài sản đến trực tiếp');
  const [customOverrideReason, setCustomOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      sendNotificationToEmployee(record.id, true);
      setIsResending(false);
    }, 400);
  };

  // Chỉ một nút Bắt đầu bàn giao, luôn bấm được
  const handleStartHandoffClick = () => {
    if (record.employeeConfirmed) {
      startHandoffProcess(record.id);
    } else {
      setOverrideError('');
      setShowUnconfirmedDialog(true);
    }
  };

  const handleConfirmStartWithReason = () => {
    let finalReason: string = overrideReason;
    if (overrideReason === 'khác') {
      if (!customOverrideReason.trim()) {
        setOverrideError('Vui lòng nhập lý do cụ thể khi chọn "Khác"');
        return;
      }
      finalReason = customOverrideReason.trim();
    }
    startHandoffProcess(record.id, finalReason);
    setShowUnconfirmedDialog(false);
  };

  const handleConfirmCancel = () => {
    cancelReturnRecord(record.id, cancelReason || 'NVQLTS hủy biên bản ở trạng thái Chờ bàn giao');
    setShowCancelDialog(false);
    setView('list');
  };

  // Check BR10: Overdue logic simulation (if created > 3 days or scheduled date passed)
  const isOverdue = !record.employeeConfirmed && new Date(record.scheduledDate).getTime() < Date.now();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* 1. Vùng tiêu đề (STT 1, 2, 3, 4) */}
      <div className="space-y-3">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Danh sách biên bản</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {record.id}
              </h2>
              {/* Badge Chờ bàn giao (STT 3) */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                Chờ bàn giao
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
        </div>
      </div>

      {/* Tình trạng phản hồi của nhân viên & Nhắc nhở quá hạn (BR10) */}
      {record.employeeConfirmed ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Nhân viên đã xác nhận cam kết mang tài sản đến bàn giao đúng hẹn (Vào lúc {record.employeeConfirmedAt || '2026-03-22'}).
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Đã đồng ý
          </span>
        </div>
      ) : (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-blue-800">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Đã gửi thông báo đến nhân viên. Đang chờ nhân viên mở và xác nhận cam kết bàn giao trên tài khoản của họ.
            </span>
          </div>
          <button
            onClick={() => {
              setView('employee_confirm', record.id);
            }}
            className="text-[11px] text-blue-700 font-semibold underline shrink-0 hover:text-blue-900"
          >
            Mở xem góc nhìn nhân viên (M10)
          </button>
        </div>
      )}

      {/* 2. Khối thông tin biên bản (STT 5, 6, 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Lịch bàn giao
          </span>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 font-mono">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{record.scheduledDate}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Người tạo
          </span>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User className="w-4 h-4 text-slate-500" />
            <span>{record.createdBy}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Email nhân viên
          </span>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800 truncate">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{record.employeeEmail}</span>
          </div>
        </div>
      </div>

      {/* 3. Danh sách tài sản (STT 8, 9) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Danh sách tài sản ({record.items.length})
          </h3>
          <span className="text-xs text-slate-500">
            Nhân viên sẽ mang tài sản đến đối chiếu vào ngày bàn giao hẹn trước
          </span>
        </div>

        <div className="space-y-2.5">
          {record.items.map((item) => (
            <div
              key={item.assetId}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {item.assetId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    {item.assetName} <span className="text-slate-300">·</span>{' '}
                    <span className="font-mono text-slate-500 text-[11px]">SN: {item.serial}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Người dùng hiện tại: <span className="text-slate-800 font-medium">{record.employeeName}</span>{' '}
                    <span className="text-slate-300">|</span> Ngày bắt đầu: {item.startDate}
                  </p>
                </div>
              </div>

              {/* Nút Quét QR (STT 9.4: Disabled ở trạng thái Chờ bàn giao) */}
              <div className="shrink-0 flex items-center">
                <button
                  disabled
                  title="Chưa dùng được ở trạng thái Chờ bàn giao. Chỉ kích hoạt khi biên bản chuyển sang Đang bàn giao."
                  className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Quét QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Vùng nút thao tác (STT 10, 11, 12) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Nút Hủy (STT 10) */}
        <button
          onClick={() => setShowCancelDialog(true)}
          className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hủy</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          {/* Nút Gửi lại thông báo cho nhân viên */}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="flex-1 sm:flex-initial px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isResending ? 'Đang gửi lại...' : 'Gửi lại thông báo cho nhân viên'}</span>
          </button>

          {/* Chỉ MỘT nút Bắt đầu bàn giao, luôn bấm được */}
          <button
            onClick={handleStartHandoffClick}
            className="flex-1 sm:flex-initial px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Bắt đầu bàn giao</span>
          </button>
        </div>
      </div>

      {/* Modal cảnh báo khi nhân viên chưa xác nhận */}
      {showUnconfirmedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  Nhân viên chưa xác nhận, vẫn bắt đầu bàn giao?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nhân viên chưa xác nhận cam kết bàn giao trên hệ thống. Để tiếp tục, vui lòng chọn lý do:
                </p>
              </div>
            </div>

            {/* Các tùy chọn lý do */}
            <div className="space-y-2.5 pt-1">
              <label
                onClick={() => setOverrideReason('nhân viên mang tài sản đến trực tiếp')}
                className={`p-3 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                  overrideReason === 'nhân viên mang tài sản đến trực tiếp'
                    ? 'border-blue-500 bg-blue-50/50 text-slate-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="overrideReason"
                  checked={overrideReason === 'nhân viên mang tài sản đến trực tiếp'}
                  onChange={() => setOverrideReason('nhân viên mang tài sản đến trực tiếp')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Nhân viên mang tài sản đến trực tiếp</span>
              </label>

              <label
                onClick={() => setOverrideReason('không truy cập được hệ thống')}
                className={`p-3 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                  overrideReason === 'không truy cập được hệ thống'
                    ? 'border-blue-500 bg-blue-50/50 text-slate-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="overrideReason"
                  checked={overrideReason === 'không truy cập được hệ thống'}
                  onChange={() => setOverrideReason('không truy cập được hệ thống')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Không truy cập được hệ thống</span>
              </label>

              <label
                onClick={() => setOverrideReason('khác')}
                className={`p-3 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                  overrideReason === 'khác'
                    ? 'border-blue-500 bg-blue-50/50 text-slate-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="overrideReason"
                  checked={overrideReason === 'khác'}
                  onChange={() => setOverrideReason('khác')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Khác</span>
              </label>

              {/* Ô nhập cụ thể khi chọn "Khác" */}
              {overrideReason === 'khác' && (
                <div className="pl-7 pt-1">
                  <input
                    type="text"
                    value={customOverrideReason}
                    onChange={(e) => {
                      setCustomOverrideReason(e.target.value);
                      setOverrideError('');
                    }}
                    placeholder="Nhập lý do cụ thể..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {overrideError && (
                    <p className="text-[11px] text-red-600 mt-1">{overrideError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUnconfirmedDialog(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmStartWithReason}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tiếp tục bàn giao</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận Hủy biên bản */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Xác nhận hủy biên bản thu hồi</h4>
                <p className="text-xs text-slate-500">Biên bản sẽ bị đóng và giải phóng các tài sản này (BR03)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Lý do hủy:
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy bỏ biên bản..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
