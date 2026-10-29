export type RecordStatus = 'draft' | 'pending_handoff' | 'in_handoff' | 'completed' | 'cancelled';

export type AssetStatus = 'in_use' | 'reclaimed' | 'lost' | 'in_storage';

export type PhysicalCondition = 'Mới / Tốt' | 'Trầy xước nhẹ' | 'Cũ / Đã sử dụng' | 'Móp méo / nứt vỡ';

export type OperatingStatus = 'Hoạt động bình thường' | 'Lỗi màn hình' | 'Không lên nguồn' | 'Khác';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatarText: string;
  position?: string;
  phone?: string;
}

export interface Asset {
  id: string; // e.g. BBBG_01, BBBG_06, BBBG_08
  name: string;
  serial: string;
  category: 'laptop' | 'monitor' | 'printer' | 'phone' | 'desktop' | 'tablet' | 'accessory';
  status: AssetStatus;
  currentUserId?: string;
  currentUserName?: string;
  startDate?: string;
  standardAccessories: string[];
  notes?: string;
}

export interface ReturnRecordItem {
  assetId: string;
  assetName: string;
  serial: string;
  category: string;
  startDate: string;
  // Progress & status in return flow:
  scanned: boolean;
  scannedAt?: string;
  physicalCondition?: PhysicalCondition;
  operatingStatus?: OperatingStatus;
  operatingStatusOtherNote?: string;
  accessories: string[]; // Handed over accessories
  accessoryQuantities?: Record<string, number>; // Quantities for each handed over accessory
  missingAccessoriesNote?: string;
  conditionNote?: string;
  photos: string[];
  isLost?: boolean;
  lostReason?: string;
  handedOverAt?: string;
}

export interface NotificationLog {
  id: string;
  recordId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  sentAt: string;
  type: 'invitation' | 'reminder' | 'overdue' | 'completed' | 'cancelled';
  read: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: RecordStatus | null;
  toStatus: RecordStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface ReturnRecord {
  id: string; // e.g. TH01/2026
  employeeId: string;
  employeeName: string;
  department: string;
  employeeEmail: string;
  reason: string; // e.g. nghỉ việc, chuyển phòng ban, hết hạn hợp đồng
  scheduledDate: string; // yyyy-mm-dd or yyyy-mm-dd HH:mm
  isSudden?: boolean; // Thu hồi đột xuất
  status: RecordStatus;
  createdBy: string; // "Phòng HCNS"
  createdAt: string;
  items: ReturnRecordItem[];
  // Confirmations
  employeeConfirmed?: boolean;
  employeeConfirmedAt?: string;
  // Final receipt
  completedAt?: string;
  receiverName?: string; // "Phòng HCNS"
  cancellationReason?: string;
  cancelledAt?: string;
  history: StatusHistoryEntry[];
}
