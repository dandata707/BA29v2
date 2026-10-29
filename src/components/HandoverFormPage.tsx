import { Header } from './Header';
import { handoverBreadcrumbs } from '../navigation/breadcrumbs';
import { useWorkspaceNavigation } from '../navigation/WorkspaceNavigation';
import React, { useState } from 'react';
import { HandoverProtocol, UserProfile, HandoverItem } from '../types.ts';
import { PasswordConfirmModal } from './PasswordConfirmModal.tsx';
import { canEditHandover, canSignHandover } from '../utils/handoverRules';
import { loadAssetCatalog } from '../data/assetCatalog';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { blankHandoverItem, isAvailableCatalogAsset, selectHandoverAsset, selectHandoverCategory, updateHandoverQuantity, validateHandoverItems } from '../utils/handoverItems';
import { handoverAmountInWords } from '../utils/handoverDocument';
import { Trash2 } from 'lucide-react';
import { TruncatedSelect } from './TruncatedSelect';

interface HandoverFormPageProps {
  mode?: 'create' | 'edit' | 'detail';
  protocol?: HandoverProtocol | null;
  currentUser: UserProfile;
  onBack: () => void;
  onSubmitSend: (protocol: HandoverProtocol, passwordConfirmed: boolean) => void;
  onSaveDraft?: (protocol: HandoverProtocol) => void;
  onOpenMobileSidebar?: () => void;
}

export const HandoverFormPage: React.FC<HandoverFormPageProps> = ({
  mode,
  protocol,
  currentUser,
  onBack,
  onSubmitSend,
  onSaveDraft,
  onOpenMobileSidebar,
}) => {
  const navigation = useWorkspaceNavigation();
  const isEmployee = currentUser.role === 'employee';
  const canEdit = canEditHandover(protocol, currentUser);
  const canSign = canSignHandover(protocol, currentUser);

  const todayStr = (() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  })();

  // Initial protocol values or defaults matching HTML
  const handoverCode = protocol?.code || `BBBG-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
  const createdDate = protocol?.createdDate || todayStr;

  // Sender info (defaults to manager or protocol)
  const [senderName, setSenderName] = useState(protocol?.senderName ?? 'Trần Văn Minh');
  const [senderCode, setSenderCode] = useState(protocol?.senderCode ?? 'NV00123');
  const [senderDept, setSenderDept] = useState(protocol?.senderDept ?? 'Phòng Hành chính');
  const [senderRole, setSenderRole] = useState(protocol?.senderRole ?? 'Chuyên viên');

  // Receiver info (defaults to recipient or protocol)
  const [receiverName, setReceiverName] = useState(protocol?.receiverName ?? 'Nguyễn Thị Mai');
  const [receiverCode, setReceiverCode] = useState(protocol?.receiverCode ?? 'NV00456');
  const [receiverDept, setReceiverDept] = useState(protocol?.receiverDept ?? 'Phòng Kinh doanh');
  const [receiverRole, setReceiverRole] = useState(protocol?.receiverRole ?? 'Trưởng phòng');

  // Assets list (defaults to sample matching HTML)
  const defaultItems: HandoverItem[] = protocol
    ? protocol.items
    : [
        {
          id: '1',
          name: 'Laptop Dell Latitude 7440',
          category: 'Thiết bị CNTT',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 25000000,
          totalPrice: 25000000,
          notes: 'Còn tốt, kèm sạc',
        },
        {
          id: '2',
          name: 'Màn hình Dell 27 inch',
          category: 'Thiết bị CNTT',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 6500000,
          totalPrice: 6500000,
          notes: 'Đã qua sử dụng',
        },
        {
          id: '3',
          name: 'Bàn làm việc văn phòng',
          category: 'Nội thất',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 2800000,
          totalPrice: 2800000,
          notes: 'Màu nâu, còn tốt',
        },
        {
          id: '4',
          name: 'Ghế xoay văn phòng',
          category: 'Nội thất',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 1200000,
          totalPrice: 1200000,
          notes: 'Còn tốt',
        },
        {
          id: '5',
          name: 'Điện thoại IP',
          category: 'Thiết bị văn phòng',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 1500000,
          totalPrice: 1500000,
          notes: 'Đã qua sử dụng',
        },
      ];

  const [items, setItems] = useState<HandoverItem[]>(defaultItems);
  const [catalog] = useState(loadAssetCatalog);
  const availableAssets = catalog.filter(isAvailableCatalogAsset);
  const categories = [...INITIAL_CATEGORIES];
  for (const asset of availableAssets) {
    if (!categories.some(category => category.id === asset.categoryId)) categories.push({ id: asset.categoryId, name: asset.categoryName, code: '', isITorElectronic: asset.isITorElectronic, defaultUsefulLifeMonths: 0 });
  }
  const [itemError, setItemError] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Totals calculation
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const currentStatus = protocol?.status || 'Nháp';

  const buildProtocolPayload = (status: HandoverProtocol['status']): HandoverProtocol => {
    return {
      id: protocol?.id || `hb_${Date.now()}`,
      code: handoverCode,
      createdDate,
      ticketCode: protocol?.ticketCode,
      senderName,
      senderCode,
      senderDept,
      senderRole,
      receiverName,
      receiverCode,
      receiverDept,
      receiverRole,
      items,
      totalQuantity: totalQty,
      totalValueNumber: totalValue,
      totalValueWords: handoverAmountInWords(totalValue),
      status,
      signedBySender: true,
      signedByReceiver: status === 'Hoàn tất',
    };
  };

  const handleOpenPasswordConfirm = () => {
    if (!canEdit && !canSign) return;
    if (canEdit) {
      const error = validateHandoverItems(items);
      setItemError(error || '');
      if (error) return;
    }
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirmed = (password: string) => {
    if (!password.trim()) return;
    if (canEdit && validateHandoverItems(items)) {
      setItemError(validateHandoverItems(items)!);
      setIsPasswordModalOpen(false);
      return;
    }
    setIsPasswordModalOpen(false);
    if (!canEdit && !canSign) return;
    if (canSign && protocol) {
      onSubmitSend({ ...protocol, status: 'Hoàn tất', signedByReceiver: true }, true);
      return;
    }
    // If employee is signing a "Chờ ký" protocol -> completes to "Hoàn tất"
    // If manager is sending -> sets to "Chờ ký" or "Hoàn tất"
    const nextStatus: HandoverProtocol['status'] = isEmployee ? 'Hoàn tất' : 'Chờ ký';
    const payload = buildProtocolPayload(nextStatus);
    onSubmitSend(payload, true);
  };

  const handleDraftSave = () => {
    if (!canEdit) return;
    const payload = buildProtocolPayload('Nháp');
    if (onSaveDraft) {
      onSaveDraft(payload);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#f0f4f9]">
      {/* Top Header */}
      <Header currentUser={currentUser} onToggleMobileMenu={onOpenMobileSidebar} breadcrumbs={handoverBreadcrumbs(protocol?.code, onBack, () => navigation?.navigate('Yêu cầu cấp phát'), mode || (canEdit ? protocol ? 'edit' : 'create' : 'detail'))} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-[1180px] mx-auto space-y-6">
          {/* Form Container Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 md:p-8 space-y-7">
            {/* Header Tiêu đề & Thông tin số biên bản */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4" data-purpose="document-title">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Biên bản bàn giao tài sản</h2>
                <p className="text-xs text-slate-500 mt-1">Lập biên bản bàn giao tài sản giữa các cá nhân/đơn vị trong tổ chức</p>
              </div>

              {/* Khối 2 ô thông tin biên bản bên góc phải */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-50/60 border border-slate-200 rounded-lg px-4 py-2 min-w-[155px]">
                  <div className="text-[11px] text-slate-500 font-medium">Số biên bản</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{handoverCode}</div>
                </div>
                <div className="bg-slate-50/60 border border-slate-200 rounded-lg px-4 py-2 min-w-[155px]">
                  <div className="text-[11px] text-slate-500 font-medium">Ngày lập biên bản</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{createdDate}</div>
                </div>
              </div>
            </div>

            {/* Handover Parties: Bên giao & Bên nhận */}
            {!canEdit && <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">Biên bản ở trạng thái {currentStatus} chỉ được xem; thông tin và danh sách tài sản bàn giao đã được khóa chỉnh sửa.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bên giao */}
              <div className="bg-[#f0f6ff]/70 border border-blue-100 rounded-xl p-5" data-purpose="sender-card">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-blue-600 leading-none">Bên giao</h3>
                  <p className="text-xs text-slate-500 mt-1">Thông tin người bàn giao tài sản</p>
                </div>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        readOnly
                        type="text"
                        value={senderName}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mã nhân viên <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        readOnly
                        type="text"
                        value={senderCode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban</label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        readOnly
                        type="text"
                        value={senderDept}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ</label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        readOnly
                        type="text"
                        value={senderRole}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bên nhận */}
              <div className="bg-[#f0faf5] border border-emerald-100 rounded-xl p-5" data-purpose="receiver-card">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-emerald-700 leading-none">Bên nhận</h3>
                  <p className="text-xs text-slate-500 mt-1">Thông tin người nhận tài sản</p>
                </div>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        readOnly
                        type="text"
                        value={receiverName}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mã nhân viên <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        readOnly
                        type="text"
                        value={receiverCode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban</label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        readOnly
                        type="text"
                        value={receiverDept}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ</label>
                      <input
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        readOnly
                        type="text"
                        value={receiverRole}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset List Section */}
            <div className="space-y-3.5" data-purpose="asset-list-table">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Danh sách tài sản bàn giao</h3>
                {canEdit && (
                  <button
                    className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-500 hover:bg-blue-50 rounded-lg transition-colors shadow-sm cursor-pointer"
                    type="button"
                    onClick={() => {
                      if (!canEdit) return;
                      const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
                      setItems(previous => [...previous, blankHandoverItem(id)]);
                      setItemError('');
                    }}
                  >
                    Thêm tài sản vào
                  </button>
                )}
              </div>

              {itemError && <p role="alert" className="text-xs text-red-600">{itemError}</p>}

              {/* Table */}
              <div className="overflow-x-auto border border-blue-100 rounded-xl shadow-xs">
                <table className="w-full min-w-[1120px] table-fixed text-xs text-left border-collapse">
                  <colgroup><col className="w-14" /><col className="w-[180px]" /><col className="w-[250px]" /><col className="w-20" /><col className="w-20" /><col className="w-32" /><col className="w-36" /><col className="w-[200px]" /></colgroup>
                  <thead>
                    <tr className="bg-[#e8f1fc] text-slate-800 font-bold border-b border-blue-200/80">
                      <th className="py-3 px-3 text-center w-12 font-bold" scope="col">STT</th>
                      <th className="py-3 px-4 font-bold" scope="col">Loại tài sản</th>
                      <th className="py-3 px-4 font-bold" scope="col">Tên tài sản</th>
                      <th className="py-3 px-3 font-bold text-center" scope="col">Đơn vị tính</th>
                      <th className="py-3 px-3 font-bold text-center" scope="col">Số lượng</th>
                      <th className="py-3 px-4 font-bold text-right" scope="col">Đơn giá</th>
                      <th className="py-3 px-4 font-bold text-right" scope="col">Thành tiền</th>
                      <th className="py-3 px-4 font-bold" scope="col">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {items.map((item, idx) => {
                      const categoryId = item.categoryId || categories.find(category => category.name === item.category)?.id || '';
                      const options = availableAssets.filter(asset => asset.categoryId === categoryId);
                      const selectedAsset = options.find(asset => asset.id === item.assetId);
                      const assetLabel = item.name
                        ? `${item.name}${selectedAsset?.maTaiSan ? ` (${selectedAsset.maTaiSan})` : ''}`
                        : !categoryId ? 'Chọn loại tài sản trước' : options.length ? 'Chọn tên tài sản' : 'Không có tài sản thuộc loại này';
                      const changeItem = (update: (previous: HandoverItem) => HandoverItem) => {
                        if (!canEdit) return;
                        setItems(previous => previous.map(row => row.id === item.id ? update(row) : row));
                        setItemError('');
                      };
                      return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 text-slate-600">{canEdit ? <TruncatedSelect displayValue={item.category || 'Chọn loại tài sản'} aria-label={`Loại tài sản dòng ${idx + 1}`} value={categoryId || item.category} onChange={event => { const value = event.target.value; changeItem(row => selectHandoverCategory(row, value, categories)); }}>
                          <option value="">Chọn loại tài sản</option>
                          {!categoryId && item.category && <option value={item.category}>{item.category}</option>}
                          {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </TruncatedSelect> : <span className="block truncate" title={item.category}>{item.category}</span>}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{canEdit ? <TruncatedSelect displayValue={assetLabel} aria-label={`Tên tài sản dòng ${idx + 1}`} title={!categoryId && !item.name ? 'Vui lòng chọn loại tài sản trước' : undefined} disabled={!categoryId || !options.length} value={item.assetId || ''} onChange={event => { const value = event.target.value; changeItem(row => selectHandoverAsset({ ...row, categoryId }, value, availableAssets)); }}>
                          <option value="">{!item.assetId && item.name ? item.name : !categoryId ? 'Chọn loại tài sản trước' : options.length ? 'Chọn tên tài sản' : 'Không có tài sản thuộc loại này'}</option>
                          {item.assetId && !options.some(asset => asset.id === item.assetId) && <option value={item.assetId}>{item.name}</option>}
                          {options.map(asset => <option key={asset.id} value={asset.id}>{asset.tenTaiSan} ({asset.maTaiSan})</option>)}
                        </TruncatedSelect> : <span className="block truncate" title={item.name}>{item.name}</span>}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                        <td className="py-3 px-3 text-center font-medium">{canEdit ? <input aria-label={`Số lượng dòng ${idx + 1}`} type="number" min="1" step="1" disabled={!item.name} value={item.quantity || ''} onChange={event => changeItem(row => updateHandoverQuantity(row, event.target.value))} className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-center disabled:bg-slate-50" /> : item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">
                          {item.name ? formatMoney(item.unitPrice) : ''}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 font-medium font-mono">
                          {item.name ? formatMoney(item.totalPrice) : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-normal break-words">{canEdit ? <div className="flex min-w-0 items-center gap-2"><input aria-label={`Ghi chú dòng ${idx + 1}`} title={item.notes} value={item.notes} onChange={event => { const value = event.target.value; changeItem(row => ({ ...row, notes: value })); }} className="min-w-0 w-full border border-slate-200 rounded-lg px-2 py-2" /><button type="button" aria-label={`Xóa tài sản dòng ${idx + 1}`} onClick={() => { if (!canEdit) return; setItems(previous => previous.filter(row => row.id !== item.id)); setItemError(''); }} className="text-slate-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button></div> : item.notes}</td>
                      </tr>
                    ); })}
                    {/* Summary Row */}
                    <tr className="bg-[#edf4fd] font-bold text-slate-900 border-t border-blue-200">
                      <td className="py-3.5 px-4 font-bold text-left text-slate-900 text-xs" colSpan={4}>
                        Tổng cộng
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-mono">{totalQty}</td>
                      <td className="py-3.5 px-4" />
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatMoney(totalValue)}
                      </td>
                      <td className="py-3.5 px-4" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Value Card */}
            <div className="border border-slate-200/90 rounded-xl p-5 bg-white space-y-2" data-purpose="total-value">
              <h4 className="text-sm font-bold text-slate-900">Tổng giá trị tài sản bàn giao</h4>
              <div className="flex flex-col md:flex-row md:items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Tổng giá trị (bằng số):</span>
                  <span className="text-lg font-bold text-blue-600 font-mono">{formatMoney(totalValue)} VNĐ</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-slate-300" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Tổng giá trị (bằng chữ):</span>
                  <span className="text-sm font-bold text-blue-600">{handoverAmountInWords(totalValue)}</span>
                </div>
              </div>
            </div>

            {/* Commitment Box */}
            <div className="bg-[#fef9ee] border border-[#fae5b6] rounded-xl p-4" data-purpose="commitment-note">
              <h4 className="text-xs font-bold text-slate-900 mb-1">Cam kết bàn giao</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Kể từ ngày <span className="font-bold text-blue-600">{createdDate}</span>, số tài sản trên sẽ do{' '}
                <span className="font-bold text-blue-600">{receiverName}</span> chịu trách nhiệm sử dụng và quản lý.
              </p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end items-center gap-3 pt-2" data-purpose="form-actions">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
              >
                Hủy / Quay lại
              </button>

              {canEdit && onSaveDraft && (
                <button
                  type="button"
                  onClick={handleDraftSave}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
                >
                  Lưu nháp
                </button>
              )}

              {currentStatus === 'Hoàn tất' ? (
                <span className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Đã hoàn tất ký nhận
                </span>
              ) : (canEdit || canSign) ? (
                <button
                  type="button"
                  onClick={handleOpenPasswordConfirm}
                  className="px-4 md:px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>{isEmployee ? 'Xác nhận' : 'Gửi'}</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Password Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={isPasswordModalOpen}
        handoverCode={handoverCode}
        currentUser={currentUser}
        title={isEmployee ? 'Xác nhận ký biên bản bàn giao' : 'Xác nhận gửi biên bản bàn giao'}
        subtitle={
          isEmployee
            ? 'Vui lòng nhập mật khẩu tài khoản của bạn để xác thực ký nhận bàn giao tài sản.'
            : 'Vui lòng nhập mật khẩu tài khoản của bạn để xác thực và hoàn tất ký biên bản bàn giao tài sản.'
        }
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirmed}
      />
    </div>
  );
};
