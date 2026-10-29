import React, { createContext, useContext } from 'react';
import { UserProfile } from '../types';

interface WorkspaceNavigation {
  user: UserProfile;
  navigate: (tab: string) => void;
  home: () => void;
  openMobileMenu: () => void;
  openRoleSwitcher: () => void;
}

export const WorkspaceNavigationContext = createContext<WorkspaceNavigation | null>(null);
export const useWorkspaceNavigation = () => useContext(WorkspaceNavigationContext);
