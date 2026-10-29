import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Printer, 
  Eye, 
  UploadCloud, 
  FolderArchive, 
  FileText,
  FileSpreadsheet,
  Check,
  Calendar
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Asset } from '../types/asset';
import { DossierPrintModal } from '../components/DossierPrintModal';
import { SupplementDocModal } from '../components/SupplementDocModal';

interface ClosingScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

const STANDARD_CHECKLIST = [
  { id: 1, name: 'Đề nghị thanh lý', docType: 'PROPOSAL' },
  { id: 2, name: 'Danh mục tài sản', docType: 'INVENTORY' },
  { id: 3, name: 'Biên bản kiểm tra hiện trạng', docType: 'INSPECTION' },
  { id: 4, name: 'Tờ trình thanh lý', docType: 'SUBMISSION' },
  { id: 5, name: 'Quyết định thanh lý', docType: 'DECISION' },
  { id: 6, name: 'Hợp đồng mua bán', docType: 'CONTRACT' },
  { id: 7, name: 'Biên bản bàn giao', docType: 'DELIVERY' },
];

export const ClosingScreen: React.FC<ClosingScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser,
    dossiers, 
    decisions, 
    assets, 
    submissions,
    selectedDossierId, 
    setSelectedDossierId, 
    supplementDossierChecklistItem,
    closeDossier 
  } = useAssetContext();

  const isNVQLTS = currentUser.role === 'NVQLTS';

  // Selected dossier
  const currentDossier = useMemo(() => {
    return (
      dossiers.find((d) => d.id === selectedDossierId || d.decisionCode === selectedDossierId) ||
      dossiers[0]
    );
  }, [dossiers, selectedDossierId]);

  // Decision linked
  const relatedDecision = useMemo(() => {
    return decisions.find(
      (d) => d.id === currentDossier?.decisionId || d.code === currentDossier?.decisionCode
    );
  }, [decisions, currentDossier]);

  // Submission linked
  const relatedSubmission = useMemo(() => {
    if (!relatedDecision) return null;
    return submissions.find((s) => s.code === relatedDecision.submissionId || s.id === relatedDecision.submissionId);
  }, [submissions, relatedDecision]);

  // Contract code
  const contractCode = useMemo(() => {
    if (currentDossier?.contractCode) return currentDossier.contractCode;
    if (relatedDecision?.batches && relatedDecision.batches.length > 0) {
      return relatedDecision.batches[0].contractCode;
    }
    const contractItem = currentDossier?.checklist.find((c) => c.id === 6);
    if (contractItem?.docCode) return contractItem.docCode;
    return 'HĐMB-2026-015-D1';
  }, [currentDossier, relatedDecision]);

  // Combined code
  const decisionAndContractCombined = useMemo(() => {
    const qd = currentDossier?.decisionCode || 'QĐ-2026-015';
    return `${qd} / ${contractCode}`;
  }, [currentDossier, contractCode]);

  // Assets
  const liquidatedAssets: Asset[] = useMemo(() => {
    if (!currentDossier) return [];
    if (
      currentDossier.id === 'dos-2026-015' || 
      currentDossier.id === 'dos-015' || 
      currentDossier.decisionCode === 'QĐ-2026-015'
    ) {
      return assets.filter((a) => a.id === 'TS-001' || a.id === 'TS-002');
    }
    if (relatedSubmission && relatedSubmission.assetIds.length > 0) {
      return assets.filter((a) => relatedSubmission.assetIds.includes(a.id));
    }
    return assets.filter((a) => a.status === 'DA_THANH_LY');
  }, [assets, currentDossier, relatedSubmission]);

  // Ghi chú
  const [closingNote, setClosingNote] = useState<string>(currentDossier?.note || '');

  useEffect(() => {
    setClosingNote(currentDossier?.note || '');
  }, [currentDossier?.id]);

  // Modals & toast
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [itemToSupplement, setItemToSupplement] = useState<{
    id: number;
    name: string;
    docCode?: string;
    fileName?: string;
    date?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isReadOnly = currentDossier?.status === 'HOAN_TAT';

  // Check conditions
  const allAssetsLiquidated = useMemo(() => {
    if (liquidatedAssets.length === 0) return false;
    return liquidatedAssets.every((a) => a.status === 'DA_THANH_LY');
  }, [liquidatedAssets]);

  const checklist7Items = useMemo(() => {
    const list = currentDossier?.checklist || [];
    return STANDARD_CHECKLIST.map((std) => {
      const found = list.find((item) => item.id === std.id);
      return {
        id: std.id,
        name: std.name,
        docType: std.docType,
        isComplete: !!found?.isComplete,
        docCode: found?.docCode || (std.id === 5 ? currentDossier?.decisionCode : ''),
        fileName: found?.fileName || '',
        date: found?.date || (found?.isComplete ? '22/10/2026' : ''),
      };
    });
  }, [currentDossier]);

  const completedCount = checklist7Items.filter((i) => i.isComplete).length;
  const isChecklistComplete = completedCount === 7;
  const canClose = !isReadOnly && isNVQLTS && allAssetsLiquidated && isChecklistComplete;

  // Totals
  const totalOriginal = liquidatedAssets.reduce((sum, a) => sum + (a.originalValue || 0), 0);
  const totalDepreciation = liquidatedAssets.reduce(
    (sum, a) => sum + ((a.originalValue || 0) - (a.remainingValue || 0)), 
    0
  );
  const totalRemaining = liquidatedAssets.reduce((sum, a) => sum + (a.remainingValue || 0), 0);
  const totalSale = liquidatedAssets.reduce(
    (sum, a, idx) => sum + (a.salePrice || (idx === 0 ? 80000000 : 50000000)), 
    0
  );

  const handleExecuteClose = () => {
    if (!isNVQLTS) {
      setToastMessage('Chỉ NVQLTS mới có quyền đóng hồ sơ!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (!allAssetsLiquidated) {
      setToastMessage('Còn tài sản chưa ở trạng thái "Đã thanh lý"!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (!isChecklistComplete) {
      setToastMessage('Hồ sơ còn thiếu thành phần bắt buộc!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const result = closeDossier(currentDossier.id, closingNote);
    if (result.success) {
      setToastMessage('Đã đóng và lưu trữ hồ sơ thành công!');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleOpenSupplement = (item: { id: number; name: string; docCode?: string; fileName?: string; date?: string }) => {
    setItemToSupplement(item);
    setIsSupplementModalOpen(true);
  };

  const handleSaveSupplement = (data: { docCode: string; fileName: string; date: string; note?: string }) => {
    if (itemToSupplement) {
      supplementDossierChecklistItem(currentDossier.id, itemToSupplement.id, data);
      setToastMessage(`Đã cập nhật tài liệu "${data.fileName}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Đóng và lưu trữ hồ sơ</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Xem xét danh mục tài sản, kiểm tra thành phần hồ sơ và thực hiện lưu trữ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>In hồ sơ</span>
        </button>
      </div>

      {/* Thông tin hồ sơ */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Thông tin hồ sơ
          </h2>
          <div>
            {currentDossier?.status === 'HOAN_TAT' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hoàn tất</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span>Đang thực hiện</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn hồ sơ đã bàn giao
            </label>
            <select
              value={currentDossier?.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="w-full py-2 px-3 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.decisionCode} - {d.title} ({d.status === 'HOAN_TAT' ? 'Hoàn tất' : 'Đang thực hiện'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số quyết định / Số hợp đồng
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                maxLength={30}
                value={decisionAndContractCombined}
                className="w-full py-2 pl-3 pr-8 text-xs font-mono font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg cursor-not-allowed"
              />
              <div className="absolute right-2.5 top-2.5 text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách tài sản thanh lý */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách tài sản thanh lý
          </h2>
          <span className="text-xs text-slate-500">
            {liquidatedAssets.length} tài sản
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-3 w-32">Mã TS</th>
                  <th className="py-2.5 px-3">Tên TS</th>
                  <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                  <th className="py-2.5 px-3 text-right">Hao mòn lũy kế</th>
                  <th className="py-2.5 px-3 text-right">Giá trị còn lại</th>
                  <th className="py-2.5 px-3 text-right">Giá bán</th>
                  <th className="py-2.5 px-3 text-center w-28">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liquidatedAssets.length > 0 ? (
                  liquidatedAssets.map((asset, index) => {
                    const haoMon = (asset.originalValue || 0) - (asset.remainingValue || 0);
                    const giaBan = asset.salePrice || (index === 0 ? 80000000 : 50000000);
                    const isLiquidated = asset.status === 'DA_THANH_LY';

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-700 whitespace-nowrap">
                          {asset.code}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 font-medium">{asset.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {asset.originalValue.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {haoMon.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {asset.remainingValue.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                          {giaBan.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isLiquidated ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã thanh lý
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Chờ thực hiện
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 text-xs">
                      Không có dữ liệu tài sản.
                    </td>
                  </tr>
                )}
              </tbody>
              {liquidatedAssets.length > 0 && (
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right text-slate-600">
                      Tổng cộng:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalOriginal.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalDepreciation.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalRemaining.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                      {totalSale.toLocaleString('vi-VN')} đ
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Danh mục thành phần hồ sơ */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh mục thành phần hồ sơ
          </h2>
          <span className="text-xs text-slate-500">
            {completedCount}/7 thành phần
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-3">Tên thành phần hồ sơ</th>
                  <th className="py-2.5 px-3 w-36">Mã văn bản</th>
                  <th className="py-2.5 px-3">Tệp đính kèm</th>
                  <th className="py-2.5 px-3 w-28">Ngày lập</th>
                  <th className="py-2.5 px-3 text-center w-24">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklist7Items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-medium text-slate-500">{item.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-700">{item.docCode || '--'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {item.fileName ? (
                        <div className="flex items-center gap-1.5 truncate max-w-xs">
                          {item.fileName.endsWith('.xlsx') ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          <span className="truncate">{item.fileName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{item.date || '--'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isComplete ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đủ
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Thiếu
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.isComplete ? (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenDocModal(
                                item.name,
                                item.docCode || currentDossier.decisionCode,
                                item.docType
                              )
                            }
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                        ) : (
                          !isReadOnly && isNVQLTS && (
                            <button
                              type="button"
                              onClick={() => handleOpenSupplement(item)}
                              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Bổ sung</span>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="note-field" className="text-xs font-semibold text-slate-700">
            Ghi chú
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {closingNote.length}/500
          </span>
        </div>
        <textarea
          id="note-field"
          rows={3}
          maxLength={500}
          disabled={isReadOnly}
          value={closingNote}
          onChange={(e) => setClosingNote(e.target.value)}
          placeholder="Nhập ghi chú..."
          className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
        />
      </div>

      {/* Nút Đóng và lưu hồ sơ */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={!canClose}
          onClick={handleExecuteClose}
          className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
            isReadOnly
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : canClose
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          {isReadOnly ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Đã hoàn tất lưu trữ</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Đóng và lưu hồ sơ</span>
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      <DossierPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        dossier={currentDossier}
        assets={liquidatedAssets}
      />

      <SupplementDocModal
        isOpen={isSupplementModalOpen}
        onClose={() => {
          setIsSupplementModalOpen(false);
          setItemToSupplement(null);
        }}
        dossierCode={currentDossier.decisionCode}
        item={itemToSupplement}
        onSave={handleSaveSupplement}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
