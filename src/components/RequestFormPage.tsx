import React, { useState, useEffect } from 'react';
import { RequestTicket, RequestType, FormAssetItem, UserRole } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface RequestFormPageProps {
  mode: 'create' | 'view' | 'edit';
  ticket?: RequestTicket | null;
  onBack: () => void;
  onSubmit: (newTicket: RequestTicket, isDraft?: boolean) => void;
  onSaveEdit?: (updatedTicket: RequestTicket) => void;
  onPrint?: (ticket: RequestTicket) => void;
  onRevoke?: (ticket: RequestTicket) => void;
  onSwitchToEdit?: () => void;
  onApprove?: (ticket: RequestTicket) => void;
  onReject?: (ticket: RequestTicket) => void;
  onViewRejectionReason?: (ticket: RequestTicket) => void;
  currentRole?: UserRole;
  nextTicketCode?: string;
  nextId?: number;
}

interface StandardPackage {
  id: string;
  name: string;
  department: string;
  lastUpdated: string;
  items: FormAssetItem[];
}

const STANDARD_PACKAGES: Record<string, StandardPackage> = {
  standard_sales: {
    id: 'standard_sales',
    name: 'Định mức Tiêu chuẩn - Nhân viên kinh doanh (Sales Executive) - Áp dụng từ 01/2026',
    department: 'Phòng Kinh Doanh (KD)',
    lastUpdated: '15/01/2026',
    items: [
      {
        id: 'std_1',
        category: 'Laptop',
        specs: 'Core i5, RAM 16GB, SSD 512GB',
        quantity: 1,
        notes: 'Kèm balo, chuột không dây và sạc',
        isStandard: true,
      },
      {
        id: 'std_2',
        category: 'Màn hình rời 24 inch',
        specs: 'Full HD, IPS, 75Hz',
        quantity: 1,
        notes: 'Theo nhu cầu vị trí kinh doanh',
        isStandard: true,
      },
      {
        id: 'std_3',
        category: 'Điện thoại bàn',
        specs: 'Yealink SIP-T31P kèm nguồn',
        quantity: 1,
        notes: 'Cấp số nội bộ kinh doanh',
        isStandard: true,
      },
    ],
  },
  senior_sales: {
    id: 'senior_sales',
    name: 'Định mức Nâng cao - Nhân viên kinh doanh cấp cao (Senior Sales Executive)',
    department: 'Phòng Kinh Doanh (KD)',
    lastUpdated: '15/01/2026',
    items: [
      {
        id: 'std_s1',
        category: 'Laptop cao cấp',
        specs: 'Core i7, RAM 32GB, SSD 1TB',
        quantity: 1,
        notes: 'Kèm balo da cao cấp, chuột không dây công thái học',
        isStandard: true,
      },
      {
        id: 'std_s2',
        category: 'Màn hình rời 27 inch',
        specs: '2K QHD, IPS, Type-C 90W',
        quantity: 1,
        notes: 'Màn hình thuyết trình khách hàng',
        isStandard: true,
      },
      {
        id: 'std_s3',
        category: 'Tai nghe đàm thoại',
        specs: 'Jabra Evolve2 65 chống ồn chủ động',
        quantity: 1,
        notes: 'Phục vụ đàm phán hợp đồng',
        isStandard: true,
      },
      {
        id: 'std_s4',
        category: 'Điện thoại bàn thông minh',
        specs: 'Yealink T54W Wi-Fi/Bluetooth',
        quantity: 1,
        notes: 'Tích hợp tổng đài VIP',
        isStandard: true,
      },
    ],
  },
  intern_sales: {
    id: 'intern_sales',
    name: 'Định mức Tối giản - Thực tập sinh kinh doanh (Sales Intern)',
    department: 'Phòng Kinh Doanh (KD)',
    lastUpdated: '15/01/2026',
    items: [
      {
        id: 'std_i1',
        category: 'Laptop tiêu chuẩn',
        specs: 'Core i3/i5, RAM 8GB, SSD 256GB',
        quantity: 1,
        notes: 'Kèm sạc và túi chống sốc',
        isStandard: true,
      },
      {
        id: 'std_i2',
        category: 'Tai nghe có dây',
        specs: 'Logitech H390 USB',
        quantity: 1,
        notes: 'Phục vụ trực tổng đài tư vấn',
        isStandard: true,
      },
    ],
  },
};

export const RequestFormPage: React.FC<RequestFormPageProps> = ({
  mode = 'create',
  ticket = null,
  onBack,
  onSubmit,
  onSaveEdit,
  onPrint,
  onRevoke,
  onSwitchToEdit,
  onApprove,
  onReject,
  onViewRejectionReason,
  currentRole = 'employee',
  nextTicketCode = 'CP-2026-025',
  nextId = 25,
}) => {
  const isViewOnly = mode === 'view';

  // Section 1: Thông tin người lập
  const creatorName = ticket?.creatorName || 'Nguyễn Minh Anh';
  const creatorCode = ticket?.creatorCode || 'NV-0025';
  const creatorDepartment = ticket?.creatorDepartment || 'Nhân sự';
  const creatorRole = ticket?.creatorRole || 'Chuyên viên nhân sự';
  const ticketCode = ticket?.code || nextTicketCode;
  const createdDate = ticket?.createdDate || (() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  })();

  // Section 2: Đối tượng (Loại yêu cầu)
  const [requestType, setRequestType] = useState<RequestType>(
    ticket?.type || 'Cho nhân viên mới'
  );

  // Section 3: Người nhận tài sản
  const [recipientName, setRecipientName] = useState(
    ticket?.recipient || 'Trần Hoàng Nam'
  );
  const [recipientCode, setRecipientCode] = useState(
    ticket?.recipientCode || 'NV-0089'
  );
  const [recipientRole, setRecipientRole] = useState(
    ticket?.recipientRole || 'Nhân viên kinh doanh'
  );
  const [department, setDepartment] = useState(ticket?.department || 'KD');
  const [startDate, setStartDate] = useState(
    ticket?.startDate || ticket?.neededDate || '25/10/2026'
  );

  // Section 4: Tài sản cần cấp - Allocation Mode & Packages
  const [allocationMode, setAllocationMode] = useState<'standard' | 'custom'>(
    ticket?.allocationMode || 'standard'
  );

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    ticket?.standardPackage || 'standard_sales'
  );

  // Default custom items for custom mode
  const defaultCustomItems: FormAssetItem[] = [
    {
      id: '1',
      category: 'Máy tính xách tay',
      specs: 'RAM 16GB, SSD 512GB',
      quantity: 1,
      notes: 'Kèm bộ sạc',
    },
    {
      id: '2',
      category: 'Màn hình',
      specs: '24 inch, Full HD',
      quantity: 1,
      notes: '',
    },
  ];

  // Initialize assetRows based on ticket or default standard package
  const initialItems: FormAssetItem[] = ticket?.items && ticket.items.length > 0
    ? ticket.items
    : STANDARD_PACKAGES.standard_sales.items;

  const [assetRows, setAssetRows] = useState<FormAssetItem[]>(initialItems);

  // Section 5: Lý do & thời gian
  const [reason, setReason] = useState(ticket?.reason || '');
  const [neededDate, setNeededDate] = useState(ticket?.neededDate || '25/10/2026');

  // Validation states
  const [deptError, setDeptError] = useState(false);
  const [reasonError, setReasonError] = useState(false);

  // Sync state if ticket changes
  useEffect(() => {
    if (ticket) {
      setRequestType(ticket.type);
      setRecipientName(ticket.recipient);
      setRecipientCode(ticket.recipientCode || '');
      setRecipientRole(ticket.recipientRole || '');
      setDepartment(ticket.department || 'KD');
      setStartDate(ticket.startDate || ticket.neededDate);
      setAllocationMode(ticket.allocationMode || 'standard');
      setSelectedPackageId(ticket.standardPackage || 'standard_sales');
      setReason(ticket.reason || '');
      setNeededDate(ticket.neededDate);
      if (ticket.items && ticket.items.length > 0) {
        setAssetRows(ticket.items);
      }
    }
  }, [ticket]);

  // Handle switching allocation mode
  const handleAllocationModeChange = (mode: 'standard' | 'custom') => {
    if (isViewOnly) return;
    setAllocationMode(mode);
    if (mode === 'standard') {
      const pkg = STANDARD_PACKAGES[selectedPackageId] || STANDARD_PACKAGES.standard_sales;
      setAssetRows(pkg.items);
    } else {
      setAssetRows(defaultCustomItems);
    }
  };

  // Handle switching package in standard mode
  const handlePackageChange = (packageId: string) => {
    if (isViewOnly) return;
    setSelectedPackageId(packageId);
    const pkg = STANDARD_PACKAGES[packageId];
    if (pkg) {
      setAssetRows(pkg.items);
    }
  };

  // Toggle request type auto-fill
  const handleRequestTypeChange = (type: RequestType) => {
    if (isViewOnly) return;
    setRequestType(type);
    if (type === 'Cho cá nhân') {
      setRecipientName('Nguyễn Minh Anh');
      setRecipientCode('NV-0025');
      setRecipientRole('Chuyên viên nhân sự');
      setDepartment('NS');
    } else {
      setRecipientName('Trần Hoàng Nam');
      setRecipientCode('NV-0089');
      setRecipientRole('Nhân viên kinh doanh');
      setDepartment('KD');
    }
  };

  // Add new asset row in custom mode
  const handleAddAssetRow = () => {
    if (isViewOnly) return;
    const newRow: FormAssetItem = {
      id: String(Date.now()),
      category: 'Bàn phím & Chuột',
      specs: '',
      quantity: 1,
      notes: '',
    };
    setAssetRows([...assetRows, newRow]);
  };

  // Delete an asset row in custom mode
  const handleDeleteAssetRow = (id: string) => {
    if (isViewOnly) return;
    if (assetRows.length <= 1) {
      alert('Cần ít nhất một tài sản trong phiếu yêu cầu!');
      return;
    }
    setAssetRows(assetRows.filter((row) => row.id !== id));
  };

  // Change quantity with stepper (supports decimals, e.g. 2,5 or 2.5)
  const handleQtyChange = (id: string, delta: number) => {
    if (isViewOnly) return;
    setAssetRows(
      assetRows.map((row) => {
        if (row.id === id) {
          const rawStr = String(row.quantity ?? '1').replace(',', '.');
          const num = parseFloat(rawStr);
          const baseNum = isNaN(num) ? 1 : num;
          const step = (baseNum <= 1 && delta < 0) || (baseNum % 1 !== 0) ? 0.5 : 1;
          const newNum = Math.max(0.5, Math.round((baseNum + delta * step) * 10) / 10);
          const formatted = String(newNum).replace('.', ',');
          return { ...row, quantity: formatted };
        }
        return row;
      })
    );
  };

  // Update item field
  const handleRowChange = (id: string, field: keyof FormAssetItem, value: any) => {
    if (isViewOnly) return;
    setAssetRows(
      assetRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Submit form handler
  const handleFormSubmit = (isDraft: boolean = false) => {
    let isValid = true;

    if (!department) {
      setDeptError(true);
      isValid = false;
    } else {
      setDeptError(false);
    }

    if (!isDraft && !reason.trim()) {
      setReasonError(true);
      isValid = false;
    } else {
      setReasonError(false);
    }

    if (!isValid) return;

    const payload: RequestTicket = {
      id: ticket?.id || nextId,
      code: ticketCode,
      type: requestType,
      recipient: recipientName.trim() || 'Nguyễn Minh Anh',
      recipientCode,
      recipientRole,
      department,
      startDate,
      createdDate,
      neededDate: neededDate || createdDate,
      status: isDraft ? 'Nháp' : (ticket?.status && mode === 'edit' ? ticket.status : 'Chờ duyệt'),
      allocationMode,
      standardPackage: allocationMode === 'standard' ? selectedPackageId : undefined,
      creatorName,
      creatorCode,
      creatorDepartment,
      creatorRole,
      reason: reason.trim() || (isDraft ? 'Lưu bản nháp' : 'Yêu cầu cấp phát tài sản'),
      items: assetRows,
    };

    if (mode === 'edit' && onSaveEdit) {
      onSaveEdit(payload);
    } else {
      onSubmit(payload, isDraft);
    }
  };

  const currentPkg = STANDARD_PACKAGES[selectedPackageId] || STANDARD_PACKAGES.standard_sales;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* TopBar */}

      {/* Form Container */}
      <div className="flex-1 p-4 sm:p-8 pb-32 max-w-6xl mx-auto w-full">
        {/* Back Link & Page Title Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
            <span>Quay lại danh sách</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isViewOnly
                  ? 'Chi tiết phiếu yêu cầu cấp phát'
                  : mode === 'edit'
                  ? 'Chỉnh sửa phiếu yêu cầu cấp phát'
                  : 'Tạo phiếu yêu cầu cấp phát '}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isViewOnly
                  ? `Thông tin chi tiết tiến độ cấp phát của phiếu mã ${ticketCode}.`
                  : 'Điền thông tin để gửi yêu cầu cấp phát tài sản.'}
              </p>
            </div>

            {isViewOnly && ticket ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Trạng thái phiếu:</span>
                <StatusBadge status={ticket.status} />
              </div>
            ) : (
              <div className="text-xs text-rose-500 font-medium">* Thông tin bắt buộc</div>
            )}
          </div>
        </div>

        {/* Main Form Sheet */}
        <form
          className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-8"
          id="assetRequestForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(false);
          }}
        >
          {/* Rejection Notice if rejected */}
          {ticket?.status === 'Từ chối' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-rose-800 text-[13px]">Phiếu đã bị từ chối phê duyệt</h4>
                  <p className="text-rose-700 mt-1 leading-relaxed">
                    <strong>Lý do từ chối:</strong> {ticket.rejectionReason || ticket.reason}
                  </p>
                  {ticket.rejectedBy && (
                    <p className="text-rose-500 mt-1">
                      Người duyệt từ chối: {ticket.rejectedBy} {ticket.rejectedDate ? `(${ticket.rejectedDate})` : ''}
                    </p>
                  )}
                </div>
              </div>
              {onViewRejectionReason && (
                <button
                  type="button"
                  onClick={() => onViewRejectionReason(ticket)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer self-start sm:self-center shadow-xs"
                >
                  Xem chi tiết lý do
                </button>
              )}
            </div>
          )}

          {/* BEGIN: Section Thông tin người lập */}
          <section data-purpose="requester-info">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Thông tin người lập</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span>Tự động điền • Chỉ đọc</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Họ tên</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none"
                  readOnly
                  type="text"
                  value={creatorName}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Mã nhân viên</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none"
                  readOnly
                  type="text"
                  value={creatorCode}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Phòng ban</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none"
                  readOnly
                  type="text"
                  value={creatorDepartment}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Chức danh</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none"
                  readOnly
                  type="text"
                  value={creatorRole}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Mã phiếu</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none font-mono"
                  readOnly
                  type="text"
                  value={ticketCode}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Ngày lập</label>
                <input
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700 font-medium cursor-not-allowed focus:ring-0 focus:outline-none"
                  readOnly
                  type="text"
                  value={createdDate}
                />
              </div>
            </div>
          </section>
          {/* END: Section Thông tin người lập */}

          {/* BEGIN: Section Đối tượng */}
          <section data-purpose="request-type">
            <label className="block text-sm font-bold text-slate-800 mb-3">
              Đối tượng <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cho cá nhân card */}
              <label
                className={`relative flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-150 shadow-sm ${
                  isViewOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  requestType === 'Cho cá nhân'
                    ? 'border-2 border-blue-500 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  name="request_type"
                  type="radio"
                  value="personal"
                  checked={requestType === 'Cho cá nhân'}
                  disabled={isViewOnly}
                  onChange={() => handleRequestTypeChange('Cho cá nhân')}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">Cho cá nhân</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Yêu cầu tài sản cho bản thân</span>
                </div>
              </label>

              {/* Cho nhân viên mới card */}
              <label
                className={`relative flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-150 shadow-sm ${
                  isViewOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  requestType === 'Cho nhân viên mới'
                    ? 'border-2 border-blue-500 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  name="request_type"
                  type="radio"
                  value="new_employee"
                  checked={requestType === 'Cho nhân viên mới'}
                  disabled={isViewOnly}
                  onChange={() => handleRequestTypeChange('Cho nhân viên mới')}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">Cho nhân viên mới</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Đề nghị cấp phát cho nhân sự mới</span>
                </div>
              </label>
            </div>
          </section>
          {/* END: Section Đối tượng */}

          {/* BEGIN: Section Người nhận tài sản */}
          <section data-purpose="recipient-info">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Người nhận tài sản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-recipient-name" className="block text-xs text-slate-500 mb-1.5">
                  Họ tên <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  readOnly={isViewOnly}
                  className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-800 font-normal ${
                    isViewOnly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="form-recipient-code" className="block text-xs text-slate-500 mb-1.5">Mã nhân viên</label>
                <input
                  id="form-recipient-code"
                  type="text"
                  value={recipientCode}
                  onChange={(e) => setRecipientCode(e.target.value)}
                  placeholder="Nhập mã nhân viên"
                  readOnly={isViewOnly}
                  className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-800 font-normal placeholder-slate-400 ${
                    isViewOnly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="form-recipient-role" className="block text-xs text-slate-500 mb-1.5">
                  Chức danh <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-recipient-role"
                  type="text"
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value)}
                  readOnly={isViewOnly}
                  className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-800 font-normal ${
                    isViewOnly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="form-recipient-dept" className="block text-xs text-slate-500 mb-1.5">
                  Phòng ban <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="form-recipient-dept"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (e.target.value) setDeptError(false);
                    }}
                    disabled={isViewOnly}
                    className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-700 appearance-none font-normal pr-9 ${
                      isViewOnly
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                        : deptError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                    }`}
                  >
                    <option value="">Chọn phòng ban</option>
                    <option value="KD">Phòng Kinh Doanh</option>
                    <option value="KT">Phòng Kế Toán</option>
                    <option value="IT">Phòng Công Nghệ Thông Tin</option>
                    <option value="MKT">Phòng Marketing</option>
                    <option value="NS">Phòng Nhân Sự</option>
                    <option value="VH">Phòng Vận Hành</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                {deptError && <p className="text-[11px] text-rose-500 mt-1">Vui lòng chọn phòng ban</p>}
              </div>

              <div>
                <label htmlFor="form-start-date" className="block text-xs text-slate-500 mb-1.5">
                  Ngày bắt đầu làm việc <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="form-start-date"
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    readOnly={isViewOnly}
                    className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-800 font-normal pr-9 ${
                      isViewOnly
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* END: Section Người nhận tài sản */}

          {/* BEGIN: Section Tài sản cần cấp */}
          <section data-purpose="assets-list-section">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Tài sản cần cấp</h2>
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium" id="assetCountBadge">
                {assetRows.length} tài sản
              </span>
            </div>

            {/* Allocation mode options */}
            <div className="space-y-4 mb-4" data-purpose="asset-allocation-mode">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Chọn theo định mức */}
                <label
                  className={`relative flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 shadow-sm ${
                    isViewOnly ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    allocationMode === 'standard'
                      ? 'border-2 border-blue-600 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    name="allocation_mode"
                    type="radio"
                    value="standard"
                    checked={allocationMode === 'standard'}
                    disabled={isViewOnly}
                    onChange={() => handleAllocationModeChange('standard')}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-700">Chọn theo định mức</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Cấp phát theo tiêu chuẩn/định mức vị trí phòng ban
                    </span>
                  </div>
                </label>

                {/* 2. Yêu cầu mới */}
                <label
                  className={`relative flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 shadow-sm ${
                    isViewOnly ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    allocationMode === 'custom'
                      ? 'border-2 border-blue-600 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    name="allocation_mode"
                    type="radio"
                    value="custom"
                    checked={allocationMode === 'custom'}
                    disabled={isViewOnly}
                    onChange={() => handleAllocationModeChange('custom')}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">Yêu cầu mới</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Tùy chọn danh sách tài sản phát sinh theo nhu cầu
                    </span>
                  </div>
                </label>
              </div>

              {/* PHẦN LỰA CHỌN CÁC ĐỊNH MỨC (Chỉ hiện khi chọn 'standard') */}
              {allocationMode === 'standard' && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="package-select" className="block text-xs font-semibold text-slate-700">
                      Chọn gói định mức áp dụng <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      id="package-select"
                      value={selectedPackageId}
                      disabled={isViewOnly}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full text-xs rounded-lg border-blue-500 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2.5 pl-3.5 pr-10 text-slate-800 font-medium cursor-pointer"
                    >
                      <option value="standard_sales">
                        Định mức Tiêu chuẩn - Nhân viên kinh doanh (Sales Executive) - Áp dụng từ 01/2026
                      </option>
                      <option value="senior_sales">
                        Định mức Nâng cao - Nhân viên kinh doanh cấp cao (Senior Sales Executive)
                      </option>
                      <option value="intern_sales">
                        Định mức Tối giản - Thực tập sinh kinh doanh (Sales Intern)
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span>
                      Phòng ban áp dụng: <b>{currentPkg.department}</b> • Cập nhật lần cuối: <b>{currentPkg.lastUpdated}</b>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Table Container */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                <div className="col-span-3">
                  Loại tài sản <span className="text-rose-500">*</span>
                </div>
                <div className="col-span-4">Mô tả</div>
                <div className="col-span-2 text-center">
                  Số lượng <span className="text-rose-500">*</span>
                </div>
                <div className="col-span-2">Ghi chú</div>
                <div className="col-span-1 text-center" />
              </div>

              {/* Assets Row List */}
              <div className="divide-y divide-slate-100" id="assetRowsList">
                {assetRows.map((row) => {
                  if (allocationMode === 'standard' && row.isStandard) {
                    // Standard quota item with EDITABLE quantity stepper and notes
                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-12 items-center px-4 py-3 gap-3 asset-row bg-white hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="col-span-3 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">{row.category}</span>
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Định mức</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <input
                            className="w-full text-xs rounded-lg border-slate-200 bg-slate-50 text-slate-700 py-2 px-3 cursor-default"
                            readOnly
                            type="text"
                            value={row.specs || ''}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              aria-label="Giảm số lượng"
                              disabled={isViewOnly || (parseFloat(String(row.quantity).replace(',', '.')) || 1) <= 0.5}
                              onClick={() => handleQtyChange(row.id, -1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={row.quantity}
                              readOnly={isViewOnly}
                              placeholder="1"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^[\d.,]*$/.test(val)) {
                                  handleRowChange(row.id, 'quantity', val);
                                }
                              }}
                              onBlur={() => {
                                if (!row.quantity || String(row.quantity).trim() === '') {
                                  handleRowChange(row.id, 'quantity', '1');
                                }
                              }}
                              className="w-12 text-center text-xs font-bold border-none py-1.5 px-0 text-slate-800 bg-transparent focus:ring-0"
                            />
                            <button
                              type="button"
                              aria-label="Tăng số lượng"
                              disabled={isViewOnly}
                              onClick={() => handleQtyChange(row.id, 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 text-slate-700 placeholder-slate-400"
                            placeholder="Nhập ghi chú"
                            type="text"
                            value={row.notes || ''}
                            readOnly={isViewOnly}
                            onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {!isViewOnly && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAssetRow(row.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              title="Xóa tài sản"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.8"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Custom item row (either in custom mode or added to standard mode)
                  return (
                    <div key={row.id} className="grid grid-cols-12 items-center px-4 py-3 gap-3 asset-row">
                      {/* Loại tài sản */}
                      <div className="col-span-3 relative">
                        <select
                          value={row.category}
                          disabled={isViewOnly}
                          onChange={(e) => handleRowChange(row.id, 'category', e.target.value)}
                          className={`w-full text-xs rounded-lg py-2 pl-3 pr-7 text-slate-700 ${
                            isViewOnly
                              ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                          }`}
                        >
                          <option value="Máy tính xách tay">Máy tính xách tay</option>
                          <option value="Màn hình">Màn hình</option>
                          <option value="Bàn phím & Chuột">Bàn phím & Chuột</option>
                          <option value="Tai nghe">Tai nghe</option>
                          <option value="Thiết bị di động">Thiết bị di động</option>
                          <option value="Phụ kiện IT">Phụ kiện IT</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Mô tả */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={row.specs || ''}
                          readOnly={isViewOnly}
                          onChange={(e) => handleRowChange(row.id, 'specs', e.target.value)}
                          placeholder="Chi tiết cấu hình..."
                          className={`w-full text-xs rounded-lg py-2 px-3 text-slate-700 placeholder-slate-400 ${
                            isViewOnly
                              ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                          }`}
                        />
                      </div>

                      {/* Số lượng */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            aria-label="Giảm"
                            disabled={isViewOnly || (parseFloat(String(row.quantity).replace(',', '.')) || 1) <= 0.5}
                            onClick={() => handleQtyChange(row.id, -1)}
                            className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={row.quantity}
                            readOnly={isViewOnly}
                            placeholder="1"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[\d.,]*$/.test(val)) {
                                handleRowChange(row.id, 'quantity', val);
                              }
                            }}
                            onBlur={() => {
                              if (!row.quantity || String(row.quantity).trim() === '') {
                                handleRowChange(row.id, 'quantity', '1');
                              }
                            }}
                            className="w-12 text-center text-xs font-bold border-none py-1.5 px-0 text-slate-800 bg-transparent focus:ring-0"
                          />
                          <button
                            type="button"
                            aria-label="Tăng"
                            disabled={isViewOnly}
                            onClick={() => handleQtyChange(row.id, 1)}
                            className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={row.notes || ''}
                          readOnly={isViewOnly}
                          onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                          placeholder="Nhập ghi chú"
                          className={`w-full text-xs rounded-lg py-2 px-3 text-slate-700 placeholder-slate-400 ${
                            isViewOnly
                              ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                          }`}
                        />
                      </div>

                      {/* Action delete */}
                      <div className="col-span-1 flex justify-center">
                        {!isViewOnly && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAssetRow(row.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            title="Xóa tài sản"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Add Asset & Hint */}
            <div className="mt-3.5 flex items-center gap-4">
              {!isViewOnly && (
                <button
                  type="button"
                  onClick={handleAddAssetRow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 rounded-lg text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                  <span>Thêm tài sản</span>
                </button>
              )}
              <span className="text-[11px] text-slate-400">
                {allocationMode === 'standard'
                  ? 'Có thể điều chỉnh số lượng (hỗ trợ số thập phân, VD: 2,5) hoặc bổ sung thêm tài sản phát sinh theo nhu cầu.'
                  : 'Số lượng có thể nhập số thập phân (VD: 2,5).'}
              </span>
            </div>
          </section>
          {/* END: Section Tài sản cần cấp */}

          {/* BEGIN: Section Lý do & thời gian */}
          <section data-purpose="reason-and-deadline">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Lý do &amp; thời gian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Lý do yêu cầu textarea */}
              <div className="md:col-span-2">
                <label htmlFor="form-reason-textarea" className="block text-xs text-slate-500 mb-1.5">
                  Lý do yêu cầu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="form-reason-textarea"
                  rows={3}
                  value={reason}
                  readOnly={isViewOnly}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setReasonError(false);
                  }}
                  placeholder="Nhập lý do yêu cầu cấp phát tài sản"
                  className={`w-full text-xs rounded-lg p-3 text-slate-800 placeholder-slate-400 resize-y ${
                    isViewOnly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                      : reasonError
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                  }`}
                />
                {reasonError && <p className="text-[11px] text-rose-500 mt-1">Vui lòng nhập lý do yêu cầu</p>}
              </div>

              {/* Ngày cần sử dụng */}
              <div>
                <label htmlFor="form-target-date" className="block text-xs text-slate-500 mb-1.5">
                  Ngày cần sử dụng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="form-target-date"
                    type="text"
                    value={neededDate}
                    readOnly={isViewOnly}
                    onChange={(e) => setNeededDate(e.target.value)}
                    className={`w-full text-xs rounded-lg px-3.5 py-2.5 text-slate-800 font-normal pr-9 ${
                      isViewOnly
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* END: Section Lý do & thời gian */}
        </form>
      </div>

      {/* BEGIN: Bottom Fixed Action Bar */}
      <footer
        className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 shadow-lg"
        data-purpose="form-actions-bar"
      >
        <div className="text-xs text-blue-600 font-normal hidden sm:block">
          {isViewOnly
            ? 'Bạn đang xem thông tin chi tiết phiếu yêu cầu cấp phát.'
            : 'Vui lòng kiểm tra thông tin trước khi gửi phiếu.'}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isViewOnly ? (
            <>
              {/* Nút Quay lại */}
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                Quay lại danh sách
              </button>

              {/* Nút In phiếu */}
              {onPrint && ticket && (
                <button
                  type="button"
                  onClick={() => onPrint(ticket)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50/70 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                  <span>In phiếu</span>
                </button>
              )}

              {/* Quyền Quản lý tài sản: Duyệt / Từ chối */}
              {currentRole === 'asset_manager' ? (
                <>
                  {ticket && ticket.status === 'Chờ duyệt' && (
                    <>
                      {onReject && (
                        <button
                          type="button"
                          onClick={() => onReject(ticket)}
                          className="px-4 py-2 rounded-lg border border-rose-600 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50/70 transition-all cursor-pointer"
                        >
                          Từ chối
                        </button>
                      )}
                      {onApprove && (
                        <button
                          type="button"
                          onClick={() => onApprove(ticket)}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-emerald-500/25 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Duyệt phiếu</span>
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                /* Quyền Nhân viên: Thu hồi / Sửa phiếu */
                <>
                  {/* Nút Thu hồi (nếu còn có thể thu hồi) */}
                  {onRevoke && ticket && ticket.status !== 'Đã thu hồi' && ticket.status !== 'Đã cấp phát' && (
                    <button
                      type="button"
                      onClick={() => onRevoke(ticket)}
                      className="px-4 py-2 rounded-lg border border-amber-600 text-xs font-semibold text-amber-600 bg-white hover:bg-amber-50/70 transition-all cursor-pointer"
                    >
                      Thu hồi phiếu
                    </button>
                  )}

                  {/* Nút Sửa phiếu */}
                  {onSwitchToEdit && ticket && ticket.status !== 'Đã cấp phát' && ticket.status !== 'Đã thu hồi' && (
                    <button
                      type="button"
                      onClick={onSwitchToEdit}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-blue-500/25 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                      </svg>
                      <span>Sửa phiếu</span>
                    </button>
                  )}
                </>
              )}
            </>
          ) : mode === 'edit' ? (
            <>
              {/* Nút Hủy */}
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                Hủy bỏ
              </button>

              {/* Nút Lưu thay đổi */}
              <button
                type="button"
                onClick={() => handleFormSubmit(false)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-blue-500/25 cursor-pointer"
              >
                <span>Lưu thay đổi</span>
              </button>
            </>
          ) : (
            <>
              {/* Nút Lưu nháp */}
              <button
                type="button"
                onClick={() => handleFormSubmit(true)}
                className="px-5 py-2 rounded-lg border border-blue-600 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50/70 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Lưu nháp
              </button>

              {/* Nút Gửi phiếu */}
              <button
                type="button"
                onClick={() => handleFormSubmit(false)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-blue-500/25 cursor-pointer"
              >
                <svg className="w-4 h-4 -rotate-45 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Gửi phiếu</span>
              </button>
            </>
          )}
        </div>
      </footer>
      {/* END: Bottom Fixed Action Bar */}
    </div>
  );
};
