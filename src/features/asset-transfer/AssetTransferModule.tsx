import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Header } from '../../components/Header';
import { BreadcrumbItem } from '../../navigation/breadcrumbs';
import { useTransfer } from './context/TransferContext';
import { UI01_TransferList } from './components/UI01_TransferList';
import { UI02_CreateTransfer } from './components/UI02_CreateTransfer';
import { UI03_ReviewTransfer } from './components/UI03_ReviewTransfer';
import { UI04_CreateHandoverDoc } from './components/UI04_CreateHandoverDoc';
import { UI05_ConfirmHandover } from './components/UI05_ConfirmHandover';
import { AssetCatalogView } from './components/AssetCatalogView';
import { ReportsView } from './components/ReportsView';
import { HandoverPrintModal } from './components/HandoverPrintModal';
import { ToastContainer } from './components/Toast';
import { NotificationDrawer } from './components/NotificationDrawer';

export function AssetTransferModule() {
  const { currentView, selectedRequestId, navigateTo, unreadNotifsCount, currentUser } = useTransfer();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const labels = { list: 'Danh sách yêu cầu', create: 'Tạo yêu cầu', review: 'Chi tiết yêu cầu', 'handover-create': 'Lập biên bản bàn giao', 'handover-confirm': 'Xác nhận bàn giao', 'asset-catalog': 'Sổ theo dõi tài sản', reports: 'Báo cáo điều chuyển' };
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Điều chuyển tài sản', onClick: () => navigateTo('list') }];
  if (['create', 'review', 'handover-create', 'handover-confirm'].includes(currentView)) breadcrumbs.push({ label: 'Yêu cầu điều chuyển', onClick: () => navigateTo('list') });
  breadcrumbs.push({ label: labels[currentView] + (selectedRequestId ? ` ${selectedRequestId}` : '') });
  const View = { list: UI01_TransferList, create: UI02_CreateTransfer, review: UI03_ReviewTransfer, 'handover-create': UI04_CreateHandoverDoc, 'handover-confirm': UI05_ConfirmHandover, 'asset-catalog': AssetCatalogView, reports: ReportsView }[currentView];
  if (currentUser.systemRole !== 'admin_hr' && ['asset-catalog', 'reports', 'handover-create'].includes(currentView)) return null;
  return <div className="h-full flex flex-col bg-slate-50 text-slate-800">
    <Header breadcrumbs={breadcrumbs} notifications={<button type="button" aria-label="Thông báo điều chuyển" onClick={() => setNotificationsOpen(true)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Bell className="w-5 h-5" />{unreadNotifsCount > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] px-1">{unreadNotifsCount}</span>}</button>} />
    <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"><View key={`${currentUser.id}-${currentView}-${selectedRequestId || ''}`} /></main>
    <HandoverPrintModal /><ToastContainer /><NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
  </div>;
}
