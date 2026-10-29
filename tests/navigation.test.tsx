import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../src/components/Header';
import { RequestFormPage } from '../src/components/RequestFormPage';
import { Header as ReturnHeader } from '../src/features/asset-return/components/Header';
import { Header as LiquidationHeader } from '../src/features/asset-liquidation/components/Header';
import { AppProvider } from '../src/features/asset-return/context/AppContext';
import { AssetProvider } from '../src/features/asset-liquidation/context/AssetContext';
import { WorkspaceNavigationContext } from '../src/navigation/WorkspaceNavigation';
import { allocationBreadcrumbs, assetBreadcrumbs, handoverBreadcrumbs, returnBreadcrumbs, liquidationBreadcrumbs, BreadcrumbItem } from '../src/navigation/breadcrumbs';
import { ROLE_SCREENS, defaultScreen, liquidationRole } from '../src/features/asset-liquidation/permissions';
import { ASSET_MANAGER_PROFILE, EMPLOYEE_PROFILE } from '../src/data/mockTickets';
import { DIRECTOR_PROFILE } from '../src/data/userProfiles';

const labels = (items: BreadcrumbItem[]) => items.map(item => item.label);
const noop = () => {};

test('allocation and asset paths follow list, create, edit and detail screens', () => {
  let back = 0;
  const onList = () => back++;
  assert.deepEqual(labels(allocationBreadcrumbs('list', undefined, onList)), ['Cấp phát tài sản', 'Yêu cầu cấp phát']);
  assert.equal(labels(allocationBreadcrumbs('create', undefined, onList)).at(-1), 'Tạo phiếu yêu cầu');
  assert.equal(labels(allocationBreadcrumbs('edit', 'CP-001', onList)).at(-1), 'Chỉnh sửa CP-001');
  assert.equal(labels(allocationBreadcrumbs('detail', 'CP-001', onList)).at(-1), 'Chi tiết CP-001');
  allocationBreadcrumbs('detail', 'CP-001', onList)[1].onClick!();
  assert.equal(back, 1);
  assert.equal(labels(assetBreadcrumbs('create', undefined, onList)).at(-1), 'Thêm mới tài sản');
  assert.equal(labels(assetBreadcrumbs('edit', 'TS-001', onList)).at(-1), 'Chỉnh sửa TS-001');
  assert.equal(labels(assetBreadcrumbs('success', undefined, onList)).at(-1), 'Tạo tài sản thành công');
});

test('handover and return breadcrumbs identify their current screen and record', () => {
  assert.deepEqual(labels(handoverBreadcrumbs(undefined)), ['Cấp phát tài sản', 'Bàn giao tài sản', 'Danh sách biên bản']);
  assert.equal(labels(handoverBreadcrumbs('BB-001', noop, noop, 'create')).at(-1), 'Tạo biên bản bàn giao');
  assert.equal(labels(handoverBreadcrumbs('BB-001', noop, noop, 'edit')).at(-1), 'Chỉnh sửa BB-001');
  assert.equal(labels(handoverBreadcrumbs('BB-001', noop)).at(-1), 'Chi tiết BB-001');
  assert.deepEqual(labels(returnBreadcrumbs('list', undefined, noop)), ['Thu hồi tài sản', 'Biên bản thu hồi']);
  assert.equal(labels(returnBreadcrumbs('create', undefined, noop)).at(-1), 'Tạo biên bản thu hồi');
  assert.equal(labels(returnBreadcrumbs('detail', 'TH01/2026', noop)).at(-1), 'Chi tiết TH01/2026');
  assert.equal(labels(returnBreadcrumbs('asset_inventory', undefined, noop)).at(-1), 'Tài sản thu hồi');
  assert.equal(labels(returnBreadcrumbs('employee_confirm', 'TH01/2026', noop)).at(-1), 'TH01/2026');
});

test('every permitted liquidation screen has a matching path with working parent navigation', () => {
  for (const role of ['employee', 'asset_manager', 'director'] as const) {
    const internal = liquidationRole(role);
    for (const screen of ROLE_SCREENS[internal]) {
      let destination: string | undefined;
      const crumbs = liquidationBreadcrumbs(screen, role, target => { destination = target; }, defaultScreen(internal), 'TL-001', true);
      assert.equal(crumbs[0].label, 'Thanh lý tài sản');
      assert.ok(crumbs.length >= 2);
      assert.ok(crumbs.every(crumb => crumb.label && !crumb.label.includes('undefined')));
      crumbs[0].onClick!();
      assert.equal(destination, defaultScreen(internal));
      if (screen === 'INSPECTION_DETAIL') assert.equal(crumbs.at(-1)?.label, 'Thẩm định TL-001');
      if (screen === 'PROPOSAL_CREATE') assert.equal(crumbs.at(-1)?.label, 'Chỉnh sửa đề nghị TL-001');
      if (screen === 'SUBMISSION_CREATE') assert.equal(crumbs.at(-1)?.label, 'Tạo tờ trình thanh lý');
    }
  }
});

test('all active header adapters share one header, breadcrumb, role switcher and mobile toggle', () => {
  const screens = [
    <Header breadcrumbs={allocationBreadcrumbs('detail', 'CP-001', noop)} currentUser={EMPLOYEE_PROFILE} />,
    <AppProvider user={ASSET_MANAGER_PROFILE}><ReturnHeader user={ASSET_MANAGER_PROFILE} onOpenRoleSwitcher={noop} /></AppProvider>,
    <AssetProvider user={DIRECTOR_PROFILE} onRequestRoleSwitch={noop}><LiquidationHeader onOpenRoleSwitcher={noop} onOpenMobileSidebar={noop} onOpenFlowGuide={noop} /></AssetProvider>,
  ];
  for (const screen of screens) {
    const html = renderToStaticMarkup(screen);
    assert.equal((html.match(/<header\b/g) || []).length, 1);
    assert.equal((html.match(/aria-label="Breadcrumb"/g) || []).length, 1);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
    assert.match(html, /h-14 min-h-14/);
    assert.match(html, /aria-label="Trang chủ"/);
    assert.match(html, /aria-label="Mở menu"/);
    assert.match(html, /aria-label="Chuyển đổi tài khoản"/);
  }
  const form = renderToStaticMarkup(<RequestFormPage mode="create" onBack={noop} onSubmit={noop} />);
  assert.doesNotMatch(form, /<header\b|aria-label="Breadcrumb"/);
});

test('shared headers inherit the signed-in account from the app navigation context', () => {
  const html = renderToStaticMarkup(<WorkspaceNavigationContext.Provider value={{ user: DIRECTOR_PROFILE, navigate: noop, home: noop, openMobileMenu: noop, openRoleSwitcher: noop }}><Header breadcrumbs={[{ label: 'Thanh lý tài sản' }]} /></WorkspaceNavigationContext.Provider>);
  assert.match(html, /Lê Hoàng Nam/);
  assert.match(html, /Giám đốc/);
});
