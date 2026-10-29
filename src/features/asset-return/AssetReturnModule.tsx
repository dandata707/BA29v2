import React from 'react';
import { UserProfile } from '../../types';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ScreenListRecords } from './components/ScreenListRecords';
import { ScreenCreateRecord } from './components/ScreenCreateRecord';
import { ScreenDetailRouter } from './components/ScreenDetailRouter';
import { ScreenEmployeeConfirm } from './components/ScreenEmployeeConfirm';
import { ScreenAssetInventory } from './components/ScreenAssetInventory';
export function AssetReturnModule({ user, onOpenRoleSwitcher, onOpenMobileSidebar }: { user: UserProfile; onOpenRoleSwitcher: () => void; onOpenMobileSidebar?: () => void }) {
  const { currentView, selectedRecordId } = useApp();
  const manager = user.role === 'asset_manager';
  return <div className="flex h-full bg-[#f8fafc] text-slate-800 overflow-hidden">
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <Header user={user} onOpenRoleSwitcher={onOpenRoleSwitcher} onOpenMobileSidebar={onOpenMobileSidebar} />
      <main className="flex-1 overflow-y-auto">
        {manager ? <>
          {currentView === 'list' && <ScreenListRecords />}
          {currentView === 'create' && <ScreenCreateRecord />}
          {currentView === 'detail' && <ScreenDetailRouter key={selectedRecordId} />}
          {currentView === 'asset_inventory' && <ScreenAssetInventory />}
        </> : <ScreenEmployeeConfirm key={user.id + '-' + (selectedRecordId || '')} />}
      </main>
    </div>
  </div>;
}
