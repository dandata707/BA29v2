import { TransferProvider } from './features/asset-transfer/context/TransferContext';
import { AssetTransferModule } from './features/asset-transfer/AssetTransferModule';
import React, { useState, useMemo } from 'react';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { Header } from './components/Header.tsx';
import { allocationBreadcrumbs } from './navigation/breadcrumbs';
import { WorkspaceNavigationContext } from './navigation/WorkspaceNavigation';
import { FilterBar } from './components/FilterBar.tsx';
import { RequestTable } from './components/RequestTable.tsx';
import { RequestFormPage } from './components/RequestFormPage.tsx';
import { PrintRequestModal } from './components/PrintRequestModal.tsx';
import { RevokeConfirmModal } from './components/RevokeConfirmModal.tsx';
import { RejectionReasonModal } from './components/RejectionReasonModal.tsx';
import { RejectTicketActionModal } from './components/RejectTicketActionModal.tsx';
import { RoleSwitcherModal } from './components/RoleSwitcherModal.tsx';
import { AssetManagerDashboard } from './components/AssetManagerDashboard.tsx';
import { AssetManagerDetailView } from './components/AssetManagerDetailView.tsx';
import { HandoverListView } from './components/HandoverListView.tsx';
import { HandoverFormPage } from './components/HandoverFormPage.tsx';
import { INITIAL_TICKETS, EMPLOYEE_PROFILE, ASSET_MANAGER_PROFILE } from './data/mockTickets.ts';
import { INITIAL_HANDOVERS } from './data/mockHandovers.ts';
import { RequestTicket, FilterState, UserProfile, HandoverProtocol } from './types.ts';

import { AppProvider as AssetReturnProvider } from './features/asset-return/context/AppContext';
import { AssetReturnModule } from './features/asset-return/AssetReturnModule';
import { AssetProvider as LiquidationProvider } from './features/asset-liquidation/context/AssetContext';
import { AssetLiquidationModule } from './features/asset-liquidation/AssetLiquidationModule';
import { canEditHandover, confirmHandover } from './utils/handoverRules';
import { validateHandoverItems } from './utils/handoverItems';

type PageViewMode = 'list' | 'create' | 'detail' | 'edit';

function Workspace({ currentUser, setCurrentUser }: { currentUser: UserProfile; setCurrentUser: (user: UserProfile) => void }) {
  // Start logged in as Asset Manager so the user immediately sees the Asset Manager module


  // Role Switcher Modal state
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);

  // Navigation & View mode
  const [viewMode, setViewMode] = useState<PageViewMode>('list');
  const [activeTicket, setActiveTicket] = useState<RequestTicket | null>(null);

  // State for all tickets
  const [tickets, setTickets] = useState<RequestTicket[]>(INITIAL_TICKETS);

  // State for all handover protocols
  const [handovers, setHandovers] = useState<HandoverProtocol[]>(INITIAL_HANDOVERS);
  const [activeHandover, setActiveHandover] = useState<HandoverProtocol | null>(null);

  // State for filtering (Employee view)
  const [filters, setFilters] = useState<FilterState>({
    code: '',
    status: 'Tất cả trạng thái',
    type: 'Tất cả loại yêu cầu',
  });

  // State for pagination (Employee view)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Modals for actions
  const [ticketToPrint, setTicketToPrint] = useState<RequestTicket | null>(null);
  const [ticketToRevoke, setTicketToRevoke] = useState<RequestTicket | null>(null);
  const [ticketForRejection, setTicketForRejection] = useState<RequestTicket | null>(null);
  const [ticketToRejectByManager, setTicketToRejectByManager] = useState<RequestTicket | null>(null);

  // Sidebar & Notifications
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('Cấp phát tài sản');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Handle switching user / role
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setViewMode('list');
    setActiveTicket(null);
    setActiveHandover(null);
    if (user.role === 'director' || currentTab === 'Thanh lý tài sản') setCurrentTab('Thanh lý tài sản');
    else if (!['Thu hồi tài sản', 'Điều chuyển tài sản'].includes(currentTab)) setCurrentTab('Cấp phát tài sản');
    showToast(`Đã chuyển đổi sang tài khoản: ${user.name} (${user.roleTitle})`);
  };

  // Filter tickets for Employee view
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchCode =
        filters.code.trim() === '' ||
        ticket.code.toLowerCase().includes(filters.code.trim().toLowerCase());

      const matchStatus =
        filters.status === 'Tất cả trạng thái' || ticket.status === filters.status;

      const matchType =
        filters.type === 'Tất cả loại yêu cầu' || ticket.type === filters.type;

      return matchCode && matchStatus && matchType;
    });
  }, [tickets, filters]);

  // Paginated tickets for employee view
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTickets.slice(startIndex, startIndex + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      code: '',
      status: 'Tất cả trạng thái',
      type: 'Tất cả loại yêu cầu',
    });
    setCurrentPage(1);
    showToast('Đã đặt lại bộ lọc tìm kiếm');
  };

  // Refresh table data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã làm mới dữ liệu danh sách');
    }, 400);
  };

  // Next ticket code calculation
  const nextTicketCode = `CP-2026-${String(tickets.length + 1).padStart(3, '0')}`;

  // Handle create ticket submission from RequestFormPage
  const handleCreateSubmit = (newTicket: RequestTicket, isDraft: boolean = false) => {
    const enrichedTicket: RequestTicket = {
      ...newTicket,
      creatorName: currentUser.name,
      creatorCode: currentUser.code,
      creatorDepartment: currentUser.department,
      creatorRole: currentUser.roleTitle,
    };
    setTickets([enrichedTicket, ...tickets]);
    if (isDraft) {
      showToast('Đã lưu bản nháp thành công!');
    } else {
      showToast('Phiếu yêu cầu cấp phát đã được gửi duyệt thành công!');
    }
    setViewMode('list');
    setActiveTicket(null);
  };

  // Handle save edit from RequestFormPage
  const handleSaveEdit = (updatedTicket: RequestTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    setActiveTicket(updatedTicket);
    showToast(`Đã lưu thay đổi phiếu ${updatedTicket.code} thành công!`);
    setViewMode('detail');
  };

  // Handle confirm revoke
  const handleConfirmRevoke = (ticketId: number, note?: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Nháp',
              reason: note ? `${t.reason ? `${t.reason} - ` : ''}Thu hồi: ${note}` : t.reason,
            }
          : t
      )
    );
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket((prev) => (prev ? { ...prev, status: 'Nháp' } : null));
    }
    showToast(`Đã thu hồi phiếu ${target ? target.code : `#${ticketId}`} về trạng thái Nháp`);
  };

  // Handle manager approve ticket
  const handleApproveTicket = (ticket: RequestTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: 'Đã duyệt' } : t))
    );
    if (activeTicket && activeTicket.id === ticket.id) {
      setActiveTicket((prev) => (prev ? { ...prev, status: 'Đã duyệt' } : null));
    }
    showToast(`Đã phê duyệt thành công phiếu ${ticket.code}!`);
  };

  // Handle manager reject ticket
  const handleManagerConfirmReject = (ticketId: number, rejectionReasonText: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Từ chối',
              rejectionReason: rejectionReasonText,
              rejectedBy: currentUser.name,
              rejectedDate: formattedDate,
            }
          : t
      )
    );
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket((prev) =>
        prev
          ? {
              ...prev,
              status: 'Từ chối',
              rejectionReason: rejectionReasonText,
              rejectedBy: currentUser.name,
              rejectedDate: formattedDate,
            }
          : null
      );
    }
    setTicketToRejectByManager(null);
    showToast(`Đã từ chối phiếu ${target ? target.code : `#${ticketId}`}`);
  };

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab); setViewMode('list'); setActiveTicket(null); setActiveHandover(null); setIsMobileSidebarOpen(false);
  };
  const renderContent = () => {
  if (currentTab === 'Thanh lý tài sản' || currentUser.role === 'director') {
    return <AssetLiquidationModule key={currentUser.id} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />;
  }
  if (currentTab === 'Điều chuyển tài sản') return <AssetTransferModule />;
  if (currentTab === 'Thu hồi tài sản') {
    return <>
      <AssetReturnModule user={currentUser} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />
    </>;
  }
    if (currentTab === 'Bàn giao tài sản') {
      if ((viewMode !== 'list' && activeHandover) || (viewMode === 'create' && currentUser.role === 'asset_manager')) {
        return (
          <HandoverFormPage
            mode={viewMode === 'create' ? 'create' : canEditHandover(activeHandover, currentUser) ? 'edit' : 'detail'}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            key={activeHandover?.id || 'new'}
            protocol={handovers.find(h => h.id === activeHandover?.id) || activeHandover}
            currentUser={currentUser}
            onBack={() => setViewMode('list')}
            onSubmitSend={(protocol, passwordConfirmed) => {
              const existing = handovers.find(h => h.id === protocol.id);
              if (currentUser.role === 'employee') {
                const completed = confirmHandover(existing, currentUser, passwordConfirmed);
                if (!completed) return;
                setHandovers(prev => prev.map(h => h.id === completed.id ? completed : h));
                setActiveHandover(completed);
                setViewMode('detail');
                showToast('Đã xác nhận biên bản bàn giao thành công!');
                return;
              }
              if (!passwordConfirmed || !canEditHandover(existing, currentUser) || validateHandoverItems(protocol.items)) return;
              setHandovers([protocol, ...handovers.filter((h) => h.id !== protocol.id)]);
              setViewMode('list');
              showToast(`Đã gửi biên bản ${protocol.code} sang người nhận để ký xác nhận!`);
            }}
            onSaveDraft={(protocol) => {
              const existing = handovers.find(h => h.id === protocol.id);
              if (!canEditHandover(existing, currentUser)) return;
              setHandovers([protocol, ...handovers.filter((h) => h.id !== protocol.id)]);
              setViewMode('list');
              showToast(`Đã lưu bản nháp biên bản ${protocol.code}!`);
            }}
          />
        );
      }

      return (
        <div className="flex h-full bg-[#f8fafc] overflow-hidden">
          <HandoverListView
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            handovers={handovers}
            currentUser={currentUser}
            onViewHandover={(protocol) => {
              setActiveHandover(protocol);
              setViewMode(canEditHandover(protocol, currentUser) ? 'edit' : 'detail');
            }}
            onRefresh={handleRefresh}
            onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          />
        </div>
      );
    }

  // Render logic for ASSET MANAGER role
  if (currentUser.role === 'asset_manager') {
    if (viewMode === 'detail' && activeTicket) {
      return (
        <AssetManagerDetailView
          ticket={activeTicket}
          currentUser={currentUser}
          onBack={() => setViewMode('list')}
          onApprove={handleApproveTicket}
          onReject={(t) => setTicketToRejectByManager(t)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onCreateHandoverForm={(ticket) => {
            setActiveHandover({
              id: `hb_${Date.now()}`,
              code: `BBBG-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
              createdDate: '25/10/2026',
              ticketCode: ticket.code,
              senderName: currentUser.name,
              senderCode: currentUser.code,
              senderDept: currentUser.department,
              senderRole: currentUser.roleTitle,
              receiverName: ticket.recipient,
              receiverCode: ticket.recipientCode || 'NV-0025',
              receiverDept: ticket.department || 'Nhân sự',
              receiverRole: ticket.recipientRole || 'Chuyên viên',
              items: (ticket.items || []).map((it, idx) => ({
                id: String(idx + 1),
                name: it.name || it.category,
                category: it.category,
                unit: 'Chiếc',
                quantity: Number(it.quantity) || 1,
                unitPrice: 20000000,
                totalPrice: (Number(it.quantity) || 1) * 20000000,
                notes: it.notes || 'Hàng mới 100%',
              })),
              totalQuantity: (ticket.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 1), 0),
              totalValueNumber: (ticket.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 1) * 20000000, 0),
              totalValueWords: 'Bốn mươi triệu đồng chẵn.',
              status: 'Nháp',
            });
            setViewMode('create');
            setCurrentTab('Bàn giao tài sản');
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setViewMode('list');
          }}
        />
      );
    }


    return (
      <>
        <AssetManagerDashboard
          currentMenu={currentTab}
          tickets={tickets}
          currentUser={currentUser}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onViewTicket={(ticket) => {
            setActiveTicket(ticket);
            setViewMode('detail');
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setViewMode('list');
          }}
        />
      </>
    );
  }

  // Render logic for EMPLOYEE role
  return (
    <div className="flex h-full bg-[#f8fafc] overflow-hidden">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar */}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          breadcrumbs={allocationBreadcrumbs(viewMode, activeTicket?.code, () => { setViewMode('list'); setActiveTicket(null); })}
          currentUser={currentUser}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {viewMode === 'list' ? (
            <>
<button onClick={() => { setActiveTicket(null); setViewMode('create'); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">Tạo phiếu yêu cầu</button>
              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}

              />

              {/* Tickets Table Card */}
              <RequestTable
                tickets={paginatedTickets}
                totalTicketsCount={filteredTickets.length}
                currentPage={currentPage}
                pageSize={pageSize}
                isRefreshing={isRefreshing}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                onRefresh={handleRefresh}
                onViewTicket={(ticket) => {
                  setActiveTicket(ticket);
                  setViewMode('detail');
                }}
                onEditTicket={(ticket) => {
                  setActiveTicket(ticket);
                  setViewMode('edit');
                }}
                onPrintTicket={(ticket) => setTicketToPrint(ticket)}
                onRevokeTicket={(ticket) => setTicketToRevoke(ticket)}
                onViewRejectionReason={(ticket) => setTicketForRejection(ticket)}
              />
            </>
          ) : viewMode === 'create' || viewMode === 'edit' ? (
            <RequestFormPage
              mode={viewMode === 'edit' ? 'edit' : 'create'}
              ticket={activeTicket}
              nextTicketCode={nextTicketCode}
              currentRole={currentUser.role}
              onBack={() => setViewMode('list')}
              onSubmit={handleCreateSubmit}
              onSaveEdit={handleSaveEdit}
            />
          ) : viewMode === 'detail' && activeTicket ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Chi tiết phiếu {activeTicket.code}</h2>
                    <p className="text-xs text-slate-500">Tạo ngày {activeTicket.createdDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTicketToPrint(activeTicket)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In phiếu
                  </button>
                  {activeTicket.status === 'Nháp' && (
                    <button
                      onClick={() => setViewMode('edit')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              {/* Detail fields summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Người nhận tài sản</span>
                  <span className="font-bold text-slate-800 text-base">{activeTicket.recipient}</span>
                  <span className="text-xs text-slate-500 block mt-1">{activeTicket.department}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Loại yêu cầu</span>
                  <span className="font-bold text-slate-800 text-base">{activeTicket.type}</span>
                  <span className="text-xs text-slate-500 block mt-1">Cần dùng: {activeTicket.neededDate}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Trạng thái phiếu</span>
                  <span className="font-bold text-slate-800 text-base block mt-1">{activeTicket.status}</span>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Global Modals */}
      <PrintRequestModal
        ticket={ticketToPrint}
        isOpen={Boolean(ticketToPrint)}
        onClose={() => setTicketToPrint(null)}
      />

      <RevokeConfirmModal
        ticket={ticketToRevoke}
        isOpen={Boolean(ticketToRevoke)}
        onClose={() => setTicketToRevoke(null)}
        onConfirmRevoke={handleConfirmRevoke}
      />

      <RejectionReasonModal
        ticket={ticketForRejection}
        isOpen={Boolean(ticketForRejection)}
        onClose={() => setTicketForRejection(null)}
      />
    </div>
  );
  };
  return <TransferProvider user={currentUser}><LiquidationProvider user={currentUser} onRequestRoleSwitch={() => setIsRoleSwitcherOpen(true)}><WorkspaceNavigationContext.Provider value={{ user: currentUser, navigate: navigateToTab, home: () => navigateToTab(currentUser.role === 'director' ? 'Thanh lý tài sản' : 'Yêu cầu cấp phát'), openMobileMenu: () => setIsMobileSidebarOpen(true), openRoleSwitcher: () => setIsRoleSwitcherOpen(true) }}><div className="flex h-screen bg-[#f8fafc] overflow-hidden">
    <WorkspaceSidebar currentTab={currentTab} currentUser={currentUser}
      onSelectTab={navigateToTab}
      isOpenMobile={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)}
      onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />
    <div className="flex-1 min-w-0 h-full md:ml-[280px] overflow-hidden">{renderContent()}</div>
    <RoleSwitcherModal isOpen={isRoleSwitcherOpen} onClose={() => setIsRoleSwitcherOpen(false)} currentUser={currentUser} onSelectUser={handleSelectUser} />
    {ticketToRejectByManager && <RejectTicketActionModal ticket={ticketToRejectByManager} isOpen onClose={() => setTicketToRejectByManager(null)} onConfirmReject={handleManagerConfirmReject} />}
  </div></WorkspaceNavigationContext.Provider></LiquidationProvider></TransferProvider>;
}

export default function App() {
  const [user, setUser] = useState<UserProfile>(ASSET_MANAGER_PROFILE);
  return <AssetReturnProvider user={user}><Workspace currentUser={user} setCurrentUser={setUser} /></AssetReturnProvider>;
}
