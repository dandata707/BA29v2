import type { ViewType } from '../features/asset-return/context/AppContext';
import type { ScreenType } from '../features/asset-liquidation/context/AssetContext';
import { getLiquidationNavItems } from '../features/asset-liquidation/navigation';
import type { UserRole } from '../types';

export interface BreadcrumbItem { label: string; onClick?: () => void }

export function assetBreadcrumbs(mode: string, code: string | undefined, onList: () => void): BreadcrumbItem[] {
  return [{ label: 'Danh sách tài sản', onClick: onList }, ...(mode === 'list' ? [] : [{ label:
    mode === 'create' ? 'Thêm mới tài sản' : mode === 'success' ? 'Tạo tài sản thành công' : `Chỉnh sửa ${code || 'tài sản'}`,
  }])];
}

export function allocationBreadcrumbs(mode: string, code: string | undefined, onList: () => void): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Cấp phát tài sản', onClick: onList }, { label: 'Yêu cầu cấp phát', onClick: onList }];
  if (mode === 'create') items.push({ label: 'Tạo phiếu yêu cầu' });
  if (mode === 'edit') items.push({ label: code ? `Chỉnh sửa ${code}` : 'Chỉnh sửa phiếu yêu cầu' });
  if (mode === 'detail' || mode === 'view') items.push({ label: code ? `Chi tiết ${code}` : 'Chi tiết phiếu yêu cầu' });
  return items;
}

export function handoverBreadcrumbs(code: string | undefined, onList?: () => void, onAllocation?: () => void, mode = code ? 'detail' : onList ? 'create' : 'list'): BreadcrumbItem[] {
  return [{ label: 'Cấp phát tài sản', onClick: onAllocation }, { label: 'Bàn giao tài sản', onClick: onList },
    { label: mode === 'create' ? 'Tạo biên bản bàn giao' : mode === 'edit' ? `Chỉnh sửa ${code || 'biên bản'}` : code ? `Chi tiết ${code}` : 'Danh sách biên bản' }];
}

export function returnBreadcrumbs(view: ViewType, recordCode: string | undefined, onRecords: () => void): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Thu hồi tài sản', onClick: onRecords }];
  if (view === 'asset_inventory') return [...items, { label: 'Tài sản thu hồi' }];
  if (view === 'employee_confirm') return [...items, { label: 'Xác nhận bàn giao' }, ...(recordCode ? [{ label: recordCode }] : [])];
  items.push({ label: 'Biên bản thu hồi', onClick: onRecords });
  if (view === 'create') items.push({ label: 'Tạo biên bản thu hồi' });
  if (view === 'detail') items.push({ label: recordCode ? `Chi tiết ${recordCode}` : 'Chi tiết biên bản' });
  return items;
}

export function liquidationBreadcrumbs(screen: ScreenType, role: UserRole, navigate: (screen: ScreenType) => void, defaultView: ScreenType, code?: string, editing = false): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Thanh lý tài sản', onClick: () => navigate(defaultView) }];
  if (screen === 'OVERVIEW') return [...items, { label: 'Hướng dẫn quy trình' }];
  const parent = getLiquidationNavItems(role).find(item => item.active.includes(screen));
  if (parent) items.push({ label: parent.label, onClick: () => navigate(parent.screen) });
  if (screen === 'PROPOSAL_CREATE') items.push({ label: editing ? `Chỉnh sửa đề nghị${code ? ` ${code}` : ''}` : 'Tạo đề nghị thanh lý' });
  if (screen === 'INSPECTION_DETAIL') items.push({ label: code ? `Thẩm định ${code}` : 'Chi tiết thẩm định' });
  if (screen === 'SUBMISSION_CREATE') items.push({ label: 'Tạo tờ trình thanh lý' });
  return items;
}
