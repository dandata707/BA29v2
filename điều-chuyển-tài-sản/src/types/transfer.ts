export type TransferStatus =
  | 'pending' // Chờ tiếp nhận
  | 'supplement' // Chờ bổ sung
  | 'approved' // Đã phê duyệt
  | 'handover' // Chờ xác nhận bàn giao
  | 'rejected' // Từ chối
  | 'completed'; // Hoàn tất

export type UserRole = 'requester' | 'admin_hr';

export interface UserPersona {
  id: string; // e.g. NV010 or NV003
  name: string;
  department: string;
  roleTitle: string;
  avatarText: string;
  systemRole: UserRole;
  systemRoleLabel: string;
}

export interface Employee {
  id_nhan_vien: string;
  ma_nhan_vien: string;
  ho_ten: string;
  ma_phong_ban: string;
  chuc_danh_chuc_vu: string;
  trang_thai_lam_viec: string;
  ngay_bat_dau_lam_viec: string;
  email: string;
}

export interface Department {
  id_don_vi: string;
  ma_don_vi: string;
  ten_don_vi: string;
  ma_don_vi_cha?: string;
  ma_truong_don_vi?: string;
}

export interface Asset {
  // Primary identifier mapped for UI
  id: string; // ma_tai_san, e.g. "LT-2025-00001"
  id_tai_san: string; // AST00001
  ma_tai_san: string; // LT-2025-00001
  name: string; // ten_tai_san
  ten_tai_san: string;
  ma_loai: string;
  serialNumber: string; // so_seri
  so_seri: string;
  nguon_goc: string;
  ngay_nhap: string;
  nguyen_gia_vnd: string;
  originalPrice: number; // parsed numeric value for computations
  tinh_trang: string; // Tốt, Cần sửa chữa, Hỏng, ...
  trang_thai: string; // Đang sử dụng, Sẵn sàng cấp, Đã thu hồi, Mất, Đã thanh lý
  status: string; // Formatted status display

  currentLocation: string; // vi_tri
  vi_tri: string;
  currentDepartment: string; // ma_bo_phan_su_dung
  ma_bo_phan_su_dung: string;
  ma_nguoi_su_dung?: string;
  ma_nguoi_quan_ly?: string;
  ma_nguoi_ghi_nhan?: string;
  ma_nha_cung_cap?: string;
  so_chung_tu?: string;
  thong_tin_bo_sung?: string;

  custodianName: string;
  custodianCode: string;
  specs: string[];
  imageUrl: string;
  defaultAccessories: string;
  category: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: string; // e.g. "1.8 MB"
  uploadTime: string; // e.g. "14:28"
  type: 'pdf' | 'docx' | 'xlsx' | 'image';
  url?: string;
}

export interface TransferRequest {
  id: string; // e.g. DC-2026-0001
  assetId: string;
  assetName: string;
  assetSerial?: string;
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  requesterRole: string;
  createdDate: string; // "18/10/2026 - 09:30"
  updatedDate: string; // "2026-10-18"
  currentLocation: string;
  destinationLocation: string;
  recipientEmployeeId: string;
  recipientName: string;
  recipientRole: string;
  recipientDept: string;
  reason: string;
  status: TransferStatus;
  attachments: FileAttachment[];

  // Review information (UI03)
  isDocComplete?: boolean;
  isEligible?: boolean;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  // Handover document reference (UI04, UI05)
  handoverDocId?: string;
}

export interface HandoverDocument {
  id: string; // e.g. BBBG-2026-0001
  requestId: string;
  formCode: string; // "Biểu mẫu số 04B/TS-2026"
  handoverDate: string; // "2026-10-20 14:30"
  handoverLocation: string;
  accessories: string;
  termsAccepted: boolean;
  createdAt: string;

  // Sender verification (UI05)
  senderConfirmed: boolean;
  senderNotes: string;
  senderConfirmedAt?: string;
  senderName: string;
  senderCode: string;
  senderRole: string;
  senderDept: string;

  // Recipient verification (UI05)
  recipientConfirmed: boolean;
  recipientNotes: string;
  recipientConfirmedAt?: string;
  recipientName: string;
  recipientCode: string;
  recipientRole: string;
  recipientDept: string;

  attachments: FileAttachment[];
}

export interface TransferAuditLog {
  id: string;
  requestId: string;
  assetId: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  fromCustodian: string;
  toCustodian: string;
  completedAt: string;
  operator: string;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  targetRequestId?: string;
}
