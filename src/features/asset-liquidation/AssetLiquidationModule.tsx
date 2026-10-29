/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAssetContext } from './context/AssetContext';
import { Header } from './components/Header';
import { UserFlowGuideModal } from './components/UserFlowGuideModal';
import { DocumentModal } from './components/DocumentModal';
import { OverviewScreen } from './screens/OverviewScreen';
import { ProposalListScreen } from './screens/ProposalListScreen';
import { ProposalCreateScreen } from './screens/ProposalCreateScreen';
import { InspectionListScreen } from './screens/InspectionListScreen';
import { InspectionDetailScreen } from './screens/InspectionDetailScreen';
import { QualifiedProposalsScreen } from './screens/QualifiedProposalsScreen';
import { SubmissionCreateScreen } from './screens/SubmissionCreateScreen';
import { NVQLTSSubmissionListScreen } from './screens/NVQLTSSubmissionListScreen';
import { SubmissionListScreen } from './screens/SubmissionListScreen';
import { ExecutionScreen } from './screens/ExecutionScreen';
import { ClosingScreen } from './screens/ClosingScreen';

export const AssetLiquidationModule: React.FC<{ onOpenMobileSidebar: () => void; onOpenRoleSwitcher: () => void }> = ({ onOpenMobileSidebar, onOpenRoleSwitcher }) => {
  const { activeScreen } = useAssetContext();
  const [isFlowGuideOpen, setIsFlowGuideOpen] = useState(false);

  // Global document viewer modal state (V5, V6, V16, V18, V19)
  const [docModalState, setDocModalState] = useState<{
    isOpen: boolean;
    title: string;
    code: string;
    type: 'DE_NGHI' | 'BIEN_BAN' | 'TO_TRINH' | 'QUYET_DINH' | 'HOP_DONG' | 'BAN_GIAO' | 'CUSTOM';
  }>({
    isOpen: false,
    title: '',
    code: '',
    type: 'CUSTOM',
  });

  const handleOpenDocModal = (
    title: string,
    code: string,
    type: 'DE_NGHI' | 'BIEN_BAN' | 'TO_TRINH' | 'QUYET_DINH' | 'HOP_DONG' | 'BAN_GIAO' | 'CUSTOM' = 'CUSTOM'
  ) => {
    setDocModalState({
      isOpen: true,
      title,
      code,
      type,
    });
  };

  return (
    <div className="flex h-full bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileSidebar={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher} onOpenFlowGuide={() => setIsFlowGuideOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeScreen === 'OVERVIEW' && (
            <OverviewScreen
              onOpenFlowGuide={() => setIsFlowGuideOpen(true)}
              onOpenDocModal={handleOpenDocModal}
            />
          )}
          {activeScreen === 'PROPOSALS' && (
            <ProposalListScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'PROPOSAL_CREATE' && <ProposalCreateScreen />}
          {activeScreen === 'INSPECTIONS' && <InspectionListScreen />}
          {activeScreen === 'INSPECTION_DETAIL' && (
            <InspectionDetailScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'QUALIFIED_PROPOSALS' && <QualifiedProposalsScreen />}
          {activeScreen === 'SUBMISSION_CREATE' && (
            <SubmissionCreateScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'NVQLTS_SUBMISSIONS' && (
            <NVQLTSSubmissionListScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'SUBMISSION_LIST' && (
            <SubmissionListScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'EXECUTIONS' && (
            <ExecutionScreen onOpenDocModal={handleOpenDocModal} />
          )}
          {activeScreen === 'DOSSIERS' && (
            <ClosingScreen onOpenDocModal={handleOpenDocModal} />
          )}
        </main>
      </div>

      {/* Interactive Process Roadmap Modal (Table 1: 14 steps + Tables 2-5: V1-V24) */}
      <UserFlowGuideModal
        isOpen={isFlowGuideOpen}
        onClose={() => setIsFlowGuideOpen(false)}
      />

      {/* Legal PDF Document Preview Modal with Audit Logging */}
      <DocumentModal
        isOpen={docModalState.isOpen}
        onClose={() => setDocModalState((prev) => ({ ...prev, isOpen: false }))}
        docTitle={docModalState.title}
        docCode={docModalState.code}
        docType={docModalState.type}
      />
    </div>
  );
};
