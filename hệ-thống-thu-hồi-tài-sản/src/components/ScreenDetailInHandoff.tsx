import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  AlertCircle,
  Save,
  Camera,
  X,
  Upload,
  Calendar,
  User,
  Mail,
  Box,
  FileCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ReturnRecord, ReturnRecordItem, PhysicalCondition, OperatingStatus } from '../types/asset';
import { useApp } from '../context/AppContext';
import { QRScannerModal } from './QRScannerModal';

const PHYSICAL_CONDITIONS: PhysicalCondition[] = [
  'Mới / Tốt',
  'Trầy xước nhẹ',
  'Cũ / Đã sử dụng',
  'Móp méo / nứt vỡ',
];

const OPERATING_STATUSES: OperatingStatus[] = [
  'Hoạt động bình thường',
  'Lỗi màn hình',
  'Không lên nguồn',
  'Khác',
];

const DEFAULT_ACCESSORIES_MAP: Record<string, string[]> = {
  laptop: ['Sạc', 'Cáp', 'Chuột', 'Balo', 'Hộp'],
  monitor: ['Dây nguồn', 'Cáp HDMI', 'Cáp Type-C', 'Chân đế', 'Hộp'],
  printer: ['Dây nguồn', 'Cáp USB', 'Khay giấy', 'Hộp'],
  phone: ['Cáp sạc', 'Củ sạc', 'Tai nghe', 'Ốp lưng', 'Hộp'],
  tablet: ['Bút cảm ứng', 'Bao da', 'Cáp sạc', 'Củ sạc', 'Hộp'],
  default: ['Sạc', 'Cáp', 'Phụ kiện kèm máy'],
};

export const ScreenDetailInHandoff: React.FC<{ record: ReturnRecord }> = ({ record }) => {
  const {
    setView,
    scanAssetQR,
    saveItemCondition,
    reportAssetLost,
    cancelAssetLost,
    completeReturnRecord,
  } = useApp();

  const [activeScannerAssetId, setActiveScannerAssetId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form states for each asset currently being edited
  const [formStates, setFormStates] = useState<
    Record<
      string,
      {
        physicalCondition: PhysicalCondition | '';
        operatingStatus: OperatingStatus | '';
        operatingStatusOtherNote: string;
        accessories: string[];
        accessoryQuantities: Record<string, number>;
        missingAccessoriesNote: string;
        conditionNote: string;
        photos: string[];
        errors: {
          physical?: string;
          operating?: string;
          otherNote?: string;
          missingAcc?: string;
        };
        savedSuccess?: boolean;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};
    record.items.forEach((item) => {
      const allowedAcc =
        DEFAULT_ACCESSORIES_MAP[item.category] || DEFAULT_ACCESSORIES_MAP['default'];
      const currentAcc = item.accessories.length > 0 ? item.accessories : [...allowedAcc];
      const initialQuantities: Record<string, number> = {};
      currentAcc.forEach((acc) => {
        initialQuantities[acc] = item.accessoryQuantities?.[acc] || 1;
      });

      initial[item.assetId] = {
        physicalCondition: item.physicalCondition || '',
        operatingStatus: item.operatingStatus || '',
        operatingStatusOtherNote: item.operatingStatusOtherNote || '',
        accessories: currentAcc,
        accessoryQuantities: initialQuantities,
        missingAccessoriesNote: item.missingAccessoriesNote || '',
        conditionNote: item.conditionNote || '',
        photos: item.photos || [],
        errors: {},
        savedSuccess: !!item.physicalCondition,
      };
    });
    return initial;
  });

  // Reporting lost state for each asset
  const [lostReportStates, setLostReportStates] = useState<
    Record<string, { isOpen: boolean; reason: string; error?: string }>
  >({});

  const [generalError, setGeneralError] = useState<string | null>(null);

  // Calculate processed count
  const processedItems = record.items.filter((item) => {
    if (item.isLost && item.lostReason) return true;
    const form = formStates[item.assetId];
    if (item.scanned && form?.savedSuccess) return true;
    return false;
  });

  const remainingCount = record.items.length - processedItems.length;
  const isReadyToComplete = remainingCount === 0;

  const handleOpenScanner = (assetId: string) => {
    setActiveScannerAssetId(assetId);
    setIsScannerOpen(true);
    setGeneralError(null);
  };

  const handleScanSuccess = (assetCode: string) => {
    scanAssetQR(record.id, assetCode);
  };

  const handleToggleAccessory = (assetId: string, accName: string) => {
    setFormStates((prev) => {
      const current = prev[assetId] || {};
      const currentAcc = current.accessories || [];
      const currentQuantities = { ...(current.accessoryQuantities || {}) };
      const isSelected = currentAcc.includes(accName);

      const updatedAcc = isSelected
        ? currentAcc.filter((a: string) => a !== accName)
        : [...currentAcc, accName];

      if (!isSelected && !currentQuantities[accName]) {
        currentQuantities[accName] = 1;
      }

      return {
        ...prev,
        [assetId]: {
          ...current,
          accessories: updatedAcc,
          accessoryQuantities: currentQuantities,
          savedSuccess: false,
        },
      };
    });
  };

  const handleUpdateAccessoryQuantity = (assetId: string, accName: string, delta: number) => {
    setFormStates((prev) => {
      const current = prev[assetId] || {};
      const currentQuantities = { ...(current.accessoryQuantities || {}) };
      const currentQty = currentQuantities[accName] || 1;
      const newQty = Math.max(1, currentQty + delta);
      currentQuantities[accName] = newQty;

      return {
        ...prev,
        [assetId]: {
          ...current,
          accessoryQuantities: currentQuantities,
          savedSuccess: false,
        },
      };
    });
  };

  const handleSaveCondition = (assetId: string) => {
    const form = formStates[assetId];
    if (!form) return;

    const errors: typeof form.errors = {};
    if (!form.physicalCondition) {
      errors.physical = 'Vui lòng chọn tình trạng vật lý (BR07)';
    }
    if (!form.operatingStatus) {
      errors.operating = 'Vui lòng chọn trạng thái hoạt động (BR07)';
    }
    if (form.operatingStatus === 'Khác' && !form.operatingStatusOtherNote.trim()) {
      errors.otherNote = 'E5: Chọn "Khác" bắt buộc phải nhập ghi chú mô tả chi tiết!';
    }

    // Check if missing accessories without note
    const item = record.items.find((i) => i.assetId === assetId);
    const standardAcc = item
      ? DEFAULT_ACCESSORIES_MAP[item.category] || DEFAULT_ACCESSORIES_MAP['default']
      : [];
    const missingAccCount = standardAcc.length - form.accessories.length;
    if (missingAccCount > 0 && !form.missingAccessoriesNote.trim()) {
      errors.missingAcc = 'E5: Có phụ kiện bị thiếu, vui lòng nhập ghi chú phụ kiện còn thiếu!';
    }

    if (Object.keys(errors).length > 0) {
      setFormStates((prev) => ({
        ...prev,
        [assetId]: { ...prev[assetId], errors },
      }));
      return;
    }

    const res = saveItemCondition(record.id, assetId, {
      physicalCondition: form.physicalCondition,
      operatingStatus: form.operatingStatus,
      operatingStatusOtherNote: form.operatingStatusOtherNote,
      accessories: form.accessories,
      accessoryQuantities: form.accessoryQuantities,
      missingAccessoriesNote: form.missingAccessoriesNote,
      conditionNote: form.conditionNote,
      photos: form.photos,
    });

    if (res.success) {
      setFormStates((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          errors: {},
          savedSuccess: true,
        },
      }));
      setGeneralError(null);
    } else {
      setGeneralError(res.error || 'Có lỗi xảy ra khi lưu tình trạng.');
    }
  };

  const handleOpenLostForm = (assetId: string) => {
    setLostReportStates((prev) => ({
      ...prev,
      [assetId]: { isOpen: true, reason: '', error: undefined },
    }));
  };

  const handleConfirmLost = (assetId: string) => {
    const st = lostReportStates[assetId];
    if (!st || !st.reason.trim()) {
      setLostReportStates((prev) => ({
        ...prev,
        [assetId]: {
          isOpen: true,
          reason: st?.reason || '',
          error: 'E4: Báo mất nhưng bỏ trống Lý do mất. Bắt buộc nhập lý do! (BR08)',
        },
      }));
      return;
    }

    const res = reportAssetLost(record.id, assetId, st.reason);
    if (res.success) {
      setLostReportStates((prev) => ({
        ...prev,
        [assetId]: { isOpen: false, reason: '', error: undefined },
      }));
      setGeneralError(null);
    } else {
      setGeneralError(res.error || 'Không thể ghi nhận báo mất');
    }
  };

  const handleCancelLost = (assetId: string) => {
    setLostReportStates((prev) => ({
      ...prev,
      [assetId]: { isOpen: false, reason: '', error: undefined },
    }));
  };

  const handleAddSamplePhoto = (assetId: string) => {
    // Add realistic sample inspection photo
    const samplePhotos = [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
    ];
    setFormStates((prev) => {
      const cur = prev[assetId];
      const curPhotos = cur.photos || [];
      return {
        ...prev,
        [assetId]: {
          ...cur,
          photos: [...curPhotos, samplePhotos[curPhotos.length % samplePhotos.length]],
          savedSuccess: false,
        },
      };
    });
  };

  const handleComplete = () => {
    setGeneralError(null);
    const res = completeReturnRecord(record.id);
    if (!res.success) {
      setGeneralError(res.error || 'Chưa đủ điều kiện để hoàn tất.');
    }
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
              {/* Badge Đang bàn giao (STT 3) */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Đang bàn giao
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

      {generalError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-medium text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{generalError}</span>
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

      {/* 3. Danh sách tài sản cần quét & Tiến độ (STT 8, 9) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Danh sách tài sản ({record.items.length})
          </h3>
          {/* Bộ đếm tiến độ quét (STT 9) */}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            {processedItems.length}/{record.items.length} đã quét / xử lý
          </span>
        </div>

        {/* Danh sách từng tài sản (Thẻ tài sản M06, M07, M08) */}
        <div className="space-y-4">
          {record.items.map((item) => {
            const form = formStates[item.assetId] || {
              physicalCondition: '',
              operatingStatus: '',
              operatingStatusOtherNote: '',
              accessories: [],
              missingAccessoriesNote: '',
              conditionNote: '',
              photos: [],
              errors: {},
            };
            const lostState = lostReportStates[item.assetId] || { isOpen: false, reason: '' };
            const standardAccessories =
              DEFAULT_ACCESSORIES_MAP[item.category] || DEFAULT_ACCESSORIES_MAP['default'];
            const missingAccessories = standardAccessories.filter(
              (acc) => !form.accessories.includes(acc)
            );

            return (
              <div
                key={item.assetId}
                className={`bg-white rounded-xl border p-5 shadow-2xs space-y-4 transition-all ${
                  item.isLost
                    ? 'border-red-200 bg-red-50/20'
                    : item.scanned
                    ? 'border-emerald-200 bg-slate-50/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Thẻ tài sản (STT 10 / 18) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        item.isLost
                          ? 'bg-red-100 text-red-600'
                          : item.scanned
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {item.assetId}
                        </span>
                        {/* Badge Đã quét (STT 10.1) */}
                        {item.scanned && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 stroke-[3]" /> Đã quét
                          </span>
                        )}
                        {item.isLost && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" /> Báo mất
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {item.assetName} <span className="text-slate-300">·</span>{' '}
                        <span className="font-mono text-slate-500 text-[11px]">SN: {item.serial}</span>
                      </p>
                    </div>
                  </div>

                  {/* Hành động Quét QR hoặc Báo mất (STT 10.3, 10.4 / 19, 20) */}
                  {!item.isLost && !item.scanned && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Nút Quét QR (nền đen) */}
                      <button
                        type="button"
                        onClick={() => handleOpenScanner(item.assetId)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Quét QR</span>
                      </button>

                      {/* Nút Báo mất (viền đỏ) */}
                      <button
                        type="button"
                        onClick={() => handleOpenLostForm(item.assetId)}
                        className="px-3.5 py-1.5 border border-red-300 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Báo mất</span>
                      </button>
                    </div>
                  )}

                  {/* Khi tài sản đã quét hoặc báo mất, cho phép quét lại hoặc hủy báo mất */}
                  {(item.scanned || item.isLost) && (
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isLost ? (
                        <button
                          type="button"
                          onClick={() => cancelAssetLost(record.id, item.assetId)}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100"
                        >
                          <RotateCcw className="w-3 h-3" /> Hủy báo mất
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenScanner(item.assetId)}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100"
                        >
                          <QrCode className="w-3 h-3" /> Quét lại QR
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-info: Người dùng hiện tại & Ngày bắt đầu (STT 10.5, 10.6) */}
                <div className="text-[11px] text-slate-500 flex items-center gap-4">
                  <span>
                    Người dùng hiện tại:{' '}
                    <strong className="text-slate-700">{record.employeeName}</strong>
                  </span>
                  <span>
                    Ngày bắt đầu:{' '}
                    <strong className="text-slate-700 font-mono">{item.startDate}</strong>
                  </span>
                </div>

                {/* FORM GHI NHẬN TÌNH TRẠNG (Màn hình 7 & 8: khi item.scanned = true) */}
                {item.scanned && !item.isLost && (
                  <div className="space-y-4 pt-2 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tình trạng vật lý (STT 11) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tình trạng vật lý <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.physicalCondition}
                          onChange={(e) => {
                            const val = e.target.value as PhysicalCondition;
                            setFormStates((prev) => ({
                              ...prev,
                              [item.assetId]: {
                                ...prev[item.assetId],
                                physicalCondition: val,
                                savedSuccess: false,
                                errors: { ...prev[item.assetId]?.errors, physical: undefined },
                              },
                            }));
                          }}
                          className={`w-full text-xs px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            form.errors?.physical ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                          }`}
                        >
                          <option value="">— Chọn —</option>
                          {PHYSICAL_CONDITIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {form.errors?.physical && (
                          <p className="text-[11px] text-red-600 mt-1">{form.errors.physical}</p>
                        )}
                      </div>

                      {/* Trạng thái hoạt động (STT 12 - Màn hình 8) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Trạng thái hoạt động <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.operatingStatus}
                          onChange={(e) => {
                            const val = e.target.value as OperatingStatus;
                            setFormStates((prev) => ({
                              ...prev,
                              [item.assetId]: {
                                ...prev[item.assetId],
                                operatingStatus: val,
                                savedSuccess: false,
                                errors: { ...prev[item.assetId]?.errors, operating: undefined },
                              },
                            }));
                          }}
                          className={`w-full text-xs px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            form.errors?.operating ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                          }`}
                        >
                          <option value="">— Chọn —</option>
                          {OPERATING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {form.errors?.operating && (
                          <p className="text-[11px] text-red-600 mt-1">{form.errors.operating}</p>
                        )}
                      </div>
                    </div>

                    {/* Nếu chọn "Khác" ở Trạng thái hoạt động -> Bắt buộc nhập ghi chú (E5) */}
                    {form.operatingStatus === 'Khác' && (
                      <div>
                        <label className="block text-xs font-semibold text-red-600 mb-1">
                          Mô tả chi tiết trạng thái hoạt động (*)
                        </label>
                        <input
                          type="text"
                          value={form.operatingStatusOtherNote}
                          onChange={(e) =>
                            setFormStates((prev) => ({
                              ...prev,
                              [item.assetId]: {
                                ...prev[item.assetId],
                                operatingStatusOtherNote: e.target.value,
                                savedSuccess: false,
                                errors: { ...prev[item.assetId]?.errors, otherNote: undefined },
                              },
                            }))
                          }
                          placeholder="Mô tả cụ thể tình trạng lỗi hoạt động..."
                          className="w-full text-xs px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {form.errors?.otherNote && (
                          <p className="text-[11px] text-red-600 mt-1">{form.errors.otherNote}</p>
                        )}
                      </div>
                    )}

                    {/* Phụ kiện đi kèm */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-800">
                          Phụ kiện đi kèm
                        </label>
                        <span className="text-[11px] text-slate-500">
                          (Không chọn được hiểu là thiếu)
                        </span>
                      </div>

                      {/* Danh sách chip phụ kiện */}
                      <div className="flex flex-wrap gap-2">
                        {standardAccessories.map((acc) => {
                          const isSelected = form.accessories.includes(acc);
                          return (
                            <button
                              key={acc}
                              type="button"
                              onClick={() => handleToggleAccessory(item.assetId, acc)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border border-blue-400 bg-blue-50/70 text-blue-600 font-semibold shadow-2xs'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                              <span>{acc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Khung điều chỉnh số lượng từng phụ kiện đã chọn */}
                      {form.accessories.length > 0 && (
                        <div className="mt-3 p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap gap-2.5 items-center">
                          {form.accessories.map((acc) => {
                            const qty = form.accessoryQuantities?.[acc] || 1;
                            return (
                              <div
                                key={acc}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-700 shadow-2xs"
                              >
                                <span className="font-medium text-slate-800 whitespace-nowrap">{acc}:</span>
                                <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAccessoryQuantity(item.assetId, acc, -1)}
                                    disabled={qty <= 1}
                                    className="w-5 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-35 disabled:cursor-not-allowed select-none text-xs font-semibold"
                                    title="Giảm số lượng"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold text-slate-900 tabular-nums select-none">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAccessoryQuantity(item.assetId, acc, 1)}
                                    className="w-5 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors select-none text-xs font-semibold"
                                    title="Tăng số lượng"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Cảnh báo thiếu phụ kiện (STT 13.1) */}
                      {missingAccessories.length > 0 && (
                        <p className="text-[11px] font-medium text-amber-700 mt-2.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Nếu thiếu phụ kiện, vui lòng ghi chú bên dưới.</span>
                        </p>
                      )}
                    </div>

                    {/* Ghi chú phụ kiện nếu thiếu (STT 14) */}
                    {missingAccessories.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Ghi chú phụ kiện (nếu thiếu):
                        </label>
                        <input
                          type="text"
                          value={form.missingAccessoriesNote}
                          onChange={(e) =>
                            setFormStates((prev) => ({
                              ...prev,
                              [item.assetId]: {
                                ...prev[item.assetId],
                                missingAccessoriesNote: e.target.value,
                                savedSuccess: false,
                                errors: { ...prev[item.assetId]?.errors, missingAcc: undefined },
                              },
                            }))
                          }
                          placeholder="VD: Thiếu cáp sạc, chuột không dây..."
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {form.errors?.missingAcc && (
                          <p className="text-[11px] text-red-600 mt-1">{form.errors.missingAcc}</p>
                        )}
                      </div>
                    )}

                    {/* Ghi chú tình trạng (STT 15) */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Ghi chú hiện trạng:
                      </label>
                      <input
                        type="text"
                        value={form.conditionNote}
                        onChange={(e) =>
                          setFormStates((prev) => ({
                            ...prev,
                            [item.assetId]: {
                              ...prev[item.assetId],
                              conditionNote: e.target.value,
                              savedSuccess: false,
                            },
                          }))
                        }
                        placeholder="VD: Vết xước ở góc trái mặt lưng kim loại..."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Hình ảnh hiện trạng (STT 16) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          Hình ảnh hiện trạng thiết bị:
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddSamplePhoto(item.assetId)}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Camera className="w-3 h-3" /> Đính kèm ảnh mẫu kiểm tra
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {form.photos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group"
                          >
                            <img
                              src={photoUrl}
                              alt="Hiện trạng tài sản"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newP = form.photos.filter((_, i) => i !== idx);
                                setFormStates((prev) => ({
                                  ...prev,
                                  [item.assetId]: { ...prev[item.assetId], photos: newP },
                                }));
                              }}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nút Lưu tình trạng (STT 17) */}
                    <div className="pt-2 flex items-center justify-between">
                      {form.savedSuccess ? (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đã lưu thông tin kiểm tra tài sản này
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Bấm lưu để hoàn tất thông tin tài sản này
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveCondition(item.assetId)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu tình trạng</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM BÁO MẤT (STT 21, 21.1, 21.2) */}
                {lostState.isOpen && (
                  <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-red-700 mb-1">
                        Lý do mất tài sản <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lostState.reason}
                        onChange={(e) =>
                          setLostReportStates((prev) => ({
                            ...prev,
                            [item.assetId]: { ...prev[item.assetId], reason: e.target.value, error: undefined },
                          }))
                        }
                        placeholder="Nhập cụ thể lý do mất tài sản..."
                        className="w-full text-xs px-3 py-2 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {lostState.error && (
                        <p className="text-[11px] text-red-600 mt-1">{lostState.error}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelLost(item.assetId)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmLost(item.assetId)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Xác nhận báo mất
                      </button>
                    </div>
                  </div>
                )}

                {/* Khi tài sản đã ở trạng thái Mất */}
                {item.isLost && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                    <strong>Đã ghi nhận báo mất:</strong> {item.lostReason} (Miễn quét QR theo BR08)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Vùng nút thao tác (STT 23, 24 / Màn hình 6, 7 & 8) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Nút Hủy (STT 23: A3 - thông tin đã lưu được giữ, biên bản vẫn ở Đang bàn giao) */}
        <button
          onClick={() => setView('list')}
          className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
        >
          Hủy (Lưu tạm và thoát)
        </button>

        {/* Nút Hoàn tất hoặc Cần quét đủ n tài sản nữa (STT 12/24) */}
        {isReadyToComplete ? (
          <button
            onClick={handleComplete}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Hoàn tất bàn giao</span>
          </button>
        ) : (
          <button
            disabled
            title="Cần quét QR hoặc báo mất đầy đủ cho tất cả tài sản trong biên bản"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Cần quét đủ {remainingCount} tài sản nữa</span>
          </button>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        record={record}
        targetAssetId={activeScannerAssetId || undefined}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
