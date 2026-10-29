import React, { useState } from 'react';
import {
  CheckSquare,
  Box,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Building,
  User,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReturnRecord } from '../types/asset';
import { PrintableDocument } from './PrintableDocument';

export const ScreenEmployeeConfirm: React.FC = () => {
  const {
    records,
    currentEmployee,
    employeeConfirmHandoff,
    selectedRecordId,
    setView,
  } = useApp();

  // Find target record: either explicitly selected record or the first pending/draft record assigned to this employee
  const employeeRecords = records.filter(
    (r) =>
      r.employeeId === currentEmployee.id && r.status !== 'draft'
  );

  const [activeRecordId, setActiveRecordId] = useState<string>(() => {
    if (selectedRecordId && employeeRecords.some((r) => r.id === selectedRecordId)) {
      return selectedRecordId;
    }
    const pending = employeeRecords.find((r) => r.status === 'pending_handoff');
    return pending ? pending.id : employeeRecords[0]?.id || '';
  });

  const record = employeeRecords.find((r) => r.id === activeRecordId);

  const [committed, setCommitted] = useState<boolean>(record?.employeeConfirmed || false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showPrint, setShowPrint] = useState(false);

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center space-y-3">
        <h3 className="text-base font-semibold text-slate-800">Không tìm thấy biên bản thu hồi</h3>
        <p className="text-xs text-slate-500">Chưa có biên bản thu hồi nào được gửi tới tài khoản này.</p>
        <button
          onClick={() => setView('list')}
          className="px-3.5 py-1.5 text-xs bg-slate-900 text-white rounded-lg"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!committed) {
      setErrorMsg('Vui lòng tích chọn ô cam kết bàn giao trước khi bấm xác nhận!');
      setSuccessMsg('');
      return;
    }

    const res = employeeConfirmHandoff(record.id);
    if (res.success) {
      setSuccessMsg('Đã xác nhận cam kết bàn giao tài sản thành công! Thông báo đã gửi tới Phòng HCNS.');
      setErrorMsg('');
    } else {
      setErrorMsg(res.error || 'Có lỗi xảy ra khi xác nhận');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Nút quay lại & Selector biên bản nếu nhân viên có nhiều biên bản */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại phân hệ</span>
        </button>

        {employeeRecords.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Xem biên bản:</span>
            <select
              value={record.id}
              onChange={(e) => {
                setActiveRecordId(e.target.value);
                setView('employee_confirm', e.target.value);
                const target = records.find((r) => r.id === e.target.value);
                setCommitted(target?.employeeConfirmed || false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {employeeRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.employeeName} ({r.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. Vùng tiêu đề (STT 1, 2) */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Xác nhận biên bản thu hồi
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Mã biên bản: <span className="font-bold text-slate-800">{record.id}</span>
        </p>
      </div>

      {/* Thông báo kết quả xác nhận */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-medium text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-medium text-red-700 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thẻ “Biên bản thu hồi tài sản” (STT 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Tiêu đề thẻ (STT 3) */}
        <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Biên bản thu hồi tài sản
          </h3>
          {record.employeeConfirmed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Đã xác nhận ({record.employeeConfirmedAt || '2026-03-22'})
            </span>
          )}
        </div>

        {/* Thông tin biên bản (STT 4, 5, 6, 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Nhân viên: </span>
            <strong className="text-slate-900 font-semibold">{record.employeeName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Phòng ban: </span>
            <strong className="text-slate-900 font-semibold">{record.department}</strong>
          </div>
          <div>
            <span className="text-slate-500">Lý do: </span>
            <span className="text-slate-800">{record.reason}</span>
          </div>
          <div>
            <span className="text-slate-500">Lịch bàn giao: </span>
            <strong className="text-slate-900 font-mono font-semibold">{record.scheduledDate}</strong>
          </div>
        </div>

        {/* Danh sách tài sản trong biên bản (STT 8) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 block">
            Danh mục tài sản ({record.items.length}):
          </span>

          <div className="space-y-3">
            {record.items.map((item, index) => (
              <div
                key={item.assetId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3.5"
              >
                {/* Icon tài sản (STT 8.1) */}
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4" />
                </div>

                <div className="space-y-1.5 min-w-0 flex-1 text-xs">
                  {/* Số thứ tự, mã và tên tài sản (STT 8.2) */}
                  <p className="font-bold text-slate-900">
                    {index + 1}. {item.assetId} — {item.assetName}
                  </p>

                  {/* Tình trạng (STT 8.3) */}
                  <p className="text-slate-600">
                    <span className="text-slate-500">Tình trạng: </span>
                    {item.isLost ? (
                      <span className="text-red-600 font-medium">Mất · -</span>
                    ) : (
                      <span className="text-slate-800 font-medium">
                        {item.physicalCondition || 'Tốt'} · {item.operatingStatus || 'Hoạt động bình thường'}
                      </span>
                    )}
                  </p>

                  {/* Phụ kiện (STT 8.4) */}
                  <p className="text-slate-600">
                    <span className="text-slate-500">Phụ kiện: </span>
                    <span className="text-slate-800">
                      {item.isLost
                        ? '-'
                        : item.accessories && item.accessories.length > 0
                        ? item.accessories
                            .map((acc) => {
                              const q = item.accessoryQuantities?.[acc];
                              return q && q > 1 ? `${acc} (x${q})` : acc;
                            })
                            .join(', ')
                        : '-'}
                    </span>
                  </p>

                  {/* Ghi chú (STT 8.5) - chỉ hiển thị khi có ghi chú */}
                  {item.conditionNote && (
                    <p className="text-slate-600">
                      <span className="text-slate-500">Ghi chú: </span>
                      <span className="italic text-slate-700">{item.conditionNote}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vùng xác nhận (STT 9, 10) */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          {/* Ô cam kết bàn giao (STT 9) */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="employeeCommitCheck"
              checked={committed}
              disabled={record.employeeConfirmed || record.status !== 'pending_handoff'}
              onChange={(e) => {
                setCommitted(e.target.checked);
                setErrorMsg('');
              }}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="employeeCommitCheck"
              className="text-xs text-slate-800 cursor-pointer select-none leading-relaxed font-medium"
            >
              Tôi đã xem và xác nhận sẽ bàn giao tài sản đúng hẹn
            </label>
          </div>

          {/* Nút Xác nhận (STT 10: Nền xanh, có icon dấu tích) */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Quy trình UC03: Xác nhận biên bản điện tử
            </span>

            {record.employeeConfirmed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bạn đã hoàn thành xác nhận</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={record.status !== 'pending_handoff'}
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Xác nhận</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {record.status === 'completed' && <button onClick={() => setShowPrint(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">In / Lưu PDF biên bản</button>}
      {showPrint && record.status === 'completed' && <PrintableDocument record={record} onClose={() => setShowPrint(false)} />}
    </div>
  );
};
