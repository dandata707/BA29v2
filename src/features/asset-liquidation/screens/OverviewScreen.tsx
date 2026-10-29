import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  FilePlus2, 
  FileCheck2, 
  FileText, 
  CheckCircle2, 
  Briefcase, 
  Archive,
  Lock,
  Layers,
  Map,
  Sparkles,
  Info
} from 'lucide-react';
import { useAssetContext, ScreenType } from '../context/AssetContext';
import { UserRole } from '../types/asset';

interface OverviewScreenProps {
  onOpenFlowGuide: () => void;
  onOpenDocModal: (title: string, code: string, type: any) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ onOpenFlowGuide, onOpenDocModal }) => {
  const { 
    currentUser, 
    switchUserRole, 
    setActiveScreen, 
    proposals, 
    submissions, 
    decisions, 
    dossiers 
  } = useAssetContext();

  const steps: Array<{
    number: number;
    title: string;
    actor: string;
    actorRole: UserRole;
    screen: ScreenType;
    description: string;
    guardrail?: string;
    countInfo: string;
  }> = [
    {
      number: 1,
      title: 'Lập đề nghị thanh lý (BPSDTS)',
      actor: 'Nguyễn Minh Anh (Kế toán)',
      actorRole: 'BPSDTS',
      screen: 'PROPOSALS',
      description: 'Tạo đề nghị, chọn tài sản của bộ phận, nhập tình trạng & lý do. Khóa form sau khi gửi.',
      guardrail: 'Chốt chặn 1: Khóa form sau khi gửi, bắn thông báo NVQLTS.',
      countInfo: `${proposals.length} đề nghị trong hệ thống`,
    },
    {
      number: 2,
      title: 'Tiếp nhận & Thẩm định (NVQLTS)',
      actor: 'Trần Văn Bình (Quản lý TS)',
      actorRole: 'NVQLTS',
      screen: 'INSPECTIONS',
      description: 'Kiểm tra hiện trường, thẩm định từng tài sản, lập & lưu biên bản thẩm định có chữ ký.',
      guardrail: 'Chốt chặn 2: Lưu biên bản & có TS đủ điều kiện mới mở lập tờ trình.',
      countInfo: `${proposals.filter((p) => p.status === 'CHO_TIEP_NHAN').length} đề nghị chờ xử lý`,
    },
    {
      number: 3,
      title: 'Lập tờ trình thanh lý (NVQLTS)',
      actor: 'Trần Văn Bình (Quản lý TS)',
      actorRole: 'NVQLTS',
      screen: 'QUALIFIED_PROPOSALS',
      description: 'Gom các đề nghị đủ điều kiện thành tờ trình tổng, auto tính tổng nguyên giá & GTCL.',
      countInfo: `${proposals.filter((p) => p.status === 'DU_DIEU_KIEN').length} đề nghị đủ điều kiện`,
    },
    {
      number: 4,
      title: 'Phê duyệt thanh lý (Giám đốc)',
      actor: 'Lê Hoàng Nam (Giám đốc)',
      actorRole: 'GIAM_DOC',
      screen: 'SUBMISSION_LIST',
      description: 'Giám đốc xem xét hồ sơ kỹ thuật, quyết định Phê duyệt ban hành QĐ hoặc Trả bổ sung.',
      guardrail: 'Chốt chặn 3: Phê duyệt ban hành QĐ hoặc Trả bổ sung kèm lý do.',
      countInfo: `${submissions.filter((s) => s.status === 'CHO_PHE_DUYET').length} tờ trình chờ duyệt`,
    },
    {
      number: 5,
      title: 'Thực hiện thanh lý (NVQLTS)',
      actor: 'Trần Văn Bình (Quản lý TS)',
      actorRole: 'NVQLTS',
      screen: 'EXECUTIONS',
      description: 'Bán thanh lý theo nhiều đợt. Lưu HĐMB & Biên bản bàn giao theo từng đợt.',
      countInfo: `${decisions.filter((d) => d.status === 'DANG_THUC_HIEN').length} quyết định đang thực hiện`,
    },
    {
      number: 6,
      title: 'Đóng & Lưu hồ sơ (NVQLTS)',
      actor: 'Trần Văn Bình (Quản lý TS)',
      actorRole: 'NVQLTS',
      screen: 'DOSSIERS',
      description: 'Kiểm tra 7 thành phần pháp lý. Khóa niêm phong hồ sơ đạt chuẩn kiểm toán.',
      guardrail: 'Chốt chặn 4: Vô hiệu hóa nút đóng nếu thiếu bất kỳ mục nào trong 7 thành phần.',
      countInfo: `${dossiers.length} hồ sơ thanh lý`,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Quy chuẩn quản lý tài sản cố định chuẩn hóa 2026</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Hệ thống Quản lý Quy trình Thanh lý Tài sản
          </h1>

          <p className="text-xs md:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Chu trình 14 bước khép kín từ Lập đề nghị, Thẩm định hiện trạng, Trình duyệt Giám đốc, Bán thanh lý đa đợt đến Đóng và lưu trữ hồ sơ 7 thành phần pháp lý. Bổ sung trọn vẹn luồng Xem/Đọc (Read-only) với Audit Log tự động.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFlowGuide}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-950 font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Map className="w-4 h-4 text-blue-700" />
              <span>Mở Bản đồ 14 bước & 5 bảng tra cứu</span>
            </button>
            <button
              onClick={() => {
                switchUserRole('BPSDTS');
                setActiveScreen('PROPOSALS');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-700/80 hover:bg-blue-600/90 text-white font-semibold text-xs md:text-sm rounded-xl transition-colors cursor-pointer border border-blue-400/30"
            >
              <span>Bắt đầu từ Bước 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Actors & Personas */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>3 Tác nhân chính tham gia luồng nghiệp vụ</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => switchUserRole('BPSDTS')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              currentUser.role === 'BPSDTS'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">1. BPSDTS (Bộ phận sử dụng TS)</div>
                <div className="text-[11px] text-slate-500">Nguyễn Minh Anh · Phòng Kế toán</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lập đề nghị thanh lý, chọn tài sản, theo dõi timeline tiến trình điện tử (V10 - V12), sửa lại đề nghị khi bị trả về (V13).
            </p>
          </div>

          <div
            onClick={() => switchUserRole('NVQLTS')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              currentUser.role === 'NVQLTS'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">2. NVQLTS (Nhân viên Quản lý TS)</div>
                <div className="text-[11px] text-slate-500">Trần Văn Bình · Phòng Quản lý Tài sản</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tiếp nhận, thẩm định hiện trường, lập tờ trình, thực hiện thanh lý đa đợt (HĐMB/BBBG) và đóng hồ sơ 7 thành phần.
            </p>
          </div>

          <div
            onClick={() => switchUserRole('GIAM_DOC')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              currentUser.role === 'GIAM_DOC'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">3. Ban Giám đốc (Người phê duyệt)</div>
                <div className="text-[11px] text-slate-500">Lê Hoàng Nam · Giám đốc Điều hành</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xem xét tờ trình & biên bản (V7, V8), ký quyết định phê duyệt thanh lý hoặc trả bổ sung hồ sơ (Bước 10, 11).
            </p>
          </div>
        </div>
      </div>

      {/* 6 Process Stages Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            6 Giai đoạn của Quy trình Thanh lý Tài sản (MH_TL01 - MH_TL06)
          </h2>
          <span className="text-xs text-slate-500">Nhấp vào thẻ để trải nghiệm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st) => (
            <div
              key={st.number}
              onClick={() => {
                switchUserRole(st.actorRole);
                setActiveScreen(st.screen);
              }}
              className="bg-white border border-slate-200 hover:border-blue-400 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {st.number}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    {st.countInfo}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  {st.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.description}
                </p>

                {st.guardrail && (
                  <div className="pt-2 text-[11px] text-amber-800 font-medium border-t border-slate-100 flex items-start gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{st.guardrail}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Vào màn hình</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
