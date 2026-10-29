import React, { useState, useMemo, useEffect } from 'react';
import { 
  Send, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  UploadCloud, 
  FileText, 
  Calendar, 
  Info,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Building2,
  Layers,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Square,
  Lock,
  Search,
  RotateCcw
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Asset, Proposal, AttachedFile } from '../types/asset';

interface SubmissionCreateScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const SubmissionCreateScreen: React.FC<SubmissionCreateScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser, 
    nextSubmissionCode,
    switchUserRole,
    proposals, 
    assets, 
    submissions, 
    qualifiedSelectedProposalIds, 
    createSubmission, 
    setActiveScreen 
  } = useAssetContext();

  const isNVQLTS = currentUser.role === 'NVQLTS';

  // Current Date in dd/mm/yyyy
  const currentDateFormatted = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    return `${day}/${month}/${year}`;
  }, []);

  // 1. Số tờ trình: Textbox [20], O, Tự sinh theo quy tắc, không sửa được
  const [subCode] = useState(nextSubmissionCode);

  // 2. Ngày lập tờ trình: Date, O, Ngày hiện tại, định dạng dd/mm/yyyy, không sửa được
  const [subDate] = useState(currentDateFormatted);

  // 3. Phòng / Bộ phận: Textbox [100], O, Lấy tự động từ tài khoản NVQLTS, không sửa được
  const departmentName = currentUser.department || 'Phòng Quản lý Tài sản';

  // 4. Người lập biểu: Textbox [100], O, Lấy tự động từ tài khoản NVQLTS (hiển thị ở phần chữ ký)
  const creatorDisplayName = currentUser.name || 'Trần Văn Bình';

  // Lý do thanh lý: Textarea [1000], I, Mẫu văn bản, Bắt buộc. Cho phép NVQLTS sửa lại nếu cần
  const defaultReason =
    'Căn cứ kết quả kiểm tra và thẩm định hiện trạng thực tế của Hội đồng thẩm định, các tài sản đề nghị thanh lý đã hết niên hạn sử dụng, linh kiện cơ học và bo mạch điện tử hư hỏng nặng, chi phí sửa chữa phục hồi không mang lại hiệu quả kinh tế. Kính đề nghị Ban Giám đốc xem xét phê duyệt thanh lý theo quy định hiện hành.';
  const [reason, setReason] = useState(defaultReason);

  // Đề nghị thanh lý liên quan: Dropdown, I, Bắt buộc.
  // Chỉ liệt kê các Đề nghị có tài sản "Đủ điều kiện" và chưa nằm trong tờ trình khác.
  const eligibleProposals = useMemo(() => {
    const occupiedProposalIds = submissions
      .filter((s) => s.status === 'CHO_PHE_DUYET' || s.status === 'DA_PHE_DUYET')
      .flatMap((s) => s.proposalIds);

    return proposals.filter((p) => {
      const isOccupied = occupiedProposalIds.includes(p.id);
      const hasQualifiedAssets = assets.some(
        (a) =>
          p.assetIds.includes(a.id) &&
          (a.inspectionResult === 'Đủ điều kiện thanh lý' || a.status === 'CHO_LAP_TO_TRINH')
      );
      const isEligibleStatus = p.status === 'DU_DIEU_KIEN' || p.status === 'DANG_THAM_DINH';
      return p.status === 'DU_DIEU_KIEN' && hasQualifiedAssets && !isOccupied;
    });
  }, [proposals, submissions, assets]);

  // Selected proposal IDs for the submission
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>(() => {
    if (qualifiedSelectedProposalIds.length > 0) {
      return qualifiedSelectedProposalIds;
    }
    if (eligibleProposals.length > 0) {
      return [eligibleProposals[0].id];
    }
    return [];
  });

  // Chosen proposals full objects
  const activeProposals = useMemo(() => {
    const list = proposals.filter((p) => selectedProposalIds.includes(p.id));
    if (list.length === 0 && eligibleProposals.length > 0) {
      return [eligibleProposals[0]];
    }
    return list;
  }, [proposals, selectedProposalIds, eligibleProposals]);

  // Primary single proposal select for Dropdown 6
  const primarySelectedProposalId = selectedProposalIds[0] || (eligibleProposals[0]?.id ?? '');

  // 12. Danh mục tài sản: Load từ Đề nghị đã chọn
  // Filter only assets that are qualified for liquidation
  const loadedAssets = useMemo(() => {
    const propAssetIds = activeProposals.flatMap((p) => p.assetIds);
    return assets.filter(
      (a) =>
        propAssetIds.includes(a.id) &&
        (a.inspectionResult === 'Đủ điều kiện thanh lý' || a.status === 'CHO_LAP_TO_TRINH' || a.status === 'DU_DIEU_KIEN')
    );
  }, [activeProposals, assets]);

  // Checkbox selection in Asset Grid 12
  const [checkedAssetIds, setCheckedAssetIds] = useState<string[]>([]);

  // Keep all loaded assets checked by default when proposal changes
  useEffect(() => {
    setCheckedAssetIds(loadedAssets.map((a) => a.id));
  }, [loadedAssets]);

  // Popup "+ Thêm tài sản" (11)
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [popupSearchTerm, setPopupSearchTerm] = useState('');
  const [popupSelectedAssetIds, setPopupSelectedAssetIds] = useState<string[]>([]);

  // Other available assets waiting for submission ("Chờ lập tờ trình")
  const poolAvailableAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        (a.inspectionResult === 'Đủ điều kiện thanh lý' || a.status === 'CHO_LAP_TO_TRINH') &&
        !checkedAssetIds.includes(a.id)
    );
  }, [assets, checkedAssetIds]);

  const filteredPopupAssets = useMemo(() => {
    return poolAvailableAssets.filter(
      (a) =>
        a.code.toLowerCase().includes(popupSearchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(popupSearchTerm.toLowerCase()) ||
        a.department.toLowerCase().includes(popupSearchTerm.toLowerCase())
    );
  }, [poolAvailableAssets, popupSearchTerm]);

  // 9 & 14. Files đính kèm (Bao gồm 2 file tự động cho mỗi đề nghị + file tải lên)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(() => {
    const files: AttachedFile[] = [];
    activeProposals.forEach((p) => {
      files.push({
        id: `f-dn-${p.code}`,
        name: `DeNghi-${p.code}.pdf`,
        size: '1.8 MB',
        type: 'pdf',
        uploadedAt: `${p.createdDate} 10:00`,
      });
      files.push({
        id: `f-bb-${p.code}`,
        name: `BB-KiemTra-${p.code}.pdf`,
        size: '2.1 MB',
        type: 'pdf',
        uploadedAt: `${currentDateFormatted} 09:30`,
      });
    });
    return files;
  });

  // Synchronize auto files when active proposals change
  useEffect(() => {
    setAttachedFiles((prev) => {
      const customFiles = prev.filter((f) => !f.id.startsWith('f-dn-') && !f.id.startsWith('f-bb-'));
      const autoFiles: AttachedFile[] = [];
      activeProposals.forEach((p) => {
        autoFiles.push({
          id: `f-dn-${p.code}`,
          name: `DeNghi-${p.code}.pdf`,
          size: '1.8 MB',
          type: 'pdf',
          uploadedAt: `${p.createdDate} 10:00`,
        });
        autoFiles.push({
          id: `f-bb-${p.code}`,
          name: `BB-KiemTra-${p.code}.pdf`,
          size: '2.1 MB',
          type: 'pdf',
          uploadedAt: `${currentDateFormatted} 09:30`,
        });
      });
      return [...autoFiles, ...customFiles];
    });
  }, [activeProposals, currentDateFormatted]);

  // 16. Textarea "Ghi chú chỉ đạo" [500]
  const [generalNote, setGeneralNote] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected asset list
  const selectedAssets = useMemo(() => {
    return assets.filter((a) => checkedAssetIds.includes(a.id));
  }, [assets, checkedAssetIds]);

  const totalOriginal = selectedAssets.reduce((sum, a) => sum + a.originalValue, 0);
  const totalRemaining = selectedAssets.reduce((sum, a) => sum + a.remainingValue, 0);

  // Toggle single asset in main grid
  const handleToggleAssetCheck = (id: string) => {
    if (checkedAssetIds.includes(id)) {
      setCheckedAssetIds((prev) => prev.filter((aId) => aId !== id));
    } else {
      setCheckedAssetIds((prev) => [...prev, id]);
    }
  };

  // Select all / deselect all in main grid
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedAssetIds(loadedAssets.map((a) => a.id));
    } else {
      setCheckedAssetIds([]);
    }
  };

  // Remove asset from grid
  const handleRemoveAsset = (id: string) => {
    setCheckedAssetIds((prev) => prev.filter((aId) => aId !== id));
  };

  // Add custom file upload
  const handleAddCustomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'doc',
          uploadedAt: 'Vừa tải lên',
        },
      ]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // 18. Nút "Gửi tờ trình": Kiểm tra dữ liệu, chuyển trạng thái "Chờ phê duyệt", báo Giám đốc
  const handleSubmit = (isSent: boolean) => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác lập và gửi Tờ trình thanh lý thuộc thẩm quyền của NVQLTS (Trần Văn Bình).',
      });
      return;
    }

    if (!reason.trim()) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc nhập Lý do thanh lý!',
      });
      return;
    }

    if (checkedAssetIds.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Bảng danh mục tài sản bắt buộc có ít nhất 01 dòng được chọn!',
      });
      return;
    }

    createSubmission({
      code: subCode,
      date: subDate,
      reason,
      note: generalNote,
      proposalIds: proposals.filter(p => p.status === 'DU_DIEU_KIEN' && p.assetIds.some(id => checkedAssetIds.includes(id))).map(p => p.id),
      assetIds: checkedAssetIds,
      isSent,
      attachedFiles,
    });

    setActiveScreen('NVQLTS_SUBMISSIONS');
  };

  // 19. Nút "Hủy bỏ": Đóng màn hình, không lưu
  const handleCancel = () => {
    setActiveScreen('QUALIFIED_PROPOSALS');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách đề nghị đủ điều kiện</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Lập tờ trình thanh lý tài sản
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Tổng hợp hồ sơ đề nghị & biên bản thẩm định, lập tờ trình trình Giám đốc phê duyệt (NVQLTS).
          </p>
        </div>

        {/* Top-Right Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Lưu nháp</span>
          </button>

          {/* 18. Nút "Gửi tờ trình" */}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Gửi tờ trình</span>
          </button>

          {/* 19. Nút "Hủy bỏ" */}
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
            title="Hủy bỏ, không lưu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Role Notice */}
      {!isNVQLTS && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Quyền hạn lập tờ trình: NVQLTS</span>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Bạn đang xem với vai trò <strong>{currentUser.name} ({currentUser.roleTitle})</strong>. Thao tác lập và gửi Tờ trình thanh lý do <strong>NVQLTS</strong> thực hiện.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('NVQLTS')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shrink-0 shadow-xs transition-colors"
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
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Thông báo ràng buộc:</span>
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

      {/* ===================== Thông tin tờ trình (1 - 6) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Thông tin tờ trình
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Số tờ trình: Textbox [20], O, Tự sinh, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tờ trình
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={subCode}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-mono font-bold text-blue-900 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 2. Ngày lập tờ trình: Date, O, Ngày hiện tại dd/mm/yyyy, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày lập tờ trình
            </label>
            <div className="relative">
              <input
                type="text"
                value={subDate}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 3. Phòng / Bộ phận: Textbox [100], O, Bộ phận của NVQLTS, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phòng / Bộ phận
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                value={departmentName}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 4. Người lập biểu: Textbox [100], O, Tên NVQLTS (hiển thị ở phần chữ ký) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Người lập biểu
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                value={creatorDisplayName}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Đề nghị thanh lý liên quan: Dropdown, I, Bắt buộc */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đề nghị thanh lý liên quan <span className="text-red-500">*</span>
            </label>
            <select
              value={primarySelectedProposalId}
              onChange={(e) => {
                const pId = e.target.value;
                if (pId) {
                  setSelectedProposalIds([pId]);
                }
              }}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-white font-medium"
            >
              {eligibleProposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.department} (Người lập: {p.creatorName} · {p.assetIds.length} tài sản đề nghị)
                </option>
              ))}
              {eligibleProposals.length === 0 && (
                <option value="">Không có đề nghị đủ điều kiện khả dụng</option>
              )}
            </select>
          </div>

          {/* Lý do thanh lý: Textarea [1000], I, Bắt buộc */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Lý do thanh lý <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{reason.length}/1000 ký tự</span>
            </div>
            <textarea
              maxLength={1000}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do thanh lý trình Ban Giám đốc..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 leading-relaxed font-normal"
            />
          </div>
        </div>
      </div>

      {/* ===================== II. KHỐI HỒ SƠ TỰ ĐỘNG TỔNG HỢP (7 - 9) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        {/* Tiêu đề khối & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hồ sơ đề nghị & Biên bản thẩm định tổng hợp vào Tờ trình
            </h2>
          </div>
          
        </div>

        {/* 8. Card thông tin Đề nghị (Read-only) & 9. File tự động đính kèm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProposals.map((prop) => (
            <div
              key={prop.id}
              className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3 shadow-2xs"
            >
              {/* Header card: Mã ĐN, Bộ phận, Ngày lập */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 text-xs bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {prop.code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{prop.department}</span>
                </div>
                <span className="text-[11px] text-slate-500">Ngày lập: {prop.createdDate}</span>
              </div>

              {/* Body: Lý do, Số tài sản đưa vào */}
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400 font-medium">Lý do đề nghị:</span> {prop.reason}
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Số tài sản đưa vào:</span>{' '}
                  <strong className="text-slate-900">{prop.assetIds.length} tài sản</strong>
                </div>
              </div>

              {/* 9. File tự động đính kèm: Link kèm icon xem trước */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onOpenDocModal(`Đề nghị thanh lý - ${prop.code}`, prop.code, 'DE_NGHI')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-colors font-medium cursor-pointer"
                  title="Xem trước Đề nghị thanh lý"
                >
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  <span>DeNghi-{prop.code}.pdf</span>
                  <Eye className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDocModal(`Biên bản kiểm tra - ${prop.code}`, `BB-${prop.code}`, 'BIEN_BAN')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
                  title="Xem trước Biên bản kiểm tra thẩm định"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>BB-KiemTra-{prop.code}.pdf</span>
                  <Eye className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== III. KHỐI DANH MỤC TÀI SẢN (Grid: 10 - 12) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            {/* Tiêu đề khối */}
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Danh sách tài sản đưa vào tờ trình ({selectedAssets.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600 flex items-center gap-3">
              <span>Tổng nguyên giá: <strong className="font-mono text-slate-900">{totalOriginal.toLocaleString('vi-VN')} đ</strong></span>
              <span>·</span>
              <span>Tổng GTCL: <strong className="font-mono text-blue-700">{totalRemaining.toLocaleString('vi-VN')} đ</strong></span>
            </div>

            {/* 11. Nút "+ Thêm tài sản": Mở popup chọn tài sản từ danh sách "Chờ lập tờ trình" */}
            <button
              type="button"
              onClick={() => {
                setPopupSelectedAssetIds([]);
                setPopupSearchTerm('');
                setIsAddAssetModalOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-50 border border-blue-600 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm tài sản</span>
            </button>
          </div>
        </div>

        {/* 12. Bảng danh mục tài sản: Grid (Load từ Đề nghị) */}
        {/* Cột: Chọn (Checkbox), STT, Mã TS, Tên/đặc điểm TSCĐ, ĐVT, Số lượng, Số hiệu, Năm SX, Năm SD, Nguyên giá, GTCL, Kết luận kiểm tra, Ghi chú */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={loadedAssets.length > 0 && checkedAssetIds.length === loadedAssets.length}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3 w-28">Mã TS</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Tên / đặc điểm TSCĐ</th>
                  <th className="py-2.5 px-3 text-center w-14">ĐVT</th>
                  <th className="py-2.5 px-3 text-center w-14">SL</th>
                  <th className="py-2.5 px-3 text-center w-20">Số hiệu</th>
                  <th className="py-2.5 px-3 text-center w-16">Năm SX</th>
                  <th className="py-2.5 px-3 text-center w-16">Năm SD</th>
                  <th className="py-2.5 px-3 text-right w-24">Nguyên giá</th>
                  <th className="py-2.5 px-3 text-right w-24">GTCL</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Kết luận kiểm tra</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Ghi chú</th>
                  <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedAssets.length > 0 ? (
                  selectedAssets.map((asset, index) => {
                    const isChecked = checkedAssetIds.includes(asset.id);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Chọn (Checkbox) */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAssetCheck(asset.id)}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>
                        {/* STT */}
                        <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                        {/* Mã TS */}
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                        {/* Tên/đặc điểm TSCĐ */}
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{asset.name}</div>
                          {asset.specs && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{asset.specs}</div>
                          )}
                        </td>
                        {/* ĐVT */}
                        <td className="py-2.5 px-3 text-center text-slate-600">Cái</td>
                        {/* Số lượng */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">1</td>
                        {/* Số hiệu */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-[11px]">
                          {asset.code.replace('TS-', 'SH-')}
                        </td>
                        {/* Năm SX */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{asset.manufactureYear || 2018}</td>
                        {/* Năm SD */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{asset.usageYear || 2019}</td>
                        {/* Nguyên giá */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {asset.originalValue.toLocaleString('vi-VN')} đ
                        </td>
                        {/* GTCL */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {asset.remainingValue.toLocaleString('vi-VN')} đ
                        </td>
                        {/* Kết luận kiểm tra */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đủ điều kiện thanh lý
                          </span>
                        </td>
                        {/* Ghi chú */}
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {asset.note || asset.condition || 'Hư hỏng không thể sửa chữa'}
                        </td>
                        {/* Xóa */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            title="Loại bỏ tài sản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-400 text-xs">
                      Chưa có tài sản nào được chọn trong tờ trình. Vui lòng bấm <strong>&quot;+ Thêm tài sản&quot;</strong> hoặc chọn lại đề nghị liên quan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== IV. KHỐI FILE ĐÍNH KÈM & GHI CHÚ (13 - 16) ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 13 & 14. File đính kèm */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            {/* 13. Tiêu đề "FILE ĐÍNH KÈM (N)" */}
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tệp đính kèm bổ sung ({attachedFiles.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Hồ sơ pháp lý, đề nghị & biên bản</span>
          </div>

          {/* 14. Vùng kéo thả file */}
          <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleAddCustomFile}
            />
            <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-xs font-semibold text-slate-700">
              Kéo thả tệp hoặc <span className="text-blue-600 underline">Chọn tệp bổ sung</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hỗ trợ: PDF, DOC, DOCX (Chứng thư định giá, ảnh hiện trường...)
            </div>
          </label>

          {/* Danh sách file đã có kèm icon Xem và Xóa */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-colors"
              >
                <div
                  onClick={() => onOpenDocModal(file.name, subCode, 'TO_TRINH')}
                  className="flex items-center gap-2 cursor-pointer truncate"
                >
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                    PDF
                  </span>
                  <span className="font-medium text-slate-800 hover:text-blue-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-slate-400 text-[10px] shrink-0 font-mono">({file.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenDocModal(file.name, subCode, 'TO_TRINH')}
                    className="p-1 text-slate-500 hover:text-blue-700 rounded cursor-pointer"
                    title="Xem tài liệu"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                    title="Xóa tệp"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 15 & 16. Ghi chú chỉ đạo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            {/* 15. Tiêu đề "GHI CHÚ CHỈ ĐẠO" & Bộ đếm ký tự (0/500) */}
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ghi chú chỉ đạo
            </h2>
            <span className="text-[11px] text-slate-400">{generalNote.length}/500</span>
          </div>

          {/* Textarea "Ghi chú" */}
          <textarea
            maxLength={500}
            rows={7}
            placeholder="Nhập ghi chú hoặc ý kiến đề xuất của NVQLTS gửi Giám đốc..."
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 leading-relaxed font-normal"
          />
          <div className="text-[11px] text-slate-400">
            Ý kiến hoặc đề xuất phương thức xử lý sau phê duyệt (ví dụ: chào giá cạnh tranh, bán phế liệu thu hồi).
          </div>
        </div>
      </div>

      {/* ===================== V. KHỐI NÚT THAO TÁC (FOOTER: 18 - 19) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Tờ trình sẽ được chuyển sang trạng thái <strong>&quot;Chờ phê duyệt&quot;</strong> và gửi thông báo trực tiếp đến Ban Giám đốc.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* 19. Nút "Hủy bỏ": Đóng màn hình, không lưu */}
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            {/* Lưu nháp */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Lưu bản nháp
            </button>

            {/* 18. Nút "Gửi tờ trình": Kiểm tra dữ liệu, chuyển trạng thái "Chờ phê duyệt", báo Giám đốc */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Gửi tờ trình</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== POPUP THÊM TÀI SẢN (11) ===================== */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Thêm tài sản vào tờ trình thanh lý
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAssetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter in popup */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã tài sản, tên thiết bị, bộ phận..."
                  value={popupSearchTerm}
                  onChange={(e) => setPopupSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Popup Table */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">Chọn</th>
                      <th className="py-2.5 px-3 w-28">Mã TS</th>
                      <th className="py-2.5 px-3">Tên tài sản</th>
                      <th className="py-2.5 px-3">Phòng ban</th>
                      <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                      <th className="py-2.5 px-3 text-right">GTCL</th>
                      <th className="py-2.5 px-3">Kết luận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPopupAssets.length > 0 ? (
                      filteredPopupAssets.map((asset) => {
                        const isChecked = popupSelectedAssetIds.includes(asset.id);
                        return (
                          <tr
                            key={asset.id}
                            onClick={() => {
                              if (isChecked) {
                                setPopupSelectedAssetIds((prev) => prev.filter((id) => id !== asset.id));
                              } else {
                                setPopupSelectedAssetIds((prev) => [...prev, asset.id]);
                              }
                            }}
                            className={`cursor-pointer transition-colors ${
                              isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPopupSelectedAssetIds((prev) => [...prev, asset.id]);
                                  } else {
                                    setPopupSelectedAssetIds((prev) => prev.filter((id) => id !== asset.id));
                                  }
                                }}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{asset.name}</td>
                            <td className="py-2 px-3 text-slate-600">{asset.department}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {asset.originalValue.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                              {asset.remainingValue.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đủ điều kiện
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                          Không còn tài sản khả dụng nào ở trạng thái &quot;Chờ lập tờ trình&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Đã chọn <strong>{popupSelectedAssetIds.length}</strong> tài sản
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckedAssetIds((prev) => [...new Set([...prev, ...popupSelectedAssetIds])]);
                    setIsAddAssetModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Thêm vào danh sách ({popupSelectedAssetIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
