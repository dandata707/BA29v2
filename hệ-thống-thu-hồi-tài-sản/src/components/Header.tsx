import React, { useState } from 'react';
import { Bell, Search, Plus, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentView,
    setView,
    selectedRecord,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    activeRole,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Breadcrumb / Title zone */}
      <div className="flex items-center gap-2 text-sm">
        <span
          onClick={() => setView('list')}
          className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
        >
          Thu hồi tài sản
        </span>
        {currentView === 'create' && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Tạo biên bản mới</span>
          </>
        )}
        {currentView === 'detail' && selectedRecord && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold font-mono">{selectedRecord.id}</span>
          </>
        )}
        {currentView === 'employee_confirm' && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Xác nhận của nhân viên</span>
          </>
        )}
        {currentView === 'asset_inventory' && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Danh sách tài sản</span>
          </>
        )}
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-3">
        {/* Quick action button for creating return record */}
        {activeRole === 'nvqlts' && currentView !== 'create' && (
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo biên bản</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
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
        </div>
      </div>
    </header>
  );
};
