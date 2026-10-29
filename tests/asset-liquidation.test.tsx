import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AssetProvider, useAssetContext } from '../src/features/asset-liquidation/context/AssetContext';
import { AssetLiquidationModule } from '../src/features/asset-liquidation/AssetLiquidationModule';
import { canOpenScreen, defaultScreen, liquidationRole } from '../src/features/asset-liquidation/permissions';
import { nextDocumentCode } from '../src/features/asset-liquidation/documentCodes';
import { INITIAL_ASSETS } from '../src/features/asset-liquidation/data/mockData';
import { ASSET_MANAGER_PROFILE } from '../src/data/mockTickets';
import { DIRECTOR_PROFILE, EMPLOYEE_PROFILES } from '../src/data/userProfiles';
import { RoleSwitcherModal } from '../src/components/RoleSwitcherModal';
import { Sidebar } from '../src/components/Sidebar';
import { UserProfile } from '../src/types';
import { getLiquidationNavItems } from '../src/features/asset-liquidation/navigation';

test('three app roles map to their liquidation workspaces', () => {
  for (const [role, internal, screen] of [['employee', 'BPSDTS', 'PROPOSALS'], ['asset_manager', 'NVQLTS', 'INSPECTIONS'], ['director', 'GIAM_DOC', 'SUBMISSION_LIST']] as const) {
    assert.equal(liquidationRole(role), internal);
    assert.equal(defaultScreen(internal), screen);
    assert.equal(canOpenScreen(internal, screen), true);
  }
  assert.equal(canOpenScreen('BPSDTS', 'SUBMISSION_LIST'), false);
  assert.equal(canOpenScreen('NVQLTS', 'SUBMISSION_LIST'), false);
  assert.equal(canOpenScreen('GIAM_DOC', 'EXECUTIONS'), false);
});

test('document numbering uses the highest sequence across departments', () => {
  assert.equal(nextDocumentCode('TL', ['TL-2026-001', 'TL-2026-105', 'TL-2025-999'], 2026), 'TL-2026-106');
  assert.equal(nextDocumentCode('TT', [], 2026), 'TT-2026-001');
});

test('all three roles share the sidebar, and the director account is selectable', () => {
  for (const user of [EMPLOYEE_PROFILES[0], ASSET_MANAGER_PROFILE, DIRECTOR_PROFILE]) {
    const sidebar = renderToStaticMarkup(<Sidebar currentTab="Thanh lý tài sản" currentUser={user} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
    assert.equal((sidebar.match(/<aside\b/g) || []).length, 1);
    assert.match(sidebar, /Thanh lý tài sản/);
    if (user.role === 'director') assert.doesNotMatch(sidebar, /Thu hồi tài sản|Yêu cầu cấp phát/);
    const screen = renderToStaticMarkup(<AssetProvider user={user} onRequestRoleSwitch={() => {}}><AssetLiquidationModule onOpenMobileSidebar={() => {}} onOpenRoleSwitcher={() => {}} /></AssetProvider>);
    assert.doesNotMatch(screen, /<aside/);
    assert.match(screen, /Thanh lý tài sản/);
    if (user.role === 'employee') assert.doesNotMatch(screen, />Thực hiện thanh lý</);
    assert.doesNotMatch(screen, /aria-label="Nghiệp vụ thanh lý"/);
    if (user.role === 'director') assert.match(sidebar, /Phê duyệt tờ trình/);
  }
  const accounts = renderToStaticMarkup(<RoleSwitcherModal isOpen currentUser={DIRECTOR_PROFILE} onSelectUser={() => {}} onClose={() => {}} />);
  assert.match(accounts, /Giám đốc/);
  assert.match(accounts, /Lê Hoàng Nam/);
  assert.equal((accounts.match(/Đang kích hoạt/g) || []).length, 1);
});

test('liquidation submenus live in the shared sidebar and highlight their matching workflow screens', () => {
  for (const user of [EMPLOYEE_PROFILES[0], ASSET_MANAGER_PROFILE, DIRECTOR_PROFILE]) {
    const entries = getLiquidationNavItems(user.role);
    assert.equal(entries.length, user.role === 'asset_manager' ? 5 : 1);
    for (const entry of entries) {
      for (const screen of entry.active) {
        const sidebar = renderToStaticMarkup(<Sidebar currentTab="Thanh lý tài sản" currentUser={user} liquidationScreen={screen} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
        const selected = sidebar.match(/<button\b[^>]*aria-current="page"[^>]*>[\s\S]*?<\/button>/g) || [];
        assert.equal(selected.length, 1);
        assert.ok(selected[0].includes(entry.label.replace('&', '&amp;')));
        assert.match(sidebar, /id="asset-liquidation-navigation"/);
        assert.ok(entries.every(item => sidebar.includes(item.label.replace('&', '&amp;'))));
      }
    }
  }
});

// Runs the real provider's state updates and effects in memory, without a browser.
function providerHarness(initialUser: UserProfile) {
  const slots: unknown[] = [];
  let user = initialUser;
  let value: ReturnType<typeof useAssetContext>;
  let switches = 0;
  const render = () => {
    let cursor = 0;
    const effects: (() => void)[] = [];
    const originalState = React.useState;
    const originalEffect = React.useEffect;
    (React as any).useState = (initial: any) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (next: any) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    };
    (React as any).useEffect = (callback: () => void, dependencies: unknown[]) => {
      const index = cursor++;
      const previous = slots[index] as unknown[] | undefined;
      if (!previous || dependencies.some((entry, i) => !Object.is(entry, previous[i]))) effects.push(callback);
      slots[index] = dependencies;
    };
    try {
      const element = AssetProvider({ user, children: null, onRequestRoleSwitch: () => switches++ }) as React.ReactElement<{ value: typeof value }>;
      value = element.props.value;
    } finally {
      React.useState = originalState;
      React.useEffect = originalEffect;
    }
    effects.forEach(effect => effect());
    return value!;
  };
  return { render, setUser: (next: UserProfile) => { user = next; render(); return render(); }, get switches() { return switches; } };
}

test('complete workflow survives employee → manager → director role changes and blocks premature closure', () => {
  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) };
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try {
    const employee = EMPLOYEE_PROFILES[0];
    const assetIds = ['TEST-ASSET-1', 'TEST-ASSET-2'];
    storage.setItem('ba_asset_management_state_v2_assets', JSON.stringify(assetIds.map(id => ({ ...INITIAL_ASSETS[0], id, code: id, department: employee.department, status: 'CHUA_DE_NGHI' }))));
    const harness = providerHarness(employee);
    let context = harness.render();
    const proposalCode = context.nextProposalCode;
    context.createProposal({ code: proposalCode, date: '29/10/2026', department: employee.department, reason: 'Hư hỏng', note: '', assetIds, isSent: true, assetDetails: assetIds.map(id => ({ id, liquidationReason: 'Hư hỏng không thể sửa chữa', note: 'Bo mạch hỏng' })) });
    context = harness.render();
    assert.equal(context.proposals.find(p => p.id === proposalCode)?.status, 'CHO_TIEP_NHAN');
    assert.ok(context.assets.every(a => a.note === 'Bo mạch hỏng'));
    const originalSubmissionCount = context.submissions.length;
    context.approveSubmission(context.submissions[0].id, 'QD-NOT-ALLOWED', '29/10/2026');
    assert.equal(harness.render().decisions.some(d => d.code === 'QD-NOT-ALLOWED'), false);
    context.switchUserRole('GIAM_DOC');
    assert.equal(harness.switches, 1);
    assert.equal(harness.render().currentUser.role, 'BPSDTS');

    context = harness.setUser(ASSET_MANAGER_PROFILE);
    context.startInspection(proposalCode);
    context = harness.render();
    assert.equal(context.proposals.find(p => p.id === proposalCode)?.status, 'DANG_THAM_DINH');
    assert.equal(context.transferToSubmission(proposalCode), false);
    context.saveInspection(proposalCode, ASSET_MANAGER_PROFILE.name, '29/10/2026', 'Đủ điều kiện thanh lý', assetIds.map(id => ({ id, condition: 'Hỏng', result: 'Đủ điều kiện thanh lý', method: 'Thanh lý (Bán thanh lý)' })));
    context = harness.render();
    assert.equal(context.transferToSubmission(proposalCode), true);
    context = harness.render();
    const submissionCode = context.nextSubmissionCode;
    context.createSubmission({ code: submissionCode, date: '29/10/2026', reason: 'Đề nghị thanh lý', note: '', proposalIds: [proposalCode], assetIds, isSent: true });
    context = harness.render();
    assert.equal(context.submissions.length, originalSubmissionCount + 1);
    assert.equal(context.submissions.find(s => s.id === submissionCode)?.status, 'CHO_PHE_DUYET');
    context.approveSubmission(submissionCode, 'QD-NOT-ALLOWED', '29/10/2026');
    assert.equal(harness.render().decisions.some(d => d.code === 'QD-NOT-ALLOWED'), false);

    context = harness.setUser(DIRECTOR_PROFILE);
    context.rejectSubmission(submissionCode, 'Bổ sung hồ sơ thẩm định');
    context = harness.render();
    assert.equal(context.submissions.find(s => s.id === submissionCode)?.status, 'TRA_BO_SUNG');
    context.approveSubmission(submissionCode, 'QD-NOT-PENDING', '29/10/2026');
    assert.equal(harness.render().decisions.some(d => d.code === 'QD-NOT-PENDING'), false);
    context = harness.setUser(ASSET_MANAGER_PROFILE);
    context.createSubmission({ code: submissionCode, date: '29/10/2026', reason: 'Đã bổ sung hồ sơ', note: '', proposalIds: [proposalCode], assetIds, isSent: true });
    context = harness.setUser(DIRECTOR_PROFILE);
    context.approveSubmission(submissionCode, 'QD-TEST-001', '29/10/2026');
    context = harness.render();
    const decision = context.decisions.find(d => d.code === 'QD-TEST-001')!;
    assert.ok(decision);
    assert.equal(decision.signerName, DIRECTOR_PROFILE.name);
    const dossierId = context.dossiers.find(d => d.decisionId === decision.id)!.id;

    context = harness.setUser(ASSET_MANAGER_PROFILE);
    assert.equal(context.closeDossier(dossierId).success, false);
    const batch = { contractCode: 'HD-TEST', contractDate: '29/10/2026', buyerName: 'Đơn vị thu mua', salePrice: 1000000, deliveryDate: '29/10/2026', receiverName: 'Người nhận', deliveryRecordCode: 'BB-TEST', assetIds: [assetIds[0]] };
    context.executeLiquidationBatch(decision.id, { ...batch, assetIds: ['unapproved-asset'] });
    assert.equal(harness.render().decisions.find(d => d.id === decision.id)!.batches.length, 0);
    context.executeLiquidationBatch(decision.id, batch);
    context = harness.render();
    assert.equal(context.closeDossier(dossierId).success, false);
    context.executeLiquidationBatch(decision.id, batch);
    assert.equal(harness.render().decisions.find(d => d.id === decision.id)!.batches.length, 1);
    context.executeLiquidationBatch(decision.id, { ...batch, assetIds: [assetIds[1]], contractCode: 'HD-TEST-2' });
    context = harness.render();
    assert.equal(context.closeDossier(dossierId).success, true);
    context = harness.render();
    assert.equal(context.dossiers.find(d => d.id === dossierId)?.status, 'HOAN_TAT');
    assert.ok(context.assets.filter(a => assetIds.includes(a.id)).every(a => a.status === 'DA_THANH_LY'));
    assert.ok(memory.has('ba_asset_management_state_v2_inspectionRecords'));
    assert.equal(providerHarness(ASSET_MANAGER_PROFILE).render().inspectionRecords[proposalCode].isTransferred, true);
  } finally {
    if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage);
    else delete (globalThis as any).localStorage;
  }
});
