import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Plus, 
  CheckCircle2, 
  UploadCloud, 
  Eye, 
  Save, 
  ArrowRight, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users, 
  Trash2, 
  Check, 
  Building2, 
  UserCheck, 
  FileUp, 
  Clock, 
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
import { Asset, Proposal, InspectionParticipant, AttachedFile } from '../types/asset';

interface InspectionDetailScreenProps {
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

interface AssetEvalRow {
  id: string;
  code: string;
  name: string;
  type: string;
  usageYear: number;
  specs: string;
  originalValue: number;
  condition: string;
  result: 'Đủ điều kiện thanh lý' | 'Chưa đủ điều kiện';
  method: 'Thanh lý (Bán thanh lý)' | 'Sửa chữa điều chuyển' | 'Thu hồi về kho' | 'Tiêu hủy';
  note: string;
}

export const InspectionDetailScreen: React.FC<InspectionDetailScreenProps> = ({ onOpenDocModal }) => {
  const { 
    currentUser, 
    switchUserRole, 
    proposals, 
    assets, 
    selectedProposalId, 
    setSelectedProposalId, 
    saveInspection, 
    scheduleInspection, 
    executeDisposition, 
    transferToSubmission, 
    inspectionRecords, 
    setActiveScreen 
  } = useAssetContext();

  const isNVQLTS = currentUser.role === 'NVQLTS';

  // 1. Danh sách đề nghị xử lý: Lọc theo Trạng thái = "Chờ tiếp nhận" (hoặc "Đang thẩm định")
  const pendingProposals = useMemo(() => {
    return proposals.filter((p) => p.status === 'CHO_TIEP_NHAN' || p.status === 'DANG_THAM_DINH');
  }, [proposals]);

  // Current proposal being inspected
  const currentProposal = useMemo(() => {
    if (selectedProposalId) {
      const found = proposals.find((p) => p.id === selectedProposalId);
      if (found) return found;
    }
    return pendingProposals[0] || proposals[0];
  }, [selectedProposalId, proposals, pendingProposals]);

  const existingRecord = inspectionRecords[currentProposal?.id || ''];

  // Current datetime format for initialization (YYYY-MM-DDTHH:mm)
  const defaultCurrentDateTime = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  // 3. Thời gian bắt đầu: DateTime, Bắt buộc, mặc định thời điểm hiện tại
  const [startTime, setStartTime] = useState(
    existingRecord?.startTime || defaultCurrentDateTime
  );

  // 4. Địa điểm: Textbox [200], Bắt buộc
  const [location, setLocation] = useState(
    existingRecord?.location || 'Kho tài sản Tầng 2 - Tòa nhà Trụ sở chính'
  );

  // Thành phần tham gia: Grid I/O, Bắt buộc. Gồm: STT, Họ và tên, Chức vụ, Đại diện đơn vị
  const [participants, setParticipants] = useState<InspectionParticipant[]>(() => {
    if (existingRecord?.participants && existingRecord.participants.length > 0) {
      return existingRecord.participants;
    }
    return [
      {
        id: 'p1',
        stt: 1,
        fullName: currentUser.name || 'Trần Văn Bình',
        position: 'Nhân viên quản lý tài sản',
        organization: 'Phòng Quản lý Tài sản (Chủ trì)',
      },
      {
        id: 'p2',
        stt: 2,
        fullName: 'Nguyễn Thị Mai',
        position: 'Kế toán viên theo dõi TSCĐ',
        organization: 'Phòng Kế toán (Thành viên)',
      },
      {
        id: 'p3',
        stt: 3,
        fullName: currentProposal?.creatorName || 'Nguyễn Minh Anh',
        position: 'Đại diện bộ phận sử dụng tài sản',
        organization: currentProposal?.department || 'Phòng ban đề nghị (Thành viên)',
      },
    ];
  });

  // 6. Danh mục tài sản kiểm tra: Grid I/O, Load từ Đề nghị
  const [evalRows, setEvalRows] = useState<AssetEvalRow[]>([]);

  // 7. Ghi nhận chung: Textarea [1000]
  const [generalConclusion, setGeneralConclusion] = useState(
    existingRecord?.generalConclusion ||
    'Đoàn kiểm tra đã tiến hành kiểm tra thực tế hiện trường các tài sản thuộc đề nghị. Toàn bộ các thiết bị đều đã qua thời gian sử dụng dài, linh kiện cơ học và điện tử hư hỏng nặng, chi phí phục hồi vượt quá 60% giá trị còn lại. Thống nhất lập thủ tục trình cấp có thẩm quyền phê duyệt thanh lý theo quy định.'
  );

  // Đại diện BPSDTS xác nhận: Textbox [100], Bắt buộc
  const [repConfirmationName, setRepConfirmationName] = useState(
    existingRecord?.repConfirmationName || currentProposal?.creatorName || 'Nguyễn Minh Anh'
  );

  // Tệp biên bản đã xác nhận: File upload, Bắt buộc
  const [signedRecordFile, setSignedRecordFile] = useState<AttachedFile | null>(
    existingRecord?.signedRecordFile || {
      id: `bb-signed-${currentProposal?.code || '025'}`,
      name: `BB-KiemTra-${currentProposal?.code || 'TL-2026-025'}-signed.pdf`,
      size: '1.4 MB',
      type: 'pdf',
      uploadedAt: '25/10/2026 10:15',
    }
  );

  const [isSaved, setIsSaved] = useState(existingRecord?.isSaved || false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Sync state when switching current proposal
  useEffect(() => {
    if (currentProposal) {
      const rec = inspectionRecords[currentProposal.id];
      setIsSaved(rec?.isSaved || false);

      if (rec?.startTime) setStartTime(rec.startTime);
      if (rec?.location) setLocation(rec.location);
      if (rec?.generalConclusion) setGeneralConclusion(rec.generalConclusion);
      if (rec?.repConfirmationName) setRepConfirmationName(rec.repConfirmationName);
      if (rec?.signedRecordFile) setSignedRecordFile(rec.signedRecordFile);

      if (rec?.participants && rec.participants.length > 0) {
        setParticipants(rec.participants);
      } else {
        setParticipants([
          {
            id: 'p1',
            stt: 1,
            fullName: currentUser.name || 'Trần Văn Bình',
            position: 'Nhân viên quản lý tài sản',
            organization: 'Phòng Quản lý Tài sản (Chủ trì)',
          },
          {
            id: 'p2',
            stt: 2,
            fullName: 'Nguyễn Thị Mai',
            position: 'Kế toán viên theo dõi TSCĐ',
            organization: 'Phòng Kế toán (Thành viên)',
          },
          {
            id: 'p3',
            stt: 3,
            fullName: currentProposal.creatorName || 'Nguyễn Minh Anh',
            position: 'Đại diện bộ phận sử dụng tài sản',
            organization: currentProposal.department || 'Phòng ban đề nghị (Thành viên)',
          },
        ]);
      }

      // Load assets from proposal
      const propAssets = assets.filter((a) => currentProposal.assetIds.includes(a.id));
      const rows: AssetEvalRow[] = propAssets.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        usageYear: a.usageYear || 2019,
        specs: a.specs || 'Thiết bị văn phòng tiêu chuẩn',
        originalValue: a.originalValue,
        condition: a.condition || 'Hỏng linh kiện, lỗi kỹ thuật nghiêm trọng',
        result: a.inspectionResult || 'Đủ điều kiện thanh lý',
        method: (a.actionMethod as any) || 'Thanh lý (Bán thanh lý)',
        note: a.inspectionNote || 'Không thể phục hồi hoặc chi phí sửa chữa quá cao',
      }));
      setEvalRows(rows);
    }
  }, [currentProposal?.id, inspectionRecords]);

  // Derived counts
  const qualifiedCount = evalRows.filter((r) => r.result === 'Đủ điều kiện thanh lý').length;
  const nonQualifiedCount = evalRows.filter((r) => r.result !== 'Đủ điều kiện thanh lý').length;

  // Validation: Check if all mandatory fields are filled
  const isFormValid = useMemo(() => {
    const hasValidStartTime = !!startTime.trim();
    const hasValidLocation = !!location.trim();
    const hasValidRep = !!repConfirmationName.trim();
    const hasFile = !!signedRecordFile;
    const hasAssets = evalRows.length > 0;
    const hasValidParticipants = participants.length > 0 && participants.every((p) => p.fullName.trim() !== '');
    const hasValidAssetCondition = evalRows.every((r) => r.condition.trim() !== '');

    return (
      hasValidStartTime &&
      hasValidLocation &&
      hasValidRep &&
      hasFile &&
      hasAssets &&
      hasValidParticipants &&
      hasValidAssetCondition
    );
  }, [startTime, location, repConfirmationName, signedRecordFile, evalRows, participants]);

  // Participant handlers
  const handleAddParticipant = () => {
    const newStt = participants.length + 1;
    setParticipants([
      ...participants,
      {
        id: `p-${Date.now()}`,
        stt: newStt,
        fullName: '',
        position: 'Thành viên',
        organization: 'Đơn vị liên quan',
      },
    ]);
  };

  const handleUpdateParticipant = (id: string, field: keyof InspectionParticipant, val: any) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 1) {
      setFeedback({
        type: 'error',
        message: 'Thành phần tham gia đoàn kiểm tra phải có ít nhất 01 thành viên!',
      });
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, stt: idx + 1 })));
  };

  // Asset row updates
  const handleUpdateAssetCondition = (id: string, cond: string) => {
    setEvalRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, condition: cond } : r))
    );
  };

  const handleUpdateAssetMethod = (id: string, methodVal: any) => {
    setEvalRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const isEligible = methodVal === 'Thanh lý (Bán thanh lý)' || methodVal === 'Tiêu hủy';
          return {
            ...r,
            method: methodVal,
            result: isEligible ? 'Đủ điều kiện thanh lý' : 'Chưa đủ điều kiện',
          };
        }
        return r;
      })
    );
  };

  // 11. Nút Tiếp nhận & Báo lịch
  const handleSchedule = () => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác Tiếp nhận & Báo lịch thuộc quyền hạn của Nhân viên quản lý tài sản (NVQLTS).',
      });
      return;
    }

    if (!startTime.trim() || !location.trim()) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng nhập đầy đủ Thời gian bắt đầu và Địa điểm kiểm tra thực tế trước khi Tiếp nhận & Báo lịch!',
      });
      return;
    }

    const scheduledDateStr = `${startTime.replace('T', ' ')} tại ${location}`;
    scheduleInspection(currentProposal.id, scheduledDateStr);
    setFeedback({
      type: 'success',
      message: `Đã tiếp nhận Đề nghị ${currentProposal.code} và gửi thông báo lịch kiểm tra thực tế tới NVQLTS (${scheduledDateStr}) thành công!`,
    });
  };

  // 12. Nút Tải/Xuất biên bản
  const handleExportSampleDoc = () => {
    onOpenDocModal(
      `Biên bản kiểm tra hiện trạng tài sản - ${currentProposal.code}`,
      `BB-KT-${currentProposal.code.replace('TL-', '')}`,
      'BIEN_BAN'
    );
  };

  // 13. Nút Lưu biên bản: Bật khi đã nhập đủ trường bắt buộc và có tệp biên bản đã xác nhận
  const handleSaveResult = () => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác lưu biên bản thẩm định thuộc quyền hạn của NVQLTS.',
      });
      return;
    }

    if (!isFormValid) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng hoàn thành đầy đủ các trường bắt buộc (Thời gian bắt đầu, Địa điểm, Họ tên thành viên tham gia, Tình trạng tài sản, Họ tên đại diện BPSDTS và Tệp biên bản đã xác nhận)!',
      });
      return;
    }

    saveInspection(
      currentProposal.id,
      currentUser.name || 'Trần Văn Bình',
      '26/10/2026',
      generalConclusion,
      evalRows.map((r) => ({
        id: r.id,
        condition: r.condition,
        result: r.result,
        method: r.method,
        note: r.note,
      })),
      {
        startTime,
        location,
        participants,
        repConfirmationName,
        signedRecordFile: signedRecordFile || undefined,
      }
    );

    setIsSaved(true);
    setFeedback({
      type: 'success',
      message: `Đã lưu dữ liệu biên bản thành công! Hệ thống tự động sinh số Biên bản: BB-KT-${currentProposal.code.replace('TL-', '')}.`,
    });
  };

  // 14. Nút Thực hiện hướng xử lý (khi có tài sản chọn hướng xử lý khác "Đủ điều kiện")
  const handleExecuteDisposition = () => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Chỉ NVQLTS mới có quyền thực thi hướng xử lý.',
      });
      return;
    }

    executeDisposition(currentProposal.id);
    setFeedback({
      type: 'success',
      message: `Đã thực thi điều chuyển / sửa chữa nội bộ / thu hồi kho cho các tài sản chưa đủ điều kiện thanh lý thuộc đề nghị ${currentProposal.code}.`,
    });
  };

  // 15. Nút Chuyển lập tờ trình: Bật khi Biên bản đã lưu và có ít nhất 1 tài sản Đủ điều kiện
  const handleTransfer = () => {
    if (!isNVQLTS) {
      setFeedback({
        type: 'error',
        message: 'Thao tác chuyển lập tờ trình thuộc quyền hạn của NVQLTS.',
      });
      return;
    }

    if (!isSaved) {
      setFeedback({
        type: 'error',
        message: 'Bạn phải nhấn "Lưu biên bản" trước khi chuyển lập tờ trình!',
      });
      return;
    }

    if (qualifiedCount === 0) {
      setFeedback({
        type: 'error',
        message: 'Cần có ít nhất 01 tài sản đạt "Đủ điều kiện thanh lý" để chuyển lập tờ trình!',
      });
      return;
    }

    const success = transferToSubmission(currentProposal.id);
    if (success) {
      setActiveScreen('QUALIFIED_PROPOSALS');
    }
  };

  // File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignedRecordFile({
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'doc',
        uploadedAt: 'Hôm nay ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
      setFeedback({
        type: 'success',
        message: `Đã tải lên tệp biên bản xác nhận: ${file.name}.`,
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActiveScreen('INSPECTIONS')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách chờ tiếp nhận</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Tiếp nhận, kiểm tra và thẩm định tài sản
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Quy trình tiếp nhận đề nghị thanh lý, tổ chức kiểm tra thực tế hiện trường và lập biên bản thẩm định kỹ thuật (NVQLTS).
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {/* 12. Nút Tải/Xuất biên bản */}
          <button
            type="button"
            onClick={handleExportSampleDoc}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            title="Tải xuống file mẫu biên bản để in, ký và scan lại"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải/Xuất biên bản</span>
          </button>

          <div className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentProposal?.status === 'CHO_TIEP_NHAN' ? 'Chờ tiếp nhận' : 'Đang thẩm định'}</span>
          </div>
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
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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

      {/* Role Notice */}
      {!isNVQLTS && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold">Quyền hạn tiếp nhận & thẩm định: NVQLTS (Nhân viên quản lý tài sản)</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Bạn đang xem với vai trò <strong>{currentUser.name} ({currentUser.role})</strong>. Chỉ <strong>NVQLTS</strong> mới có quyền lưu biên bản thẩm định và chuyển lập tờ trình.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('NVQLTS')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Chuyển sang NVQLTS
          </button>
        </div>
      )}

      {/* ===================== KHỐI: DANH SÁCH ĐỀ NGHỊ XỬ LÝ ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Danh sách đề nghị xử lý
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            Có <strong>{pendingProposals.length}</strong> đề nghị cần xử lý
          </div>
        </div>

        {/* Grid 1: Table of Proposals */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">Chọn</th>
                <th className="py-2.5 px-3 w-32">Số ĐN</th>
                <th className="py-2.5 px-3 w-28">Ngày lập</th>
                <th className="py-2.5 px-3">Phòng / Bộ phận</th>
                <th className="py-2.5 px-3">Người đề nghị</th>
                <th className="py-2.5 px-3 text-center w-24">Số TS</th>
                <th className="py-2.5 px-3 w-32">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingProposals.length > 0 ? (
                pendingProposals.map((prop) => {
                  const isSelected = prop.id === currentProposal?.id;
                  return (
                    <tr
                      key={prop.id}
                      onClick={() => setSelectedProposalId(prop.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="radio"
                          name="selected_proposal"
                          checked={isSelected}
                          onChange={() => setSelectedProposalId(prop.id)}
                          className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {prop.code}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{prop.createdDate}</td>
                      <td className="py-2.5 px-3 text-slate-900">{prop.department}</td>
                      <td className="py-2.5 px-3 text-slate-700">{prop.creatorName}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {prop.assetIds.length}
                      </td>
                      <td className="py-2.5 px-3">
                        {prop.status === 'CHO_TIEP_NHAN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Chờ tiếp nhận
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Đang thẩm định
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                    Hiện không có đề nghị nào ở trạng thái Chờ tiếp nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== KHỐI: THÔNG TIN ĐỀ NGHỊ ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Thông tin Đề nghị
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Số ĐN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số Đề nghị (Số ĐN)
            </label>
            <input
              type="text"
              readOnly
              value={currentProposal?.code || ''}
              className="w-full py-2 px-3 text-xs font-mono font-bold text-blue-900 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
            />
          </div>

          {/* Ngày lập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày lập
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={currentProposal?.createdDate || ''}
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Bộ phận */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bộ phận đề nghị
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={currentProposal?.department || ''}
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Người lập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Người lập đề nghị
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={currentProposal?.creatorName || ''}
                className="w-full py-2 pl-3 pr-8 text-xs font-medium text-slate-800 bg-slate-100/90 border border-slate-200 rounded-xl cursor-not-allowed select-none"
              />
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI: THỜI GIAN & ĐỊA ĐIỂM KIỂM TRA ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Thời gian & Địa điểm kiểm tra thực tế</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {existingRecord?.scheduledDate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã báo lịch</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSchedule}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              title="Bấm để tiếp nhận và gửi thông báo lịch kiểm tra thực tế tới NVQLTS"
            >
              <Calendar className="w-4 h-4" />
              <span>Tiếp nhận & Báo lịch</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thời gian bắt đầu: DateTime, Bắt buộc */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-2 pl-3 pr-8 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
              />
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Địa điểm: Textbox [200], Bắt buộc */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={200}
                placeholder="Nhập địa điểm kiểm tra thực tế (VD: Kho tài sản Tầng 2 - Tòa nhà Trụ sở)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2 pl-3 pr-8 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI 5: THÀNH PHẦN THAM GIA (Grid - I/O) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Thành phần tham gia <span className="text-red-500">*</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddParticipant}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm thành viên</span>
          </button>
        </div>

        {/* Grid 5: Participants */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3 min-w-[180px]">Họ và tên *</th>
                <th className="py-2.5 px-3 min-w-[160px]">Chức vụ</th>
                <th className="py-2.5 px-3 min-w-[200px]">Đại diện đơn vị</th>
                <th className="py-2.5 px-3 text-center w-14">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="Nhập họ và tên..."
                      value={p.fullName}
                      onChange={(e) => handleUpdateParticipant(p.id, 'fullName', e.target.value)}
                      className="w-full py-1.5 px-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="Chức vụ..."
                      value={p.position}
                      onChange={(e) => handleUpdateParticipant(p.id, 'position', e.target.value)}
                      className="w-full py-1.5 px-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="Đại diện đơn vị..."
                      value={p.organization}
                      onChange={(e) => handleUpdateParticipant(p.id, 'organization', e.target.value)}
                      className="w-full py-1.5 px-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== KHỐI 6: DANH MỤC TÀI SẢN KIỂM TRA (Grid - I/O) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Danh mục tài sản kiểm tra <span className="text-red-500">*</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đủ ĐK: {qualifiedCount}
            </span>
            {nonQualifiedCount > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Hướng xử lý khác: {nonQualifiedCount}
              </span>
            )}
          </div>
        </div>

        {/* Grid 6: Assets under evaluation */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3 w-28">Mã TS</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Tên TS</th>
                  <th className="py-2.5 px-3 text-center w-20">Năm SD</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Thông số kỹ thuật</th>
                  <th className="py-2.5 px-3 text-right w-28">Nguyên giá</th>
                  <th className="py-2.5 px-3 min-w-[210px]">Tình trạng kiểm tra *</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Hướng xử lý *</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evalRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{row.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{row.usageYear}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-tight">{row.specs}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      {row.originalValue.toLocaleString('vi-VN')} đ
                    </td>
                    {/* Tình trạng kiểm tra */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="Nhập tình trạng thực tế..."
                        value={row.condition}
                        onChange={(e) => handleUpdateAssetCondition(row.id, e.target.value)}
                        className="w-full py-1.5 px-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
                      />
                    </td>
                    {/* Hướng xử lý */}
                    <td className="py-2 px-3">
                      <select
                        value={row.method}
                        onChange={(e) => handleUpdateAssetMethod(row.id, e.target.value)}
                        className="w-full py-1.5 px-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white font-medium"
                      >
                        <option value="Thanh lý (Bán thanh lý)">Đủ điều kiện thanh lý</option>
                        <option value="Sửa chữa điều chuyển">Sửa chữa điều chuyển</option>
                        <option value="Thu hồi về kho">Thu hồi về kho</option>
                        <option value="Tiêu hủy">Tiêu hủy</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== KHỐI 7: GHI NHẬN CHUNG (Textarea [1000]) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Ghi nhận chung
        </h2>
        <textarea
          maxLength={1000}
          rows={3}
          value={generalConclusion}
          onChange={(e) => setGeneralConclusion(e.target.value)}
          placeholder="Nhập nhận xét chung của đoàn kiểm tra tại hiện trường..."
          className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 leading-relaxed font-normal"
        />
        <div className="text-[11px] text-slate-400 text-right">
          {generalConclusion.length}/1000 ký tự
        </div>
      </div>

      {/* ===================== KHỐI 8 & 9: XÁC NHẬN TẠI CHỖ & TỆP BIÊN BẢN ĐÃ XÁC NHẬN ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Đại diện BPSDTS xác nhận: Textbox [100] */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Đại diện BPSDTS xác nhận <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="relative">
            <input
              type="text"
              maxLength={100}
              placeholder="Nhập họ và tên người xác nhận tại chỗ..."
              value={repConfirmationName}
              onChange={(e) => setRepConfirmationName(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
            />
            <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Tệp biên bản đã xác nhận: File upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Tệp biên bản đã xác nhận <span className="text-red-500">*</span>
            </h2>
          </div>

          {signedRecordFile ? (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">{signedRecordFile.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {signedRecordFile.size} · Tải lên: {signedRecordFile.uploadedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportSampleDoc}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                  title="Xem trước tài liệu"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSignedRecordFile(null)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  title="Xóa tệp đính kèm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-blue-600">Chọn tệp hoặc kéo thả bản scan PDF</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ PDF, DOCX, PNG (Tối đa 10MB)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ===================== CÁC NÚT ĐIỀU KHIỂN & HÀNH ĐỘNG (11 - 15) ===================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <span>Trạng thái hồ sơ:</span>
              {isSaved ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Đã lưu biên bản thẩm định (BB-KT-{currentProposal?.code.replace('TL-', '')})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                  Chưa lưu biên bản
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 12. Nút Tải/Xuất biên bản */}
            <button
              type="button"
              onClick={handleExportSampleDoc}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Tải/Xuất biên bản
            </button>

            {/* 13. Nút Lưu biên bản: Chỉ bật khi đã nhập đủ trường bắt buộc và có Tệp biên bản đã xác nhận */}
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSaveResult}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title={!isFormValid ? 'Yêu cầu điền đủ trường bắt buộc và tải lên tệp biên bản xác nhận' : 'Lưu dữ liệu và tự động sinh số biên bản'}
            >
              <Save className="w-4 h-4" />
              <span>Lưu biên bản</span>
            </button>

            {/* 14. Nút Thực hiện hướng xử lý: Chỉ bật khi có TS chọn hướng xử lý khác "Đủ điều kiện" */}
            <button
              type="button"
              disabled={nonQualifiedCount === 0}
              onClick={handleExecuteDisposition}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                nonQualifiedCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title={nonQualifiedCount > 0 ? 'Thực thi phản hồi / điều chuyển / thu hồi' : 'Chỉ bật khi có tài sản chọn hướng xử lý khác "Đủ điều kiện"'}
            >
              Thực hiện hướng xử lý ({nonQualifiedCount})
            </button>

            {/* 15. Nút Chuyển lập tờ trình: Chỉ bật khi Biên bản đã lưu và có ít nhất 1 tài sản "Đủ điều kiện" */}
            <button
              type="button"
              disabled={!isSaved || qualifiedCount === 0}
              onClick={handleTransfer}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                isSaved && qualifiedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title={!isSaved ? 'Cần Lưu biên bản trước' : qualifiedCount === 0 ? 'Cần ít nhất 01 tài sản đủ điều kiện' : 'Chuyển sang màn hình lập tờ trình'}
            >
              <span>Chuyển lập tờ trình ({qualifiedCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
