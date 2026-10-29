import React, { useState } from 'react';
import {
  Layers,
  Search,
  Laptop,
  Monitor,
  Printer,
  Smartphone,
  Tablet,
  Box,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Tag,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Asset, AssetStatus } from '../types/asset';
import { QRCodeSVG } from './QRCodeBadge';

export const ScreenAssetInventory: React.FC = () => {
  const { assets, records, setView } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-slate-700" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-slate-700" />;
      case 'printer':
        return <Printer className="w-4 h-4 text-slate-700" />;
      case 'phone':
        return <Smartphone className="w-4 h-4 text-slate-700" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-slate-700" />;
      default:
        return <Box className="w-4 h-4 text-slate-700" />;
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Đang sử dụng
          </span>
        );
      case 'reclaimed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Đã thu hồi (Nhập kho)
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Mất tài sản
          </span>
        );
      case 'in_storage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Lưu kho sẵn sàng
          </span>
        );
    }
  };

  const filtered = assets.filter((asset) => {
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        asset.id.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.serial.toLowerCase().includes(q) ||
        (asset.currentUserName && asset.currentUserName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Danh sách tài sản
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi trạng thái và người sử dụng tài sản, tự động chuyển đổi sang "Đã thu hồi" hoặc "Mất" sau khi hoàn tất bàn giao (BR12)
          </p>
        </div>

        <button
          onClick={() => setView('create')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Tạo biên bản thu hồi
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã BBBG, tên thiết bị, serial hoặc người đang giữ..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'in_use', 'reclaimed', 'lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' && `Tất cả (${assets.length})`}
              {st === 'in_use' && `Đang sử dụng (${assets.filter((a) => a.status === 'in_use').length})`}
              {st === 'reclaimed' && `Đã thu hồi (${assets.filter((a) => a.status === 'reclaimed').length})`}
              {st === 'lost' && `Mất (${assets.filter((a) => a.status === 'lost').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Mã tài sản</th>
                <th className="py-3 px-4">Tên thiết bị</th>
                <th className="py-3 px-4">Số Serial</th>
                <th className="py-3 px-4">Người sử dụng</th>
                <th className="py-3 px-4">Ngày cấp</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Tem QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((asset) => {
                const activeRec = records.find(
                  (r) =>
                    r.status !== 'completed' &&
                    r.status !== 'cancelled' &&
                    r.items.some((i) => i.assetId === asset.id)
                );

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(asset.category)}
                        <span>{asset.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{asset.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{asset.serial}</td>
                    <td className="py-3 px-4">
                      {asset.currentUserName ? (
                        <span className="font-medium text-slate-900">{asset.currentUserName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Kho lưu trữ (Trống)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{asset.startDate || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(asset.status)}
                        {activeRec && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            Đang xử lý ở {activeRec.id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedAssetForQR(asset)}
                        title="Xem mã QR dán trên nhãn tài sản"
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {selectedAssetForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Tem QR Code tài sản</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {selectedAssetForQR.id} - {selectedAssetForQR.name}
              </p>
            </div>

            <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <QRCodeSVG value={selectedAssetForQR.id} size={160} />
            </div>

            <div className="text-left bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-mono text-slate-600">
              <p>Mã: <strong className="text-slate-900">{selectedAssetForQR.id}</strong></p>
              <p>SN: <strong className="text-slate-900">{selectedAssetForQR.serial}</strong></p>
              <p>Trạng thái: {selectedAssetForQR.status}</p>
            </div>

            <button
              onClick={() => setSelectedAssetForQR(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
