import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Eye, 
  Search, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Calendar, 
  Lock,
  UserCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  FileCheck2,
  FolderOpen,
  Building2,
  FileUp
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Submission, Asset, AttachedFile } from '../types/asset';
import { RejectSubmissionModal } from '../components/RejectSubmissionModal';

interface SubmissionListScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const SubmissionListScreen: React.FC<SubmissionListScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser, 
    switchUserRole,
    submissions, 
    assets, 
    decisions,
    selectedSubmissionId, 
    setSelectedSubmissionId, 
    approveSubmission, 
    rejectSubmission, 
    auditLogs,
    setActiveScreen 
  } = useAssetContext();

  const isDirector = currentUser.role === 'GIAM_DOC';

  // ===================== I. HEADER & BỘ LỌC =====================
  // 4. Bộ lọc Số tờ trình
  const [searchCode, setSearchCode] = useState('');
  // 5. Bộ lọc Bộ phận
  const [deptFilter, setDeptFilter] = useState('ALL');
  // 6. Bộ lọc Ngày gửi (Date range)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  // 7. Bộ lọc Trạng thái: Mặc định "Chờ phê duyệt"
  const [statusFilter, setStatusFilter] = useState('CHO_PHE_DUYET');

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    code: '',
    dept: 'ALL',
    from: '',
    to: '',
    status: 'CHO_PHE_DUYET',
  });

  // 8. Nút "Tìm kiếm" (Áp dụng bộ lọc)
  const handleApplyFilter = () => {
    setAppliedFilters({
      code: searchCode,
      dept: deptFilter,
      from: fromDate,
      to: toDate,
      status: statusFilter,
    });
    setCurrentPage(1);
  };

  // 9. Nút "Làm mới" (Reset bộ lọc)
  const handleResetFilter = () => {
    setSearchCode('');
    setDeptFilter('ALL');
    setFromDate('');
    setToDate('');
    setStatusFilter('CHO_PHE_DUYET');
    setAppliedFilters({
      code: '',
      dept: 'ALL',
      from: '',
      to: '',
      status: 'CHO_PHE_DUYET',
    });
    setCurrentPage(1);
  };

  // 14. Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchCode = !appliedFilters.code || s.code.toLowerCase().includes(appliedFilters.code.toLowerCase().trim());
      const matchDept = appliedFilters.dept === 'ALL' || s.department === appliedFilters.dept;
      const matchStatus = appliedFilters.status === 'ALL' || s.status === appliedFilters.status;
      return matchCode && matchDept && matchStatus;
    });
  }, [submissions, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);

  // Selected submission in grid
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // ===================== III. KHỐI CHI TIẾT TỜ TRÌNH (PANEL) =====================
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  const [detailTab, setDetailTab] = useState<'INFO' | 'ASSETS' | 'FILES'>('INFO');

  const currentSubmission = useMemo(() => {
    if (selectedSubmissionId) {
      const found = submissions.find((s) => s.id === selectedSubmissionId || s.code === selectedSubmissionId);
      if (found) return found;
    }
    return filteredSubmissions[0] || submissions[0];
  }, [submissions, selectedSubmissionId, filteredSubmissions]);

  // 13. Nút "Xem" (trong Grid): Click hiển thị panel chi tiết Tờ trình ở bên dưới
  const handleViewDetail = (sub: Submission) => {
    setSelectedSubmissionId(sub.id);
    setIsDetailPanelOpen(true);
    // Smooth scroll to panel
    setTimeout(() => {
      document.getElementById('detail-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Assets in current submission
  const currentSubmissionAssets = useMemo(() => {
    if (!currentSubmission) return [];
    return assets.filter((a) => currentSubmission.assetIds.includes(a.id));
  }, [assets, currentSubmission]);

  const totalOriginal = currentSubmissionAssets.reduce((sum, a) => sum + a.originalValue, 0);
  const totalRemaining = currentSubmissionAssets.reduce((sum, a) => sum + a.remainingValue, 0);

  // Today formatted for date inputs
  const todayDateString = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayFormattedVN = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    return `${day}/${month}/${year}`;
  }, []);

  // ===================== V. KHỐI Ý KIẾN PHÊ DUYỆT (21 - 27) =====================
  // 22. Radio "Kết quả xem xét": Bắt buộc chọn 1 trong 2: Phê duyệt / Không phê duyệt
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT' | null>(null);

  // 23. Textbox "Số quyết định" [30] (Bắt buộc nếu chọn "Phê duyệt")
  const [decisionCode, setDecisionCode] = useState('');

  // 24. Date "Ngày quyết định" (Date, Bắt buộc nếu chọn "Phê duyệt")
  const [decisionDate, setDecisionDate] = useState(todayDateString);

  // 25. File "Tệp quyết định đã ký" (File upload, Bắt buộc nếu chọn "Phê duyệt", PDF ≤ 10MB)
  const [decisionFile, setDecisionFile] = useState<AttachedFile | null>(null);

  // 26. Textbox "Ghi chú" [500] (Bắt buộc nếu chọn "Phê duyệt")
  const [decisionNote, setDecisionNote] = useState('');

  // 27. Textarea "Lý do từ chối" [500] (Bắt buộc nếu chọn "Không phê duyệt", Tối đa 500 ký tự)
  const [rejectReason, setRejectReason] = useState('');

  // Modal / Toast
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-generate suggested decision code
  useEffect(() => {
    if (currentSubmission) {
      const num = currentSubmission.code.replace(/\D/g, '') || '015';
      const codeSuggest = `QĐ-2026-0${num.padStart(2, '0')}`;
      setDecisionCode(codeSuggest);
      setDecisionDate(todayDateString);
      setDecisionFile({
        id: `qd-file-${currentSubmission.code}`,
        name: `${codeSuggest}-signed.pdf`,
        size: '2.4 MB',
        type: 'pdf',
        uploadedAt: todayFormattedVN + ' 10:30',
      });
      setDecisionNote('Đồng ý phê duyệt phương án thanh lý theo đề xuất của NVQLTS và biên bản kiểm tra hiện trạng.');
      setRejectReason('Cần bổ sung chứng thư thẩm định giá độc lập từ đơn vị có thẩm quyền theo quy định.');
    }
  }, [currentSubmission?.id, currentSubmission?.code, todayDateString, todayFormattedVN]);

  // File Upload handler for decision file (25)
  const handleDecisionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Dung lượng tệp quyết định vượt quá giới hạn 10MB!',
        });
        return;
      }
      setDecisionFile({
        id: `df-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'pdf',
        uploadedAt: 'Hôm nay ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
      setFeedback({
        type: 'success',
        message: `Đã đính kèm tệp quyết định đã ký: ${file.name}.`,
      });
    }
  };

  // 29. Nút "Phê duyệt" / "Lưu kết quả"
  const handleExecuteDecision = () => {
    if (!isDirector) {
      setFeedback({
        type: 'error',
        message: 'Chỉ người dùng có vai trò Giám đốc mới có quyền Phê duyệt & Ban hành Quyết định hoặc Trả hồ sơ!',
      });
      return;
    }

    if (!decisionMode) {
      setFeedback({
        type: 'error',
        message: 'Bắt buộc chọn Kết quả xem xét: "Phê duyệt" hoặc "Không phê duyệt"!',
      });
      return;
    }

    if (decisionMode === 'APPROVE') {
      // Số quyết định bắt buộc
      if (!decisionCode.trim()) {
        setFeedback({
          type: 'error',
          message: 'Bắt buộc nhập Số quyết định!',
        });
        return;
      }

      // Check duplicate
      const isDuplicate = decisions.some(
        (d) => d.code.toLowerCase().trim() === decisionCode.toLowerCase().trim()
      );
      if (isDuplicate) {
        setFeedback({
          type: 'error',
          message: `Số quyết định ${decisionCode} đã tồn tại trong hệ thống. Vui lòng nhập số quyết định khác!`,
        });
        return;
      }

      // Ngày quyết định bắt buộc, không lớn hơn ngày hiện tại
      if (!decisionDate) {
        setFeedback({
          type: 'error',
          message: 'Bắt buộc chọn Ngày quyết định!',
        });
        return;
      }
      if (decisionDate > todayDateString) {
        setFeedback({
          type: 'error',
          message: 'Ngày quyết định không được lớn hơn ngày hiện tại!',
        });
        return;
      }

      // 25. Tệp quyết định đã ký bắt buộc
      if (!decisionFile) {
        setFeedback({
          type: 'error',
          message: 'Bắt buộc tải lên Tệp quyết định đã ký (định dạng PDF ≤ 10MB)!',
        });
        return;
      }

      // Ghi chú bắt buộc
      if (!decisionNote.trim()) {
        setFeedback({
          type: 'error',
          message: 'Bắt buộc nhập Ghi chú chỉ đạo!',
        });
        return;
      }

      const formattedSignDate = decisionDate.split('-').reverse().join('/');
      approveSubmission(currentSubmission.id, decisionCode, formattedSignDate, decisionNote);
      setFeedback({
        type: 'success',
        message: `Đã phê duyệt Tờ trình ${currentSubmission.code} và ban hành Quyết định ${decisionCode}! Tài sản đã chuyển sang trạng thái "Được duyệt thanh lý".`,
      });
    } else {
      // Lý do từ chối bắt buộc
      if (!rejectReason.trim()) {
        setFeedback({
          type: 'error',
          message: 'Bắt buộc nhập Lý do từ chối / trả bổ sung hồ sơ!',
        });
        return;
      }
      if (rejectReason.length > 500) {
        setFeedback({
          type: 'error',
          message: 'Lý do từ chối không được vượt quá 500 ký tự!',
        });
        return;
      }

      rejectSubmission(currentSubmission.id, rejectReason);
      setFeedback({
        type: 'success',
        message: `Đã chuyển trạng thái Tờ trình ${currentSubmission.code} sang "Trả bổ sung" và gửi thông báo yêu cầu chỉnh sửa đến NVQLTS!`,
      });
    }
  };

  // 28. Nút "Hủy": Đóng panel, không lưu kết quả
  const handleClosePanel = () => {
    setIsDetailPanelOpen(false);
  };

  // 12. Badge trạng thái
  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'CHO_PHE_DUYET':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Chờ phê duyệt
          </span>
        );
      case 'DA_PHE_DUYET':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Đã phê duyệt
          </span>
        );
      case 'TRA_BO_SUNG':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            Trả bổ sung
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            Bản nháp
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ===================== I. HEADER & BỘ LỌC (1 - 9) ===================== */}
      {/* 1. Breadcrumb: Link O: Home / Thanh lý tài sản / Phê duyệt thanh lý */}
      <nav className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
        <button
          type="button"
          onClick={() => setActiveScreen('OVERVIEW')}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <span className="hover:text-blue-600 cursor-pointer">Thanh lý tài sản</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">Phê duyệt thanh lý</span>
      </nav>

      {/* 2. Tiêu đề màn hình & 3. Mô tả màn hình */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Phê duyệt thanh lý tài sản
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Xem xét tờ trình, danh mục tài sản và quyết định phê duyệt hoặc trả hồ sơ bổ sung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Thẩm quyền:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Giám đốc Điều hành
          </span>
        </div>
      </div>

      {/* Role notice if not Giám đốc */}
      {!isDirector && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Lưu ý phân quyền:</span> Bạn đang xem màn hình với vai trò{' '}
              <span className="font-bold underline">{currentUser.roleTitle}</span>. Nghiệp vụ <strong>Phê duyệt & Ban hành Quyết định</strong> hoặc <strong>Trả hồ sơ bổ sung</strong> thuộc thẩm quyền của{' '}
              <span className="font-bold text-blue-700">Giám đốc (Lê Hoàng Nam)</span>.
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('GIAM_DOC')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chuyển sang Giám đốc</span>
          </button>
        </div>
      )}

      {/* Filter Bar (4 - 9) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 4. Bộ lọc Số tờ trình: Textbox, I */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tờ trình
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhập số tờ trình..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* 5. Bộ lọc Bộ phận: Dropdown, I */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bộ phận
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="ALL">Tất cả bộ phận</option>
              <option value="Phòng Quản lý Tài sản">Phòng Quản lý Tài sản</option>
              <option value="Phòng Kế toán">Phòng Kế toán</option>
              <option value="Phòng Hành chính">Phòng Hành chính</option>
              <option value="Phòng IT">Phòng IT</option>
            </select>
          </div>

          {/* 6. Bộ lọc Ngày gửi: Date range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày gửi (Từ ngày - Đến ngày)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* 7. Bộ lọc Trạng thái: Dropdown, I, Mặc định "Chờ phê duyệt" */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CHO_PHE_DUYET">Chờ phê duyệt</option>
              <option value="DA_PHE_DUYET">Đã phê duyệt</option>
              <option value="TRA_BO_SUNG">Trả bổ sung</option>
            </select>
          </div>
        </div>

        {/* 8. Nút "Tìm kiếm" (Xanh đặc) & 9. Nút "Làm mới" (Outline) */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetFilter}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleApplyFilter}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm</span>
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
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {feedback.type === 'success' ? 'Thành công:' : 'Lỗi / Cảnh báo:'}
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

      {/* ===================== II. KHỐI DANH SÁCH TỜ TRÌNH CHỜ DUYỆT (10 - 14) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          {/* 10. Tiêu đề khối */}
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Danh sách tờ trình chờ phê duyệt ({filteredSubmissions.length} tờ trình)
          </h2>
          <span className="text-xs text-slate-500">
            Trang {currentPage} / {totalPages}
          </span>
        </div>

        {/* 11. Bảng danh sách Tờ trình: Grid */}
        {/* Cột: Checkbox, Số TTr, Ngày lập, Người lập, Tổng nguyên giá, Trạng thái (Badge), Thao tác (Nút Xem) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={paginatedSubmissions.length > 0 && checkedIds.length === paginatedSubmissions.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedIds(paginatedSubmissions.map((s) => s.id));
                        } else {
                          setCheckedIds([]);
                        }
                      }}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-32">Số TTr</th>
                  <th className="py-3 px-3 w-28">Ngày lập</th>
                  <th className="py-3 px-3">Người lập</th>
                  <th className="py-3 px-3 text-right w-36">Tổng nguyên giá</th>
                  <th className="py-3 px-3 w-36">Trạng thái</th>
                  <th className="py-3 px-3 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((item) => {
                    const isSelected = currentSubmission?.id === item.id;
                    const isChecked = checkedIds.includes(item.id);

                    // Compute total original value for submission
                    const itemAssets = assets.filter((a) => item.assetIds.includes(a.id));
                    const totalVal = itemAssets.reduce((sum, a) => sum + a.originalValue, 0);

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedIds([...checkedIds, item.id]);
                              } else {
                                setCheckedIds(checkedIds.filter((id) => id !== item.id));
                              }
                            }}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* Số TTr */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">
                          {item.code}
                        </td>

                        {/* Ngày lập */}
                        <td className="py-3 px-3 text-slate-600">{item.createdDate}</td>

                        {/* Người lập */}
                        <td className="py-3 px-3 text-slate-800">{item.creatorName}</td>

                        {/* Tổng nguyên giá */}
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          {totalVal.toLocaleString('vi-VN')} đ
                        </td>

                        {/* 12. Trạng thái (Badge) */}
                        <td className="py-3 px-3">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* 13. Nút "Xem" (trong Grid): Click hiển thị panel chi tiết Tờ trình ở bên dưới */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(item)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy tờ trình nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 14. Phân trang: Pagination (1 / N trang) */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{paginatedSubmissions.length}</strong> / <strong>{filteredSubmissions.length}</strong> tờ trình
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== III. KHỐI CHI TIẾT TỜ TRÌNH (PANEL) (15 - 29) ===================== */}
      {isDetailPanelOpen && currentSubmission && (
        <div id="detail-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* 15. Tiêu đề Panel: Có badge trạng thái bên cạnh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Chi tiết tờ trình thanh lý - {currentSubmission.code}
              </h2>
              {/* Badge trạng thái */}
              <div>{getStatusBadge(currentSubmission.status)}</div>
            </div>

            <button
              type="button"
              onClick={handleClosePanel}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              title="Đóng panel chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (16, 17, 18) */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {/* 16. Tab "Thông tin chung" (Mặc định) */}
            <button
              type="button"
              onClick={() => setDetailTab('INFO')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                detailTab === 'INFO'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Thông tin chung
            </button>

            {/* 17. Tab "Danh mục tài sản" */}
            <button
              type="button"
              onClick={() => setDetailTab('ASSETS')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                detailTab === 'ASSETS'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Danh mục tài sản ({currentSubmissionAssets.length})
            </button>

            {/* 18. Tab "Hồ sơ đính kèm" */}
            <button
              type="button"
              onClick={() => setDetailTab('FILES')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                detailTab === 'FILES'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Hồ sơ đính kèm ({currentSubmission.attachedFiles.length})
            </button>
          </div>

          {/* ===================== IV. KHỐI NỘI DUNG TAB "THÔNG TIN CHUNG" (19 - 20) ===================== */}
          {detailTab === 'INFO' && (
            <div className="space-y-6">
              {/* 19. Thông tin Tờ trình (Read-only) */}
              {/* Hiển thị: Số TTr, Ngày lập, Người lập, Bộ phận, Tổng nguyên giá, Tổng GTCL, Nội dung */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thông tin tổng quan tờ trình
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <span className="text-slate-400 block font-medium">Số TTr:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{currentSubmission.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Ngày lập:</span>
                    <span className="font-semibold text-slate-800">{currentSubmission.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Người lập:</span>
                    <span className="font-semibold text-slate-800">{currentSubmission.creatorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Bộ phận:</span>
                    <span className="font-semibold text-slate-800">{currentSubmission.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Tổng nguyên giá:</span>
                    <span className="font-mono font-bold text-slate-900">{totalOriginal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Tổng GTCL:</span>
                    <span className="font-mono font-bold text-blue-700">{totalRemaining.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-400 block font-medium mb-1">Nội dung / Lý do thanh lý:</span>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-normal">
                    {currentSubmission.reason}
                  </div>
                </div>
              </div>

              {/* 20. Bảng danh mục tài sản: Grid (Read-only), Load từ CT_TO_TRINH */}
              {/* Cột: STT, Mã tài sản, Tên tài sản, Nguyên giá */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh mục tài sản ({currentSubmissionAssets.length} tài sản)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDetailTab('ASSETS')}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Xem chi tiết đầy đủ &rarr;
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 w-32">Mã tài sản</th>
                        <th className="py-2.5 px-3">Tên tài sản</th>
                        <th className="py-2.5 px-3 text-right w-36">Nguyên giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSubmissionAssets.map((asset, idx) => (
                        <tr key={asset.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{asset.name}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-800">
                            {asset.originalValue.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: "Danh mục tài sản" (Grid đầy đủ) */}
          {detailTab === 'ASSETS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Toàn bộ {currentSubmissionAssets.length} tài sản đã qua kiểm tra & thẩm định</span>
                <div className="flex items-center gap-4">
                  <span>Tổng nguyên giá: <strong className="font-mono text-slate-900">{totalOriginal.toLocaleString('vi-VN')} đ</strong></span>
                  <span>·</span>
                  <span>Tổng GTCL: <strong className="font-mono text-blue-700">{totalRemaining.toLocaleString('vi-VN')} đ</strong></span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">STT</th>
                        <th className="py-2.5 px-3 w-28">Mã tài sản</th>
                        <th className="py-2.5 px-3 min-w-[170px]">Tên tài sản</th>
                        <th className="py-2.5 px-3 text-center w-16">Loại</th>
                        <th className="py-2.5 px-3 text-right w-28">Nguyên giá</th>
                        <th className="py-2.5 px-3 text-right w-28">Giá trị còn lại</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Hiện trạng thực tế</th>
                        <th className="py-2.5 px-3 w-32">Kết luận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSubmissionAssets.map((asset, idx) => (
                        <tr key={asset.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{asset.code}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{asset.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600">{asset.type}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                            {asset.originalValue.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                            {asset.remainingValue.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{asset.condition || 'Hỏng hóc, sửa không hiệu quả'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đủ điều kiện thanh lý
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 18: "Hồ sơ đính kèm" */}
          {detailTab === 'FILES' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Hồ sơ pháp lý đính kèm ({currentSubmission.attachedFiles.length} tài liệu):</strong> Đã tích hợp Đề nghị thanh lý & Biên bản thẩm định đã ký duyệt.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(currentSubmission.attachedFiles.length > 0
                  ? currentSubmission.attachedFiles
                  : [
                      { id: 'f-1', name: `DeNghi-${currentSubmission.code}.pdf`, size: '1.8 MB' },
                      { id: 'f-2', name: `BB-KiemTra-${currentSubmission.code}.pdf`, size: '2.1 MB' },
                    ]
                ).map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onOpenDocModal(file.name, currentSubmission.code, 'TO_TRINH')}
                    className="p-4 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-700">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {file.size} · Đã ký số xác thực
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white rounded-lg text-xs font-bold transition-colors shrink-0">
                      Xem trước
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== V. KHỐI Ý KIẾN PHÊ DUYỆT (21 - 27) ===================== */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            {/* 21. Tiêu đề khối: Label "Ý kiến phê duyệt" (chữ đậm, có icon) */}
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Ý kiến phê duyệt
              </h3>
            </div>

            {/* 22. Radio "Kết quả xem xét": Bắt buộc chọn 1 trong 2: Phê duyệt / Không phê duyệt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option Phê duyệt */}
              <div
                onClick={() => setDecisionMode('APPROVE')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  decisionMode === 'APPROVE'
                    ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    name="decisionRadioReview"
                    checked={decisionMode === 'APPROVE'}
                    onChange={() => setDecisionMode('APPROVE')}
                    className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-slate-900">
                    Phê duyệt & Ban hành quyết định
                  </span>
                </div>

                <div className="space-y-3 text-xs pl-6">
                  {/* 23. Textbox "Số quyết định" [30] & 24. Date "Ngày quyết định" */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Số quyết định <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="VD: QĐ-2026-015"
                        value={decisionCode}
                        onChange={(e) => setDecisionCode(e.target.value)}
                        className="w-full py-1.5 px-2.5 text-xs font-mono font-bold text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ngày quyết định <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        max={todayDateString}
                        value={decisionDate}
                        onChange={(e) => setDecisionDate(e.target.value)}
                        className="w-full py-1.5 px-2.5 text-xs font-mono text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 25. File "Tệp quyết định đã ký" (File upload, PDF ≤ 10MB) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tệp quyết định đã ký <span className="text-red-500">*</span>
                    </label>
                    {decisionFile ? (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="truncate font-medium text-slate-800">{decisionFile.name} ({decisionFile.size})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDocModal(`Quyết định thanh lý - ${decisionCode}`, decisionCode, 'QUYET_DINH')}
                            className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer"
                          >
                            Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionFile(null)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors">
                        <FileUp className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-blue-600 font-semibold">Tải lên file PDF quyết định đã ký</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleDecisionFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 26. Textbox "Ghi chú" [500] (Bắt buộc theo UI có dấu *) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ghi chú <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={500}
                      placeholder="Nhập ghi chú chỉ đạo..."
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Option Không phê duyệt */}
              <div
                onClick={() => setDecisionMode('REJECT')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  decisionMode === 'REJECT'
                    ? 'border-red-600 bg-red-50/20 ring-1 ring-red-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    name="decisionRadioReview"
                    checked={decisionMode === 'REJECT'}
                    onChange={() => setDecisionMode('REJECT')}
                    className="text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-red-800">
                    Không phê duyệt / Yêu cầu trả bổ sung
                  </span>
                </div>

                <div className="space-y-3 text-xs pl-6">
                  {/* 27. Textarea "Lý do từ chối" [500] */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Lý do từ chối <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRejectModalOpen(true);
                        }}
                        className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Gợi ý lý do nhanh &rarr;
                      </button>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={6}
                      placeholder="Nhập lý do từ chối hoặc các điểm cần bổ sung gửi lại NVQLTS..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-500 bg-white leading-relaxed"
                    />
                    <div className="text-[11px] text-slate-400 text-right mt-0.5">
                      {rejectReason.length}/500 ký tự
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== VI. KHỐI NÚT THAO TÁC (FOOTER: 28 - 29) ===================== */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {decisionMode === 'APPROVE' && 'Hồ sơ sẽ được ban hành Quyết định thanh lý và chuyển tiếp sang bước thực hiện.'}
              {decisionMode === 'REJECT' && 'Hồ sơ sẽ chuyển trạng thái "Trả bổ sung" để NVQLTS hoàn thiện lại.'}
              {!decisionMode && 'Vui lòng tích chọn một trong hai phương án xem xét ở trên.'}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* 28. Nút "Hủy": Button (Outline xám), Đóng panel, không lưu kết quả */}
              <button
                type="button"
                onClick={handleClosePanel}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy
              </button>

              {/* 29. Nút "Phê duyệt" / "Lưu kết quả": Button (Xanh đặc) */}
              <button
                type="button"
                onClick={handleExecuteDecision}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors ${
                  decisionMode === 'REJECT'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{decisionMode === 'REJECT' ? 'Xác nhận trả bổ sung' : 'Phê duyệt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with preset templates */}
      <RejectSubmissionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        submission={currentSubmission}
        onConfirmReject={(id, reasonText) => {
          setRejectReason(reasonText);
          setDecisionMode('REJECT');
          setIsRejectModalOpen(false);
        }}
      />
    </div>
  );
};
