import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  X, 
  Search, 
  RotateCcw, 
  Info,
  ArrowLeft,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Asset, Proposal } from '../types/asset';

interface AssetRowState {
  asset: Asset;
  liquidationReason: string;
  note: string;
}

export const ProposalCreateScreen: React.FC = () => {
  const { 
    currentUser, 
    nextProposalCode,
    switchUserRole,
    assets, 
    proposals, 
    createProposal, 
    updateProposal, 
    editingProposalId, 
    setEditingProposalId, 
    setActiveScreen 
  } = useAssetContext();

  const isBPSDTS = currentUser.role === 'BPSDTS';

  const isEditing = !!editingProposalId;
  const editingProposal = isEditing ? proposals.find((p) => p.id === editingProposalId) : null;

  // 1. Số đề nghị: Textbox [20], O, Tự sinh (VD: TL-2026-025), Số tự sinh theo quy tắc, không sửa được
  const [proposalCode, setProposalCode] = useState('TL-2026-026');

  // 2. Ngày đề nghị: Date, O, Ngày hiện tại (VD: 21/10/2026 hoặc hôm nay), Định dạng dd/mm/yyyy, có icon lịch, không sửa được.
  const todayFormatted = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    return `${day}/${month}/${year}`;
  }, []);
  const proposalDate = editingProposal ? editingProposal.createdDate : todayFormatted;

  // 3. Phòng / Bộ phận: Dropdown, O, Bộ phận từ tài khoản (VD: Phòng Kế toán), Lấy tự động từ tài khoản đăng nhập, không sửa được.
  const department = currentUser.department || 'Phòng Kế toán';

  // 4. Người đề nghị: Dropdown, O, Tên từ tài khoản (VD: NV003 - Nguyễn Minh Anh), Lấy tự động từ tài khoản đăng nhập, không sửa được.
  const creatorDisplayName = useMemo(() => {
    return `${currentUser.code || currentUser.id} - ${currentUser.name}`;
  }, [currentUser]);

  const [reason, setReason] = useState('Hết hạn sử dụng & hư hỏng không thể sửa chữa');
  const [generalNote, setGeneralNote] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [assetId: string]: { reason?: boolean; note?: boolean } }>({});

  // DANH MỤC TÀI SẢN ĐỀ NGHỊ THANH LÝ (Grid 11 cột)
  const [selectedAssetRows, setSelectedAssetRows] = useState<AssetRowState[]>([]);

  // POPUP: THÊM TÀI SẢN (17 - 26)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalTypeFilter, setModalTypeFilter] = useState<'ALL' | 'TSCĐ' | 'CCDC'>('ALL');
  const [modalStatusFilter, setModalStatusFilter] = useState<'ALL' | 'DANG_SU_DUNG' | 'DANG_BAO_TRI'>('ALL');
  const [modalSelectedIds, setModalSelectedIds] = useState<string[]>([]);

  // Pre-fill or generate code
  useEffect(() => {
    if (editingProposal) {
      setProposalCode(editingProposal.code);
      setReason(editingProposal.reason);
      setGeneralNote(editingProposal.note || '');

      const initialRows: AssetRowState[] = editingProposal.assetIds
        .map((id) => assets.find((a) => a.id === id))
        .filter((a): a is Asset => !!a)
        .map((a) => ({
          asset: a,
          liquidationReason: a.liquidationReason || 'Hết hạn sử dụng',
          note: a.note || '',
        }));

      setSelectedAssetRows(initialRows);
    } else {
      setProposalCode(nextProposalCode);

      // Seed 1 asset from this department for instant demonstration
      const defaultAsset = assets.find((a) => a.department === department && a.status === 'CHUA_DE_NGHI');
      if (defaultAsset) {
        setSelectedAssetRows([
          {
            asset: defaultAsset,
            liquidationReason: 'Hết hạn sử dụng',
            note: defaultAsset.note || 'Bản in mờ, hộc mực nặng',
          },
        ]);
      }
    }
  }, [editingProposal, department, assets, nextProposalCode]);

  // Assets belonging to this department
  const departmentAssets = useMemo(() => {
    return assets.filter((a) => a.department === department);
  }, [assets, department]);

  // Occupied asset IDs in other active proposals
  const occupiedAssetIds = useMemo(() => {
    return proposals
      .filter((p) => p.id !== editingProposalId && p.status !== 'NHAP')
      .flatMap((p) => p.assetIds);
  }, [proposals, editingProposalId]);

  // Modal filtered assets based on search, type, and status
  const modalFilteredAssets = useMemo(() => {
    return departmentAssets.filter((a) => {
      const matchSearch =
        a.code.toLowerCase().includes(modalSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(modalSearch.toLowerCase());
      const matchType = modalTypeFilter === 'ALL' || a.type === modalTypeFilter;
      const matchStatus =
        modalStatusFilter === 'ALL'
          ? true
          : modalStatusFilter === 'DANG_BAO_TRI'
          ? a.condition.toLowerCase().includes('hỏng') || a.condition.toLowerCase().includes('lỗi')
          : true;
      return matchSearch && matchType && matchStatus;
    });
  }, [departmentAssets, modalSearch, modalTypeFilter, modalStatusFilter]);

  // 6. Click "+ Thêm tài sản": Mở Popup Thêm tài sản
  const handleOpenAddModal = () => {
    setModalSelectedIds(selectedAssetRows.map((r) => r.asset.id));
    setModalSearch('');
    setModalTypeFilter('ALL');
    setModalStatusFilter('ALL');
    setIsAddModalOpen(true);
  };

  // 26. Nút "Thêm vào danh sách (N)": Đẩy N tài sản được tick vào bảng chính
  const handleConfirmAddAssets = () => {
    const newRows: AssetRowState[] = modalSelectedIds.map((id) => {
      const existing = selectedAssetRows.find((r) => r.asset.id === id);
      if (existing) return existing;
      const asset = assets.find((a) => a.id === id)!;
      return {
        asset,
        liquidationReason: asset.liquidationReason || 'Hết hạn sử dụng',
        note: asset.note || 'Bản in mờ, hộc mực nặng',
      };
    });

    setSelectedAssetRows(newRows);
    setIsAddModalOpen(false);
  };

  // 10. Icon Thùng rác (Xóa): Xóa tài sản khỏi danh mục
  const handleRemoveAsset = (id: string) => {
    setSelectedAssetRows((prev) => prev.filter((r) => r.asset.id !== id));
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // 8. Cột "Lý do thanh lý": Dropdown (trong Grid)
  const handleRowReasonChange = (id: string, reasonVal: string) => {
    setSelectedAssetRows((prev) =>
      prev.map((r) => (r.asset.id === id ? { ...r, liquidationReason: reasonVal } : r))
    );
    if (validationErrors[id]?.reason) {
      setValidationErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], reason: false },
      }));
    }
  };

  // 9. Cột "Ghi chú / Mô tả": Textbox (trong Grid)
  const handleRowNoteChange = (id: string, noteVal: string) => {
    setSelectedAssetRows((prev) =>
      prev.map((r) => (r.asset.id === id ? { ...r, note: noteVal } : r))
    );
    if (validationErrors[id]?.note) {
      setValidationErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], note: false },
      }));
    }
  };

  // 16. Nút "Gửi đề nghị": Kiểm tra dữ liệu, chuyển trạng thái "Chờ tiếp nhận", báo NVQLTS
  const handleSubmit = (isSent: boolean) => {
    if (!isBPSDTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác tạo hoặc gửi đề nghị thanh lý thuộc quyền hạn của Bộ phận sử dụng tài sản (BPSDTS). Vui lòng chuyển sang vai trò BPSDTS.',
      });
      return;
    }

    if (selectedAssetRows.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng chọn ít nhất 01 tài sản vào danh mục tài sản đề nghị thanh lý!',
      });
      return;
    }

    // Validation: Lý do thanh lý và Ghi chú mô tả là bắt buộc cho từng tài sản
    const errors: { [assetId: string]: { reason?: boolean; note?: boolean } } = {};
    let hasError = false;

    for (const row of selectedAssetRows) {
      const rowErr: { reason?: boolean; note?: boolean } = {};
      if (
        !row.liquidationReason ||
        !['Hết hạn sử dụng', 'Sửa chữa không hiệu quả', 'Hư hỏng không thể sửa chữa'].includes(row.liquidationReason)
      ) {
        rowErr.reason = true;
        hasError = true;
      }
      if (!row.note || !row.note.trim()) {
        rowErr.note = true;
        hasError = true;
      }
      if (rowErr.reason || rowErr.note) {
        errors[row.asset.id] = rowErr;
      }
    }

    if (hasError && isSent) {
      setValidationErrors(errors);
      setFeedback({
        type: 'error',
        message: 'Bắt buộc: Vui lòng chọn "Lý do thanh lý" (1 trong 3 lý do) và nhập "Ghi chú / Mô tả" chi tiết thực trạng hư hỏng cho tất cả tài sản trong danh mục!',
      });
      return;
    }

    const assetIds = selectedAssetRows.map((r) => r.asset.id);
    const assetDetails = selectedAssetRows.map(row => ({ id: row.asset.id, liquidationReason: row.liquidationReason, note: row.note }));

    if (isEditing && editingProposal) {
      updateProposal(editingProposal.id, {
        assetDetails,
        reason,
        note: generalNote,
        assetIds,
        isSent,
      });
    } else {
      createProposal({
        assetDetails,
        code: proposalCode,
        date: proposalDate,
        department,
        reason,
        note: generalNote,
        assetIds,
        isSent,
      });
    }

    setEditingProposalId(null);
    setActiveScreen('PROPOSALS');
  };

  // Totals in main grid
  const totalOriginalPrice = selectedAssetRows.reduce((sum, r) => sum + r.asset.originalValue, 0);
  const totalRemainingVal = selectedAssetRows.reduce((sum, r) => sum + r.asset.remainingValue, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => {
              setEditingProposalId(null);
              setActiveScreen('PROPOSALS');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách đề nghị</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {isEditing ? `Chỉnh sửa đề nghị thanh lý (${proposalCode})` : 'Lập đề nghị thanh lý tài sản'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Biểu mẫu lập đề nghị thanh lý tài sản dành cho Bộ phận sử dụng tài sản (BPSDTS).
          </p>
        </div>

        {/* Top-right action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Lưu bản nháp
          </button>
          {/* 16. Nút "Gửi đề nghị" */}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Gửi đề nghị</span>
          </button>
        </div>
      </div>

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
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Thông báo ràng buộc dữ liệu:</span>
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

      {/* Role notice if not BPSDTS */}
      {!isBPSDTS && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold">Quyền hạn lập đề nghị: BPSDTS (Bộ phận sử dụng tài sản)</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Bạn đang xem với vai trò <strong>{currentUser.name} ({currentUser.role})</strong>. Thao tác lập và gửi đề nghị thanh lý do <strong>BPSDTS</strong> thực hiện.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('BPSDTS')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Chuyển sang BPSDTS
          </button>
        </div>
      )}

      {/* Editing notice if fixing returned proposal */}
      {isEditing && editingProposal?.rejectReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Hồ sơ đã được mở lại từ trạng thái Bị trả lại:</div>
            <div className="mt-0.5">{editingProposal.rejectReason}</div>
            <div className="text-slate-600 mt-1 italic">
              Vui lòng bổ sung hoặc điều chỉnh lý do thanh lý, ghi chú thực trạng bên dưới rồi bấm &quot;Gửi đề nghị&quot;.
            </div>
          </div>
        </div>
      )}

      {/* ===================== KHỐI: THÔNG TIN ĐỀ NGHỊ (1 - 4) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Thông tin đề nghị
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Số đề nghị: Textbox [20], O, Tự sinh (VD: TL-2026-025), Số tự sinh theo quy tắc, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số đề nghị
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={proposalCode}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-mono font-bold text-blue-900 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Ngày đề nghị: Date, O, Ngày hiện tại (VD: 21/10/2026), Định dạng dd/mm/yyyy, có icon lịch, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày đề nghị
            </label>
            <div className="relative">
              <input
                type="text"
                value={proposalDate}
                readOnly
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phòng / Bộ phận: Dropdown, O, Bộ phận từ tài khoản (VD: Phòng Kế toán), Lấy tự động từ tài khoản đăng nhập, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phòng / Bộ phận
            </label>
            <div className="relative">
              <select
                disabled
                value={department}
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed appearance-none select-none"
              >
                <option value={department}>{department}</option>
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Người đề nghị: Dropdown, O, Tên từ tài khoản (VD: NV003 - Nguyễn Minh Anh), Lấy tự động từ tài khoản đăng nhập, không sửa được */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Người đề nghị
            </label>
            <div className="relative">
              <select
                disabled
                value={creatorDisplayName}
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed appearance-none select-none"
              >
                <option value={creatorDisplayName}>{creatorDisplayName}</option>
              </select>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI: DANH MỤC TÀI SẢN ĐỀ NGHỊ THANH LÝ (Grid 11 cột: 5 - 10) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {/* 5. Tiêu đề khối */}
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Danh mục tài sản đề nghị thanh lý
            </h2>
          </div>

          {/* 6. Nút "+ Thêm tài sản": Button, I, Click: Mở Popup Thêm tài sản */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-600 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>+ Thêm tài sản</span>
          </button>
        </div>

        {/* 7. Bảng danh mục tài sản: Grid (11 cột) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3 w-28">Mã TS</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Tên TS</th>
                  <th className="py-2.5 px-3 w-16 text-center">Loại</th>
                  <th className="py-2.5 px-3 text-center w-20">Năm SX</th>
                  <th className="py-2.5 px-3 text-center w-20">Năm SD</th>
                  <th className="py-2.5 px-3 text-right w-28">Nguyên giá</th>
                  <th className="py-2.5 px-3 text-right w-28">Giá trị còn lại</th>
                  {/* 8. Cột Lý do thanh lý (Dropdown, bắt buộc) */}
                  <th className="py-2.5 px-3 min-w-[210px]">
                    Lý do thanh lý <span className="text-red-500">*</span>
                  </th>
                  {/* 9. Cột Ghi chú / Mô tả (Textbox, bắt buộc) */}
                  <th className="py-2.5 px-3 min-w-[230px]">
                    Ghi chú / Mô tả <span className="text-red-500">*</span>
                  </th>
                  {/* 10. Thao tác (Icon Thùng rác) */}
                  <th className="py-2.5 px-3 text-center w-14">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedAssetRows.length > 0 ? (
                  selectedAssetRows.map((row, index) => {
                    const rowErrors = validationErrors[row.asset.id];
                    const hasReasonError = rowErrors?.reason;
                    const hasNoteError = rowErrors?.note;

                    return (
                      <tr 
                        key={row.asset.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          hasReasonError || hasNoteError ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* 1. STT (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>

                        {/* 2. Mã TS (ma_tai_san) (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          {row.asset.code}
                        </td>

                        {/* 3. Tên TS (ten_tai_san) (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 font-medium text-slate-900">{row.asset.name}</td>

                        {/* 4. Loại (ma_loai - TSCĐ/CCDC) (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {row.asset.type}
                          </span>
                        </td>

                        {/* 5. Năm sản xuất (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          {row.asset.manufactureYear || 2018}
                        </td>

                        {/* 6. Năm đưa vào sử dụng (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          {row.asset.usageYear || 2019}
                        </td>

                        {/* 7. Nguyên giá (nguyen_gia_vnd) (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {row.asset.originalValue.toLocaleString('vi-VN')} đ
                        </td>

                        {/* 8. Giá trị còn lại (Hệ thống tự động điền) */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {row.asset.remainingValue.toLocaleString('vi-VN')} đ
                        </td>

                        {/* 8. Cột "Lý do thanh lý": Dropdown (trong Grid), Bắt buộc. Chọn 1 trong 3 */}
                        <td className="py-2 px-3">
                          <select
                            value={row.liquidationReason}
                            onChange={(e) => handleRowReasonChange(row.asset.id, e.target.value)}
                            className={`w-full py-1.5 px-2 text-xs border rounded-lg focus:outline-hidden bg-white font-medium ${
                              hasReasonError
                                ? 'border-red-500 focus:border-red-600 ring-1 ring-red-500'
                                : 'border-slate-200 focus:border-blue-500'
                            }`}
                          >
                            <option value="Hết hạn sử dụng">Hết hạn sử dụng</option>
                            <option value="Sửa chữa không hiệu quả">Sửa chữa không hiệu quả</option>
                            <option value="Hư hỏng không thể sửa chữa">Hư hỏng không thể sửa chữa</option>
                          </select>
                        </td>

                        {/* 9. Cột "Ghi chú / Mô tả": Textbox (trong Grid), Bắt buộc. Nhập chi tiết thực trạng hư hỏng */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Chi tiết thực trạng (VD: Bản in mờ, hộc mực nặng)..."
                            value={row.note}
                            onChange={(e) => handleRowNoteChange(row.asset.id, e.target.value)}
                            className={`w-full py-1.5 px-2 text-xs border rounded-lg focus:outline-hidden ${
                              hasNoteError
                                ? 'border-red-500 focus:border-red-600 ring-1 ring-red-500'
                                : 'border-slate-200 focus:border-blue-500'
                            }`}
                          />
                        </td>

                        {/* 10. Icon Thùng rác (Xóa): Click: Xóa tài sản khỏi danh mục */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(row.asset.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa tài sản khỏi danh mục"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                      Chưa có tài sản nào trong danh mục. Vui lòng bấm <strong>&quot;+ Thêm tài sản&quot;</strong> để chọn tài sản thanh lý.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table summary row */}
          {selectedAssetRows.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 font-medium">
                Tổng cộng: <strong className="text-slate-900">{selectedAssetRows.length}</strong> tài sản đề nghị
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <span>
                  Tổng nguyên giá: <strong className="font-mono text-slate-900">{totalOriginalPrice.toLocaleString('vi-VN')} đ</strong>
                </span>
                <span>·</span>
                <span>
                  Tổng GTCL: <strong className="font-mono text-blue-700">{totalRemainingVal.toLocaleString('vi-VN')} đ</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom submit action bar */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Lưu bản nháp
          </button>
          {/* 16. Nút "Gửi đề nghị" */}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Gửi đề nghị</span>
          </button>
        </div>
      </div>

      {/* ===================== D. POPUP: THÊM TÀI SẢN (17 - 26) ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* 17. Tiêu đề Popup & 18. Icon Đóng (X) */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                {/* 17. Tiêu đề Popup */}
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Thêm tài sản vào danh sách đề nghị thanh lý
                </h3>
              </div>
              {/* 18. Icon Đóng (X): Click: Đóng popup, không lưu */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Đóng popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar (19, 20, 21, 22) */}
            <div className="p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white">
              {/* 19. Ô tìm kiếm: Textbox [200], I, Placeholder "Nhập mã tài sản, tên tài sản..." */}
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Nhập mã tài sản, tên tài sản..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* 20. Bộ lọc "Loại tài sản": Dropdown, I, "Tất cả", Lọc theo TSCĐ / CCDC */}
              <div>
                <select
                  value={modalTypeFilter}
                  onChange={(e) => setModalTypeFilter(e.target.value as any)}
                  className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden bg-white"
                >
                  <option value="ALL">Loại tài sản: Tất cả</option>
                  <option value="TSCĐ">Tài sản cố định (TSCĐ)</option>
                  <option value="CCDC">Công cụ dụng cụ (CCDC)</option>
                </select>
              </div>

              {/* 21. Bộ lọc "Trạng thái tài sản": Dropdown, I, "Tất cả" & 22. Nút "Đặt lại" */}
              <div className="flex items-center gap-2">
                <select
                  value={modalStatusFilter}
                  onChange={(e) => setModalStatusFilter(e.target.value as any)}
                  className="flex-1 py-1.5 px-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden bg-white"
                >
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="DANG_SU_DUNG">Đang sử dụng</option>
                  <option value="DANG_BAO_TRI">Đang bảo trì / Hỏng</option>
                </select>

                {/* 22. Nút "Đặt lại": Button, I, Reset các bộ lọc về mặc định */}
                <button
                  type="button"
                  onClick={() => {
                    setModalSearch('');
                    setModalTypeFilter('ALL');
                    setModalStatusFilter('ALL');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0 text-xs transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              </div>
            </div>

            {/* 23. Bảng chọn tài sản: Grid (Checkbox + STT, Mã TS, Tên TS, Loại TS, Năm SX, Năm SD, Nguyên giá, GTCL) */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={
                            modalFilteredAssets.length > 0 &&
                            modalFilteredAssets
                              .filter((a) => !occupiedAssetIds.includes(a.id))
                              .every((a) => modalSelectedIds.includes(a.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const selectable = modalFilteredAssets
                                .filter((a) => !occupiedAssetIds.includes(a.id))
                                .map((a) => a.id);
                              setModalSelectedIds([...new Set([...modalSelectedIds, ...selectable])]);
                            } else {
                              const removeIds = modalFilteredAssets.map((a) => a.id);
                              setModalSelectedIds(modalSelectedIds.filter((id) => !removeIds.includes(id)));
                            }
                          }}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 text-center w-10">STT</th>
                      <th className="py-2.5 px-3 w-28">Mã TS</th>
                      <th className="py-2.5 px-3">Tên TS</th>
                      <th className="py-2.5 px-3 w-20 text-center">Loại TS</th>
                      <th className="py-2.5 px-3 text-center w-18">Năm SX</th>
                      <th className="py-2.5 px-3 text-center w-18">Năm SD</th>
                      <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                      <th className="py-2.5 px-3 text-right">Giá trị còn lại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalFilteredAssets.map((asset, idx) => {
                      const isOccupied = occupiedAssetIds.includes(asset.id);
                      const isChecked = modalSelectedIds.includes(asset.id);

                      return (
                        <tr
                          key={asset.id}
                          className={`transition-colors ${
                            isOccupied
                              ? 'bg-slate-50/70 opacity-45 cursor-not-allowed select-none'
                              : 'hover:bg-blue-50/40 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (isOccupied) return;
                            if (isChecked) {
                              setModalSelectedIds(modalSelectedIds.filter((id) => id !== asset.id));
                            } else {
                              setModalSelectedIds([...modalSelectedIds, asset.id]);
                            }
                          }}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              disabled={isOccupied}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setModalSelectedIds([...modalSelectedIds, asset.id]);
                                } else {
                                  setModalSelectedIds(modalSelectedIds.filter((id) => id !== asset.id));
                                }
                              }}
                              className={`rounded text-blue-600 ${isOccupied ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {asset.name}
                            {isOccupied && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-normal">
                                Đã nằm trong đề nghị khác
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{asset.type}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600">{asset.manufactureYear || 2018}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600">{asset.usageYear || 2019}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {asset.originalValue.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                            {asset.remainingValue.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Bottom: 25. Nút "Hủy" & 26. Nút "Thêm vào danh sách (N)" */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>
                  Đã chọn <strong>{modalSelectedIds.length}</strong> tài sản. Tài sản đã chọn sẽ được đưa vào danh mục để nhập lý do thanh lý.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 25. Nút "Hủy": Button, I, Click: Đóng popup, không lưu */}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                {/* 26. Nút "Thêm vào danh sách (N)": Button, I, Click: Đẩy N tài sản được tick vào bảng chính */}
                <button
                  type="button"
                  onClick={handleConfirmAddAssets}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Thêm vào danh sách ({modalSelectedIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
