import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Laptop,
  Monitor,
  Printer,
  Smartphone,
  Tablet,
  Box,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ScreenCreateRecord: React.FC = () => {
  const { employees, assets, records, createReturnRecord, setView } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [reason, setReason] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isSudden, setIsSudden] = useState<boolean>(false);

  // Field validation error states (E3)
  const [errors, setErrors] = useState<{
    employee?: string;
    reason?: string;
    scheduledDate?: string;
    assets?: string;
    general?: string;
  }>({});

  // Active records to verify BR03 (asset cannot be in another unresolved return record)
  const unresolvedRecords = records.filter(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  );

  // Filter assets currently held by selected employee (BR02)
  const employeeAssets = selectedEmpId
    ? assets.filter(
        (a) => a.currentUserId === selectedEmpId && a.status === 'in_use'
      )
    : [];

  // When selecting employee, automatically select all available assets by default as per SRS mockup
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    setErrors((prev) => ({ ...prev, employee: undefined, assets: undefined, general: undefined }));

    if (empId) {
      const heldAssets = assets.filter(
        (a) => a.currentUserId === empId && a.status === 'in_use'
      );
      // Only select those not blocked by BR03
      const availableIds = heldAssets
        .filter((a) => !unresolvedRecords.some((rec) => rec.items.some((it) => it.assetId === a.id)))
        .map((a) => a.id);

      setSelectedAssetIds(availableIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
    setErrors((prev) => ({ ...prev, assets: undefined }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-slate-700" />;
      case 'monitor':
        return <Monitor className="w-5 h-5 text-slate-700" />;
      case 'printer':
        return <Printer className="w-5 h-5 text-slate-700" />;
      case 'phone':
        return <Smartphone className="w-5 h-5 text-slate-700" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-slate-700" />;
      default:
        return <Box className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!selectedEmpId) {
      newErrors.employee = 'Vui lòng chọn nhân viên có tài sản cần thu hồi';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do thu hồi tài sản';
    }

    if (!scheduledDate) {
      newErrors.scheduledDate = 'Vui lòng chọn ngày hẹn bàn giao';
    } else {
      // E3: Ngày bàn giao không được nhỏ hơn ngày hiện tại (trừ trường hợp khẩn cấp/đột xuất)
      const today = new Date().toISOString().split('T')[0];
      if (scheduledDate < today && !isSudden) {
        newErrors.scheduledDate = 'Ngày bàn giao không được nhỏ hơn ngày hiện tại (E3)';
      }
    }

    if (selectedEmpId && employeeAssets.length === 0) {
      newErrors.general = 'E1: Đối tượng không có tài sản đang giữ, hệ thống không cho lưu.';
    } else if (selectedAssetIds.length === 0) {
      newErrors.assets = 'BR01: Mỗi biên bản thu hồi bắt buộc phải chọn ít nhất một tài sản.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = createReturnRecord({
      employeeId: selectedEmpId,
      reason: reason.trim(),
      scheduledDate,
      assetIds: selectedAssetIds,
      isSudden,
    });

    if (!res.success) {
      setErrors({ general: res.error });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 1. Vùng tiêu đề (STT 1, 2, 3) */}
      <div className="mb-6">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-3 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Tạo biên bản thu hồi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Chọn nhân viên, hệ thống liệt kê tài sản đang giữ.
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* 2. Biểu mẫu tạo biên bản (Màn hình 2 & 3) */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        {/* Trường Nhân viên (*) (STT 4) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nhân viên <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.employee ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
            }`}
          >
            <option value="">— Chọn nhân viên —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} · {emp.department}
              </option>
            ))}
          </select>
          {errors.employee && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.employee}
            </p>
          )}
        </div>

        {/* Khi chưa chọn nhân viên: Hộp lưu ý màu vàng nhạt (STT 7 - Màn hình 2) */}
        {!selectedEmpId && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Sau khi chọn nhân viên, list danh sách tài sản nhân viên đó đang giữ sẽ được hiển thị trong biên bản.
            </p>
          </div>
        )}

        {/* Khi đã chọn nhân viên: Hiển thị danh sách tài sản đang giữ (STT 5, 6 - Màn hình 3) */}
        {selectedEmpId && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Tài sản đang giữ</span>
                <span className="text-xs text-slate-500">
                  ({employeeAssets.length} thiết bị được tìm thấy)
                </span>
              </div>
              <span className="text-xs font-semibold text-blue-600">
                Đã chọn: {selectedAssetIds.length} tài sản
              </span>
            </div>

            {employeeAssets.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                Nhân viên này hiện không nắm giữ tài sản nào đang sử dụng (BR02).
              </div>
            ) : (
              <div className="space-y-2">
                {employeeAssets.map((asset) => {
                  const isChecked = selectedAssetIds.includes(asset.id);
                  // Check BR03 / E2: Conflicting active record
                  const conflictingRecord = unresolvedRecords.find((rec) =>
                    rec.items.some((it) => it.assetId === asset.id)
                  );

                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (!conflictingRecord) toggleAsset(asset.id);
                      }}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        conflictingRecord
                          ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'border-blue-400 bg-blue-50/40 cursor-pointer shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {asset.id}
                            </span>
                            {conflictingRecord && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Đang xử lý ở {conflictingRecord.id} (BR03)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate">
                            {asset.name} <span className="text-slate-300">·</span>{' '}
                            <span className="font-mono text-slate-500">SN: {asset.serial}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <input
                          type="checkbox"
                          disabled={!!conflictingRecord}
                          checked={isChecked}
                          onChange={() => {
                            if (!conflictingRecord) toggleAsset(asset.id);
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.assets && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.assets}
              </p>
            )}
          </div>
        )}

        {/* Trường Lý do thu hồi (*) (STT 5 / 7) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lý do thu hồi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrors((prev) => ({ ...prev, reason: undefined }));
            }}
            placeholder="VD: Nghỉ việc, chuyển phòng ban, hết hạn hợp đồng..."
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.reason ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
            }`}
          />
          {errors.reason && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.reason}
            </p>
          )}
        </div>

        {/* Trường Lịch bàn giao (*) (STT 6 / 8) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lịch bàn giao <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                setErrors((prev) => ({ ...prev, scheduledDate: undefined }));
              }}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all ${
                errors.scheduledDate ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.scheduledDate && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.scheduledDate}
            </p>
          )}
        </div>

        {/* Tùy chọn thu hồi đột xuất */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isSuddenCheck"
            checked={isSudden}
            onChange={(e) => setIsSudden(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="isSuddenCheck" className="text-xs text-slate-700 cursor-pointer select-none">
            Thu hồi khẩn cấp / Đột xuất (Không áp dụng quy tắc cảnh báo tối thiểu 3 ngày làm việc)
          </label>
        </div>

        {/* 3. Vùng nút thao tác (STT 8, 9 - Màn hình 2 & 3) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tạo biên bản</span>
          </button>
        </div>
      </form>
    </div>
  );
};
