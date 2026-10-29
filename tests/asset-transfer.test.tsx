import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TransferProvider, useTransfer } from '../src/features/asset-transfer/context/TransferContext';
import { AssetTransferModule } from '../src/features/asset-transfer/AssetTransferModule';
import { Sidebar } from '../src/components/Sidebar';
import { EMPLOYEE_PROFILES, DIRECTOR_PROFILE } from '../src/data/userProfiles';
import { ASSET_MANAGER_PROFILE } from '../src/data/mockTickets';
import { INITIAL_ASSETS } from '../src/data/mockData';
import { loadAssetCatalog, updateAssetCatalog } from '../src/data/assetCatalog';
import { UserProfile } from '../src/types';
import { canTransferAsset } from '../src/features/asset-transfer/rules';
import { UI02_CreateTransfer } from '../src/features/asset-transfer/components/UI02_CreateTransfer';
import { UI03_ReviewTransfer } from '../src/features/asset-transfer/components/UI03_ReviewTransfer';
import { UI04_CreateHandoverDoc } from '../src/features/asset-transfer/components/UI04_CreateHandoverDoc';
import { UI05_ConfirmHandover } from '../src/features/asset-transfer/components/UI05_ConfirmHandover';

function providerHarness(initialUser: UserProfile) {
  const slots: any[] = []; let user = initialUser;
  let provider: React.ReactElement;
  const render = () => {
    let cursor = 0; const effects: (() => void)[] = [];
    const original = { useState: React.useState, useEffect: React.useEffect, useSyncExternalStore: React.useSyncExternalStore };
    (React as any).useState = (initial: any) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (next: any) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    };
    (React as any).useEffect = (effect: () => void, dependencies: any[]) => {
      const index = cursor++; const previous = slots[index];
      if (!previous || dependencies.some((entry, i) => !Object.is(entry, previous[i]))) effects.push(effect);
      slots[index] = dependencies;
    };
    (React as any).useSyncExternalStore = (_subscribe: any, snapshot: any) => snapshot();
    let element: React.ReactElement<{ value: ReturnType<typeof useTransfer> }>;
    try { element = TransferProvider({ user, children: null }) as typeof element; }
    finally { Object.assign(React, original); }
    effects.forEach(effect => effect());
    provider = element!;
    return element!.props.value;
  };
  return { render, markup(children: React.ReactNode) { return renderToStaticMarkup(React.cloneElement(provider, {}, children)); }, setUser(next: UserProfile) { user = next; render(); return render(); } };
}

test('transfer uses existing employee accounts, shared navigation and canonical asset records through the entire workflow', () => {
  const memory = new Map<string, string>();
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
  } });
  try {
    const sender = EMPLOYEE_PROFILES[0], receiver = EMPLOYEE_PROFILES[1], other = EMPLOYEE_PROFILES[2];
    const asset = { ...INITIAL_ASSETS[0], id: 'shared-transfer-asset', maTaiSan: 'TS-SHARED', tenTaiSan: 'Tài sản gốc', nguoiSuDungId: sender.id, nguoiSuDungTen: sender.name, viTriLuuKho: 'Vị trí ban đầu' };
    updateAssetCatalog([asset]);
    const harness = providerHarness(sender); let context = harness.render();
    assert.equal(context.assets.length, 1);
    assert.equal(context.assets[0].name, asset.tenTaiSan);
    const creation = harness.markup(<UI02_CreateTransfer />);
    assert.match(creation, /Tài sản gốc/);
    assert.match(creation, /Phạm Hoàng Dung/);
    assert.doesNotMatch(creation, /material-symbols-outlined|LT-2025-00001/);
    const input = { assetId: asset.id, destinationLocation: 'Vị trí mới', recipientEmployeeId: receiver.id, recipientName: 'Spoof', recipientRole: 'Spoof', recipientDept: 'Spoof', reason: 'Phục vụ công việc', attachments: [] };
    assert.equal(context.createRequest({ ...input, recipientEmployeeId: 'prototype-NV001' }), null);
    assert.equal(context.createRequest({ ...input, recipientEmployeeId: sender.id }), null);
    const request = context.createRequest(input)!; assert.ok(request);
    assert.equal(request.recipientName, receiver.name);
    assert.equal(request.requesterId, sender.id);
    context = harness.render();
    context.navigateTo('review', request.id); context = harness.render();
    assert.doesNotMatch(harness.markup(<UI03_ReviewTransfer />), /Đổi sang vai trò|Lập biên bản bàn giao/);
    assert.equal(context.eligibleAssets.length, 0);
    assert.equal(context.createRequest(input), null);
    assert.equal(context.reviewRequest(request.id, 'approve', '', true, true), false);
    context = harness.setUser(other); assert.equal(context.requests.length, 0);
    assert.equal(context.resubmitRequest(request.id, 'Bổ sung trái phép', []), false);
    context = harness.setUser(ASSET_MANAGER_PROFILE);
    assert.equal(context.reviewRequest(request.id, 'approve', '', true, false), false);
    assert.equal(context.reviewRequest(request.id, 'supplement', '', false, false), false);
    assert.equal(context.reviewRequest(request.id, 'supplement', 'Bổ sung lý do', false, false), true);
    context = harness.setUser(receiver);
    assert.equal(context.requests.length, 1);
    assert.equal(context.resubmitRequest(request.id, 'Không đúng người đề nghị', []), false);
    context = harness.setUser(sender);
    assert.equal(context.resubmitRequest(request.id, 'Đã bổ sung lý do sử dụng', []), true);
    context = harness.setUser(ASSET_MANAGER_PROFILE);
    assert.equal(context.requests[0].status, 'pending');
    assert.equal(context.reviewRequest(request.id, 'approve', 'Đủ điều kiện', true, true), true);
    context = harness.render();
    assert.equal(context.reviewRequest(request.id, 'reject', 'Không được đổi sau duyệt', true, true), false);
    context.navigateTo('handover-create', request.id); context = harness.render();
    assert.match(harness.markup(<UI04_CreateHandoverDoc />), /Tài sản gốc/);
    const documentInput = { handoverDate: '2026-10-29 14:30', handoverLocation: 'Vị trí mới', accessories: 'Không kèm phụ kiện', attachments: [], termsAccepted: true };
    assert.equal(context.createHandoverDocument(request.id, { ...documentInput, termsAccepted: false }), null);
    const document = context.createHandoverDocument(request.id, documentInput)!; assert.ok(document);
    context = harness.render();
    assert.equal(context.createHandoverDocument(request.id, documentInput), null);
    assert.equal(context.completeTransfer(document.id).success, false);
    context.updateHandoverSenderCheck(document.id, true, 'Quản lý ký thay');
    assert.equal(harness.render().handovers[document.id].senderConfirmed, false);
    context = harness.setUser(sender);
    context.navigateTo('handover-confirm', request.id); context = harness.render();
    const senderScreen = harness.markup(<UI05_ConfirmHandover />);
    assert.match(senderScreen, /Lưu xác nhận/);
    assert.doesNotMatch(senderScreen, /Hoàn tất điều chuyển<|Đã ký số|signed.pdf/);
    context.updateHandoverRecipientCheck(document.id, true, 'Ký thay bên nhận');
    assert.equal(harness.render().handovers[document.id].recipientConfirmed, false);
    context.updateHandoverSenderCheck(document.id, true, 'Đã bàn giao');
    context = harness.render();
    assert.equal(context.handovers[document.id].senderConfirmed, true);
    assert.equal(loadAssetCatalog()[0].viTriLuuKho, 'Vị trí ban đầu');
    assert.equal(context.completeTransfer(document.id).success, false);
    context = harness.setUser(receiver);
    context.navigateTo('handover-confirm', request.id); context = harness.render();
    assert.match(harness.markup(<UI05_ConfirmHandover />), /Lưu xác nhận/);
    context.updateHandoverRecipientCheck(document.id, true, 'Đã nhận đầy đủ');
    context = harness.render();
    assert.equal(context.completeTransfer(document.id).success, false);
    context = harness.setUser(ASSET_MANAGER_PROFILE);
    assert.equal(context.completeTransfer(document.id).success, true);
    context = harness.render();
    assert.equal(context.requests[0].status, 'completed');
    const updated = loadAssetCatalog()[0];
    assert.equal(updated.nguoiSuDungId, receiver.id);
    assert.equal(updated.nguoiSuDungTen, receiver.name);
    assert.equal(updated.donViQuanLy, receiver.department);
    assert.equal(updated.viTriLuuKho, input.destinationLocation);
    assert.equal(updated.phienBan, asset.phienBan + 1);
    assert.equal(updated.lichSu!.at(-1)!.actionType, 'Điều chuyển tài sản');
    assert.equal(context.auditLogs.length, 1);
    assert.equal(context.assets[0].custodianCode, receiver.id);
    assert.equal(context.assets[0].vi_tri, input.destinationLocation);
    assert.equal(context.completeTransfer(document.id).success, false);
    context = harness.setUser(receiver);
    context.navigateTo('handover-confirm', request.id); context = harness.render();
    assert.doesNotMatch(harness.markup(<UI05_ConfirmHandover />), /Lưu xác nhận|Hoàn tất điều chuyển<|Xem Sổ tài sản đã cập nhật/);
    context.updateHandoverRecipientCheck(document.id, false, 'Đổi xác nhận sau hoàn tất');
    assert.equal(harness.render().handovers[document.id].recipientConfirmed, true);
    const reloaded = providerHarness(receiver).render();
    assert.equal(reloaded.requests[0].status, 'completed');
    assert.equal(reloaded.handovers[document.id].recipientConfirmed, true);
    assert.equal(harness.setUser(DIRECTOR_PROFILE).requests.length, 0);
    assert.equal([...memory.keys()].some(key => key.startsWith('asset_transfer_app_v2_')), false);
  } finally {
    if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage);
    else delete (globalThis as any).localStorage;
  }
});

test('shared sidebar exposes transfer to managers and employees, with one header and no prototype shell', () => {
  for (const user of [ASSET_MANAGER_PROFILE, ...EMPLOYEE_PROFILES]) {
    const markup = renderToStaticMarkup(<Sidebar currentTab="Điều chuyển tài sản" currentUser={user} onSelectTab={() => {}} onOpenRoleSwitcher={() => {}} />);
    assert.equal((markup.match(/<aside\b/g) || []).length, 1);
    assert.match(markup, /asset-transfer-navigation/);
    assert.match(markup, /Yêu cầu điều chuyển/);
    assert.equal(markup.includes('Báo cáo điều chuyển'), user.role === 'asset_manager');
    const screen = renderToStaticMarkup(<TransferProvider user={user}><AssetTransferModule /></TransferProvider>);
    assert.equal((screen.match(/<header\b/g) || []).length, 1);
    assert.doesNotMatch(screen, /<aside\b|Chọn vai trò mô phỏng|material-symbols-outlined/);
    assert.equal(screen.includes('Tạo yêu cầu điều chuyển'), user.role === 'employee');
  }
});

test('deleted, liquidated and maintenance assets are excluded from transfer requests', () => {
  assert.equal(canTransferAsset({ ...INITIAL_ASSETS[0], isDeleted: true }), false);
  assert.equal(canTransferAsset({ ...INITIAL_ASSETS[0], trangThai: 'Đã thanh lý' }), false);
  assert.equal(canTransferAsset({ ...INITIAL_ASSETS[0], trangThai: 'Đang sửa chữa / bảo trì' }), false);
});
