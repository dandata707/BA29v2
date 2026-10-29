import { TransferIcon } from './TransferIcon';
import React from 'react';
import { useTransfer } from '../context/TransferContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotifsAsRead, navigateTo } = useTransfer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <TransferIcon className="text-blue-600 text-[22px]" name={"notifications"} />
            <h3 className="font-semibold text-slate-800 text-base">Thông báo hệ thống</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markNotifsAsRead}
              className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Đã đọc tất cả
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center"
            >
              <TransferIcon className="text-[18px]" name={"close"} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.targetRequestId) {
                    navigateTo('review', notif.targetRequestId);
                    onClose();
                  }
                }}
                className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex gap-3 ${
                  !notif.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'success'
                      ? 'bg-emerald-100 text-emerald-600'
                      : notif.type === 'warning'
                      ? 'bg-amber-100 text-amber-600'
                      : notif.type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <TransferIcon className="text-[16px]" name={notif.type === 'success'
                      ? 'check_circle'
                      : notif.type === 'warning'
                      ? 'priority_high'
                      : notif.type === 'error'
                      ? 'cancel'
                      : 'info'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
