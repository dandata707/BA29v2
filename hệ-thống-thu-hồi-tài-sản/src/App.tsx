import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ScreenListRecords } from './components/ScreenListRecords';
import { ScreenCreateRecord } from './components/ScreenCreateRecord';
import { ScreenDetailRouter } from './components/ScreenDetailRouter';
import { ScreenEmployeeConfirm } from './components/ScreenEmployeeConfirm';
import { ScreenAssetInventory } from './components/ScreenAssetInventory';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {currentView === 'list' && <ScreenListRecords />}
        {currentView === 'create' && <ScreenCreateRecord />}
        {currentView === 'detail' && <ScreenDetailRouter />}
        {currentView === 'employee_confirm' && <ScreenEmployeeConfirm />}
        {currentView === 'asset_inventory' && <ScreenAssetInventory />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
