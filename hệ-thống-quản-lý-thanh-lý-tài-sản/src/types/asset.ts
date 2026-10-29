export type UserRole = 'BPSDTS' | 'NVQLTS' | 'GIAM_DOC';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarText: string;
}

export type AssetType = 'TSCĐ' | 'CCDC';

export type LiquidationStatus = 
  | 'CHUA_DE_NGHI'
  | 'CHO_TIEP_NHAN'
  | 'DANG_THAM_DINH'
  | 'DU_DIEU_KIEN'
  | 'CHUA_DU_DIEU_KIEN'
  | 'CHO_LAP_TO_TRINH'
  | 'CHO_PHE_DUYET'
  | 'DUOC_DUYET'
  | 'DA_THANH_LY';

export interface Asset {
  id: string;
  code: string;
  name: string;
  type: AssetType;
  department: string;
  originalValue: number;
  remainingValue: number;
  manufactureYear?: number;
  usageYear?: number;
  specs?: string;
  condition: string;
  liquidationReason: string;
  note?: string;
  status: LiquidationStatus;
  inspectionResult?: 'Đủ điều kiện thanh lý' | 'Chưa đủ điều kiện';
  actionMethod?: 'Thanh lý (Bán thanh lý)' | 'Sửa chữa điều chuyển' | 'Thu hồi về kho' | 'Tiêu hủy';
  inspectionNote?: string;
  salePrice?: number;
}

export type ProposalStatus = 
  | 'NHAP'
  | 'CHO_TIEP_NHAN'
  | 'DANG_THAM_DINH'
  | 'DU_DIEU_KIEN'
  | 'CHUA_DU_DIEU_KIEN'
  | 'BI_TRA_LAI'
  | 'DA_HOAN_TAT';

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image';
  uploadedAt: string;
  url?: string;
}

export interface TimelineEvent {
  step: string;
  title: string;
  actor: string;
  timestamp: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
  note?: string;
}

export interface Proposal {
  id: string;
  code: string;
  createdDate: string;
  sentDate?: string;
  department: string;
  creatorName: string;
  creatorId: string;
  status: ProposalStatus;
  reason: string;
  note?: string;
  assetIds: string[];
  attachedFiles: AttachedFile[];
  timeline: TimelineEvent[];
  rejectReason?: string;
}

export interface InspectionParticipant {
  id: string;
  stt: number;
  fullName: string;
  position: string;
  organization: string;
}

export interface InspectionRecord {
  id: string;
  proposalId: string;
  recordCode: string;
  inspectorName: string;
  inspectionDate: string;
  startTime?: string;
  location?: string;
  participants?: InspectionParticipant[];
  generalConclusion: string;
  repConfirmationName?: string;
  signedRecordFile?: AttachedFile;
  signedFile?: AttachedFile;
  isSaved: boolean;
  isTransferred: boolean;
  scheduledDate?: string;
}

export type SubmissionStatus = 
  | 'NHAP'
  | 'CHO_PHE_DUYET'
  | 'DA_PHE_DUYET'
  | 'TRA_BO_SUNG';

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  targetDoc: string;
  timestamp: string;
}

export interface Submission {
  id: string;
  code: string;
  createdDate: string;
  sentDate?: string;
  creatorName: string;
  department: string;
  reason: string;
  note?: string;
  status: SubmissionStatus;
  proposalIds: string[];
  assetIds: string[];
  totalOriginalValue: number;
  totalRemainingValue: number;
  attachedFiles: AttachedFile[];
  rejectReason?: string;
  auditLogs: AuditLog[];
}

export interface SaleBatch {
  id: string;
  decisionId: string;
  batchNumber: number;
  contractCode: string;
  contractDate: string;
  buyerName: string;
  salePrice: number;
  deliveryDate: string;
  receiverName: string;
  deliveryRecordCode: string;
  note?: string;
  assetIds: string[];
  contractFile?: AttachedFile;
  deliveryFile?: AttachedFile;
  createdAt: string;
}

export type DecisionStatus = 'DA_PHE_DUYET' | 'DANG_THUC_HIEN' | 'HOAN_TAT';

export interface Decision {
  id: string;
  code: string;
  submissionId: string;
  signDate: string;
  signerName: string;
  department: string;
  status: DecisionStatus;
  totalOriginalValue: number;
  totalRemainingValue: number;
  signedFile?: AttachedFile;
  batches: SaleBatch[];
  note?: string;
}

export interface DossierDocument {
  id: string;
  docCode: string;
  title: string;
  date: string;
  fileName: string;
  fileSize?: string;
  signerOrPartner?: string;
  isComplete: boolean;
  note?: string;
}

export interface DossierCategory {
  id: number;
  name: string;
  description: string;
  required: boolean;
  documents: DossierDocument[];
}

export interface DossierChecklistItem {
  id: number;
  name: string;
  isComplete: boolean;
  fileName?: string;
  docCode?: string;
  date?: string;
}

export interface Dossier {
  id: string;
  decisionId: string;
  decisionCode: string;
  contractCode?: string;
  title: string;
  createdDate: string;
  status: 'DANG_THUC_HIEN' | 'HOAN_TAT';
  closedDate?: string;
  closedBy?: string;
  note?: string;
  checklist: DossierChecklistItem[];
  categories?: DossierCategory[];
}
