import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  RotateCcw, 
  Check, 
  Clock, 
  Layers, 
  Eye, 
  Download, 
  Calendar,
  Building2,
  DollarSign,
  User,
  Plus,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileUp,
  FileCheck,
  Trash2,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  X,
  UserCheck
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Decision, Asset, AttachedFile } from '../types/asset';

interface ExecutionScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const ExecutionScreen: React.FC<ExecutionScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser,
    switchUserRole,
    decisions, 
    submissions, 
    assets, 
    selectedDecisionId, 
    setSelectedDecisionId, 
    executeLiquidationBatch 
  } = useAssetContext();

  const isNVQLTS = currentUser.role === 'NVQLTS';

  // ===================== I. KHỐI CHỌN QUYẾT ĐỊNH =====================
  // 1. Chọn Quyết định thanh lý: Dropdown, I
  // Chỉ hiển thị các QĐ đã phê duyệt nhưng chưa hoàn tất thanh lý (status = DANG_THUC_HIEN)
  const availableDecisions = useMemo(() => {
    return decisions.filter((d) => d.status === 'DANG_THUC_HIEN' || d.status !== 'HOAN_TAT');
  }, [decisions]);

  // Selected decision
  const currentDecision = useMemo(() => {
    if (selectedDecisionId) {
      const found = availableDecisions.find((d) => d.id === selectedDecisionId || d.code === selectedDecisionId);
      if (found) return found;
    }
    return availableDecisions[0] || decisions[0];
  }, [availableDecisions, selectedDecisionId, decisions]);

  // Assets belonging to current decision
  const relatedSubmission = submissions.find((s) => s.code === currentDecision?.submissionId);
  const decisionAssets = useMemo(() => {
    if (!currentDecision) return [];
    if (relatedSubmission && relatedSubmission.assetIds.length > 0) {
      return assets.filter((a) => relatedSubmission.assetIds.includes(a.id));
    }
    // Fallback if needed
    return assets.filter((a) => a.id === 'TS-001' || a.id === 'TS-002');
  }, [assets, relatedSubmission, currentDecision]);

  // Assets already liquidated in previous batches
  const soldAssetIds = useMemo(() => {
    if (!currentDecision) return [];
    return currentDecision.batches.flatMap((b) => b.assetIds);
  }, [currentDecision]);

  // Assets available to be liquidated in this batch (chưa thanh lý)
  const availableAssetIds = useMemo(() => {
    return decisionAssets
      .filter((a) => !soldAssetIds.includes(a.id) && a.status !== 'DA_THANH_LY')
      .map((a) => a.id);
  }, [decisionAssets, soldAssetIds]);

  // ===================== II. KHỐI DANH MỤC TÀI SẢN (2 - 3) =====================
  // 2. Bảng tài sản thanh lý: Checkbox chọn
  const [tickedAssetIds, setTickedAssetIds] = useState<string[]>([]);

  // Prices per asset (Giá bán input ≥ 0)
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  // Reset / initialize selection when decision changes
  useEffect(() => {
    if (availableAssetIds.length > 0) {
      // Pick first available asset by default
      setTickedAssetIds([availableAssetIds[0]]);
    } else {
      setTickedAssetIds([]);
    }

    // Initialize prices
    const initPrices: Record<string, number> = {};
    decisionAssets.forEach((a) => {
      initPrices[a.id] = a.salePrice && a.salePrice > 0 ? a.salePrice : a.remainingValue;
    });
    setCustomPrices(initPrices);
  }, [currentDecision?.id, decisionAssets, availableAssetIds]);

  // 15. Thanh tiến độ thanh lý: % tài sản đã thanh lý trên tổng số tài sản thuộc QĐ đã chọn
  const totalAssetsCount = decisionAssets.length;
  const soldAssetsCount = decisionAssets.filter((a) => soldAssetIds.includes(a.id) || a.status === 'DA_THANH_LY').length;
  const progressPercent = totalAssetsCount > 0 ? Math.round((soldAssetsCount / totalAssetsCount) * 100) : 0;

  // Convert decision signDate (dd/mm/yyyy) to YYYY-MM-DD
  const decisionDateIso = useMemo(() => {
    if (!currentDecision?.signDate) return '2026-10-22';
    const parts = currentDecision.signDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '2026-10-22';
  }, [currentDecision]);

  // ===================== III. KHỐI HỢP ĐỒNG MUA BÁN (4 - 7) =====================
  const nextBatchNum = (currentDecision?.batches.length || 0) + 1;
  const defaultContractCode = `HĐMB-2026-015-D${nextBatchNum}`;
  
  // 4. Số hợp đồng: Textbox [30], Bắt buộc, không trùng
  const [contractCode, setContractCode] = useState(defaultContractCode);

  // 5. Ngày ký hợp đồng: Date, Bắt buộc, không nhỏ hơn ngày ban hành QĐ
  const [contractDate, setContractDate] = useState('2026-10-22');

  // 6. Bên mua (Tên tổ chức/cá nhân): Textbox [200], Bắt buộc
  const [buyerName, setBuyerName] = useState('Công ty TNHH Công nghệ & Thiết bị Minh Phát');

  // 7. Tệp Hợp đồng mua bán: File upload, Bắt buộc, PDF ≤ 10MB
  const [contractFile, setContractFile] = useState<AttachedFile | null>({
    id: `cf-${nextBatchNum}`,
    name: `HopDong-${defaultContractCode}-signed.pdf`,
    size: '1.8 MB',
    type: 'pdf',
    uploadedAt: '22/10/2026 14:00',
  });

  // ===================== IV. KHỐI BIÊN BẢN BÀN GIAO (8 - 10) =====================
  const defaultDeliveryRecordCode = `BBBG-2026-015-D${nextBatchNum}`;

  // 8. Ngày bàn giao thực tế: Date, Bắt buộc, không nhỏ hơn ngày ký HĐ
  const [deliveryDate, setDeliveryDate] = useState('2026-10-25');

  // 9. Người nhận (Đại diện bên mua): Textbox [100], Bắt buộc
  const [receiverName, setReceiverName] = useState('Nguyễn Văn Nam');

  // 10. Tệp Biên bản bàn giao: File upload, Bắt buộc, PDF ≤ 10MB
  const [deliveryFile, setDeliveryFile] = useState<AttachedFile | null>({
    id: `df-${nextBatchNum}`,
    name: `BBBG-${defaultDeliveryRecordCode}-signed.pdf`,
    size: '1.5 MB',
    type: 'pdf',
    uploadedAt: '25/10/2026 15:30',
  });

  // ===================== V. KHỐI TỔNG KẾT & THAO TÁC (11 - 15) =====================
  // 11. Ghi chú: Textarea [500] (Không bắt buộc)
  const [batchNote, setBatchNote] = useState('Bàn giao tài sản thanh lý theo đúng hiện trạng cam kết tại hợp đồng.');

  // 12. Tổng giá trị hợp đồng: Number [18], Tự động tính bằng tổng cột "Giá bán" của các tài sản được tick
  const totalContractPrice = useMemo(() => {
    return tickedAssetIds.reduce((sum, id) => {
      const p = customPrices[id] ?? assets.find((a) => a.id === id)?.remainingValue ?? 0;
      return sum + Number(p);
    }, 0);
  }, [tickedAssetIds, customPrices, assets]);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update batch code defaults when decision changes
  useEffect(() => {
    if (currentDecision) {
      const bNum = currentDecision.batches.length + 1;
      const decShort = currentDecision.code.replace(/\D/g, '') || '015';
      const cCode = `HĐMB-2026-${decShort}-D${bNum}`;
      const dCode = `BBBG-2026-${decShort}-D${bNum}`;
      setContractCode(cCode);
      setContractFile({
        id: `cf-${Date.now()}`,
        name: `HopDong-${cCode}-signed.pdf`,
        size: '1.8 MB',
        type: 'pdf',
        uploadedAt: 'Hôm nay',
      });
      setDeliveryFile({
        id: `df-${Date.now()}`,
        name: `BBBG-${dCode}-signed.pdf`,
        size: '1.5 MB',
        type: 'pdf',
        uploadedAt: 'Hôm nay',
      });
    }
  }, [currentDecision?.id]);

  // Checkbox toggle in Grid 2
  const handleToggleCheck = (id: string, isSold: boolean) => {
    if (isSold) return;
    if (tickedAssetIds.includes(id)) {
      setTickedAssetIds((prev) => prev.filter((aId) => aId !== id));
    } else {
      setTickedAssetIds((prev) => [...prev, id]);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setTickedAssetIds(availableAssetIds);
    } else {
      setTickedAssetIds([]);
    }
  };

  // Price change handler
  const handlePriceChange = (id: string, val: number) => {
    const validVal = Math.max(0, isNaN(val) ? 0 : val);
    setCustomPrices((prev) => ({
      ...prev,
      [id]: validVal,
    }));
  };

  // Contract File Upload (7)
  const handleContractFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Dung lượng tệp hợp đồng vượt quá 10MB!',
        });
        return;
      }
      setContractFile({
        id: `cf-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'pdf',
        uploadedAt: 'Hôm nay',
      });
      setFeedback({
        type: 'success',
        message: `Đã đính kèm tệp hợp đồng mua bán: ${file.name}.`,
      });
    }
  };

  // Delivery File Upload (10)
  const handleDeliveryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Dung lượng tệp biên bản bàn giao vượt quá 10MB!',
        });
        return;
      }
      setDeliveryFile({
        id: `df-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'pdf',
        uploadedAt: 'Hôm nay',
      });
      setFeedback({
        type: 'success',
        message: `Đã đính kèm tệp biên bản bàn giao: ${file.name}.`,
      });
    }
  };

  // 13. Nút "Lưu nháp"
  const handleSaveDraft = () => {
    setFeedback({
      type: 'success',
      message: 'Đã lưu nháp thông tin hợp đồng và biên bản bàn giao thành công. Trạng thái tài sản vẫn được giữ nguyên để hoàn tất sau.',
    });
  };

  // 14. Nút "Hoàn tất thanh lý đợt này"
  const handleCompleteBatch = () => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác thực hiện thanh lý thuộc thẩm quyền của NVQLTS (Nhân viên quản lý tài sản).',
      });
      return;
    }

    if (!currentDecision) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng chọn Quyết định thanh lý cần thực hiện!',
      });
      return;
    }

    // Validate 1: Must tick at least 1 asset
    if (tickedAssetIds.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc tick chọn ít nhất 01 tài sản trong bảng danh mục tài sản để thanh lý đợt này!',
      });
      return;
    }

    // Validate 4: Số hợp đồng bắt buộc, không trùng
    if (!contractCode.trim()) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc nhập Số hợp đồng!',
      });
      return;
    }
    const isDuplicateHĐ = decisions
      .flatMap((d) => d.batches)
      .some((b) => b.contractCode.toLowerCase().trim() === contractCode.toLowerCase().trim());
    if (isDuplicateHĐ) {
      setFeedback({
        type: 'error',
        message: `Số hợp đồng "${contractCode}" đã tồn tại trong hệ thống. Vui lòng nhập số hợp đồng khác!`,
      });
      return;
    }

    // Validate 5: Ngày ký HĐ bắt buộc, không nhỏ hơn ngày quyết định
    if (!contractDate) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc chọn Ngày ký hợp đồng!',
      });
      return;
    }
    if (contractDate < decisionDateIso) {
      setFeedback({
        type: 'error',
        message: `Ngày ký hợp đồng (${contractDate}) không được nhỏ hơn ngày ban hành Quyết định (${currentDecision.signDate})!`,
      });
      return;
    }

    // Validate 6: Bên mua bắt buộc
    if (!buyerName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc nhập Bên mua (Tên tổ chức/cá nhân)!',
      });
      return;
    }

    // Validate 7: Tệp HĐ bắt buộc
    if (!contractFile) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc tải lên Tệp Hợp đồng mua bán đã ký (PDF ≤ 10MB)!',
      });
      return;
    }

    // Validate 8: Ngày bàn giao bắt buộc, không nhỏ hơn ngày ký HĐ
    if (!deliveryDate) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc chọn Ngày bàn giao thực tế!',
      });
      return;
    }
    if (deliveryDate < contractDate) {
      setFeedback({
        type: 'error',
        message: 'Ngày bàn giao thực tế không được nhỏ hơn ngày ký hợp đồng!',
      });
      return;
    }

    // Validate 9: Người nhận bắt buộc
    if (!receiverName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc nhập Họ tên Người nhận (Đại diện bên mua)!',
      });
      return;
    }

    // Validate 10: Tệp BBBG bắt buộc
    if (!deliveryFile) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc tải lên Tệp Biên bản bàn giao đã ký (PDF ≤ 10MB)!',
      });
      return;
    }

    const formattedContractDate = contractDate.split('-').reverse().join('/');
    const formattedDeliveryDate = deliveryDate.split('-').reverse().join('/');
    const deliveryRecCode = `BBBG-${contractCode.replace('HĐMB-', '')}`;

    // Execute batch: updates ONLY ticked assets to DA_THANH_LY
    executeLiquidationBatch(currentDecision.id, {
      contractCode,
      contractDate: formattedContractDate,
      buyerName,
      salePrice: totalContractPrice,
      deliveryDate: formattedDeliveryDate,
      receiverName,
      deliveryRecordCode: deliveryRecCode,
      note: batchNote,
      assetIds: tickedAssetIds,
      contractFileName: contractFile.name,
      deliveryFileName: deliveryFile.name,
    });

    setFeedback({
      type: 'success',
      message: `Đã hoàn tất thanh lý đợt này cho ${tickedAssetIds.length} tài sản! Các tài sản đã chọn được chuyển sang trạng thái "Đã thanh lý". Hồ sơ pháp lý đã được tự động bổ sung vào Hồ sơ thanh lý.`,
    });

    // Reset ticked assets
    setTickedAssetIds([]);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Thực hiện thanh lý tài sản
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Lập hợp đồng mua bán, biên bản bàn giao thực tế và cập nhật kết quả thanh lý tài sản (NVQLTS).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Vai trò thực hiện:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            NVQLTS (Trần Văn Bình)
          </span>
        </div>
      </div>

      {/* Role notice if not NVQLTS */}
      {!isNVQLTS && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Lưu ý phân quyền:</span> Bạn đang xem màn hình với vai trò{' '}
              <span className="font-bold underline">{currentUser.roleTitle}</span>. Nghiệp vụ thực hiện thanh lý, ký hợp đồng và bàn giao do{' '}
              <span className="font-bold text-blue-700">NVQLTS (Trần Văn Bình)</span> thực hiện.
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('NVQLTS')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chuyển sang NVQLTS</span>
          </button>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {feedback.type === 'success' ? 'Thành công:' : 'Cảnh báo / Lỗi:'}
              </span>
              <span>{feedback.message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================== KHỐI CHỌN QUYẾT ĐỊNH & THANH TIẾN ĐỘ ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chọn quyết định thanh lý
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Chọn Quyết định thanh lý: Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chọn Quyết định thanh lý <span className="text-red-500">*</span>
            </label>
            <select
              value={currentDecision?.id || ''}
              onChange={(e) => setSelectedDecisionId(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-500 font-semibold text-xs text-slate-900 shadow-2xs"
            >
              {availableDecisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - Ngày ký: {d.signDate} · Trạng thái: {d.status === 'DANG_THUC_HIEN' ? 'Đang thực hiện' : 'Chờ hoàn tất'} ({d.batches.length} đợt đã bàn giao)
                </option>
              ))}
              {availableDecisions.length === 0 && (
                <option value="">Không có quyết định nào đang chờ thực hiện</option>
              )}
            </select>
          </div>

          {/* Thanh tiến độ thanh lý (Progress bar) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Tiến độ thanh lý:</span>
              <span className="text-blue-700 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Đã thanh lý: <strong className="text-slate-800">{soldAssetsCount}/{totalAssetsCount}</strong> tài sản</span>
              <span>Còn lại: <strong className="text-blue-700">{totalAssetsCount - soldAssetsCount}</strong> tài sản</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI DANH MỤC TÀI SẢN ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Bảng tài sản thanh lý theo quyết định ({decisionAssets.length} tài sản)
            </h2>
            {/* Dòng thông báo hướng dẫn (Text nhỏ màu xanh) */}
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              Chỉ những tài sản được tick chọn mới được áp dụng Biên bản/Hợp đồng bên dưới. Tài sản không chọn sẽ chờ đợt sau.
            </p>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>Đã chọn: <strong className="text-blue-700 font-bold">{tickedAssetIds.length}</strong> tài sản</span>
          </div>
        </div>

        {/* 2. Bảng tài sản thanh lý: Grid */}
        {/* Cột: Chọn (Checkbox), Mã TS, Tên TS, GTCL, Giá bán (Input, số ≥ 0), Trạng thái */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={availableAssetIds.length > 0 && availableAssetIds.every((id) => tickedAssetIds.includes(id))}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-32">Mã TS</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Tên TS</th>
                  <th className="py-2.5 px-3 text-right w-36">GTCL (VNĐ)</th>
                  <th className="py-2.5 px-3 text-right w-44">Giá bán (Input, số ≥ 0) *</th>
                  <th className="py-2.5 px-3 w-36 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decisionAssets.map((asset) => {
                  const isSold = soldAssetIds.includes(asset.id) || asset.status === 'DA_THANH_LY';
                  const isTicked = tickedAssetIds.includes(asset.id);
                  const currentPrice = customPrices[asset.id] ?? asset.remainingValue;

                  return (
                    <tr
                      key={asset.id}
                      className={`transition-colors ${
                        isSold
                          ? 'bg-slate-50/70 opacity-60'
                          : isTicked
                          ? 'bg-blue-50/60 font-medium'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Chọn (Checkbox) */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          disabled={isSold}
                          checked={isTicked}
                          onChange={() => handleToggleCheck(asset.id, isSold)}
                          className={`rounded text-blue-600 ${isSold ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                      </td>

                      {/* Mã TS */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {asset.code}
                      </td>

                      {/* Tên TS */}
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {asset.name}
                        {asset.specs && (
                          <div className="text-[11px] text-slate-400 font-normal truncate max-w-sm">
                            {asset.specs}
                          </div>
                        )}
                      </td>

                      {/* GTCL */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {asset.remainingValue.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Giá bán (Input, số ≥ 0) */}
                      <td className="py-2 px-3 text-right">
                        {isSold ? (
                          <span className="font-mono font-bold text-slate-600 tabular-nums">
                            {(asset.salePrice || currentPrice).toLocaleString('vi-VN')} đ
                          </span>
                        ) : (
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              disabled={!isTicked}
                              value={currentPrice}
                              onChange={(e) => handlePriceChange(asset.id, parseFloat(e.target.value))}
                              className={`w-full py-1.5 px-2 text-right font-mono font-bold text-xs border rounded-lg focus:outline-hidden ${
                                isTicked
                                  ? 'border-blue-300 focus:border-blue-600 bg-white text-blue-900'
                                  : 'border-slate-200 bg-slate-100/80 text-slate-400 cursor-not-allowed'
                              }`}
                            />
                          </div>
                        )}
                      </td>

                      {/* Trạng thái (mặc định: Chờ thực hiện) */}
                      <td className="py-2.5 px-3 text-center">
                        {isSold ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Đã thanh lý
                          </span>
                        ) : isTicked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Đang chọn bán đợt này
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            Chờ thực hiện
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== GRID: III. HỢP ĐỒNG MUA BÁN & IV. BIÊN BẢN BÀN GIAO ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===================== KHỐI HỢP ĐỒNG MUA BÁN ===================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hợp đồng mua bán
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Số hợp đồng: Textbox [30], Bắt buộc, không trùng */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số hợp đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={30}
                placeholder="VD: HĐMB-2026-015-D1"
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl font-mono font-bold text-blue-900 focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>

            {/* Ngày ký hợp đồng: Date, Bắt buộc, không nhỏ hơn ngày QĐ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày ký hợp đồng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={decisionDateIso}
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Bên mua: Textbox [200], Bắt buộc */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bên mua (Tên tổ chức / cá nhân) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="Nhập tên tổ chức hoặc cá nhân mua tài sản thanh lý..."
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>

            {/* Tệp Hợp đồng mua bán: File upload, Bắt buộc, PDF ≤ 10MB */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tệp Hợp đồng mua bán <span className="text-red-500">*</span>
              </label>
              {contractFile ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 truncate">{contractFile.name}</div>
                      <div className="text-[11px] text-slate-400">{contractFile.size} · Đã có chữ ký 2 bên</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDocModal(`Hợp đồng mua bán - ${contractCode}`, contractCode, 'HOP_DONG')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="Xem tài liệu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setContractFile(null)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      title="Xóa tệp"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-blue-600">Chọn bản scan HĐ hoặc kéo thả tệp</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Định dạng PDF (Tối đa 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleContractFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ===================== KHỐI BIÊN BẢN BÀN GIAO ===================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Biên bản bàn giao
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Ngày bàn giao thực tế: Date, Bắt buộc, không nhỏ hơn ngày ký HĐ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bàn giao thực tế <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={contractDate}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Người nhận (Đại diện bên mua): Textbox [100], Bắt buộc */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người nhận (Đại diện bên mua) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="Nhập họ và tên người đại diện bên mua nhận tài sản..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>

            {/* Tệp Biên bản bàn giao: File upload, Bắt buộc, PDF ≤ 10MB */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tệp Biên bản bàn giao <span className="text-red-500">*</span>
              </label>
              {deliveryFile ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 truncate">{deliveryFile.name}</div>
                      <div className="text-[11px] text-slate-400">{deliveryFile.size} · Đã có chữ ký xác nhận</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDocModal(`Biên bản bàn giao - ${contractCode}`, contractCode, 'BAN_GIAO')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="Xem tài liệu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryFile(null)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      title="Xóa tệp"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30 transition-all">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-emerald-600">Chọn bản scan BBBG hoặc kéo thả tệp</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Định dạng PDF (Tối đa 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleDeliveryFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI TỔNG KẾT & THAO TÁC ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        {/* Ghi chú: Textarea [500] */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Ghi chú
            </label>
            <span className="text-[11px] text-slate-400">{batchNote.length}/500</span>
          </div>
          <textarea
            maxLength={500}
            rows={2}
            placeholder="Nhập ghi chú chi tiết về điều kiện bàn giao, thời hạn tháo dỡ, phương thức vận chuyển..."
            value={batchNote}
            onChange={(e) => setBatchNote(e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 leading-relaxed bg-white"
          />
        </div>

        {/* Footer Bar: Tổng giá trị HĐ, Lưu nháp, Hoàn tất thanh lý đợt này */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tổng giá trị hợp đồng: Number [18], Tự động tính bằng tổng cột "Giá bán" của các tài sản được tick */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Tổng giá trị hợp đồng:</span>
            <span className="font-mono text-lg font-black text-blue-700">
              {totalContractPrice.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-xs text-slate-400">
              ({tickedAssetIds.length} tài sản được tick)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Nút "Lưu nháp" */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Lưu nháp
            </button>

            {/* Nút "Hoàn tất thanh lý đợt này" */}
            <button
              type="button"
              onClick={handleCompleteBatch}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Hoàn tất thanh lý đợt này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
