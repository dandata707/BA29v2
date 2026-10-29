import { Header as SharedHeader } from '../../../components/Header';
import { liquidationBreadcrumbs } from '../../../navigation/breadcrumbs';
import { defaultScreen, liquidationRole } from '../permissions';
import { useWorkspaceNavigation } from '../../../navigation/WorkspaceNavigation';
import React, { useState } from 'react';
import { Bell, Map } from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';
export function Header({ onOpenFlowGuide, onOpenRoleSwitcher, onOpenMobileSidebar }: { onOpenFlowGuide: () => void; onOpenRoleSwitcher: () => void; onOpenMobileSidebar: () => void }) {
  const { currentUser, notifications, markNotificationAsRead, setActiveScreen, activeScreen, selectedProposalId, editingProposalId } = useAssetContext();
  const navigation = useWorkspaceNavigation();
  const role = navigation?.user.role || (currentUser.role === 'GIAM_DOC' ? 'director' : currentUser.role === 'NVQLTS' ? 'asset_manager' : 'employee');
  const [open, setOpen] = useState(false);
  return <SharedHeader currentUser={navigation?.user || { ...currentUser, role, code: currentUser.id }} onToggleMobileMenu={onOpenMobileSidebar} onOpenRoleSwitcher={onOpenRoleSwitcher}
    onHome={() => { setActiveScreen(defaultScreen(liquidationRole(role))); navigation?.home(); }}
    breadcrumbs={liquidationBreadcrumbs(activeScreen, role, setActiveScreen, defaultScreen(liquidationRole(role)), activeScreen === 'PROPOSAL_CREATE' ? editingProposalId || undefined : selectedProposalId || undefined, Boolean(editingProposalId))}
    actions={<button onClick={onOpenFlowGuide} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg"><Map className="w-4 h-4" /><span className="hidden sm:inline">Hướng dẫn quy trình</span></button>}
    notifications={<div className="relative"><button onClick={() => setOpen(!open)} aria-label="Thông báo thanh lý" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative"><Bell className="w-5 h-5" />{notifications.some(n => !n.isRead) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}</button>
        {open && <div className="absolute right-0 mt-2 w-80 max-w-[90vw] max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-30"><div className="p-3 text-xs font-semibold bg-slate-50">Thông báo thanh lý</div>{!notifications.length && <p className="p-4 text-xs text-slate-500">Không có thông báo mới</p>}{notifications.map(n => <button key={n.id} onClick={() => { markNotificationAsRead(n.id); if(n.linkScreen) setActiveScreen(n.linkScreen); setOpen(false); }} className="w-full text-left p-3 hover:bg-blue-50 border-t border-slate-100"><span className="block text-xs font-semibold text-slate-800">{n.title}</span><span className="block text-xs text-slate-500 mt-1">{n.message}</span></button>)}</div>}
      </div>} />;
}
