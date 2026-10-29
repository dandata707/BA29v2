import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { employeeCanView, itemIsProcessed, matchesAssetCode, validateSelectedAssets } from '../src/features/asset-return/rules';
import { INITIAL_ASSETS, INITIAL_RECORDS, INITIAL_EMPLOYEES } from '../src/features/asset-return/data/mockData';
import { AppProvider, useApp } from '../src/features/asset-return/context/AppContext';
import { AssetReturnModule } from '../src/features/asset-return/AssetReturnModule';
import { EMPLOYEE_PROFILE, ASSET_MANAGER_PROFILE } from '../src/data/mockTickets';
import { ReturnRecordItem } from '../src/features/asset-return/types/asset';
import App from '../src/App';
import { Sidebar } from '../src/components/Sidebar';
import { RoleSwitcherModal } from '../src/components/RoleSwitcherModal';
import { EMPLOYEE_PROFILES } from '../src/data/userProfiles';
import { canEditHandover, canSignHandover } from '../src/utils/handoverRules';
import { INITIAL_HANDOVERS } from '../src/data/mockHandovers';
import { HandoverFormPage } from '../src/components/HandoverFormPage';
import { CreateHandoverModal } from '../src/components/CreateHandoverModal';
import { TruncatedSelect } from '../src/components/TruncatedSelect';
import { INITIAL_TICKETS } from '../src/data/mockTickets';

const item: ReturnRecordItem = { assetId: 'BBBG_01', serial: 'C02XK1ABC', assetName: 'Laptop', category: 'laptop', startDate: '2026-01-01', scanned: false, accessories: [], photos: [] };

test('employee visibility excludes other employees and unpublished drafts', () => {
  const record = INITIAL_RECORDS[0];
  assert.equal(employeeCanView({ ...record, employeeId: 'EMP01', status: 'draft' }, 'EMP01'), false);
  assert.equal(employeeCanView({ ...record, employeeId: 'EMP02', status: 'pending_handoff' }, 'EMP01'), false);
  for (const status of ['pending_handoff', 'in_handoff', 'completed', 'cancelled'] as const) {
    assert.equal(employeeCanView({ ...record, employeeId: 'EMP01', status }, 'EMP01'), true);
  }
});

test('asset selection requires unique, existing assets currently assigned to the employee', () => {
  const assigned = INITIAL_ASSETS.filter(a => a.status === 'in_use' && a.currentUserId === 'EMP01');
  assert.ok(assigned.length);
  const id = assigned[0].id;
  assert.equal(validateSelectedAssets(INITIAL_ASSETS, [id], 'EMP01'), true);
  assert.equal(validateSelectedAssets(INITIAL_ASSETS, [], 'EMP01'), false);
  assert.equal(validateSelectedAssets(INITIAL_ASSETS, [id, id], 'EMP01'), false);
  assert.equal(validateSelectedAssets(INITIAL_ASSETS, [id], 'EMP02'), false);
  assert.equal(validateSelectedAssets(INITIAL_ASSETS, ['unknown'], 'EMP01'), false);
  assert.equal(validateSelectedAssets([{ ...assigned[0], status: 'reclaimed' }], [id], 'EMP01'), false);
});

test('QR matching accepts exact asset code or serial and rejects partial matches', () => {
  assert.equal(matchesAssetCode(item, ' bbbg_01 '), true);
  assert.equal(matchesAssetCode(item, 'c02xk1abc'), true);
  assert.equal(matchesAssetCode(item, 'BBBG_010'), false);
  assert.equal(matchesAssetCode(item, 'prefix-BBBG_01'), false);
  assert.equal(matchesAssetCode(item, ''), false);
});

test('completion requires recorded condition or a loss report with a reason', () => {
  assert.equal(itemIsProcessed(item), false);
  assert.equal(itemIsProcessed({ ...item, scanned: true }), false);
  const inspected = { ...item, scanned: true, physicalCondition: 'Mới / Tốt', operatingStatus: 'Hoạt động bình thường' } as ReturnRecordItem;
  assert.equal(itemIsProcessed(inspected), true);
  assert.equal(itemIsProcessed({ ...inspected, operatingStatus: 'Khác' }), false);
  assert.equal(itemIsProcessed({ ...inspected, operatingStatus: 'Khác', operatingStatusOtherNote: 'Lỗi bàn phím' }), true);
  assert.equal(itemIsProcessed({ ...item, isLost: true, lostReason: ' ' }), false);
  assert.equal(itemIsProcessed({ ...item, isLost: true, lostReason: 'Thất lạc khi di chuyển' }), true);
});

test('both role interfaces render with shared navigation and scoped employee records', () => {
  const render = (user: typeof EMPLOYEE_PROFILE) => renderToStaticMarkup(<AppProvider user={user}><AssetReturnModule user={user} onOpenRoleSwitcher={() => {}} /></AppProvider>);
  const manager = render(ASSET_MANAGER_PROFILE);
  assert.doesNotMatch(manager, /<aside/);
  assert.match(manager, /Tạo biên bản/);
  assert.match(manager, /Biên bản thu hồi/);
  assert.doesNotMatch(manager, />Tài sản thu hồi<\/button>/);
  const employee = render(EMPLOYEE_PROFILE);
  assert.match(employee, /Xác nhận biên bản thu hồi/);
  assert.doesNotMatch(employee, /Tạo biên bản/);
  assert.doesNotMatch(employee, /Phạm Hoàng Dung/);
  assert.doesNotMatch(employee, /Lê Minh Quân/);
  assert.match(employee, /Nguyễn Minh Anh/);
});

test('the manager accesses return records and inventory through sidebar submenus', () => {
  for (const returnView of ['list', 'create', 'detail', 'asset_inventory'] as const) {
    const sidebar = renderToStaticMarkup(<Sidebar currentTab="Thu hồi tài sản" currentUser={ASSET_MANAGER_PROFILE} returnView={returnView} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
    assert.match(sidebar, /id="asset-return-navigation"/);
    assert.match(sidebar, /Biên bản thu hồi/);
    assert.match(sidebar, /Tài sản thu hồi/);
    const selected = sidebar.match(/<button\b[^>]*aria-current="page"[^>]*>[\s\S]*?<\/button>/g) || [];
    assert.equal(selected.length, 1);
    assert.ok(selected[0].includes(returnView === 'asset_inventory' ? 'Tài sản thu hồi' : 'Biên bản thu hồi'));
  }
  const employee = renderToStaticMarkup(<Sidebar currentTab="Thu hồi tài sản" currentUser={EMPLOYEE_PROFILE} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
  assert.doesNotMatch(employee, /id="asset-return-navigation"/);
});

test('the application owns exactly one sidebar and shares its menu across modules', () => {
  const app = renderToStaticMarkup(<App />);
  assert.equal((app.match(/<aside\b/g) || []).length, 1);
  for (const user of [ASSET_MANAGER_PROFILE, EMPLOYEE_PROFILE]) {
    for (const currentTab of ['Cấp phát tài sản', 'Bàn giao tài sản', 'Thu hồi tài sản']) {
      const sidebar = renderToStaticMarkup(<Sidebar currentTab={currentTab} currentUser={user} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
      assert.equal((sidebar.match(/<aside\b/g) || []).length, 1);
      assert.match(sidebar, /AssetFlow/);
      assert.match(sidebar, /Yêu cầu cấp phát/);
      assert.match(sidebar, /Bàn giao tài sản/);
      assert.match(sidebar, /Thu hồi tài sản/);
      if (user.role === 'employee') assert.doesNotMatch(sidebar, /Danh sách tài sản/);
    }
  }
});

test('account switcher includes every employee from the return-record directory and highlights only the selected account', () => {
  assert.equal(EMPLOYEE_PROFILES.length, INITIAL_EMPLOYEES.length);
  for (const user of EMPLOYEE_PROFILES) {
    const markup = renderToStaticMarkup(<RoleSwitcherModal isOpen currentUser={user} onSelectUser={() => {}} onClose={() => {}} />);
    for (const employee of INITIAL_EMPLOYEES) {
      assert.match(markup, new RegExp(employee.name));
      assert.ok(markup.includes(employee.id));
      assert.ok(markup.includes(employee.email));
    }
    assert.equal((markup.match(/Đang kích hoạt/g) || []).length, 1);
    function CheckIdentity() {
      const { currentEmployee, records, assets, notifications } = useApp();
      assert.equal(currentEmployee.id, user.employeeId);
      assert.equal(currentEmployee.email, user.email);
      assert.ok(records.every(r => r.employeeId === user.employeeId && r.status !== 'draft'));
      assert.ok(assets.every(a => a.currentUserId === user.employeeId));
      assert.ok(notifications.every(n => n.recipientEmail === user.email));
      return null;
    }
    renderToStaticMarkup(<AppProvider user={user}><CheckIdentity /></AppProvider>);
  }
});

test('pending and completed handovers lock all editing while drafts remain editable', () => {
  const base = INITIAL_HANDOVERS[0];
  for (const status of ['Nháp', 'Chờ ký', 'Hoàn tất'] as const) {
    const protocol = { ...base, status };
    const markup = renderToStaticMarkup(<HandoverFormPage protocol={protocol} currentUser={ASSET_MANAGER_PROFILE} onBack={() => {}} onSubmitSend={() => {}} onSaveDraft={() => {}} />);
    assert.equal(canEditHandover(protocol, ASSET_MANAGER_PROFILE), status === 'Nháp');
    assert.equal(canEditHandover(protocol, EMPLOYEE_PROFILE), false);
    assert.match(markup, /Danh sách tài sản bàn giao/);
    if (status === 'Nháp') {
      assert.match(markup, /Thêm tài sản vào/);
      assert.match(markup, /Lưu nháp/);
      assert.match(markup, /<span>Gửi<\/span>/);
    } else {
      assert.doesNotMatch(markup, /Thêm tài sản vào|Lưu nháp|<span>Gửi<\/span>/);
      assert.match(markup, /đã được khóa chỉnh sửa/);
    }
  }
  const pending = { ...base, status: 'Chờ ký' as const, receiverCode: EMPLOYEE_PROFILE.code, receiverName: EMPLOYEE_PROFILE.name };
  assert.equal(canSignHandover(pending, EMPLOYEE_PROFILE), true);
  assert.equal(canSignHandover(pending, ASSET_MANAGER_PROFILE), false);
  assert.equal(canSignHandover({ ...pending, status: 'Hoàn tất' }, EMPLOYEE_PROFILE), false);
  assert.equal(canSignHandover({ ...pending, receiverCode: 'other', receiverName: 'other' }, EMPLOYEE_PROFILE), false);
  const sidebar = renderToStaticMarkup(<Sidebar currentTab="Cấp phát tài sản" currentUser={ASSET_MANAGER_PROFILE} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
  assert.doesNotMatch(sidebar, /Định mức tài sản/);
});

test('handover tables keep notes last and ellipsize long names without changing values or permissions', () => {
  const name = 'Tên tài sản rất dài cần hiển thị rút gọn nhưng vẫn giữ nguyên dữ liệu đầy đủ';
  const category = 'Loại tài sản có tên rất dài để kiểm tra cách hiển thị';
  const notes = 'Ghi chú bàn giao được lưu và hiển thị đầy đủ';
  const item = { ...INITIAL_HANDOVERS[0].items[0], name, category, notes };
  for (const user of [ASSET_MANAGER_PROFILE, EMPLOYEE_PROFILE]) {
    for (const status of ['Nháp', 'Chờ ký', 'Hoàn tất'] as const) {
      const protocol = { ...INITIAL_HANDOVERS[0], status, items: [item] };
      const html = renderToStaticMarkup(<HandoverFormPage protocol={protocol} currentUser={user} onBack={() => {}} onSubmitSend={() => {}} />);
      const headings = html.match(/<th\b[^>]*>[\s\S]*?<\/th>/g) || [];
      assert.match(headings.at(-1)!, />Ghi chú<\/th>/);
      assert.equal(headings.filter(heading => heading.includes('Ghi chú')).length, 1);
      assert.match(html, /table-fixed/);
      assert.ok(html.includes(`title="${category}"`));
      assert.ok(html.includes(`title="${name}"`));
      assert.ok(html.includes(notes));
      assert.match(html, /truncate/);
      if (status !== 'Nháp' || user.role !== 'asset_manager') assert.doesNotMatch(html, /<select\b|aria-label="Ghi chú dòng/);
      assert.equal(protocol.items[0].name, name);
      assert.equal(protocol.items[0].category, category);
    }
  }
  const picker = renderToStaticMarkup(<TruncatedSelect displayValue={name} value="asset-001" onChange={() => {}} aria-label="Chọn tài sản"><option value="asset-001">{name}</option></TruncatedSelect>);
  assert.match(picker, /block truncate/);
  assert.match(picker, /value="asset-001" selected/);
  assert.ok(picker.includes(`title="${name}"`));
  const modal = renderToStaticMarkup(<CreateHandoverModal isOpen ticket={{ ...INITIAL_TICKETS[0], items: [{ id: 'item', name, category, notes, quantity: 1 }] }} currentUser={ASSET_MANAGER_PROFILE} onClose={() => {}} onSuccess={() => {}} />);
  const modalHeadings = modal.match(/<th\b[^>]*>[\s\S]*?<\/th>/g) || [];
  assert.match(modalHeadings.at(-1)!, />Ghi chú<\/th>/);
  assert.ok(modal.includes(notes));
  assert.match(modal, /block truncate/);
});
