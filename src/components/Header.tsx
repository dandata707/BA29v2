import React, { useState } from 'react';
import { Bell, ChevronRight, Home, Menu } from 'lucide-react';
import { UserProfile } from '../types';
import { BreadcrumbItem } from '../navigation/breadcrumbs';
import { useWorkspaceNavigation } from '../navigation/WorkspaceNavigation';

interface HeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onToggleMobileMenu?: () => void;
  currentUser?: UserProfile;
  onOpenRoleSwitcher?: () => void;
  onHome?: () => void;
  actions?: React.ReactNode;
  notifications?: React.ReactNode;
}

export function Header({ breadcrumbs, onToggleMobileMenu, currentUser, onOpenRoleSwitcher, onHome, actions, notifications }: HeaderProps) {
  const navigation = useWorkspaceNavigation();
  const user = currentUser || navigation?.user;
  const [showNotifications, setShowNotifications] = useState(false);
  const home = onHome || navigation?.home || breadcrumbs[0]?.onClick;
  return <header className="h-14 min-h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0 font-sans" data-purpose="top-navigation">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <button type="button" onClick={onToggleMobileMenu || navigation?.openMobileMenu} aria-label="Mở menu" className="p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden shrink-0"><Menu className="w-5 h-5" /></button>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 min-w-0 overflow-x-auto whitespace-nowrap py-1">
        <button type="button" aria-label="Trang chủ" title="Trang chủ" onClick={home} className="text-slate-500 hover:text-blue-600 shrink-0"><Home className="w-4 h-4" /></button>
        {breadcrumbs.map((item, index) => <React.Fragment key={`${index}-${item.label}`}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {index === breadcrumbs.length - 1
            ? <span aria-current="page" className="font-semibold text-slate-800">{item.label}</span>
            : item.onClick
              ? <button type="button" onClick={item.onClick} className="hover:text-blue-600 hover:underline">{item.label}</button>
              : <span>{item.label}</span>}
        </React.Fragment>)}
      </nav>
    </div>
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      {actions}
      {notifications ?? <div className="relative">
        <button type="button" title="Thông báo" aria-label="Thông báo" aria-expanded={showNotifications} onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"><Bell className="w-5 h-5" /></button>
        {showNotifications && <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-xs text-slate-500">Không có thông báo mới</div>}
      </div>}
      <button type="button" onClick={onOpenRoleSwitcher || navigation?.openRoleSwitcher} aria-label="Chuyển đổi tài khoản" title={user ? `${user.name} (${user.roleTitle}) — Chuyển đổi tài khoản` : 'Chuyển đổi tài khoản'} className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center hover:ring-2 hover:ring-blue-300 shrink-0">{user?.avatarText || 'NA'}</button>
    </div>
  </header>;
}
