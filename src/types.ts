export type RequestStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Phê duyệt'
  | 'Nháp'
  | 'Từ chối'
  | 'Đã cấp phát'
  | 'Đã thu hồi';

export type RequestType = 'Cho cá nhân' | 'Cho nhân viên mới';

export type UserRole = 'employee' | 'asset_manager' | 'director';

export interface UserProfile {
  id: string;
  name: string;
  roleTitle: string;
  role: UserRole;
  avatarText: string;
  department: string;
  code: string;
  email?: string;
  employeeId?: string;
}

export interface FormAssetItem {
  id: string;
  name?: string;
  category: string;
  specs?: string;
  quantity: number | string;
  notes?: string;
  isStandard?: boolean;
}

export interface RequestTicket {
  id: number;
  code: string;
  type: RequestType;
  recipient: string;
  recipientCode?: string;
  recipientRole?: string;
  department?: string;
  startDate?: string;
  createdDate: string;
  neededDate: string;
  status: RequestStatus;
  allocationMode?: 'standard' | 'custom';
  standardPackage?: string;
  creatorName?: string;
  creatorCode?: string;
  creatorDepartment?: string;
  creatorRole?: string;
  reason?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  items?: FormAssetItem[];
}

export interface FilterState {
  code: string;
  status: string; // 'Tất cả trạng thái' or specific status
  type: string;   // 'Tất cả loại yêu cầu' or specific type
  department?: string; // 'Tất cả phòng ban' or specific department
}

export type HandoverStatus = 'Nháp' | 'Chờ ký' | 'Hoàn tất';

export interface HandoverItem {
  id: string;
  assetId?: string;
  categoryId?: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

export interface HandoverProtocol {
  id: string;
  code: string; // e.g., 'BBBG-2024-0325'
  createdDate: string; // e.g., '25/03/2024'
  ticketCode?: string; // e.g., 'CP-2026-030'
  senderName: string;
  senderCode: string;
  senderDept: string;
  senderRole: string;
  receiverName: string;
  receiverCode: string;
  receiverDept: string;
  receiverRole: string;
  items: HandoverItem[];
  totalQuantity: number;
  totalValueNumber: number;
  totalValueWords: string;
  status: HandoverStatus;
  notes?: string;
  signedBySender?: boolean;
  signedByReceiver?: boolean;
  senderSignDate?: string;
  receiverSignDate?: string;
}
