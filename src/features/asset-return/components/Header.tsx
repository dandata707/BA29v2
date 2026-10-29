import { Header as SharedHeader } from '../../../components/Header';
import { returnBreadcrumbs } from '../../../navigation/breadcrumbs';
import { UserProfile } from '../../../types';
import React, { useState } from 'react';
import { Bell, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{ user: UserProfile; onOpenRoleSwitcher: () => void; onOpenMobileSidebar?: () => void }> = ({ user, onOpenRoleSwitcher, onOpenMobileSidebar }) => {
  const {
    currentView,
    setView,
    selectedRecord,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return <SharedHeader currentUser={user} onToggleMobileMenu={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher}
    breadcrumbs={returnBreadcrumbs(currentView, selectedRecord?.id, () => setView('list'))}
    notifications={<div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative transition-colors"
            aria-label="Thông báo thu hồi"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Thông báo hệ thống ({notifications.length})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 truncate pr-2">
                          {notif.subject}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                          {notif.sentAt.split(' ')[1] || notif.sentAt}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                        {notif.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Đến: {notif.recipientName}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setView('detail', notif.recordId);
                            setShowNotifMenu(false);
                          }}
                          className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          Mở biên bản <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>} />;
};
