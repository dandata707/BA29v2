import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ReturnRecord,
  Asset,
  Employee,
  NotificationLog,
  RecordStatus,
  ReturnRecordItem,
} from '../types/asset';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_RECORDS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

export type ViewType =
  | 'list'
  | 'create'
  | 'detail'
  | 'employee_confirm'
  | 'asset_inventory';

interface AppContextType {
  records: ReturnRecord[];
  assets: Asset[];
  employees: Employee[];
  notifications: NotificationLog[];
  currentView: ViewType;
  selectedRecordId: string | null;
  selectedRecord: ReturnRecord | null;
  activeRole: 'nvqlts' | 'employee';
  currentEmployee: Employee;
  statusFilter: string;
  searchKeyword: string;
  // Navigation
  setView: (view: ViewType, recordId?: string | null) => void;
  openRecordDetail: (recordId: string) => void;
  setStatusFilter: (status: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setActiveRole: (role: 'nvqlts' | 'employee') => void;
  setCurrentEmployeeId: (empId: string) => void;
  // Business Actions
  createReturnRecord: (payload: {
    employeeId: string;
    reason: string;
    scheduledDate: string;
    assetIds: string[];
    isSudden?: boolean;
  }) => { success: boolean; error?: string; recordId?: string };
  sendNotificationToEmployee: (recordId: string, isReminder?: boolean) => void;
  startHandoffProcess: (recordId: string, overrideReason?: string) => void;
  scanAssetQR: (recordId: string, assetCode: string) => { success: boolean; message: string };
  saveItemCondition: (
    recordId: string,
    assetId: string,
    data: {
      physicalCondition: any;
      operatingStatus: any;
      operatingStatusOtherNote?: string;
      accessories: string[];
      accessoryQuantities?: Record<string, number>;
      missingAccessoriesNote?: string;
      conditionNote?: string;
      photos: string[];
    }
  ) => { success: boolean; error?: string };
  reportAssetLost: (
    recordId: string,
    assetId: string,
    lostReason: string
  ) => { success: boolean; error?: string };
  cancelAssetLost: (recordId: string, assetId: string) => void;
  completeReturnRecord: (recordId: string) => { success: boolean; error?: string };
  cancelReturnRecord: (recordId: string, reason?: string) => void;
  employeeConfirmHandoff: (recordId: string) => { success: boolean; error?: string };
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RECORDS: 'qlts_return_records_v1',
  ASSETS: 'qlts_assets_v1',
  NOTIFICATIONS: 'qlts_notifications_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [records, setRecords] = useState<ReturnRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'nvqlts' | 'employee'>('nvqlts');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('EMP01');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.error(e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) || employees[0];

  const setView = (view: ViewType, recordId: string | null = null) => {
    setCurrentView(view);
    if (recordId !== undefined) {
      setSelectedRecordId(recordId);
    }
  };

  const openRecordDetail = (recordId: string) => {
    setSelectedRecordId(recordId);
    setCurrentView('detail');
  };

  // Helper to generate unique serial format: TH{2 digits}/{current year} (BR04)
  const generateRecordId = (): string => {
    const currentYear = new Date().getFullYear();
    const existingNumbers = records
      .filter((r) => r.id.endsWith(`/${currentYear}`))
      .map((r) => {
        const match = r.id.match(/^TH(\d+)\//);
        return match ? parseInt(match[1], 10) : 0;
      });

    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const padded = nextNum.toString().padStart(2, '0');
    return `TH${padded}/${currentYear}`;
  };

  // UC01: Tạo biên bản thu hồi (BR01, BR02, BR03, BR04)
  const createReturnRecord = (payload: {
    employeeId: string;
    reason: string;
    scheduledDate: string;
    assetIds: string[];
    isSudden?: boolean;
  }) => {
    const { employeeId, reason, scheduledDate, assetIds, isSudden } = payload;
    const employee = employees.find((e) => e.id === employeeId);

    if (!employee) {
      return { success: false, error: 'Vui lòng chọn nhân viên có tài sản cần thu hồi' };
    }
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Vui lòng nhập lý do thu hồi tài sản' };
    }
    if (!scheduledDate) {
      return { success: false, error: 'Vui lòng chọn lịch hẹn bàn giao' };
    }
    if (!assetIds || assetIds.length === 0) {
      return { success: false, error: 'BR01: Mỗi biên bản phải có ít nhất 1 tài sản được chọn' };
    }

    // Check BR03: Tài sản không được đang xử lý ở biên bản khác (chưa Hoàn tất hoặc chưa Hủy)
    const activeRecords = records.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
    for (const assetId of assetIds) {
      const conflictingRecord = activeRecords.find((rec) =>
        rec.items.some((item) => item.assetId === assetId)
      );
      if (conflictingRecord) {
        return {
          success: false,
          error: `Tài sản ${assetId} đang được xử lý trong biên bản ${conflictingRecord.id}. Không thể tạo mới! (BR03)`,
        };
      }
    }

    const newId = generateRecordId();
    const selectedAssets = assets.filter((a) => assetIds.includes(a.id));

    const items: ReturnRecordItem[] = selectedAssets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.name,
      serial: asset.serial,
      category: asset.category,
      startDate: asset.startDate || '2025-01-01',
      scanned: false,
      accessories: [],
      photos: [],
    }));

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRecord: ReturnRecord = {
      id: newId,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      employeeEmail: employee.email,
      reason: reason.trim(),
      scheduledDate,
      isSudden: !!isSudden,
      status: 'draft',
      createdBy: 'Phòng HCNS',
      createdAt: nowStr,
      employeeConfirmed: false,
      receiverName: 'Phòng HCNS',
      items,
      history: [
        {
          id: `H_${Date.now()}`,
          fromStatus: null,
          toStatus: 'draft',
          changedBy: 'Phòng HCNS',
          changedAt: nowStr,
          note: 'Khởi tạo biên bản ở trạng thái Nháp',
        },
      ],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedRecordId(newId);
    setCurrentView('detail');

    return { success: true, recordId: newId };
  };

  // UC02: Gửi thông báo cho nhân viên
  const sendNotificationToEmployee = (recordId: string, isReminder = false) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const nextStatus: RecordStatus = 'pending_handoff';
        const newHistory = [
          ...r.history,
          {
            id: `H_${Date.now()}`,
            fromStatus: r.status,
            toStatus: nextStatus,
            changedBy: 'Phòng HCNS',
            changedAt: nowStr,
            note: isReminder
              ? 'Gửi lại thông báo nhắc nhở bàn giao cho nhân viên'
              : 'Gửi thông báo bàn giao tài sản đến email nhân viên',
          },
        ];

        return {
          ...r,
          status: nextStatus,
          history: newHistory,
        };
      })
    );

    const record = records.find((r) => r.id === recordId);
    if (record) {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newNotif: NotificationLog = {
        id: `NOTIF_${Date.now()}`,
        recordId,
        recipientEmail: record.employeeEmail,
        recipientName: record.employeeName,
        subject: isReminder
          ? `[Nhắc nhở] Lịch bàn giao thu hồi tài sản - Biên bản ${record.id}`
          : `[Thông báo thu hồi tài sản] Biên bản ${record.id} - ${record.reason}`,
        content: `Kính gửi ${record.employeeName}, phòng HCNS thông báo lịch hẹn tiếp nhận thu hồi ${record.items.length} tài sản vào ngày ${record.scheduledDate}. Vui lòng đăng nhập hệ thống để xem chi tiết và xác nhận.`,
        sentAt: nowStr,
        type: isReminder ? 'reminder' : 'invitation',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Bắt đầu bàn giao (Chuyển từ Chờ bàn giao -> Đang bàn giao)
  const startHandoffProcess = (recordId: string, overrideReason?: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const historyNote = overrideReason
          ? `Bắt đầu bàn giao (Chưa có xác nhận trực tuyến: ${overrideReason})`
          : 'Bắt đầu quy trình tiếp nhận và kiểm tra tài sản thực tế';
        return {
          ...r,
          status: 'in_handoff',
          history: [
            ...r.history,
            {
              id: `H_${Date.now()}`,
              fromStatus: r.status,
              toStatus: 'in_handoff',
              changedBy: 'Phòng HCNS',
              changedAt: nowStr,
              note: historyNote,
            },
          ],
        };
      })
    );
  };

  // UC04: Quét QR hoặc nhập mã tài sản
  const scanAssetQR = (recordId: string, assetCode: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Không tìm thấy biên bản' };

    const cleanInput = assetCode.trim().toUpperCase();
    const itemIndex = record.items.findIndex(
      (item) =>
        item.assetId.toUpperCase() === cleanInput ||
        item.serial.toUpperCase() === cleanInput ||
        cleanInput.includes(item.assetId.toUpperCase())
    );

    if (itemIndex === -1) {
      return {
        success: false,
        message: `Mã "${assetCode}" không thuộc danh sách tài sản trong biên bản này! (E2)`,
      };
    }

    const item = record.items[itemIndex];
    if (item.scanned) {
      return {
        success: true,
        message: `Tài sản ${item.assetId} đã được quét thành công trước đó (E3).`,
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newItems = [...r.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          scanned: true,
          scannedAt: nowStr,
          // default physical condition if empty
          physicalCondition: newItems[itemIndex].physicalCondition || 'Mới / Tốt',
          operatingStatus: newItems[itemIndex].operatingStatus || 'Hoạt động bình thường',
        };
        return { ...r, items: newItems };
      })
    );

    return {
      success: true,
      message: `Đã đối chiếu thành công tài sản ${item.assetId} (${item.assetName}). Vui lòng nhập tình trạng thực tế!`,
    };
  };

  // UC04 & M07: Lưu tình trạng tài sản đã quét
  const saveItemCondition = (
    recordId: string,
    assetId: string,
    data: {
      physicalCondition: any;
      operatingStatus: any;
      operatingStatusOtherNote?: string;
      accessories: string[];
      accessoryQuantities?: Record<string, number>;
      missingAccessoriesNote?: string;
      conditionNote?: string;
      photos: string[];
    }
  ) => {
    if (!data.physicalCondition) {
      return { success: false, error: 'Vui lòng chọn tình trạng vật lý (BR07)' };
    }
    if (!data.operatingStatus) {
      return { success: false, error: 'Vui lòng chọn trạng thái hoạt động (BR07)' };
    }
    if (data.operatingStatus === 'Khác' && !data.operatingStatusOtherNote?.trim()) {
      return {
        success: false,
        error: 'E5: Khi chọn trạng thái hoạt động là "Khác", bắt buộc phải nhập ghi chú chi tiết!',
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newItems = r.items.map((it) => {
          if (it.assetId !== assetId) return it;
          return {
            ...it,
            scanned: true,
            scannedAt: it.scannedAt || nowStr,
            physicalCondition: data.physicalCondition,
            operatingStatus: data.operatingStatus,
            operatingStatusOtherNote: data.operatingStatusOtherNote,
            accessories: data.accessories,
            accessoryQuantities: data.accessoryQuantities,
            missingAccessoriesNote: data.missingAccessoriesNote,
            conditionNote: data.conditionNote,
            photos: data.photos,
            isLost: false,
            lostReason: undefined,
          };
        });
        return { ...r, items: newItems };
      })
    );

    return { success: true };
  };

  // Báo mất tài sản (BR08, A2)
  const reportAssetLost = (recordId: string, assetId: string, lostReason: string) => {
    if (!lostReason || lostReason.trim() === '') {
      return { success: false, error: 'E4: Báo mất bắt buộc phải nhập lý do mất! (BR08)' };
    }

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newItems = r.items.map((it) => {
          if (it.assetId !== assetId) return it;
          return {
            ...it,
            isLost: true,
            lostReason: lostReason.trim(),
            scanned: false, // Miễn quét QR theo BR08
            physicalCondition: undefined,
            operatingStatus: undefined,
          };
        });
        return { ...r, items: newItems };
      })
    );

    return { success: true };
  };

  const cancelAssetLost = (recordId: string, assetId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newItems = r.items.map((it) => {
          if (it.assetId !== assetId) return it;
          return {
            ...it,
            isLost: false,
            lostReason: undefined,
          };
        });
        return { ...r, items: newItems };
      })
    );
  };

  // UC05 & UC06: Hoàn tất biên bản (BR06, BR07, BR08, BR11, BR12)
  const completeReturnRecord = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return { success: false, error: 'Không tìm thấy biên bản' };

    // E1: Kiểm tra đủ dữ kiện (mọi tài sản đều đã được ghi nhận tình trạng hoặc báo mất kèm lý do)
    const unprocessedItems = record.items.filter((item) => {
      if (item.isLost && item.lostReason) return false;
      if (item.scanned && item.physicalCondition && item.operatingStatus) return false;
      return true;
    });

    if (unprocessedItems.length > 0) {
      const remainingNames = unprocessedItems.map((i) => i.assetId).join(', ');
      return {
        success: false,
        error: `E1: Còn ${unprocessedItems.length} tài sản chưa hoàn tất kiểm tra (${remainingNames}). Cần quét QR hoặc báo mất cho toàn bộ tài sản trước khi hoàn tất!`,
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // BR12: Khi biên bản Hoàn tất, hệ thống tự động gỡ người dùng, đổi trạng thái tài sản thành "Đã thu hồi" hoặc "Mất"
    setAssets((prev) =>
      prev.map((asset) => {
        const item = record.items.find((it) => it.assetId === asset.id);
        if (!item) return asset;

        if (item.isLost) {
          return {
            ...asset,
            status: 'lost',
            currentUserId: undefined,
            currentUserName: undefined,
            notes: `Báo mất theo biên bản ${record.id}: ${item.lostReason || ''}`,
          };
        } else {
          return {
            ...asset,
            status: 'reclaimed',
            currentUserId: undefined,
            currentUserName: undefined,
            notes: `Đã thu hồi nhập kho theo biên bản ${record.id} ngày ${nowStr}`,
          };
        }
      })
    );

    // Cập nhật trạng thái biên bản thành "completed"
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          status: 'completed',
          completedAt: nowStr,
          receiverName: 'Phòng HCNS',
          items: r.items.map((it) => ({
            ...it,
            handedOverAt: nowStr.split(' ')[0],
          })),
          history: [
            ...r.history,
            {
              id: `H_${Date.now()}`,
              fromStatus: r.status,
              toStatus: 'completed',
              changedBy: 'Phòng HCNS',
              changedAt: nowStr,
              note: 'Hoàn tất bàn giao, cập nhật trạng thái kho tài sản và sinh biên bản điện tử',
            },
          ],
        };
      })
    );

    // Create system notification for employee
    const notif: NotificationLog = {
      id: `NOTIF_${Date.now()}`,
      recordId,
      recipientEmail: record.employeeEmail,
      recipientName: record.employeeName,
      subject: `[Biên bản hoàn tất] Thu hồi tài sản ${record.id} đã hoàn thành`,
      content: `Biên bản thu hồi tài sản ${record.id} đã được phòng HCNS xác nhận hoàn tất thành công vào lúc ${nowStr}. Bạn có thể tải biên bản điện tử để lưu giữ.`,
      sentAt: nowStr,
      type: 'completed',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Celebrate with confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    return { success: true };
  };

  // Hủy biên bản thu hồi
  const cancelReturnRecord = (recordId: string, reason = 'NVQLTS thao tác hủy') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          status: 'cancelled',
          cancelledAt: nowStr,
          cancellationReason: reason,
          history: [
            ...r.history,
            {
              id: `H_${Date.now()}`,
              fromStatus: r.status,
              toStatus: 'cancelled',
              changedBy: 'Phòng HCNS',
              changedAt: nowStr,
              note: `Hủy biên bản thu hồi. Lý do: ${reason}`,
            },
          ],
        };
      })
    );
  };

  // UC03 / Màn hình 10: Nhân viên xác nhận đã đọc và cam kết bàn giao
  const employeeConfirmHandoff = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return { success: false, error: 'Không tìm thấy biên bản' };

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          employeeConfirmed: true,
          employeeConfirmedAt: nowStr,
          history: [
            ...r.history,
            {
              id: `H_${Date.now()}`,
              fromStatus: r.status,
              toStatus: r.status,
              changedBy: record.employeeName,
              changedAt: nowStr,
              note: 'Nhân viên đã xác nhận đồng ý lịch và cam kết bàn giao tài sản đúng hẹn',
            },
          ],
        };
      })
    );

    // Notify NVQLTS
    const notif: NotificationLog = {
      id: `NOTIF_${Date.now()}`,
      recordId,
      recipientEmail: 'hcns@company.vn',
      recipientName: 'Phòng HCNS',
      subject: `[Nhân viên đã xác nhận] Biên bản ${record.id} - ${record.employeeName}`,
      content: `Nhân viên ${record.employeeName} đã xem và xác nhận đồng ý bàn giao đúng hẹn đối với biên bản ${record.id}.`,
      sentAt: nowStr,
      type: 'invitation',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setRecords(INITIAL_RECORDS);
    setAssets(INITIAL_ASSETS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentView('list');
    setSelectedRecordId(null);
  };

  return (
    <AppContext.Provider
      value={{
        records,
        assets,
        employees,
        notifications,
        currentView,
        selectedRecordId,
        selectedRecord,
        activeRole,
        currentEmployee,
        statusFilter,
        searchKeyword,
        setView,
        openRecordDetail,
        setStatusFilter,
        setSearchKeyword,
        setActiveRole,
        setCurrentEmployeeId,
        createReturnRecord,
        sendNotificationToEmployee,
        startHandoffProcess,
        scanAssetQR,
        saveItemCondition,
        reportAssetLost,
        cancelAssetLost,
        completeReturnRecord,
        cancelReturnRecord,
        employeeConfirmHandoff,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
