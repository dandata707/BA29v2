import { useTransfer } from '../features/asset-transfer/context/TransferContext';
import React from 'react';
import { Sidebar, SidebarProps } from './Sidebar';
import { useApp } from '../features/asset-return/context/AppContext';
import { useAssetContext } from '../features/asset-liquidation/context/AssetContext';

export function WorkspaceSidebar(props: Omit<SidebarProps, 'transferView' | 'onSelectTransferView' | 'returnView' | 'onSelectReturnView' | 'liquidationScreen' | 'onSelectLiquidationScreen'>) {
  const transfer = useTransfer();
  const { currentView, setView } = useApp();
  const { activeScreen, setActiveScreen } = useAssetContext();
  return <Sidebar {...props} transferView={transfer.currentView} onSelectTransferView={transfer.navigateTo} returnView={currentView} onSelectReturnView={setView}
    liquidationScreen={activeScreen} onSelectLiquidationScreen={setActiveScreen} />;
}
