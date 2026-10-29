import { HandoverItem } from '../types';
import { Asset } from '../types/asset';

export const isAvailableCatalogAsset = (asset: Asset) => !asset.isDeleted && !['Đã xóa', 'Đã thanh lý'].includes(asset.trangThai);

export function blankHandoverItem(id: string): HandoverItem {
  return { id, name: '', category: '', unit: '', quantity: 0, unitPrice: 0, totalPrice: 0, notes: '' };
}

export function selectHandoverCategory(item: HandoverItem, categoryId: string, categories: { id: string; name: string }[]): HandoverItem {
  const category = categories.find(entry => entry.id === categoryId);
  return { ...blankHandoverItem(item.id), categoryId: category?.id, category: category?.name || '' };
}

export function selectHandoverAsset(item: HandoverItem, assetId: string, catalog: Asset[]): HandoverItem {
  if (!item.categoryId) return item;
  const asset = catalog.find(entry => entry.id === assetId && entry.categoryId === item.categoryId && isAvailableCatalogAsset(entry));
  if (!asset || !Number.isFinite(asset.nguyenGia) || asset.nguyenGia < 0) return { ...blankHandoverItem(item.id), categoryId: item.categoryId, category: item.category };
  return { ...item, assetId: asset.id, name: asset.tenTaiSan, unit: asset.donViTinh?.trim() || 'Chiếc', quantity: 1, unitPrice: asset.nguyenGia, totalPrice: asset.nguyenGia, notes: asset.ghiChu || '' };
}

export function updateHandoverQuantity(item: HandoverItem, input: string): HandoverItem {
  const value = Number(input);
  const quantity = Number.isSafeInteger(value) && value > 0 ? value : 0;
  return { ...item, quantity, totalPrice: quantity * item.unitPrice };
}

export function validateHandoverItems(items: HandoverItem[]): string | null {
  if (!items.length) return 'Vui lòng thêm ít nhất một tài sản bàn giao.';
  const incomplete = items.findIndex(item => !item.category.trim() || !item.name.trim() || !item.unit.trim() || !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0 || !Number.isFinite(item.totalPrice) || item.totalPrice !== item.quantity * item.unitPrice);
  return incomplete < 0 ? null : `Dòng ${incomplete + 1}: vui lòng chọn loại tài sản, tên tài sản và nhập số lượng hợp lệ trước khi gửi.`;
}
