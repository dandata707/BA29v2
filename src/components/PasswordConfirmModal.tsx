import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types.ts';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  handoverCode: string;
  currentUser: UserProfile;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  isOpen,
  handoverCode,
  currentUser,
  title = 'Xác nhận gửi biên bản bàn giao',
  subtitle = 'Vui lòng nhập mật khẩu tài khoản của bạn để xác thực và hoàn tất ký biên bản bàn giao tài sản.',
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu xác nhận!');
      inputRef.current?.focus();
      return;
    }
    onConfirm(password);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300"
      id="password-confirm-modal"
    >
      {/* Modal Card Box */}
      <div className="bg-white w-full max-w-[490px] rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button 'X' */}
        <button
          aria-label="Đóng modal"
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          type="button"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="p-6 md:p-7">
          {/* Header Icon & Title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="pr-6">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
            </div>
          </div>

          {/* Summary Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Mã biên bản:</span>
              <span className="font-bold font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {handoverCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Người xác nhận:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                {currentUser.name} ({currentUser.roleTitle})
              </span>
            </div>
          </div>

          {/* Password Input Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="confirm-password-input">
              Mật khẩu xác nhận <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <input
                ref={inputRef}
                className={`w-full text-xs bg-white border ${
                  errorMsg ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                } rounded-xl pl-10 pr-10 py-2.5 text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-blue-500 shadow-sm transition outline-none`}
                id="confirm-password-input"
                placeholder="Nhập mật khẩu của bạn..."
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              <button
                aria-label="Hiện/ẩn mật khẩu"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  ) : (
                    <>
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {errorMsg ? (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            ) : (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Mật khẩu dùng để xác nhận tính pháp lý khi hoàn tất biên bản bàn giao điện tử.
              </p>
            )}
          </div>

          {/* Modal Actions / Buttons */}
          <div className="flex items-center justify-end gap-3 mt-7 pt-4 border-t border-slate-100">
            <button
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
              type="button"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              type="submit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
