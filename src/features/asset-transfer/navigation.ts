import type { AppView } from './context/TransferContext';
import type { UserRole } from '../../types';
export function getTransferNavItems(role: UserRole): { label: string; view: AppView; active: AppView[] }[] {
  if (role === 'director') return [];
  const items: { label: string; view: AppView; active: AppView[] }[] = [
    { label: 'Yêu cầu điều chuyển', view: 'list', active: ['list', 'create', 'review', 'handover-create', 'handover-confirm'] },
  ];
  if (role === 'asset_manager') items.push(
    { label: 'Sổ theo dõi tài sản', view: 'asset-catalog', active: ['asset-catalog'] },
    { label: 'Báo cáo điều chuyển', view: 'reports', active: ['reports'] },
  );
  return items;
}
