import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../../../types';
import { useAssetCatalog } from '../../../data/assetCatalog';
import { EMPLOYEE_PROFILES } from '../../../data/userProfiles';
import { FileAttachment, HandoverDocument, NotificationItem, TransferAuditLog, TransferRequest, UserPersona } from '../types/transfer';
import { canTransferAsset, canViewRequest, toTransferAsset, transferredAsset } from '../rules';

export type AppView = 'list' | 'create' | 'review' | 'handover-create' | 'handover-confirm' | 'asset-catalog' | 'reports';
interface TransferState {
  requests: TransferRequest[]; handovers: Record<string, HandoverDocument>;
  auditLogs: TransferAuditLog[]; notifications: NotificationItem[];
}
const emptyState: TransferState = { requests: [], handovers: {}, auditLogs: [], notifications: [] };
const STORAGE_KEY = 'qlts_transfer_v1';
function loadState(): TransferState {
  try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && Array.isArray(parsed.requests) && parsed.handovers && Array.isArray(parsed.auditLogs) && Array.isArray(parsed.notifications) ? parsed : emptyState;
  } catch { return emptyState; }
}
function useTransferState(user: UserProfile) {
  const [state, setState] = useState<TransferState>(loadState);
  const [catalog, setCatalog] = useAssetCatalog();
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [printHandoverId, setPrintHandoverId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }[]>([]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { setCurrentView('list'); setSelectedRequestId(null); setPrintHandoverId(null); setGlobalSearch(''); setToasts([]); }, [user.id]);
  const currentUser: UserPersona = { ...user, systemRole: user.role === 'asset_manager' ? 'admin_hr' : 'requester', systemRoleLabel: user.roleTitle };
  const requests = state.requests.filter(request => canViewRequest(user, request));
  const assets = catalog.filter(asset => !asset.isDeleted).map(toTransferAsset);
  const eligibleAssets = catalog.filter(asset => canTransferAsset(asset) &&
    (user.role === 'asset_manager' || !asset.nguoiSuDungId || asset.nguoiSuDungId === user.id) &&
    !state.requests.some(request => request.assetId === asset.id && !['completed', 'rejected'].includes(request.status))).map(toTransferAsset);
  const removeToast = (id: string) => setToasts(prev => prev.filter(toast => toast.id !== id));
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = crypto.randomUUID(); setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  };
  const fail = (message = 'Thao tác không hợp lệ hoặc bạn không có quyền thực hiện.') => { addToast(message, 'error'); return false; };
  const navigateTo = (view: AppView, requestId?: string) => {
    const request = requests.find(item => item.id === (requestId ?? selectedRequestId));
    if (user.role === 'director' || (['review', 'handover-create', 'handover-confirm'].includes(view) && !request) ||
      (['handover-create', 'reports', 'asset-catalog'].includes(view) && user.role !== 'asset_manager') ||
      (view === 'create' && user.role !== 'employee')) { fail(); return; }
    setSelectedRequestId(requestId ?? null); setCurrentView(view);
  };
  const nextCode = (prefix: string, codes: string[]) => {
    const stem = `${prefix}-${new Date().getFullYear()}-`;
    const sequence = Math.max(0, ...codes.filter(code => code.startsWith(stem)).map(code => Number(code.slice(stem.length)) || 0)) + 1;
    return stem + String(sequence).padStart(4, '0');
  };
  const notify = (draft: TransferState, request: TransferRequest, title: string): TransferState => ({ ...draft,
    notifications: [{ id: crypto.randomUUID(), title, message: `${request.id}: ${request.assetName}`, timestamp: new Date().toLocaleString('vi-VN'), read: false, type: 'info', targetRequestId: request.id }, ...draft.notifications],
  });
  const createRequest = (data: { assetId: string; destinationLocation: string; recipientEmployeeId: string; recipientName: string; recipientRole: string; recipientDept: string; reason: string; attachments: FileAttachment[] }): TransferRequest | null => {
    const asset = eligibleAssets.find(item => item.id === data.assetId);
    const recipient = EMPLOYEE_PROFILES.find(item => item.id === data.recipientEmployeeId);
    if (user.role !== 'employee' || !asset || !recipient || recipient.id === user.id || !data.destinationLocation.trim() || data.destinationLocation.trim() === asset.currentLocation || !data.reason.trim()) { fail('Kiểm tra tài sản, người nhận, vị trí mới và lý do điều chuyển.'); return null; }
    const request: TransferRequest = { ...data, id: nextCode('DC', state.requests.map(item => item.id)),
      assetName: asset.name, assetSerial: asset.serialNumber, currentLocation: asset.currentLocation,
      requesterId: user.id, requesterName: user.name, requesterDept: user.department, requesterRole: user.roleTitle,
      recipientName: recipient.name, recipientRole: recipient.roleTitle, recipientDept: recipient.department,
      createdDate: new Date().toLocaleString('vi-VN'), updatedDate: new Date().toISOString().slice(0, 10), status: 'pending',
    };
    setState(prev => notify({ ...prev, requests: [request, ...prev.requests] }, request, 'Yêu cầu điều chuyển mới'));
    addToast(`Đã tạo ${request.id}`); return request;
  };
  const reviewRequest = (id: string, action: 'approve' | 'supplement' | 'reject', notes: string, isDocComplete: boolean, isEligible: boolean) => {
    const request = state.requests.find(item => item.id === id);
    if (user.role !== 'asset_manager' || !request || !['pending', 'supplement'].includes(request.status) ||
      (action === 'approve' && (!isDocComplete || !isEligible || !catalog.some(asset => asset.id === request.assetId && canTransferAsset(asset)))) ||
      (action !== 'approve' && !notes.trim())) return fail();
    const updated: TransferRequest = { ...request, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'supplement',
      reviewNotes: notes, isDocComplete, isEligible, reviewedBy: user.name, reviewedAt: new Date().toLocaleString('vi-VN') };
    setState(prev => notify({ ...prev, requests: prev.requests.map(item => item.id === id ? updated : item) }, updated, 'Kết quả thẩm định điều chuyển'));
    addToast('Đã cập nhật kết quả thẩm định'); return true;
  };
  const resubmitRequest = (id: string, reason: string, attachments: FileAttachment[]) => {
    const request = state.requests.find(item => item.id === id);
    if (user.role !== 'employee' || !request || request.requesterId !== user.id || request.status !== 'supplement' || !reason.trim()) return fail();
    const updated: TransferRequest = { ...request, reason: reason.trim(), attachments, status: 'pending', isDocComplete: false, isEligible: false, updatedDate: new Date().toISOString().slice(0, 10) };
    setState(prev => notify({ ...prev, requests: prev.requests.map(item => item.id === id ? updated : item) }, updated, 'Đã bổ sung yêu cầu điều chuyển'));
    addToast('Đã gửi lại yêu cầu để thẩm định'); return true;
  };
  const createHandoverDocument = (id: string, data: { handoverDate: string; handoverLocation: string; accessories: string; attachments: FileAttachment[]; termsAccepted: boolean }) => {
    const request = state.requests.find(item => item.id === id);
    if (user.role !== 'asset_manager' || !request || request.status !== 'approved' || request.handoverDocId || !data.handoverDate.trim() || !data.handoverLocation.trim() || !data.accessories.trim() || !data.termsAccepted) { fail(); return null; }
    const document: HandoverDocument = { ...data, id: nextCode('BBDC', Object.keys(state.handovers)), requestId: id, formCode: 'Biên bản bàn giao điều chuyển tài sản', createdAt: new Date().toLocaleString('vi-VN'),
      senderConfirmed: false, senderNotes: '', senderName: request.requesterName, senderCode: request.requesterId, senderRole: request.requesterRole, senderDept: request.requesterDept,
      recipientConfirmed: false, recipientNotes: '', recipientName: request.recipientName, recipientCode: request.recipientEmployeeId, recipientRole: request.recipientRole, recipientDept: request.recipientDept };
    setState(prev => notify({ ...prev, handovers: { ...prev.handovers, [document.id]: document }, requests: prev.requests.map(item => item.id === id ? { ...item, status: 'handover', handoverDocId: document.id } : item) }, request, 'Chờ hai bên xác nhận bàn giao'));
    return document;
  };
  const updateCheck = (id: string, side: 'sender' | 'recipient', confirmed: boolean, notes: string) => {
    const document = state.handovers[id]; const request = state.requests.find(item => item.id === document?.requestId);
    if (user.role !== 'employee' || !document || !request || request.status !== 'handover' ||
      user.id !== (side === 'sender' ? request.requesterId : request.recipientEmployeeId) || document[`${side}Confirmed`]) { fail(); return; }
    setState(prev => ({ ...prev, handovers: { ...prev.handovers, [id]: { ...prev.handovers[id], [`${side}Confirmed`]: confirmed, [`${side}Notes`]: notes, [`${side}ConfirmedAt`]: confirmed ? new Date().toLocaleString('vi-VN') : undefined } } }));
    addToast('Đã lưu xác nhận bàn giao');
  };
  const completeTransfer = (id: string) => {
    const document = state.handovers[id]; const request = state.requests.find(item => item.id === document?.requestId);
    const asset = catalog.find(item => item.id === request?.assetId);
    if (user.role !== 'asset_manager' || !request || request.status !== 'handover' || !document?.senderConfirmed || !document.recipientConfirmed || !asset || !canTransferAsset(asset) || (asset.nguoiSuDungId && asset.nguoiSuDungId !== request.requesterId)) {
      fail('Chỉ quản lý tài sản được hoàn tất khi cả hai bên đã xác nhận và tài sản còn đủ điều kiện.'); return { success: false, message: 'Chưa đủ điều kiện hoàn tất.' };
    }
    try { setCatalog(prev => prev.map(item => item.id === asset.id ? transferredAsset(item, request, user, id) : item)); }
    catch { fail('Không lưu được tài sản. Vui lòng thử lại.'); return { success: false, message: 'Không lưu được tài sản.' }; }
    const log: TransferAuditLog = { id: crypto.randomUUID(), requestId: request.id, assetId: asset.id, assetName: asset.tenTaiSan, fromLocation: request.currentLocation, toLocation: request.destinationLocation,
      fromCustodian: request.requesterName, toCustodian: request.recipientName, completedAt: new Date().toLocaleString('vi-VN'), operator: user.name, notes: `Theo biên bản ${id}` };
    setState(prev => notify({ ...prev, requests: prev.requests.map(item => item.id === request.id ? { ...item, status: 'completed' } : item), auditLogs: [log, ...prev.auditLogs] }, request, 'Hoàn tất điều chuyển'));
    addToast('Hoàn tất điều chuyển và cập nhật danh mục tài sản gốc'); return { success: true, message: 'Hoàn tất điều chuyển.' };
  };
  const notifications = state.notifications.filter(notification => requests.some(request => request.id === notification.targetRequestId));
  return { currentUser, currentView, setCurrentView: navigateTo, selectedRequestId, navigateTo, printHandoverId, setPrintHandoverId,
    globalSearch, setGlobalSearch, requests, assets, eligibleAssets,
    handovers: Object.fromEntries(Object.entries(state.handovers).filter(([, document]) => requests.some(request => request.id === document.requestId))),
    auditLogs: state.auditLogs.filter(log => requests.some(request => request.id === log.requestId)), notifications,
    unreadNotifsCount: notifications.filter(item => !item.read).length,
    markNotifsAsRead: () => setState(prev => ({ ...prev, notifications: prev.notifications.map(item => notifications.some(visible => visible.id === item.id) ? { ...item, read: true } : item) })),
    createRequest, reviewRequest, resubmitRequest, createHandoverDocument,
    updateHandoverSenderCheck: (id: string, confirmed: boolean, notes: string) => updateCheck(id, 'sender', confirmed, notes),
    updateHandoverRecipientCheck: (id: string, confirmed: boolean, notes: string) => updateCheck(id, 'recipient', confirmed, notes),
    completeTransfer, addToast, toasts, removeToast,
  };
}
const TransferContext = createContext<ReturnType<typeof useTransferState> | null>(null);
export function TransferProvider({ user, children }: { user: UserProfile; children: React.ReactNode }) {
  const value = useTransferState(user);
  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}
export function useTransfer() {
  const value = useContext(TransferContext);
  if (!value) throw new Error('useTransfer requires TransferProvider');
  return value;
}
