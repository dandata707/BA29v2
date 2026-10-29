import React from 'react';
import { UserProfile } from '../types.ts';
import { ASSET_MANAGER_PROFILE } from '../data/mockTickets.ts';
import { DIRECTOR_PROFILE, EMPLOYEE_PROFILES } from '../data/userProfiles';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const profiles = [
    {
      profile: DIRECTOR_PROFILE,
      badge: 'Phê duyệt thanh lý',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
      description: 'Xem xét tờ trình thanh lý, phê duyệt và ban hành quyết định hoặc trả hồ sơ yêu cầu bổ sung.',
      features: ['Xem tờ trình & hồ sơ', 'Phê duyệt thanh lý', 'Trả hồ sơ bổ sung'],
    },
    {
      profile: ASSET_MANAGER_PROFILE,
      badge: 'Quản trị & Phê duyệt',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'Quản lý cấp phát, thu hồi và thanh lý tài sản: tiếp nhận, thẩm định, lập tờ trình, thực hiện thanh lý và đóng hồ sơ.',
      features: ['Quản lý cấp phát & thu hồi', 'Thẩm định & lập tờ trình', 'Thực hiện thanh lý & đóng hồ sơ'],
    },
    ...EMPLOYEE_PROFILES.map(profile => ({
      profile,
      badge: 'Yêu cầu & Theo dõi',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: 'Tạo và theo dõi phiếu cấp phát; xem thông báo thu hồi của mình, xác nhận lịch bàn giao và tải biên bản đã hoàn tất.',
      features: ['Tạo mới phiếu yêu cầu', 'Xác nhận bàn giao tài sản', 'Lập & theo dõi đề nghị thanh lý'],
    })),
  ];

  const handleSelect = (user: UserProfile) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Chuyển đổi vai trò / tài khoản</h3>
              <p className="text-xs text-slate-500">Chọn tài khoản để làm việc theo vai trò và phòng ban tương ứng</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Selection List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {profiles.map(({ profile, badge, badgeColor, description, features }) => {
            const isCurrent = currentUser.id === profile.id;
            return (
              <div
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                }`}
              >
                {/* Active checkmark badge */}
                {isCurrent && (
                  <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-600 text-white shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Đang kích hoạt
                  </span>
                )}

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm tracking-wider shrink-0 ring-2 ${
                    profile.role === 'asset_manager'
                      ? 'bg-blue-100 text-blue-700 ring-blue-200'
                      : 'bg-indigo-100 text-indigo-700 ring-indigo-200'
                  }`}>
                    {profile.avatarText}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-24">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">{profile.name}</h4>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {badge}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{profile.roleTitle}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Mã: <span className="font-medium text-slate-700">{profile.code}</span> • Phòng ban: <span className="font-medium text-slate-700">{profile.department}</span>
                    </p>
                    {profile.employeeId && <p className="text-xs text-slate-500 mt-1">Mã nhân viên thu hồi: <span className="font-medium text-slate-700">{profile.employeeId}</span> • {profile.email}</p>}

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-100">
                      {description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {features.map((feat, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover switch prompt */}
                {!isCurrent && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600">
                    <span>Nhấp để chuyển sang giao diện này</span>
                    <span className="font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Chuyển đổi
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống quản lý tài sản doanh nghiệp • AssetFlow</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
