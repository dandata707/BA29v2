import { UserProfile as AppUser } from '../../types';
import { UserRole } from './types/asset';
import type { ScreenType } from './context/AssetContext';

export function liquidationRole(role: AppUser['role']): UserRole {
  return role === 'director' ? 'GIAM_DOC' : role === 'asset_manager' ? 'NVQLTS' : 'BPSDTS';
}

export const ROLE_SCREENS: Record<UserRole, ScreenType[]> = {
  BPSDTS: ['PROPOSALS', 'PROPOSAL_CREATE'],
  NVQLTS: ['INSPECTIONS', 'INSPECTION_DETAIL', 'QUALIFIED_PROPOSALS', 'SUBMISSION_CREATE', 'NVQLTS_SUBMISSIONS', 'EXECUTIONS', 'DOSSIERS'],
  GIAM_DOC: ['SUBMISSION_LIST'],
};

export function canOpenScreen(role: UserRole, screen: ScreenType) {
  return screen === 'OVERVIEW' || ROLE_SCREENS[role].includes(screen);
}

export function defaultScreen(role: UserRole) {
  return ROLE_SCREENS[role][0];
}
