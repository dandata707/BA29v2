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
  AlertTriangle,
} from 'lucide-react';
import { ReturnRecord } from '../types/asset';
import { useApp } from '../context/AppContext';

export const ScreenDetailDraft: React.FC<{ record: ReturnRecord }> = ({ record }) => {
  const { setView, sendNotificationToEmployee, cancelReturnRecord } = useApp();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = () => {
    setIsSending(true);
    setTimeout(() => {
      sendNotificationToEmployee(record.id, false);
      setIsSending(false);
    }, 400);
  };

  const handleConfirmCancel = () => {
    cancelReturnRecord(record.id, cancelReason || 'NVQLTS hủy biên bản ở trạng thái Nháp');
    setShowCancelDialog(false);
    setView('list');
  };

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
              {/* Badge Nháp (STT 3) */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-500" />
                Nháp
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
            Tài sản được tiếp nhận sau khi gửi thông báo và chuyển sang bước Bàn giao
          </span>
        </div>

        <div className="space-y-2.5">
          {record.items.map((item) => (
            <div
              key={item.assetId}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Cột trái */}
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

              {/* Nút Quét QR (STT 9.4: Disabled nền xám ở trạng thái Nháp) */}
              <div className="shrink-0 flex items-center">
                <button
                  disabled
                  title="Chưa dùng được ở trạng thái Nháp. Chỉ kích hoạt khi biên bản chuyển sang Đang bàn giao."
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
          {/* Nút Bắt đầu bàn giao (STT 11: Disabled nền xanh nhạt) */}
          <button
            disabled
            title="Chưa dùng được vì chưa gửi thông báo cho nhân viên"
            className="flex-1 sm:flex-initial px-4 py-2 bg-blue-100 text-blue-400 text-xs font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bắt đầu bàn giao</span>
          </button>

          {/* Nút Gửi thông báo cho nhân viên (STT 12: Enabled xanh đậm có icon gửi) */}
          <button
            onClick={handleSendNotification}
            disabled={isSending}
            className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Đang gửi thông báo...' : 'Gửi thông báo cho nhân viên'}</span>
          </button>
        </div>
      </div>

      {/* Modal xác nhận Hủy biên bản */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Xác nhận hủy biên bản</h4>
                <p className="text-xs text-slate-500">Thao tác này sẽ chuyển biên bản sang trạng thái Đã hủy</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Lý do hủy (tùy chọn):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy biên bản..."
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
