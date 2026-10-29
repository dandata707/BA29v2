import { INITIAL_ASSETS } from './mockData';
import { Asset } from '../types/asset';
import { useSyncExternalStore } from 'react';

export function loadAssetCatalog(): Asset[] {
  try {
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem('qlts_assets_v2');
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) ? parsed : INITIAL_ASSETS;
  } catch {
    return INITIAL_ASSETS;
  }
}

let snapshot: Asset[] | undefined;
const listeners = new Set<() => void>();
function getSnapshot() { return snapshot ??= loadAssetCatalog(); }
export function updateAssetCatalog(update: Asset[] | ((assets: Asset[]) => Asset[])) {
  const next = typeof update === 'function' ? update(getSnapshot()) : update;
  // Persist before publishing so a failed write cannot report a successful transfer.
  if (typeof localStorage !== 'undefined') localStorage.setItem('qlts_assets_v2', JSON.stringify(next));
  snapshot = next;
  listeners.forEach(listener => listener());
}
export function useAssetCatalog() {
  const assets = useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, getSnapshot, getSnapshot);
  return [assets, updateAssetCatalog] as const;
}
