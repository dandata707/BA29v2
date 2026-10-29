import { TransferIcon } from './TransferIcon';
import React from 'react';
import { useTransfer } from '../context/TransferContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTransfer();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-[#1b263b] border-l-4 border-emerald-500'
                : isError
                ? 'bg-[#2b1616] border-l-4 border-red-500'
                : isWarning
                ? 'bg-[#2b2416] border-l-4 border-amber-500'
                : 'bg-[#1e2433] border-l-4 border-blue-500'
            }`}
          >
            <TransferIcon className="text-[20px] shrink-0 text-white" name={isSuccess
                ? 'check_circle'
                : isError
                ? 'error'
                : isWarning
                ? 'warning'
                : 'info'} />
            <span className="text-sm font-medium leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1 text-slate-300 hover:text-white rounded"
            >
              <TransferIcon className="text-[16px]" name={"close"} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
