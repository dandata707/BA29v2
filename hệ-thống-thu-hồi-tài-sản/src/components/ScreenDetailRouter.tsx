import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenDetailDraft } from './ScreenDetailDraft';
import { ScreenDetailPending } from './ScreenDetailPending';
import { ScreenDetailInHandoff } from './ScreenDetailInHandoff';
import { ScreenDetailCompleted } from './ScreenDetailCompleted';
import { ArrowLeft, XCircle, FileText, Calendar, User, Mail, Box } from 'lucide-react';

export const ScreenDetailRouter: React.FC = () => {
  const { selectedRecord, setView } = useApp();

  if (!selectedRecord) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Không tìm thấy biên bản</h3>
        <p className="text-xs text-slate-500">Biên bản bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => setView('list')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Render view strictly mapped to SRS screens based on current status
  if (selectedRecord.status === 'draft') {
    return <ScreenDetailDraft record={selectedRecord} />;
  }

  if (selectedRecord.status === 'pending_handoff') {
    return <ScreenDetailPending record={selectedRecord} />;
  }

  if (selectedRecord.status === 'in_handoff') {
    return <ScreenDetailInHandoff record={selectedRecord} />;
  }

  if (selectedRecord.status === 'completed') {
    return <ScreenDetailCompleted record={selectedRecord} />;
  }

  // Cancelled State view
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <button
        onClick={() => setView('list')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Danh sách biên bản</span>
      </button>

      <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono text-slate-900">{selectedRecord.id}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              <XCircle className="w-3.5 h-3.5" />
              Đã hủy
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Hủy lúc: {selectedRecord.cancelledAt || '2026-03-22'}
          </span>
        </div>

        <p className="text-xs text-slate-600">
          <strong>Lý do hủy:</strong> {selectedRecord.cancellationReason || 'NVQLTS thao tác hủy'}
        </p>

        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 mb-2">Tài sản trong biên bản đã được giải phóng (BR03):</h4>
          <div className="space-y-2">
            {selectedRecord.items.map((item) => (
              <div
                key={item.assetId}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{item.assetId}</span> -{' '}
                  <span className="text-slate-700">{item.assetName}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">SN: {item.serial}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
