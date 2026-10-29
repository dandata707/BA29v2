import React from 'react';
import { TransferProvider, useTransfer } from './context/TransferContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UI01_TransferList } from './components/UI01_TransferList';
import { UI02_CreateTransfer } from './components/UI02_CreateTransfer';
import { UI03_ReviewTransfer } from './components/UI03_ReviewTransfer';
import { UI04_CreateHandoverDoc } from './components/UI04_CreateHandoverDoc';
import { UI05_ConfirmHandover } from './components/UI05_ConfirmHandover';
import { AssetCatalogView } from './components/AssetCatalogView';
import { ReportsView } from './components/ReportsView';
import { HandoverPrintModal } from './components/HandoverPrintModal';
import { ToastContainer } from './components/Toast';

const AppContent: React.FC = () => {
  const { currentView } = useTransfer();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return <UI01_TransferList />;
      case 'create':
        return <UI02_CreateTransfer />;
      case 'review':
        return <UI03_ReviewTransfer />;
      case 'handover-create':
        return <UI04_CreateHandoverDoc />;
      case 'handover-confirm':
        return <UI05_ConfirmHandover />;
      case 'asset-catalog':
        return <AssetCatalogView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <UI01_TransferList />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3ff] text-[#131b2e] p-3 sm:p-5 antialiased font-sans flex flex-col justify-center">
      <div className="w-full max-w-[1536px] mx-auto">
        <div className="bg-white rounded-xl border border-[#c2c6d5] shadow-sm overflow-hidden flex min-h-[calc(100vh-2.5rem)]">
          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Right Main Content Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf8ff]">
            {/* Top Header */}
            <Header />

            {/* Viewport Content */}
            <main className="flex-1 p-5 md:p-8 overflow-y-auto">
              {renderCurrentView()}
            </main>
          </div>
        </div>
      </div>

      {/* Floating modals & alerts */}
      <HandoverPrintModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TransferProvider>
      <AppContent />
    </TransferProvider>
  );
}
