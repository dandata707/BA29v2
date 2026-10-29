import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ASSETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_HANDOVERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERSONAS,
  INITIAL_REQUESTS,
} from '../data/mockData';
import {
  Asset,
  FileAttachment,
  HandoverDocument,
  NotificationItem,
  TransferAuditLog,
  TransferRequest,
  TransferStatus,
  UserPersona,
} from '../types/transfer';

export type AppView =
  | 'list' // UI01
  | 'create' // UI02
  | 'review' // UI03
  | 'handover-create' // UI04
  | 'handover-confirm' // UI05
  | 'asset-catalog' // Sổ theo dõi tài sản
  | 'reports'; // Báo cáo thống kê

interface TransferContextType {
  // Current user persona
  currentUser: UserPersona;
  setCurrentUser: (persona: UserPersona) => void;
  availablePersonas: UserPersona[];

  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  navigateTo: (view: AppView, requestId?: string) => void;

  // Print modal
  printHandoverId: string | null;
  setPrintHandoverId: (id: string | null) => void;

  // Search filter global
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Data
  requests: TransferRequest[];
  assets: Asset[];
  handovers: Record<string, HandoverDocument>;
  auditLogs: TransferAuditLog[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotifsAsRead: () => void;

  // Actions
  createRequest: (data: {
    assetId: string;
    destinationLocation: string;
    recipientEmployeeId: string;
    recipientName: string;
    recipientRole: string;
    recipientDept: string;
    reason: string;
    attachments: FileAttachment[];
  }) => TransferRequest;

  reviewRequest: (
    requestId: string,
    action: 'approve' | 'supplement' | 'reject',
    notes: string,
    isDocComplete: boolean,
    isEligible: boolean
  ) => boolean;

  createHandoverDocument: (
    requestId: string,
    data: {
      handoverDate: string;
      handoverLocation: string;
      accessories: string;
      attachments: FileAttachment[];
      termsAccepted: boolean;
    }
  ) => HandoverDocument | null;

  updateHandoverSenderCheck: (
    handoverId: string,
    confirmed: boolean,
    notes: string
  ) => void;

  updateHandoverRecipientCheck: (
    handoverId: string,
    confirmed: boolean,
    notes: string
  ) => void;

  completeTransfer: (handoverId: string) => { success: boolean; message: string };

  deleteRequest: (requestId: string) => void;
  resetToDefaults: () => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: { id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }[];
  removeToast: (id: string) => void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

const STORAGE_PREFIX = 'asset_transfer_app_v2_';

export const TransferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'currentUser');
    return saved ? JSON.parse(saved) : INITIAL_PERSONAS[0];
  });

  const [currentView, setCurrentView] = useState<AppView>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [printHandoverId, setPrintHandoverId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [requests, setRequests] = useState<TransferRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [handovers, setHandovers] = useState<Record<string, HandoverDocument>>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'handovers');
    return saved ? JSON.parse(saved) : INITIAL_HANDOVERS;
  });

  const [auditLogs, setAuditLogs] = useState<TransferAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<
    { id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }[]
  >([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'handovers', JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (view: AppView, requestId?: string) => {
    if (requestId !== undefined) {
      setSelectedRequestId(requestId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Create Request (UI02 -> UI01)
  const createRequest = (data: {
    assetId: string;
    destinationLocation: string;
    recipientEmployeeId: string;
    recipientName: string;
    recipientRole: string;
    recipientDept: string;
    reason: string;
    attachments: FileAttachment[];
  }): TransferRequest => {
    const targetAsset = assets.find((a) => a.id === data.assetId);
    const nextNumber = requests.length + 1;
    const padded = nextNumber.toString().padStart(4, '0');
    const newId = `DC-2026-${padded}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newReq: TransferRequest = {
      id: newId,
      assetId: data.assetId,
      assetName: targetAsset?.name || 'Tài sản',
      assetSerial: targetAsset?.serialNumber || data.assetId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDept: currentUser.department,
      requesterRole: currentUser.roleTitle,
      createdDate: formattedDate,
      updatedDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now
        .getDate()
        .toString()
        .padStart(2, '0')}`,
      currentLocation: targetAsset?.currentLocation || 'Chưa cập nhật',
      destinationLocation: data.destinationLocation,
      recipientEmployeeId: data.recipientEmployeeId,
      recipientName: data.recipientName,
      recipientRole: data.recipientRole,
      recipientDept: data.recipientDept,
      reason: data.reason,
      status: 'pending',
      attachments: data.attachments,
    };

    setRequests((prev) => [newReq, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Yêu cầu điều chuyển mới được tạo',
      message: `${currentUser.name} đã gửi yêu cầu ${newId} cho tài sản ${newReq.assetName}.`,
      timestamp: formattedDate,
      read: false,
      type: 'info',
      targetRequestId: newId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addToast(`Đã tạo thành công yêu cầu điều chuyển ${newId}!`, 'success');

    return newReq;
  };

  // Review request (UI03)
  const reviewRequest = (
    requestId: string,
    action: 'approve' | 'supplement' | 'reject',
    notes: string,
    isDocComplete: boolean,
    isEligible: boolean
  ): boolean => {
    const now = new Date();
    const formattedTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    let newStatus: TransferStatus;
    if (action === 'approve') {
      newStatus = 'approved';
    } else if (action === 'supplement') {
      newStatus = 'supplement';
    } else {
      newStatus = 'rejected';
    }

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: newStatus,
            reviewNotes: notes,
            isDocComplete,
            isEligible,
            reviewedBy: `${currentUser.name} (${currentUser.id})`,
            reviewedAt: formattedTime,
          };
        }
        return r;
      })
    );

    const actionText =
      action === 'approve'
        ? 'Phê duyệt thành công'
        : action === 'supplement'
        ? 'Yêu cầu bổ sung thông tin'
        : 'Đã từ chối yêu cầu';

    addToast(`${actionText} cho phiếu ${requestId}`, action === 'approve' ? 'success' : action === 'supplement' ? 'warning' : 'error');

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: `Cập nhật trạng thái phiếu ${requestId}`,
      message: `HCNS (${currentUser.name}) đã ${
        action === 'approve' ? 'phê duyệt' : action === 'supplement' ? 'yêu cầu bổ sung hồ sơ' : 'từ chối'
      } phiếu ${requestId}.`,
      timestamp: formattedTime,
      read: false,
      type: action === 'approve' ? 'success' : action === 'supplement' ? 'warning' : 'error',
      targetRequestId: requestId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return true;
  };

  // Create Handover Document (UI04)
  const createHandoverDocument = (
    requestId: string,
    data: {
      handoverDate: string;
      handoverLocation: string;
      accessories: string;
      attachments: FileAttachment[];
      termsAccepted: boolean;
    }
  ): HandoverDocument | null => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return null;

    const count = Object.keys(handovers).length + 45;
    const handoverId = `BBBG-2026-${count.toString().padStart(4, '0')}`;
    const now = new Date();
    const formattedTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newHandover: HandoverDocument = {
      id: handoverId,
      requestId,
      formCode: 'Biểu mẫu số 04B/TS-2026',
      handoverDate: data.handoverDate || formattedTime,
      handoverLocation: data.handoverLocation,
      accessories: data.accessories,
      termsAccepted: data.termsAccepted,
      createdAt: formattedTime,
      senderConfirmed: false,
      senderNotes: '',
      senderName: targetReq.requesterName,
      senderCode: targetReq.requesterId,
      senderRole: targetReq.requesterRole,
      senderDept: targetReq.requesterDept,
      recipientConfirmed: false,
      recipientNotes: '',
      recipientName: targetReq.recipientName,
      recipientCode: targetReq.recipientEmployeeId,
      recipientRole: targetReq.recipientRole,
      recipientDept: targetReq.recipientDept,
      attachments: data.attachments,
    };

    setHandovers((prev) => ({ ...prev, [handoverId]: newHandover }));

    // Update request status to 'handover'
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'handover',
            handoverDocId: handoverId,
          };
        }
        return r;
      })
    );

    addToast(`Đã lập biên bản bàn giao ${handoverId} thành công!`, 'success');

    // Notify
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Biên bản bàn giao đã được lập',
      message: `Biên bản ${handoverId} đã được tạo cho phiếu ${requestId}. Chờ bên giao và bên nhận nghiệm thu.`,
      timestamp: formattedTime,
      read: false,
      type: 'info',
      targetRequestId: requestId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newHandover;
  };

  // Update sender check (UI05)
  const updateHandoverSenderCheck = (
    handoverId: string,
    confirmed: boolean,
    notes: string
  ) => {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    setHandovers((prev) => {
      const current = prev[handoverId];
      if (!current) return prev;
      return {
        ...prev,
        [handoverId]: {
          ...current,
          senderConfirmed: confirmed,
          senderNotes: notes,
          senderConfirmedAt: confirmed ? formatted : undefined,
        },
      };
    });
  };

  // Update recipient check (UI05)
  const updateHandoverRecipientCheck = (
    handoverId: string,
    confirmed: boolean,
    notes: string
  ) => {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    setHandovers((prev) => {
      const current = prev[handoverId];
      if (!current) return prev;
      return {
        ...prev,
        [handoverId]: {
          ...current,
          recipientConfirmed: confirmed,
          recipientNotes: notes,
          recipientConfirmedAt: confirmed ? formatted : undefined,
        },
      };
    });
  };

  // Complete Transfer (UI05 -> Updates Asset master records, logs audit, finishes ticket)
  const completeTransfer = (handoverId: string): { success: boolean; message: string } => {
    const handover = handovers[handoverId];
    if (!handover) {
      return { success: false, message: 'Không tìm thấy biên bản bàn giao.' };
    }

    if (!handover.senderConfirmed || !handover.recipientConfirmed) {
      return {
        success: false,
        message: 'Quy tắc BR07, BR08: Yêu cầu cả Bên giao và Bên nhận đều phải xác nhận trên biên bản trước khi hoàn tất.',
      };
    }

    const request = requests.find((r) => r.id === handover.requestId);
    if (!request) {
      return { success: false, message: 'Không tìm thấy yêu cầu điều chuyển gốc.' };
    }

    const targetAsset = assets.find((a) => a.id === request.assetId);
    const now = new Date();
    const formattedTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // 1. Update Asset Master Record
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === request.assetId) {
          return {
            ...a,
            currentLocation: request.destinationLocation,
            currentDepartment: request.recipientDept || a.currentDepartment,
            custodianName: request.recipientName,
            custodianCode: request.recipientEmployeeId,
          };
        }
        return a;
      })
    );

    // 2. Update Request Status to 'completed'
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === request.id) {
          return {
            ...r,
            status: 'completed',
          };
        }
        return r;
      })
    );

    // 3. Create Audit Log
    const newLog: TransferAuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      requestId: request.id,
      assetId: request.assetId,
      assetName: request.assetName,
      fromLocation: request.currentLocation,
      toLocation: request.destinationLocation,
      fromCustodian: `${request.requesterName} (${request.requesterId})`,
      toCustodian: `${request.recipientName} (${request.recipientEmployeeId})`,
      completedAt: formattedTime,
      operator: `${currentUser.name} (${currentUser.systemRoleLabel})`,
      notes: `Hoàn tất theo biên bản ${handover.id}. Ghi nhận xác nhận 2 bên đầy đủ.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // 4. Add Notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: `Hoàn tất điều chuyển phiếu ${request.id}`,
      message: `Tài sản ${request.assetName} đã được cập nhật vị trí mới: ${request.destinationLocation} và người quản lý mới: ${request.recipientName}.`,
      timestamp: formattedTime,
      read: false,
      type: 'success',
      targetRequestId: request.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(`Hoàn tất điều chuyển tài sản ${request.assetId} thành công! Sổ tài sản đã được cập nhật.`, 'success');

    return {
      success: true,
      message: 'Hoàn tất điều chuyển tài sản thành công!',
    };
  };

  const deleteRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    addToast(`Đã xóa yêu cầu ${requestId}`, 'info');
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    localStorage.removeItem(STORAGE_PREFIX + 'requests');
    localStorage.removeItem(STORAGE_PREFIX + 'assets');
    localStorage.removeItem(STORAGE_PREFIX + 'handovers');
    localStorage.removeItem(STORAGE_PREFIX + 'auditLogs');
    localStorage.removeItem(STORAGE_PREFIX + 'notifications');

    setCurrentUser(INITIAL_PERSONAS[0]);
    setRequests(INITIAL_REQUESTS);
    setAssets(INITIAL_ASSETS);
    setHandovers(INITIAL_HANDOVERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentView('list');
    setSelectedRequestId(null);
    addToast('Đã khôi phục dữ liệu mẫu ban đầu!', 'info');
  };

  return (
    <TransferContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availablePersonas: INITIAL_PERSONAS,
        currentView,
        setCurrentView,
        selectedRequestId,
        setSelectedRequestId,
        navigateTo,
        printHandoverId,
        setPrintHandoverId,
        globalSearch,
        setGlobalSearch,
        requests,
        assets,
        handovers,
        auditLogs,
        notifications,
        unreadNotifsCount,
        markNotifsAsRead,
        createRequest,
        reviewRequest,
        createHandoverDocument,
        updateHandoverSenderCheck,
        updateHandoverRecipientCheck,
        completeTransfer,
        deleteRequest,
        resetToDefaults,
        addToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};
