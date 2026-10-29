import { Asset, ReturnRecord, ReturnRecordItem } from './types/asset';

export function employeeCanView(record: ReturnRecord, employeeId: string) {
  return record.employeeId === employeeId && record.status !== 'draft';
}

export function matchesAssetCode(item: ReturnRecordItem, input: string) {
  const code = input.trim().toUpperCase();
  return code !== '' && (item.assetId.toUpperCase() === code || item.serial.toUpperCase() === code);
}

export function itemIsProcessed(item: ReturnRecordItem) {
  if (item.isLost) return Boolean(item.lostReason?.trim());
  return Boolean(item.scanned && item.physicalCondition && item.operatingStatus &&
    (item.operatingStatus !== 'Khác' || item.operatingStatusOtherNote?.trim()));
}

export function validateSelectedAssets(assets: Asset[], ids: string[], employeeId: string) {
  return ids.length > 0 && new Set(ids).size === ids.length &&
    ids.every(id => assets.some(asset => asset.id === id && asset.currentUserId === employeeId && asset.status === 'in_use'));
}
