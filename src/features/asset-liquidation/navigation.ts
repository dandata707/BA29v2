import type { UserRole } from '../../types';
import type { ScreenType } from './context/AssetContext';
import { canOpenScreen, liquidationRole } from './permissions';

const items: { screen: ScreenType; label: string; active: ScreenType[] }[] = [
  { screen: 'PROPOSALS', label: 'Đề nghị thanh lý', active: ['PROPOSALS', 'PROPOSAL_CREATE'] },
  { screen: 'INSPECTIONS', label: 'Tiếp nhận & thẩm định', active: ['INSPECTIONS', 'INSPECTION_DETAIL'] },
  { screen: 'QUALIFIED_PROPOSALS', label: 'Lập tờ trình', active: ['QUALIFIED_PROPOSALS', 'SUBMISSION_CREATE'] },
  { screen: 'NVQLTS_SUBMISSIONS', label: 'Theo dõi tờ trình', active: ['NVQLTS_SUBMISSIONS'] },
  { screen: 'SUBMISSION_LIST', label: 'Phê duyệt tờ trình', active: ['SUBMISSION_LIST'] },
  { screen: 'EXECUTIONS', label: 'Thực hiện thanh lý', active: ['EXECUTIONS'] },
  { screen: 'DOSSIERS', label: 'Đóng & lưu hồ sơ', active: ['DOSSIERS'] },
];

export function getLiquidationNavItems(role: UserRole) {
  return items.filter(item => canOpenScreen(liquidationRole(role), item.screen));
}
