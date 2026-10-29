import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle2, AlertCircle, QrCode, Sparkles } from 'lucide-react';
import { ReturnRecord } from '../types/asset';
import { matchesAssetCode } from '../rules';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ReturnRecord;
  targetAssetId?: string;
  onScanSuccess: (assetCode: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  record,
  targetAssetId,
  onScanSuccess,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (targetAssetId) {
      setManualCode(targetAssetId);
    }
    setErrorMessage('');
    setSuccessMessage('');
  }, [targetAssetId, isOpen]);

  // Handle webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && useCamera) {
      setCameraError('');
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err);
          setCameraError('Không thể mở camera thiết bị hoặc quyền truy cập bị từ chối.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, useCamera]);

  if (!isOpen) return null;

  const handleProcessCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('Vui lòng nhập hoặc quét mã QR tài sản!');
      return;
    }

    // Check if code matches any item in this record
    const match = record.items.find(item => matchesAssetCode(item, clean));

    if (!match) {
      setErrorMessage(`E2: Mã "${code}" không thuộc danh sách tài sản của biên bản ${record.id}!`);
      setSuccessMessage('');
      return;
    }

    if (match.scanned) {
      setSuccessMessage(`E3: Tài sản ${match.assetId} đã được đối chiếu và quét trước đó!`);
      setTimeout(() => {
        onScanSuccess(match.assetId);
        onClose();
      }, 700);
      return;
    }

    setSuccessMessage(`Khớp mã tài sản: ${match.assetId} (${match.assetName})!`);
    setErrorMessage('');

    setTimeout(() => {
      onScanSuccess(match.assetId);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Quét mã QR bàn giao tài sản</h3>
              <p className="text-xs text-slate-500">Đối chiếu biên bản {record.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Camera Viewfinder */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-4/3 flex flex-col items-center justify-center border border-slate-800 text-white">
            {useCamera && !cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  {cameraError || 'Mô phỏng ống kính camera quét mã QR dán trên nhãn tài sản'}
                </p>
                <button
                  type="button"
                  onClick={() => setUseCamera(!useCamera)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                >
                  {useCamera ? 'Tắt camera' : 'Bật camera máy ảnh'}
                </button>
              </div>
            )}

            {/* Target Reticle Lines */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 border-2 border-emerald-400/80 rounded-xl relative shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm"></div>
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400/60 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Select Asset chips for seamless demo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">
                Tài sản trong biên bản ({record.items.length}):
              </span>
              <span className="text-xs text-slate-500">Bấm nhanh để quét mã</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {record.items.map((item) => (
                <button
                  key={item.assetId}
                  type="button"
                  onClick={() => {
                    setManualCode(item.assetId);
                    handleProcessCode(item.assetId);
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    item.scanned
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="font-semibold block">{item.assetId}</span>
                    <span className="text-slate-500 text-[11px] truncate block">
                      {item.assetName}
                    </span>
                  </div>
                  {item.scanned ? (
                    <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Đã quét
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Quét
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input fallback */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Hoặc nhập mã tài sản / Số serial dán trên tem:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: BBBG_01 hoặc C02XK1ABC"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleProcessCode(manualCode);
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleProcessCode(manualCode)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Xác nhận mã
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Quy tắc BR06: Bắt buộc bàn giao vật lý trước khi hoàn tất</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
