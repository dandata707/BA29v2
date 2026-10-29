import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/App';
import { WorkspaceSidebar } from '../src/components/WorkspaceSidebar';
import { Header } from '../src/components/Header';
import { HandoverListView } from '../src/components/HandoverListView';
import { HandoverFormPage } from '../src/components/HandoverFormPage';
import { PasswordConfirmModal } from '../src/components/PasswordConfirmModal';
import { INITIAL_HANDOVERS } from '../src/data/mockHandovers';
import { ASSET_MANAGER_PROFILE, EMPLOYEE_PROFILE } from '../src/data/mockTickets';
import { confirmHandover } from '../src/utils/handoverRules';
import { INITIAL_ASSETS } from '../src/data/mockData';

const pending = INITIAL_HANDOVERS.find(protocol => protocol.status === 'Chờ ký')!;
const employee = { ...EMPLOYEE_PROFILE, name: pending.receiverName, code: pending.receiverCode };

// Exercise component callbacks and React state without a browser or running DOM effects.
function componentHarness(component: any) {
  const slots: any[] = [];
  return (props: any): any => {
    let cursor = 0;
    const originals = { state: React.useState, memo: React.useMemo, effect: React.useEffect, ref: React.useRef, context: React.useContext };
    (React as any).useState = (initial: any) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (next: any) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    };
    (React as any).useMemo = (calculate: () => any) => calculate();
    (React as any).useEffect = () => {};
    (React as any).useRef = (initial: any) => ({ current: initial });
    (React as any).useContext = (context: any) => context._currentValue;
    try { return component(props); }
    finally { React.useState = originals.state; React.useMemo = originals.memo; React.useEffect = originals.effect; React.useRef = originals.ref; React.useContext = originals.context; }
  };
}

function elements(tree: any): any[] {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(elements);
  return [tree, ...elements(tree.props?.children)];
}
function find(tree: any, type: any) { return elements(tree).find(element => element.type === type); }
function text(tree: any): string {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join('');
  return tree?.props ? text(tree.props.children) : '';
}

test('employee handover list has one top navigation and no signing action', () => {
  const html = renderToStaticMarkup(<HandoverListView handovers={[pending]} currentUser={employee} onViewHandover={() => {}} onRefresh={() => {}} onOpenRoleSwitcher={() => {}} />);
  assert.equal((html.match(/<header\b/g) || []).length, 1);
  assert.match(html, /Thao tác biên bản/);
  assert.doesNotMatch(html, /Xác nhận ký|password-confirm-modal/);
  assert.doesNotMatch(html, /h-screen/);
});

test('row click opens immutable details and confirmation goes through the password popup', () => {
  const entry = componentHarness(App)({});
  const workspace = componentHarness(entry.props.children.type);
  const workspaceProps = { currentUser: employee, setCurrentUser: () => {} };
  let tree = workspace(workspaceProps);
  find(tree, WorkspaceSidebar).props.onSelectTab('Bàn giao tài sản');
  tree = workspace(workspaceProps);
  assert.equal(find(tree, Header), undefined);
  const list = find(tree, HandoverListView);
  assert.ok(list);
  list.props.onViewHandover(pending);
  tree = workspace(workspaceProps);
  assert.equal(find(tree, HandoverListView), undefined);
  assert.equal(find(tree, Header), undefined);
  let detail = find(tree, HandoverFormPage);
  assert.equal(detail.props.protocol.id, pending.id);
  assert.equal(detail.props.protocol.status, 'Chờ ký');
  const html = renderToStaticMarkup(<HandoverFormPage {...detail.props} />);
  assert.equal((html.match(/<header\b/g) || []).length, 1);
  assert.ok((html.match(/<input\b[^>]*>/g) || []).every(input => /readOnly/.test(input)));
  assert.doesNotMatch(html, /Thêm tài sản vào|Lưu nháp|<span>Gửi<\/span>/);

  const form = componentHarness(HandoverFormPage);
  let formTree = form(detail.props);
  const confirm = elements(formTree).find(element => element.type === 'button' && text(element) === 'Xác nhận');
  assert.ok(confirm);
  confirm.props.onClick();
  formTree = form(detail.props);
  const popupProps = find(formTree, PasswordConfirmModal).props;
  assert.equal(popupProps.isOpen, true);
  const popup = componentHarness(PasswordConfirmModal);
  popup(popupProps);
  const submit = () => find(popup(popupProps), 'form').props.onSubmit({ preventDefault() {} });
  submit();
  assert.equal(find(workspace(workspaceProps), HandoverFormPage).props.protocol.status, 'Chờ ký');
  find(popup(popupProps), 'input').props.onChange({ target: { value: '   ' } });
  submit();
  assert.equal(find(workspace(workspaceProps), HandoverFormPage).props.protocol.status, 'Chờ ký');
  find(popup(popupProps), 'input').props.onChange({ target: { value: 'demo-password' } });
  const originalTimeout = globalThis.setTimeout;
  (globalThis as any).setTimeout = () => 0;
  try { submit(); } finally { globalThis.setTimeout = originalTimeout; }
  detail = find(workspace(workspaceProps), HandoverFormPage);
  assert.equal(detail.props.protocol.status, 'Hoàn tất');
  assert.equal(detail.props.protocol.signedByReceiver, true);
  assert.deepEqual(detail.props.protocol.items, pending.items);
  assert.equal(detail.props.protocol.totalValueNumber, pending.totalValueNumber);
  assert.equal(detail.props.protocol.receiverCode, pending.receiverCode);
  const completed = renderToStaticMarkup(<HandoverFormPage {...detail.props} />);
  assert.doesNotMatch(completed, /<span>Xác nhận<\/span>|Thêm tài sản vào|Lưu nháp/);
  assert.match(completed, /Đã hoàn tất ký nhận/);
  detail.props.onBack();
  assert.equal(find(workspace(workspaceProps), HandoverListView).props.handovers.find((item: any) => item.id === pending.id).status, 'Hoàn tất');
});

test('confirmation refuses another receiver, missing confirmation and already completed records', () => {
  assert.equal(confirmHandover(pending, employee, false), null);
  assert.equal(confirmHandover(pending, { ...employee, name: 'Người khác', code: 'OTHER' }, true), null);
  assert.equal(confirmHandover({ ...pending, status: 'Hoàn tất' }, employee, true), null);
  const completed = confirmHandover(pending, employee, true, '2026-10-29T10:00:00Z')!;
  assert.deepEqual(completed, { ...pending, status: 'Hoàn tất', signedByReceiver: true, receiverSignDate: '2026-10-29T10:00:00Z' });
});

test('draft asset rows start empty, enforce category-first selection and recalculate quantity totals', () => {
  let saved: any;
  const props = { protocol: { ...pending, status: 'Nháp', items: [] }, currentUser: ASSET_MANAGER_PROFILE, onBack() {}, onSubmitSend() {}, onSaveDraft(protocol: any) { saved = protocol; } };
  const render = componentHarness(HandoverFormPage);
  const button = (tree: any, label: string) => elements(tree).find(element => element.type === 'button' && text(element) === label);
  const field = (tree: any, label: string) => elements(tree).find(element => element.props?.['aria-label'] === label);
  button(render(props), 'Thêm tài sản vào').props.onClick();
  let tree = render(props);
  assert.equal(field(tree, 'Loại tài sản dòng 1').props.value, '');
  assert.equal(field(tree, 'Tên tài sản dòng 1').props.disabled, true);
  button(tree, 'Lưu nháp').props.onClick();
  assert.equal(saved.items[0].name, '');
  assert.equal(saved.items[0].unit, '');
  assert.equal(saved.totalQuantity, 0);
  button(tree, 'Gửi').props.onClick();
  assert.equal(find(render(props), PasswordConfirmModal).props.isOpen, false);
  assert.match(text(render(props)), /vui lòng chọn loại tài sản/);
  const asset = INITIAL_ASSETS.find(asset => !asset.isDeleted && asset.trangThai !== 'Đã thanh lý')!;
  field(tree, 'Tên tài sản dòng 1').props.onChange({ target: { value: asset.id } });
  assert.equal(field(render(props), 'Tên tài sản dòng 1').props.value, '');
  field(render(props), 'Loại tài sản dòng 1').props.onChange({ target: { value: asset.categoryId } });
  tree = render(props);
  assert.equal(field(tree, 'Tên tài sản dòng 1').props.disabled, false);
  const optionIds = elements(field(tree, 'Tên tài sản dòng 1')).filter(option => option.type === 'option' && option.props.value).map(option => option.props.value);
  assert.ok(optionIds.length);
  assert.ok(optionIds.every(id => INITIAL_ASSETS.some(entry => entry.id === id && entry.categoryId === asset.categoryId)));
  field(tree, 'Tên tài sản dòng 1').props.onChange({ target: { value: asset.id } });
  tree = render(props);
  assert.equal(field(tree, 'Số lượng dòng 1').props.value, 1);
  button(tree, 'Lưu nháp').props.onClick();
  assert.equal(saved.items[0].name, asset.tenTaiSan);
  assert.equal(saved.items[0].unit, 'Chiếc');
  assert.equal(saved.items[0].unitPrice, asset.nguyenGia);
  assert.equal(saved.items[0].totalPrice, asset.nguyenGia);
  const note = 'Ghi chú bàn giao đầy đủ, giữ nguyên khi lưu biên bản';
  field(tree, 'Ghi chú dòng 1').props.onChange({ target: { value: note } });
  button(render(props), 'Lưu nháp').props.onClick();
  assert.equal(saved.items[0].notes, note);
  field(tree, 'Số lượng dòng 1').props.onChange({ target: { value: '3' } });
  button(render(props), 'Lưu nháp').props.onClick();
  assert.equal(saved.totalQuantity, 3);
  assert.equal(saved.totalValueNumber, asset.nguyenGia * 3);
  const anotherCategory = INITIAL_ASSETS.find(entry => entry.categoryId !== asset.categoryId)!.categoryId;
  field(render(props), 'Loại tài sản dòng 1').props.onChange({ target: { value: anotherCategory } });
  button(render(props), 'Lưu nháp').props.onClick();
  assert.equal(saved.items[0].assetId, undefined);
  assert.equal(saved.items[0].name, '');
  assert.equal(saved.items[0].unit, '');
  assert.equal(saved.totalValueNumber, 0);
});

test('draft asset dropdown uses the latest saved catalog and retains selected asset data on send', () => {
  const asset = { ...INITIAL_ASSETS[0], id: 'latest-asset', categoryId: 'custom-category', categoryName: 'Loại mới', tenTaiSan: 'Thiết bị mới cập nhật', nguyenGia: 720000, donViTinh: 'Bộ' };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify([asset]) } });
  try {
    let sent: any;
    const props = { protocol: { ...pending, status: 'Nháp', items: [] }, currentUser: ASSET_MANAGER_PROFILE, onBack() {}, onSubmitSend(protocol: any, confirmed: boolean) { sent = { protocol, confirmed }; } };
    const render = componentHarness(HandoverFormPage);
    const button = (tree: any, label: string) => elements(tree).find(element => element.type === 'button' && text(element) === label);
    const field = (tree: any, label: string) => elements(tree).find(element => element.props?.['aria-label'] === label);
    button(render(props), 'Thêm tài sản vào').props.onClick();
    field(render(props), 'Loại tài sản dòng 1').props.onChange({ target: { value: asset.categoryId } });
    field(render(props), 'Tên tài sản dòng 1').props.onChange({ target: { value: asset.id } });
    button(render(props), 'Gửi').props.onClick();
    const popup = find(render(props), PasswordConfirmModal);
    assert.equal(popup.props.isOpen, true);
    popup.props.onConfirm('demo-password');
    assert.equal(sent.confirmed, true);
    assert.equal(sent.protocol.status, 'Chờ ký');
    assert.equal(sent.protocol.items[0].assetId, asset.id);
    assert.equal(sent.protocol.items[0].unit, 'Bộ');
    assert.equal(sent.protocol.items[0].unitPrice, 720000);
    assert.equal(sent.protocol.totalQuantity, 1);
    assert.equal(sent.protocol.totalValueNumber, 720000);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete (globalThis as any).localStorage;
  }
});
