import { UserProfile as AppUser } from '../../../types';
import { canOpenScreen, defaultScreen, liquidationRole } from '../permissions';
import { nextDocumentCode } from '../documentCodes';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  UserProfile, 
  Asset, 
  Proposal, 
  Submission, 
  Decision, 
  Dossier, 
  DossierDocument,
  AuditLog, 
  InspectionRecord,
  InspectionParticipant,
  SaleBatch,
  AttachedFile 
} from '../types/asset';
import { 
  INITIAL_ASSETS, 
  INITIAL_PROPOSALS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_DECISIONS, 
  INITIAL_DOSSIERS 
} from '../data/mockData';

export type ScreenType = 
  | 'OVERVIEW'
  | 'PROPOSALS'
  | 'PROPOSAL_CREATE'
  | 'INSPECTIONS'
  | 'INSPECTION_DETAIL'
  | 'QUALIFIED_PROPOSALS'
  | 'SUBMISSION_CREATE'
  | 'NVQLTS_SUBMISSIONS'
  | 'SUBMISSION_LIST'
  | 'EXECUTIONS'
  | 'DOSSIERS';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  targetRole: UserRole;
  isRead: boolean;
  linkScreen?: ScreenType;
}

interface AssetContextType {
  nextProposalCode: string;
  nextSubmissionCode: string;
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  
  // Entities
  assets: Asset[];
  proposals: Proposal[];
  submissions: Submission[];
  decisions: Decision[];
  dossiers: Dossier[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  inspectionRecords: Record<string, InspectionRecord>;
  
  // Selection states
  selectedProposalId: string | null;
  setSelectedProposalId: (id: string | null) => void;
  selectedSubmissionId: string | null;
  setSelectedSubmissionId: (id: string | null) => void;
  selectedDecisionId: string | null;
  setSelectedDecisionId: (id: string | null) => void;
  selectedDossierId: string | null;
  setSelectedDossierId: (id: string | null) => void;
  editingProposalId: string | null;
  setEditingProposalId: (id: string | null) => void;
  qualifiedSelectedProposalIds: string[];
  setQualifiedSelectedProposalIds: React.Dispatch<React.SetStateAction<string[]>>;

  // Workflow Handlers (Table 1: Steps 1-14 + Tables 2-5)
  createProposal: (data: { code: string; date: string; department: string; reason: string; note: string; assetIds: string[]; isSent: boolean; assetDetails?: { id: string; liquidationReason: string; note: string }[] }) => void;
  updateProposal: (id: string, data: { reason: string; note: string; assetIds: string[]; isSent: boolean; assetDetails?: { id: string; liquidationReason: string; note: string }[] }) => void;
  startInspection: (proposalId: string) => void;
  saveInspection: (
    proposalId: string, 
    inspectorName: string, 
    date: string, 
    conclusion: string, 
    assetUpdates: Array<{ id: string; condition: string; result: 'Đủ điều kiện thanh lý' | 'Chưa đủ điều kiện'; method: 'Thanh lý (Bán thanh lý)' | 'Sửa chữa điều chuyển' | 'Thu hồi về kho' | 'Tiêu hủy'; note?: string }>,
    extraDetails?: {
      startTime?: string;
      location?: string;
      participants?: InspectionParticipant[];
      repConfirmationName?: string;
      signedRecordFile?: AttachedFile;
    }
  ) => void;
  scheduleInspection: (proposalId: string, scheduledTime: string) => void;
  executeDisposition: (proposalId: string, note?: string) => void;
  transferToSubmission: (proposalId: string) => boolean;
  createSubmission: (data: { code: string; date: string; reason: string; note: string; proposalIds: string[]; assetIds: string[]; isSent: boolean; attachedFiles?: AttachedFile[] }) => void;
  approveSubmission: (submissionId: string, decisionCode: string, signDate: string, note?: string) => void;
  rejectSubmission: (submissionId: string, rejectReason: string) => void;
  executeLiquidationBatch: (decisionId: string, batchData: { contractCode: string; contractDate: string; buyerName: string; salePrice: number; deliveryDate: string; receiverName: string; deliveryRecordCode: string; note?: string; assetIds: string[]; contractFileName?: string; deliveryFileName?: string }) => void;
  supplementDossierChecklistItem: (dossierId: string, itemId: number, data: { docCode: string; fileName: string; date: string; note?: string; title?: string; signerOrPartner?: string; fileSize?: string }) => void;
  closeDossier: (dossierId: string, note?: string) => { success: boolean; message: string };
  logDocumentView: (docType: string, docCode: string) => void;
  resetAllData: () => void;
  markNotificationAsRead: (id: string) => void;
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const STORAGE_KEY = 'ba_asset_management_state_v2';
function readStorage(key: string): string | null {
  try {
    const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    if (value) JSON.parse(value);
    return value;
  } catch { return null; }
}
function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Keep the workflow usable if storage is unavailable. */ }
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: ReactNode; user: AppUser; onRequestRoleSwitch: () => void }> = ({ children, user, onRequestRoleSwitch }) => {
  const currentUser: UserProfile = { ...user, role: liquidationRole(user.role) };
  const [requestedScreen, setRequestedScreen] = useState<ScreenType>(() => defaultScreen(currentUser.role));
  const activeScreen = canOpenScreen(currentUser.role, requestedScreen) ? requestedScreen : defaultScreen(currentUser.role);
  const setActiveScreen = (screen: ScreenType) => {
    if (canOpenScreen(currentUser.role, screen)) setRequestedScreen(screen);
  };

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_assets`);
    return deduplicateById(saved ? JSON.parse(saved) : INITIAL_ASSETS);
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_proposals`);
    return deduplicateById(saved ? JSON.parse(saved) : INITIAL_PROPOSALS);
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_submissions`);
    return deduplicateById(saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS);
  });

  const [decisions, setDecisions] = useState<Decision[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_decisions`);
    return deduplicateById(saved ? JSON.parse(saved) : INITIAL_DECISIONS);
  });

  const [dossiers, setDossiers] = useState<Dossier[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_dossiers`);
    return deduplicateById(saved ? JSON.parse(saved) : INITIAL_DOSSIERS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = readStorage(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'al-init-1',
        userName: 'Nguyễn Thị Hà',
        userRole: 'NVQLTS',
        action: 'Xem trước hồ sơ đính kèm',
        targetDoc: 'De-nghi-thanh-ly-KT.pdf',
        timestamp: '20/10/2026 16:15:20',
      },
    ];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => { const saved = readStorage(`${STORAGE_KEY}_notifications`); return saved ? JSON.parse(saved) : [
    {
      id: 'n-1',
      title: 'Đề nghị mới chờ tiếp nhận',
      message: 'Phòng Hành chính đã gửi đề nghị TL-2026-025 gồm 3 tài sản',
      time: '14:30 20/10/2026',
      targetRole: 'NVQLTS',
      isRead: false,
      linkScreen: 'INSPECTIONS',
    },
    {
      id: 'n-2',
      title: 'Tờ trình mới chờ phê duyệt',
      message: 'Phòng Kế toán đã trình Tờ trình TT-2026-005 thanh lý máy móc',
      time: '16:00 20/10/2026',
      targetRole: 'GIAM_DOC',
      isRead: false,
      linkScreen: 'SUBMISSION_LIST',
    },
  ]; });

  const [inspectionRecords, setInspectionRecords] = useState<Record<string, InspectionRecord>>(() => { const saved = readStorage(`${STORAGE_KEY}_inspectionRecords`); return saved ? JSON.parse(saved) : {
    'TL-2026-025': {
      id: 'ir-025',
      proposalId: 'TL-2026-025',
      recordCode: 'BB-KiemTra-TL025-signed.pdf',
      inspectorName: 'Trần Văn Bình',
      inspectionDate: '21/10/2026',
      generalConclusion: 'Hội đồng đã tiến hành kiểm tra thực tế hiện trạng của 3 tài sản thuộc đề nghị TL-2026-025. Cả 3 tài sản đều đã sử dụng lâu năm, tỷ lệ hư hỏng lớn hơn 60%, không còn hiệu quả sửa chữa. Thống nhất chuyển phê duyệt thanh lý theo quy định hiện hành.',
      signedFile: {
        id: 'bb-f1',
        name: 'BB-KiemTra-TL025-signed.pdf',
        size: '1.2 MB',
        type: 'pdf',
        uploadedAt: '21/10/2026 09:30',
      },
      isSaved: true,
      isTransferred: false,
    },
  }; });

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>('TL-2026-025');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>('TT-2026-005');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>('QD-2026-015');
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>('dos-2026-015');
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [qualifiedSelectedProposalIds, setQualifiedSelectedProposalIds] = useState<string[]>(['TL-2026-024']);

  useEffect(() => { writeStorage(`${STORAGE_KEY}_inspectionRecords`, JSON.stringify(inspectionRecords)); }, [inspectionRecords]);
  useEffect(() => { writeStorage(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications)); }, [notifications]);

  // Sync to localStorage
  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_assets`, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_proposals`, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_decisions`, JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_dossiers`, JSON.stringify(dossiers));
  }, [dossiers]);

  useEffect(() => {
    writeStorage(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    setRequestedScreen(defaultScreen(currentUser.role));
    setSelectedProposalId(null);
    setSelectedSubmissionId(null);
    setSelectedDecisionId(null);
    setSelectedDossierId(null);
    setEditingProposalId(null);
    setQualifiedSelectedProposalIds([]);
  }, [user.id, user.role]);

  // Every role change uses the application's shared account switcher.
  const switchUserRole = (_role: UserRole) => onRequestRoleSwitch();

  const logDocumentView = (docType: string, docCode: string) => {
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newLog: AuditLog = {
      id: `al-${Date.now()}`,
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      action: `Xem tài liệu (${docType})`,
      targetDoc: docCode,
      timestamp: timeStr,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // Also append to current submission if applicable
    if (selectedSubmissionId) {
      setSubmissions((prev) =>
        prev.map((sub) => {
          if (sub.id === selectedSubmissionId || sub.code === selectedSubmissionId) {
            return {
              ...sub,
              auditLogs: [newLog, ...sub.auditLogs],
            };
          }
          return sub;
        })
      );
    }
  };

  // 1. Create Proposal (Steps 1, 2, 3, 4)
  const createProposal = (data: {
    code: string;
    date: string;
    department: string;
    reason: string;
    note: string;
    assetIds: string[];
    isSent: boolean;
    assetDetails?: { id: string; liquidationReason: string; note: string }[];
  }) => {
    if (currentUser.role !== 'BPSDTS' || data.department !== currentUser.department || !data.reason.trim() || data.assetIds.length === 0 || new Set(data.assetIds).size !== data.assetIds.length) return;
    if (data.assetIds.some(id => !assets.some(a => a.id === id && a.department === currentUser.department && a.status === 'CHUA_DE_NGHI'))) return;
    if (proposals.some(p => p.code === data.code)) return;
    setAssets(prev => prev.map(asset => {
      const details = data.assetDetails?.find(item => item.id === asset.id && data.assetIds.includes(item.id));
      return details ? { ...asset, liquidationReason: details.liquidationReason, note: details.note } : asset;
    }));
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newStatus = data.isSent ? 'CHO_TIEP_NHAN' : 'NHAP';
    const newProposal: Proposal = {
      id: data.code,
      code: data.code,
      createdDate: data.date,
      sentDate: data.isSent ? data.date : undefined,
      department: data.department,
      creatorName: currentUser.name,
      creatorId: currentUser.id,
      status: newStatus,
      reason: data.reason,
      note: data.note,
      assetIds: data.assetIds,
      attachedFiles: [
        {
          id: `f-${Date.now()}`,
          name: `DeNghiThanhLy_${data.code}.pdf`,
          size: '1.1 MB',
          type: 'pdf',
          uploadedAt: timeStr,
        },
      ],
      timeline: [
        {
          step: '1',
          title: 'Lập đề nghị',
          actor: `${currentUser.name} (BPSDTS)`,
          timestamp: timeStr,
          status: 'completed',
          note: data.isSent ? 'Đã gửi đề nghị sang NVQLTS' : 'Đã lưu bản nháp',
        },
        ...(data.isSent
          ? [
              {
                step: '2',
                title: 'Chờ tiếp nhận',
                actor: 'Nhân viên quản lý tài sản',
                timestamp: timeStr,
                status: 'current' as const,
                note: 'Hồ sơ đang chờ tiếp nhận và thẩm định thực tế',
              },
            ]
          : []),
      ],
    };

    setProposals((prev) => [newProposal, ...prev.filter((p) => p.id !== newProposal.id && p.code !== newProposal.code)]);

    // Update asset statuses
    if (data.isSent) {
      setAssets((prev) =>
        prev.map((a) =>
          data.assetIds.includes(a.id)
            ? { ...a, status: 'CHO_TIEP_NHAN' }
            : a
        )
      );

      // Notification to NVQLTS
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Đề nghị mới chờ tiếp nhận',
          message: `${data.department} vừa gửi đề nghị ${data.code} với ${data.assetIds.length} tài sản.`,
          time: timeStr,
          targetRole: 'NVQLTS',
          isRead: false,
          linkScreen: 'INSPECTIONS',
        },
        ...prev,
      ]);
    }
  };

  // Update existing proposal (V13: Sửa lại sau khi bị trả lại)
  const updateProposal = (id: string, data: {
    reason: string;
    note: string;
    assetIds: string[];
    isSent: boolean;
    assetDetails?: { id: string; liquidationReason: string; note: string }[];
  }) => {
    const target = proposals.find(p => p.id === id);
    if (currentUser.role !== 'BPSDTS' || !target || target.creatorId !== currentUser.id || !['NHAP', 'BI_TRA_LAI'].includes(target.status) || !data.reason.trim() || data.assetIds.length === 0) return;
    if (data.assetIds.some(assetId => !assets.some(asset => asset.id === assetId && asset.department === currentUser.department))) return;
    setAssets(prev => prev.map(asset => {
      const details = data.assetDetails?.find(item => item.id === asset.id && data.assetIds.includes(item.id));
      return details ? { ...asset, liquidationReason: details.liquidationReason, note: details.note } : asset;
    }));
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newStatus = data.isSent ? 'CHO_TIEP_NHAN' : 'NHAP';

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            reason: data.reason,
            note: data.note,
            assetIds: data.assetIds,
            status: newStatus,
            rejectReason: undefined,
            timeline: [
              ...p.timeline,
              {
                step: '3',
                title: 'Gửi lại đề nghị sau điều chỉnh',
                actor: `${currentUser.name} (BPSDTS)`,
                timestamp: timeStr,
                status: 'completed',
                note: 'Đã bổ sung hồ sơ và gửi lại NVQLTS',
              },
              ...(data.isSent
                ? [
                    {
                      step: '4',
                      title: 'Chờ tiếp nhận lại',
                      actor: 'Nhân viên quản lý tài sản',
                      timestamp: timeStr,
                      status: 'current' as const,
                    },
                  ]
                : []),
            ],
          };
        }
        return p;
      })
    );

    if (data.isSent) {
      setAssets((prev) =>
        prev.map((a) =>
          data.assetIds.includes(a.id)
            ? { ...a, status: 'CHO_TIEP_NHAN' }
            : a
        )
      );
    }
  };

  // 2. Start inspection (Step 5)
  const startInspection = (proposalId: string) => {
    if (currentUser.role !== 'NVQLTS' || !proposals.some(p => p.id === proposalId && ['CHO_TIEP_NHAN', 'DANG_THAM_DINH'].includes(p.status))) return;
    setSelectedProposalId(proposalId);
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: 'DANG_THAM_DINH',
            timeline: p.timeline.map((t) =>
              t.title.includes('tiếp nhận')
                ? { ...t, status: 'completed' as const }
                : t
            ).concat([
              {
                step: '3',
                title: 'Đang thẩm định thực tế',
                actor: `${currentUser.name} (NVQLTS)`,
                timestamp: 'Đang thực hiện',
                status: 'current' as const,
                note: 'NVQLTS bắt đầu kiểm tra hiện trường thiết bị',
              },
            ]),
          };
        }
        return p;
      })
    );

    setActiveScreen('INSPECTION_DETAIL');
  };

  // 3. Save Inspection Record
  const saveInspection = (
    proposalId: string,
    inspectorName: string,
    date: string,
    conclusion: string,
    assetUpdates: Array<{
      id: string;
      condition: string;
      result: 'Đủ điều kiện thanh lý' | 'Chưa đủ điều kiện';
      method: 'Thanh lý (Bán thanh lý)' | 'Sửa chữa điều chuyển' | 'Thu hồi về kho' | 'Tiêu hủy';
      note?: string;
    }>,
    extraDetails?: {
      startTime?: string;
      location?: string;
      participants?: InspectionParticipant[];
      repConfirmationName?: string;
      signedRecordFile?: AttachedFile;
    }
  ) => {
    const target = proposals.find(p => p.id === proposalId);
    if (currentUser.role !== 'NVQLTS' || !target || target.status !== 'DANG_THAM_DINH' || !conclusion.trim() || !date || assetUpdates.length !== target.assetIds.length || new Set(assetUpdates.map(a => a.id)).size !== target.assetIds.length || assetUpdates.some(a => !target.assetIds.includes(a.id))) return;
    const recordCode = `BB-KT-${proposalId.replace('TL-', '')}-signed.pdf`;
    const newRecord: InspectionRecord = {
      id: `ir-${Date.now()}`,
      proposalId,
      recordCode,
      inspectorName,
      inspectionDate: date,
      startTime: extraDetails?.startTime,
      location: extraDetails?.location,
      participants: extraDetails?.participants,
      repConfirmationName: extraDetails?.repConfirmationName,
      generalConclusion: conclusion,
      isSaved: true,
      isTransferred: false,
      signedRecordFile: extraDetails?.signedRecordFile || {
        id: `bf-${Date.now()}`,
        name: recordCode,
        size: '1.4 MB',
        type: 'pdf',
        uploadedAt: `${date} 10:00`,
      },
    };

    setInspectionRecords((prev) => ({
      ...prev,
      [proposalId]: newRecord,
    }));

    // Update assets evaluation
    setAssets((prev) =>
      prev.map((a) => {
        const update = assetUpdates.find((u) => u.id === a.id);
        if (update) {
          return {
            ...a,
            condition: update.condition,
            inspectionResult: update.result,
            actionMethod: update.method,
            inspectionNote: update.note,
          };
        }
        return a;
      })
    );
  };

  // 3b. Schedule Inspection ("Tiếp nhận & Báo lịch")
  const scheduleInspection = (proposalId: string, scheduledTime: string) => {
    if (currentUser.role !== 'NVQLTS' || !scheduledTime.trim() || !proposals.some(p => p.id === proposalId && ['CHO_TIEP_NHAN', 'DANG_THAM_DINH'].includes(p.status))) return;
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: 'DANG_THAM_DINH',
          };
        }
        return p;
      })
    );

    setInspectionRecords((prev) => ({
      ...prev,
      [proposalId]: {
        ...(prev[proposalId] || {
          id: `ir-${Date.now()}`,
          proposalId,
          recordCode: `BB-KT-${proposalId.replace('TL-', '')}`,
          inspectorName: currentUser.name,
          inspectionDate: '25/10/2026',
          generalConclusion: '',
          isSaved: false,
          isTransferred: false,
        }),
        scheduledDate: scheduledTime,
      },
    }));

    setNotifications((prev) => [
      {
        id: `noti-nvqlts-${Date.now()}`,
        title: `Lịch kiểm tra thực tế: ${proposalId}`,
        message: `Đã tiếp nhận đề nghị ${proposalId}. Lịch kiểm tra thực tế: ${scheduledTime}.`,
        time: 'Vừa xong',
        targetRole: 'NVQLTS',
        isRead: false,
        linkScreen: 'INSPECTION_DETAIL',
      },
      {
        id: `noti-bpsdts-${Date.now()}`,
        title: 'Thông báo tiếp nhận & lịch kiểm tra tài sản',
        message: `Đề nghị ${proposalId} đã được tiếp nhận. Lịch kiểm tra thực tế: ${scheduledTime}.`,
        time: 'Vừa xong',
        targetRole: 'BPSDTS',
        isRead: false,
        linkScreen: 'INSPECTIONS',
      },
      ...prev,
    ]);
  };

  // 3c. Execute Disposition ("Thực hiện hướng xử lý")
  const executeDisposition = (proposalId: string, note?: string) => {
    if (currentUser.role !== 'NVQLTS') return;
    const currentProposal = proposals.find((p) => p.id === proposalId);
    if (!currentProposal) return;

    // Assets with non-qualified resolution
    setAssets((prev) =>
      prev.map((a) => {
        if (currentProposal.assetIds.includes(a.id) && a.inspectionResult === 'Chưa đủ điều kiện') {
          return {
            ...a,
            status: 'CHUA_DE_NGHI',
            condition: a.condition + ' (Đã xử lý điều chuyển / sửa chữa nội bộ)',
          };
        }
        return a;
      })
    );

    setNotifications((prev) => [
      {
        id: `noti-disp-${Date.now()}`,
        title: 'Thực thi phương án xử lý tài sản',
        message: `Đã thực thi điều chuyển/sửa chữa các tài sản chưa đủ điều kiện thanh lý thuộc đề nghị ${proposalId}.`,
        time: 'Vừa xong',
        targetRole: 'NVQLTS',
        isRead: false,
      },
      ...prev,
    ]);
  };

  // 4. Transfer to Submission (Step 7 - Chốt chặn 2)
  const transferToSubmission = (proposalId: string): boolean => {
    if (currentUser.role !== 'NVQLTS') return false;
    const record = inspectionRecords[proposalId];
    if (!record || !record.isSaved) {
      return false;
    }

    const currentProposal = proposals.find((p) => p.id === proposalId);
    if (!currentProposal) return false;

    // Check if at least 1 asset is "Đủ điều kiện thanh lý"
    const relevantAssets = assets.filter((a) => currentProposal.assetIds.includes(a.id));
    const qualifiedAssets = relevantAssets.filter((a) => a.inspectionResult === 'Đủ điều kiện thanh lý');

    if (qualifiedAssets.length === 0) {
      return false;
    }

    // Mark proposal as DU_DIEU_KIEN
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: 'DU_DIEU_KIEN',
          };
        }
        return p;
      })
    );

    // Update assets to CHO_LAP_TO_TRINH
    setAssets((prev) =>
      prev.map((a) => {
        if (qualifiedAssets.some((qa) => qa.id === a.id)) {
          return {
            ...a,
            status: 'CHO_LAP_TO_TRINH',
          };
        }
        return a;
      })
    );

    setInspectionRecords((prev) => ({
      ...prev,
      [proposalId]: {
        ...prev[proposalId],
        isTransferred: true,
      },
    }));

    // Set qualified selection and navigate
    setQualifiedSelectedProposalIds((prev) => [...new Set([...prev, proposalId])]);
    setActiveScreen('QUALIFIED_PROPOSALS');
    return true;
  };

  // 5. Create Submission from Proposals (Steps 8 & 9)
  const createSubmission = (data: {
    code: string;
    date: string;
    reason: string;
    note: string;
    proposalIds: string[];
    assetIds: string[];
    isSent: boolean;
    attachedFiles?: AttachedFile[];
  }) => {
    if (currentUser.role !== 'NVQLTS' || !data.reason.trim() || !data.proposalIds.length || !data.assetIds.length || new Set(data.assetIds).size !== data.assetIds.length) return;
    if (submissions.some(sub => sub.code === data.code && !['NHAP', 'TRA_BO_SUNG'].includes(sub.status))) return;
    if (data.proposalIds.some(id => !proposals.some(p => p.id === id && p.status === 'DU_DIEU_KIEN'))) return;
    if (data.assetIds.some(id => !assets.some(a => a.id === id && a.inspectionResult === 'Đủ điều kiện thanh lý') || !proposals.some(p => data.proposalIds.includes(p.id) && p.assetIds.includes(id)))) return;
    if (submissions.some(sub => sub.code !== data.code && ['CHO_PHE_DUYET', 'DA_PHE_DUYET'].includes(sub.status) && sub.assetIds.some(id => data.assetIds.includes(id)))) return;
    const includedAssets = assets.filter((a) => data.assetIds.includes(a.id));
    const totalOriginal = includedAssets.reduce((sum, a) => sum + a.originalValue, 0);
    const totalRemaining = includedAssets.reduce((sum, a) => sum + a.remainingValue, 0);

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const filesToAttach: AttachedFile[] = data.attachedFiles && data.attachedFiles.length > 0
      ? data.attachedFiles
      : data.proposalIds.length > 0
      ? data.proposalIds.flatMap((propId, idx) => [
          {
            id: `f-dn-${propId}-${Date.now()}-${idx}`,
            name: `DeNghi-${propId}.pdf`,
            size: '1.8 MB',
            type: 'pdf' as const,
            uploadedAt: timeStr,
          },
          {
            id: `f-bb-${propId}-${Date.now()}-${idx}`,
            name: `BB-KiemTra-${propId}.pdf`,
            size: '1.5 MB',
            type: 'pdf' as const,
            uploadedAt: timeStr,
          },
        ])
      : [
          {
            id: `f-trinh-${Date.now()}`,
            name: `De-nghi-thanh-ly-${data.code}.pdf`,
            size: '2.1 MB',
            type: 'pdf' as const,
            uploadedAt: timeStr,
          },
          {
            id: `f-bb-${Date.now()}`,
            name: `Bien-ban-kiem-tra-${data.code}.pdf`,
            size: '1.6 MB',
            type: 'pdf' as const,
            uploadedAt: timeStr,
          },
        ];

    const newSub: Submission = {
      id: data.code,
      code: data.code,
      createdDate: data.date,
      sentDate: data.isSent ? data.date : undefined,
      creatorName: currentUser.name,
      department: currentUser.department,
      reason: data.reason,
      note: data.note,
      status: data.isSent ? 'CHO_PHE_DUYET' : 'NHAP',
      proposalIds: data.proposalIds,
      assetIds: data.assetIds,
      totalOriginalValue: totalOriginal,
      totalRemainingValue: totalRemaining,
      attachedFiles: filesToAttach,
      auditLogs: [
        {
          id: `al-${Date.now()}`,
          userName: currentUser.name,
          userRole: currentUser.roleTitle,
          action: data.isSent ? 'Trình Giám đốc phê duyệt tờ trình' : 'Lưu bản nháp tờ trình',
          targetDoc: data.code,
          timestamp: timeStr,
        },
      ],
    };

    setSubmissions((prev) => [newSub, ...prev.filter((s) => s.id !== newSub.id && s.code !== newSub.code)]);

    if (data.isSent) {
      // Update assets status to CHO_PHE_DUYET
      setAssets((prev) =>
        prev.map((a) =>
          data.assetIds.includes(a.id)
            ? { ...a, status: 'CHO_PHE_DUYET' }
            : a
        )
      );

      // Notify Director
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Tờ trình thanh lý mới',
          message: `${currentUser.name} vừa gửi Tờ trình ${data.code} với tổng giá trị ${totalOriginal.toLocaleString('vi-VN')} đ chờ Giám đốc duyệt.`,
          time: timeStr,
          targetRole: 'GIAM_DOC',
          isRead: false,
          linkScreen: 'SUBMISSION_LIST',
        },
        ...prev,
      ]);
    }
  };

  // 6. Approve Submission (Step 11 - Chốt chặn 3)
  const approveSubmission = (submissionId: string, decisionCode: string, signDate: string, note?: string) => {
    if (currentUser.role !== 'GIAM_DOC' || !decisionCode.trim() || !signDate || decisions.some(d => d.code === decisionCode)) return;
    const sub = submissions.find((s) => s.id === submissionId || s.code === submissionId);
    if (!sub || sub.status !== 'CHO_PHE_DUYET') return;

    // Update submission status to DA_PHE_DUYET
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              status: 'DA_PHE_DUYET',
              auditLogs: [
                {
                  id: `al-${Date.now()}`,
                  userName: currentUser.name,
                  userRole: currentUser.roleTitle,
                  action: `Phê duyệt tờ trình & ban hành ${decisionCode}`,
                  targetDoc: s.code,
                  timestamp: `${signDate} 11:00`,
                },
                ...s.auditLogs,
              ],
            }
          : s
      )
    );

    // Update asset statuses to DUOC_DUYET
    setAssets((prev) =>
      prev.map((a) =>
        sub.assetIds.includes(a.id)
          ? { ...a, status: 'DUOC_DUYET' }
          : a
      )
    );

    // Create Decision
    const newDecisionId = decisionCode.replace('QĐ-', 'QD-');
    const newDecision: Decision = {
      id: newDecisionId,
      code: decisionCode,
      submissionId: sub.code,
      signDate,
      signerName: currentUser.name,
      department: sub.department,
      status: 'DANG_THUC_HIEN',
      totalOriginalValue: sub.totalOriginalValue,
      totalRemainingValue: sub.totalRemainingValue,
      note: note || `Thanh lý theo Quyết định số ${decisionCode}`,
      signedFile: {
        id: `qdf-${Date.now()}`,
        name: `${decisionCode}-signed.pdf`,
        size: '2.2 MB',
        type: 'pdf',
        uploadedAt: `${signDate} 11:30`,
      },
      batches: [],
    };

    setDecisions((prev) => [
      newDecision,
      ...prev.filter((d) => d.id !== newDecisionId && d.code !== decisionCode),
    ]);

    // Create Initial Dossier
    const newDossierId = `dos-${decisionCode.replace('QĐ-', '')}`;
    const newDossier: Dossier = {
      id: newDossierId,
      decisionId: newDecision.id,
      decisionCode: decisionCode,
      title: `Hồ sơ thanh lý theo ${decisionCode} (${sub.department})`,
      createdDate: signDate,
      status: 'DANG_THUC_HIEN',
      checklist: [
        { id: 1, name: '1. Đề nghị thanh lý', isComplete: true, fileName: `DeNghi-${sub.code}.pdf`, docCode: sub.proposalIds[0] || 'TL-2026', date: sub.createdDate },
        { id: 2, name: '2. Danh mục tài sản', isComplete: true, fileName: `DanhMucTaiSan-${sub.code}.xlsx`, docCode: `DM-${decisionCode}`, date: sub.createdDate },
        { id: 3, name: '3. Biên bản kiểm tra hiện trạng', isComplete: true, fileName: `BB-KiemTra-${sub.code}.pdf`, docCode: `BBKT-${decisionCode}`, date: signDate },
        { id: 4, name: '4. Tờ trình', isComplete: true, fileName: `ToTrinh-${sub.code}.pdf`, docCode: sub.code, date: sub.createdDate },
        { id: 5, name: '5. Quyết định thanh lý', isComplete: true, fileName: `${decisionCode}-signed.pdf`, docCode: decisionCode, date: signDate },
        { id: 6, name: '6. Hợp đồng mua bán', isComplete: false },
        { id: 7, name: '7. Biên bản bàn giao', isComplete: false },
      ],
    };

    setDossiers((prev) => [
      newDossier,
      ...prev.filter((d) => d.id !== newDossierId && d.decisionCode !== decisionCode && d.decisionId !== newDecisionId),
    ]);

    // Notify NVQLTS
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: 'Quyết định thanh lý đã ban hành',
        message: `Giám đốc đã ký ban hành ${decisionCode} cho tờ trình ${sub.code}. NVQLTS tiến hành thực hiện thanh lý.`,
        time: `${signDate} 11:30`,
        targetRole: 'NVQLTS',
        isRead: false,
        linkScreen: 'EXECUTIONS',
      },
      ...prev,
    ]);
  };

  // Reject Submission (Chốt chặn 3: Trả bổ sung)
  const rejectSubmission = (submissionId: string, rejectReason: string) => {
    if (currentUser.role !== 'GIAM_DOC' || !rejectReason.trim()) return;
    const sub = submissions.find((s) => s.id === submissionId || s.code === submissionId);
    if (!sub || sub.status !== 'CHO_PHE_DUYET') return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              status: 'TRA_BO_SUNG',
              rejectReason,
              auditLogs: [
                {
                  id: `al-${Date.now()}`,
                  userName: currentUser.name,
                  userRole: currentUser.roleTitle,
                  action: `Trả hồ sơ yêu cầu bổ sung: ${rejectReason}`,
                  targetDoc: s.code,
                  timestamp: 'Hôm nay',
                },
                ...s.auditLogs,
              ],
            }
          : s
      )
    );

    // Notify NVQLTS
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: 'Tờ trình bị trả về yêu cầu bổ sung',
        message: `Giám đốc yêu cầu chỉnh sửa Tờ trình ${sub.code}: "${rejectReason}"`,
        time: 'Vừa xong',
        targetRole: 'NVQLTS',
        isRead: false,
        linkScreen: 'SUBMISSION_LIST',
      },
      ...prev,
    ]);
  };

  // 7. Execute Liquidation Batch (Steps 12 & 13 - Logic đa đợt)
  const executeLiquidationBatch = (
    decisionId: string,
    batchData: {
      contractCode: string;
      contractDate: string;
      buyerName: string;
      salePrice: number;
      deliveryDate: string;
      receiverName: string;
      deliveryRecordCode: string;
      note?: string;
      assetIds: string[];
      contractFileName?: string;
      deliveryFileName?: string;
    }
  ) => {
    if (currentUser.role !== 'NVQLTS') return;
    const targetDecision = decisions.find((d) => d.id === decisionId || d.code === decisionId);
    if (!targetDecision || targetDecision.status === 'HOAN_TAT') return;
    const approvedSubmission = submissions.find(sub => sub.id === targetDecision.submissionId || sub.code === targetDecision.submissionId);
    if (!approvedSubmission || !batchData.assetIds.length || new Set(batchData.assetIds).size !== batchData.assetIds.length || batchData.assetIds.some(id => !approvedSubmission.assetIds.includes(id) || targetDecision.batches.some(b => b.assetIds.includes(id)))) return;
    if (!batchData.contractCode.trim() || !batchData.contractDate || !batchData.buyerName.trim() || !batchData.deliveryDate || !batchData.receiverName.trim() || !batchData.deliveryRecordCode.trim() || !Number.isFinite(batchData.salePrice) || batchData.salePrice <= 0) return;

    const newBatchNumber = targetDecision.batches.length + 1;
    const newBatch: SaleBatch = {
      id: `batch-${Date.now()}`,
      decisionId: targetDecision.id,
      batchNumber: newBatchNumber,
      contractCode: batchData.contractCode,
      contractDate: batchData.contractDate,
      buyerName: batchData.buyerName,
      salePrice: batchData.salePrice,
      deliveryDate: batchData.deliveryDate,
      receiverName: batchData.receiverName,
      deliveryRecordCode: batchData.deliveryRecordCode,
      note: batchData.note,
      assetIds: batchData.assetIds,
      contractFile: {
        id: `cf-${Date.now()}`,
        name: batchData.contractFileName || `${batchData.contractCode}-Dot${newBatchNumber}.pdf`,
        size: '1.8 MB',
        type: 'pdf',
        uploadedAt: `${batchData.contractDate} 15:00`,
      },
      deliveryFile: {
        id: `df-${Date.now()}`,
        name: batchData.deliveryFileName || `${batchData.deliveryRecordCode}-Dot${newBatchNumber}.pdf`,
        size: '1.5 MB',
        type: 'pdf',
        uploadedAt: `${batchData.deliveryDate} 16:30`,
      },
      createdAt: `${batchData.contractDate} 15:00`,
    };

    // Update assets: ONLY ticked assets become DA_THANH_LY!
    setAssets((prev) =>
      prev.map((a) =>
        batchData.assetIds.includes(a.id)
          ? { ...a, status: 'DA_THANH_LY', salePrice: batchData.salePrice / batchData.assetIds.length }
          : a
      )
    );

    // Check if all assets belonging to this decision are now sold
    const relatedSub = submissions.find((s) => s.code === targetDecision.submissionId);
    const totalAssetIds = relatedSub ? relatedSub.assetIds : [];
    const allSoldAssetIds = [
      ...targetDecision.batches.flatMap((b) => b.assetIds),
      ...batchData.assetIds,
    ];
    const isAllSold = totalAssetIds.length > 0 && totalAssetIds.every((id) => allSoldAssetIds.includes(id));

    // Update Decision
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === targetDecision.id
          ? {
              ...d,
              status: isAllSold ? 'HOAN_TAT' : 'DANG_THUC_HIEN',
              batches: [...d.batches, newBatch],
            }
          : d
      )
    );

    // Update Dossier checklist item 6 (Hợp đồng mua bán) and item 7 (Biên bản bàn giao)
    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.decisionId === targetDecision.id || dos.decisionCode === targetDecision.code) {
          return {
            ...dos,
            checklist: dos.checklist.map((item) => {
              if (item.id === 6) {
                return {
                  ...item,
                  isComplete: true,
                  fileName: batchData.contractFileName || `${batchData.contractCode}-Dot${newBatchNumber}.pdf`,
                  docCode: batchData.contractCode,
                  date: batchData.contractDate,
                };
              }
              if (item.id === 7) {
                return {
                  ...item,
                  isComplete: true,
                  fileName: batchData.deliveryFileName || `${batchData.deliveryRecordCode}-Dot${newBatchNumber}.pdf`,
                  docCode: batchData.deliveryRecordCode,
                  date: batchData.deliveryDate,
                };
              }
              return item;
            }),
          };
        }
        return dos;
      })
    );
  };

  // Supplement dossier checklist item manually (e.g. upload missing Contract or Delivery Record)
  const supplementDossierChecklistItem = (
    dossierId: string,
    itemId: number,
    data: { docCode: string; fileName: string; date: string; note?: string; title?: string; signerOrPartner?: string; fileSize?: string }
  ) => {
    if (currentUser.role !== 'NVQLTS' || !dossiers.some(d => d.id === dossierId && d.status !== 'HOAN_TAT')) return;
    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId || dos.decisionCode === dossierId) {
          const updatedChecklist = dos.checklist.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isComplete: true,
                  docCode: data.docCode,
                  fileName: data.fileName,
                  date: data.date,
                }
              : item
          );

          let updatedCategories = dos.categories;
          if (dos.categories) {
            updatedCategories = dos.categories.map((cat) => {
              if (cat.id === itemId) {
                const incompleteDoc = cat.documents.find((d) => !d.isComplete || d.docCode === data.docCode);
                if (incompleteDoc) {
                  return {
                    ...cat,
                    documents: cat.documents.map((d) =>
                      d.id === incompleteDoc.id || d.docCode === data.docCode
                        ? {
                            ...d,
                            docCode: data.docCode,
                            fileName: data.fileName,
                            date: data.date,
                            fileSize: data.fileSize || '1.4 MB',
                            signerOrPartner: data.signerOrPartner || d.signerOrPartner || 'Người nộp/Đại diện',
                            isComplete: true,
                            note: data.note || d.note,
                          }
                        : d
                    ),
                  };
                } else {
                  const newDoc: DossierDocument = {
                    id: `doc-${Date.now()}`,
                    docCode: data.docCode,
                    title: data.title || `${cat.name} (${data.docCode})`,
                    date: data.date,
                    fileName: data.fileName,
                    fileSize: data.fileSize || '1.4 MB',
                    signerOrPartner: data.signerOrPartner || 'Người phụ trách',
                    isComplete: true,
                    note: data.note,
                  };
                  return {
                    ...cat,
                    documents: [...cat.documents, newDoc],
                  };
                }
              }
              return cat;
            });
          }

          return {
            ...dos,
            checklist: updatedChecklist,
            categories: updatedCategories,
          };
        }
        return dos;
      })
    );

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setAuditLogs((prev) => [
      {
        id: `al-${Date.now()}`,
        userName: currentUser.name,
        userRole: currentUser.roleTitle,
        action: `Bổ sung tài liệu vào hồ sơ: ${data.fileName}`,
        targetDoc: data.docCode,
        timestamp: timeStr,
      },
      ...prev,
    ]);
  };

  // 8. Close Dossier (Step 14 - Chốt chặn 4)
  const closeDossier = (dossierId: string, note?: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'NVQLTS') return { success: false, message: 'Chỉ nhân viên quản lý tài sản được đóng hồ sơ.' };
    const dos = dossiers.find((d) => d.id === dossierId);
    if (!dos) return { success: false, message: 'Không tìm thấy hồ sơ.' };

    // Check checklist 7 components
    const incompleteItems = dos.checklist.filter((item) => !item.isComplete);
    if (incompleteItems.length > 0) {
      return {
        success: false,
        message: `Hồ sơ chưa đủ 7 thành phần pháp lý (Còn thiếu: ${incompleteItems.map((i) => i.name).join(', ')}). Vui lòng bổ sung đầy đủ trước khi đóng hồ sơ.`,
      };
    }

    // Check if decision has assets still unsold
    const decision = decisions.find((d) => d.id === dos.decisionId || d.code === dos.decisionCode);
    if (!decision) return { success: false, message: 'Hồ sơ chưa có quyết định thanh lý hợp lệ.' };
    if (decision) {
      const relatedSub = submissions.find((s) => s.code === decision.submissionId);
      if (relatedSub && relatedSub.assetIds.length > 0) {
        const soldIds = decision.batches.flatMap((b) => b.assetIds);
        const unsold = relatedSub.assetIds.filter((id) => !soldIds.includes(id));
        if (unsold.length > 0) {
          return {
            success: false,
            message: `Quyết định còn ${unsold.length} tài sản chưa hoàn tất thanh lý. Chưa thể đóng hồ sơ!`,
          };
        }
      }
    }

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    setDossiers((prev) =>
      prev.map((d) =>
        d.id === dossierId
          ? {
              ...d,
              status: 'HOAN_TAT',
              closedDate: dateStr,
              closedBy: currentUser.name,
              note: note !== undefined ? note : d.note,
            }
          : d
      )
    );

    if (decision) {
      setDecisions((prev) =>
        prev.map((d) => (d.id === decision.id ? { ...d, status: 'HOAN_TAT' } : d))
      );
    }

    return {
      success: true,
      message: `Đã đóng và lưu hồ sơ ${dos.decisionCode} thành công vào kho lưu trữ nội bộ!`,
    };
  };

  const markNotificationAsRead = (id: string) => {
    if (!notifications.some(n => n.id === id && n.targetRole === currentUser.role)) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const resetAllData = () => {
    if (currentUser.role !== 'NVQLTS') return;
    ['ba_asset_management_state_v1', 'ba_asset_management_state_v2'].forEach((prefix) => {
      localStorage.removeItem(`${prefix}_assets`);
      localStorage.removeItem(`${prefix}_proposals`);
      localStorage.removeItem(`${prefix}_submissions`);
      localStorage.removeItem(`${prefix}_decisions`);
      localStorage.removeItem(`${prefix}_dossiers`);
      localStorage.removeItem(`${prefix}_auditLogs`);
    });

    setAssets(INITIAL_ASSETS);
    setProposals(INITIAL_PROPOSALS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setDecisions(INITIAL_DECISIONS);
    setDossiers(INITIAL_DOSSIERS);
    setAuditLogs([]);
    setInspectionRecords({
      'TL-2026-025': {
        id: 'ir-025',
        proposalId: 'TL-2026-025',
        recordCode: 'BB-KiemTra-TL025-signed.pdf',
        inspectorName: 'Trần Văn Bình',
        inspectionDate: '21/10/2026',
        generalConclusion: 'Hội đồng đã tiến hành kiểm tra thực tế hiện trạng của 3 tài sản thuộc đề nghị TL-2026-025. Cả 3 tài sản đều đã sử dụng lâu năm, tỷ lệ hư hỏng lớn hơn 60%, không còn hiệu quả sửa chữa. Thống nhất chuyển phê duyệt thanh lý theo quy định hiện hành.',
        signedFile: {
          id: 'bb-f1',
          name: 'BB-KiemTra-TL025-signed.pdf',
          size: '1.2 MB',
          type: 'pdf',
          uploadedAt: '21/10/2026 09:30',
        },
        isSaved: true,
        isTransferred: false,
      },
    });
    setQualifiedSelectedProposalIds(['TL-2026-024']);
    setNotifications([
      {
        id: 'n-1',
        title: 'Đề nghị mới chờ tiếp nhận',
        message: 'Phòng Hành chính đã gửi đề nghị TL-2026-025 gồm 3 tài sản',
        time: '14:30 20/10/2026',
        targetRole: 'NVQLTS',
        isRead: false,
        linkScreen: 'INSPECTIONS',
      },
      {
        id: 'n-2',
        title: 'Tờ trình mới chờ phê duyệt',
        message: 'Phòng Kế toán đã trình Tờ trình TT-2026-005 thanh lý máy móc',
        time: '16:00 20/10/2026',
        targetRole: 'GIAM_DOC',
        isRead: false,
        linkScreen: 'SUBMISSION_LIST',
      },
    ]);
    setSelectedProposalId('TL-2026-025');
    setSelectedSubmissionId('TT-2026-005');
    setSelectedDecisionId('QD-2026-015');
    setSelectedDossierId('dos-2026-015');
  };

  return (
    <AssetContext.Provider
      value={{
        nextProposalCode: nextDocumentCode('TL', proposals.map(p => p.code)),
        nextSubmissionCode: nextDocumentCode('TT', submissions.map(s => s.code)),
        currentUser,
        switchUserRole,
        activeScreen,
        setActiveScreen,
        assets: currentUser.role === 'BPSDTS' ? assets.filter(a => a.department === currentUser.department) : assets,
        proposals: currentUser.role === 'BPSDTS' ? proposals.filter(p => p.department === currentUser.department || p.creatorId === currentUser.id) : proposals,
        submissions,
        decisions,
        dossiers,
        auditLogs,
        notifications: notifications.filter(n => n.targetRole === currentUser.role),
        inspectionRecords,
        selectedProposalId,
        setSelectedProposalId,
        selectedSubmissionId,
        setSelectedSubmissionId,
        selectedDecisionId,
        setSelectedDecisionId,
        selectedDossierId,
        setSelectedDossierId,
        editingProposalId,
        setEditingProposalId,
        qualifiedSelectedProposalIds,
        setQualifiedSelectedProposalIds,
        createProposal,
        updateProposal,
        startInspection,
        saveInspection,
        scheduleInspection,
        executeDisposition,
        transferToSubmission,
        createSubmission,
        approveSubmission,
        rejectSubmission,
        executeLiquidationBatch,
        supplementDossierChecklistItem,
        closeDossier,
        logDocumentView,
        resetAllData,
        markNotificationAsRead,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssetContext must be used within an AssetProvider');
  }
  return context;
};
