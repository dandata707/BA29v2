import type { AppView as TransferView } from '../features/asset-transfer/context/TransferContext';
import { getTransferNavItems } from '../features/asset-transfer/navigation';
import { ArrowLeftRight } from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronDown, FileText, Gavel, Package, RotateCcw } from 'lucide-react';
import type { ViewType } from '../features/asset-return/context/AppContext';
import type { ScreenType } from '../features/asset-liquidation/context/AssetContext';
import { defaultScreen, liquidationRole } from '../features/asset-liquidation/permissions';
import { getLiquidationNavItems } from '../features/asset-liquidation/navigation';

function ModuleGroup({ id, label, icon, active, onOpen, children }: { id: string; label: string; icon: React.ReactNode; active: boolean; onOpen: () => void; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return <div className="space-y-1">
    <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => {
      if (active) setExpanded(!expanded);
      else { setExpanded(true); onOpen(); }
    }} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-semibold transition-colors ${active ? 'text-blue-600 bg-blue-50/70 hover:bg-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}>
      <span className="flex items-center gap-3">{icon}<span>{label}</span></span>
      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
    </button>
    {expanded && <div id={id} className="pl-4 pr-1 space-y-1 border-l-2 border-blue-100 ml-5 my-1">{children}</div>}
  </div>;
}

export interface SidebarProps {
  currentTab: string; onSelectTab: (tab: string) => void; currentUser: UserProfile;
  onOpenRoleSwitcher: () => void; isOpenMobile?: boolean; onCloseMobile?: () => void;
  transferView?: TransferView;
  onSelectTransferView?: (view: TransferView) => void;
  returnView?: ViewType;
  onSelectReturnView?: (view: ViewType) => void;
  liquidationScreen?: ScreenType;
  onSelectLiquidationScreen?: (screen: ScreenType) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, currentUser, onOpenRoleSwitcher, isOpenMobile, onCloseMobile, transferView = 'list', onSelectTransferView, returnView = 'list', onSelectReturnView, liquidationScreen, onSelectLiquidationScreen }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(true);
  const activeMenu = currentTab === 'Cấp phát tài sản' ? 'Yêu cầu cấp phát' : currentTab;
  const activeLiquidationScreen = liquidationScreen || defaultScreen(liquidationRole(currentUser.role));
  const childClass = (active: boolean) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${active ? 'text-blue-700 bg-blue-100/60 font-semibold hover:bg-blue-200/80' : 'text-slate-600 hover:bg-slate-50'}`;
  return <>
    {isOpenMobile && <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs" onClick={onCloseMobile} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-white border-r border-slate-200/90 flex flex-col justify-between overflow-y-auto shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        data-purpose="main-sidebar"
      >
        {/* Sidebar Top: Brand & Menu Items */}
        <div className="flex flex-col">
          {/* App Brand / Logo */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L39.32 12V32L22 42L4.68 32V12L22 2Z" fill="#1D4ED8" />
                  <path d="M22 2L39.32 12L22 22L4.68 12L22 2Z" fill="#3B82F6" />
                  <path d="M39.32 12V32L22 42V22L39.32 12Z" fill="#1E40AF" />
                  <path d="M4.68 12V32L22 42V22L4.68 12Z" fill="#60A5FA" />
                  <circle cx="22" cy="22" fill="#FFFFFF" r="5" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">AssetFlow</span>
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">QUẢN LÝ TÀI SẢN</span>
              </div>
            </div>

            {/* Mobile close */}
            <button
              type="button"
              onClick={() => onCloseMobile?.()}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="mt-2 px-3 space-y-1 text-sm font-medium">
            <div className="px-3 pt-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              QUẢN LÝ NGHIỆP VỤ
            </div>

            {currentUser.role === 'asset_manager' && <>{/* Menu Item: Danh sách tài sản */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('Danh sách tài sản');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                activeMenu === 'Danh sách tài sản'
                  ? 'text-blue-600 bg-blue-50 font-semibold hover:bg-blue-100 hover:text-blue-700'
                  : 'text-slate-600'
              }`}
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Danh sách tài sản</span>
            </button>

            </>}{currentUser.role !== 'director' && <>{/* Group: Cấp phát tài sản (Active Dropdown) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'Cấp phát tài sản' || activeMenu === 'Yêu cầu cấp phát' || activeMenu === 'Bàn giao tài sản'
                    ? 'text-blue-600 bg-blue-50/70 hover:bg-blue-100'
                    : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Cấp phát tài sản</span>
                </div>
                <svg
                  className={`w-4 h-4 text-blue-600 transition-transform ${isSubmenuOpen ? '' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Submenu items */}
              {isSubmenuOpen && (
                <div className="pl-4 pr-1 space-y-1 border-l-2 border-blue-100 ml-5 my-1">
                  <button
                    type="button"
                    onClick={() => onSelectTab('Yêu cầu cấp phát')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left cursor-pointer transition-colors ${
                      activeMenu === 'Yêu cầu cấp phát'
                        ? 'text-blue-700 bg-blue-100/60 font-semibold hover:bg-blue-200/80'
                        : 'text-slate-600'
                    }`}
                  >
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Yêu cầu cấp phát</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('Bàn giao tài sản');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left cursor-pointer transition-colors ${
                      activeMenu === 'Bàn giao tài sản'
                        ? 'text-blue-700 bg-blue-100/60 font-semibold hover:bg-blue-200/80'
                        : 'text-slate-600'
                    }`}
                  >
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Bàn giao tài sản</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu Item: Thu hồi tài sản */}
            {currentUser.role === 'asset_manager' ? <ModuleGroup id="asset-return-navigation" label="Thu hồi tài sản" icon={<RotateCcw className="w-5 h-5 shrink-0" />} active={currentTab === 'Thu hồi tài sản'} onOpen={() => onSelectTab('Thu hồi tài sản')}>
              <button type="button" aria-current={currentTab === 'Thu hồi tài sản' && returnView !== 'asset_inventory' ? 'page' : undefined} className={childClass(currentTab === 'Thu hồi tài sản' && returnView !== 'asset_inventory')} onClick={() => { onSelectReturnView?.('list'); onSelectTab('Thu hồi tài sản'); }}><FileText className="w-4 h-4 shrink-0" /><span>Biên bản thu hồi</span></button>
              <button type="button" aria-current={currentTab === 'Thu hồi tài sản' && returnView === 'asset_inventory' ? 'page' : undefined} className={childClass(currentTab === 'Thu hồi tài sản' && returnView === 'asset_inventory')} onClick={() => { onSelectReturnView?.('asset_inventory'); onSelectTab('Thu hồi tài sản'); }}><Package className="w-4 h-4 shrink-0" /><span>Tài sản thu hồi</span></button>
            </ModuleGroup> :
            <button
              type="button"
              onClick={() => onSelectTab?.('Thu hồi tài sản')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                activeMenu === 'Thu hồi tài sản'
                  ? 'text-blue-600 bg-blue-50 font-semibold hover:bg-blue-100 hover:text-blue-700'
                  : 'text-slate-600'
              }`}
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Thu hồi tài sản</span>
            </button>
            }

            </>}
            <ModuleGroup id="asset-liquidation-navigation" label="Thanh lý tài sản" icon={<Gavel className="w-5 h-5 shrink-0" />} active={currentTab === 'Thanh lý tài sản'} onOpen={() => onSelectTab('Thanh lý tài sản')}>
              {getLiquidationNavItems(currentUser.role).map(item => {
                const active = currentTab === 'Thanh lý tài sản' && item.active.includes(activeLiquidationScreen);
                return <button key={item.screen} type="button" aria-current={active ? 'page' : undefined} className={childClass(active)} onClick={() => { onSelectLiquidationScreen?.(item.screen); onSelectTab('Thanh lý tài sản'); }}><FileText className="w-4 h-4 shrink-0" /><span>{item.label}</span></button>;
              })}
            </ModuleGroup>

            {currentUser.role !== 'director' && <ModuleGroup id="asset-transfer-navigation" label="Điều chuyển tài sản" icon={<ArrowLeftRight className="w-5 h-5 shrink-0" />} active={currentTab === 'Điều chuyển tài sản'} onOpen={() => onSelectTab('Điều chuyển tài sản')}>
              {getTransferNavItems(currentUser.role).map(item => {
                const active = currentTab === 'Điều chuyển tài sản' && item.active.includes(transferView);
                return <button key={item.view} type="button" aria-current={active ? 'page' : undefined} className={childClass(active)} onClick={() => { onSelectTransferView?.(item.view); onSelectTab('Điều chuyển tài sản'); }}><FileText className="w-4 h-4 shrink-0" /><span>{item.label}</span></button>;
              })}
            </ModuleGroup>}
            </nav>
        </div>

        {/* Sidebar Bottom: Help & User Profile */}
        <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium text-left cursor-pointer"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Trợ giúp</span>
          </button>

          <div
            onClick={onOpenRoleSwitcher}
            className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-blue-50/80 cursor-pointer transition-colors group"
            data-purpose="user-card-trigger"
            title="Nhấp để đổi tài khoản / vai trò"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs tracking-wider ring-1 ring-blue-200 group-hover:ring-blue-400 transition-all">
                {currentUser.avatarText || 'LP'}
              </div>
              <div className="leading-tight text-left">
                <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-slate-400">{currentUser.roleTitle}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </aside>
  </>;
};
