import { UserProfile } from '../../types';
import { Asset as CatalogAsset } from '../../types/asset';
import { Asset, TransferRequest } from './types/transfer';

export const canViewRequest = (user: UserProfile, request: TransferRequest) =>
  user.role === 'asset_manager' || (user.role === 'employee' &&
    (request.requesterId === user.id || request.recipientEmployeeId === user.id));
export const canTransferAsset = (asset: CatalogAsset) => !asset.isDeleted &&
  ['Chưa cấp phát', 'Đang sử dụng'].includes(asset.trangThai);
export function toTransferAsset(asset: CatalogAsset): Asset {
  return {
    id: asset.id, id_tai_san: asset.id, ma_tai_san: asset.maTaiSan,
    name: asset.tenTaiSan, ten_tai_san: asset.tenTaiSan, ma_loai: asset.categoryId,
    serialNumber: asset.soSerial || asset.maTaiSan, so_seri: asset.soSerial || '',
    nguon_goc: asset.nguonTaiSan, ngay_nhap: asset.ngayMuaNhan,
    nguyen_gia_vnd: String(asset.nguyenGia), originalPrice: asset.nguyenGia,
    tinh_trang: asset.tinhTrangBanDau, trang_thai: asset.trangThai, status: asset.trangThai,
    currentLocation: asset.viTriLuuKho || asset.donViQuanLy || '', vi_tri: asset.viTriLuuKho || '',
    currentDepartment: asset.donViQuanLy || '', ma_bo_phan_su_dung: asset.donViQuanLy || '',
    ma_nguoi_su_dung: asset.nguoiSuDungId, ma_nguoi_quan_ly: asset.nguoiSuDungId,
    custodianName: asset.nguoiSuDungTen || '', custodianCode: asset.nguoiSuDungId || '',
    specs: [asset.categoryName, asset.ghiChu || ''].filter(Boolean), imageUrl: '',
    defaultAccessories: asset.phuKienDiKem || '', category: asset.categoryName,
    so_chung_tu: asset.soChungTu, thong_tin_bo_sung: asset.ghiChu,
  };
}
export function transferredAsset(asset: CatalogAsset, request: TransferRequest, user: UserProfile, documentId: string): CatalogAsset {
  const timestamp = new Date().toISOString();
  return { ...asset, viTriLuuKho: request.destinationLocation, donViQuanLy: request.recipientDept,
    nguoiSuDungId: request.recipientEmployeeId, nguoiSuDungTen: request.recipientName,
    trangThai: 'Đang sử dụng', hasTransactionHistory: true, phienBan: asset.phienBan + 1,
    nguoiCapNhat: user.name, ngayCapNhat: timestamp,
    lichSu: [...(asset.lichSu || []), { id: crypto.randomUUID(), assetId: asset.id, timestamp,
      operatorName: user.name, operatorRole: user.roleTitle, actionType: 'Điều chuyển tài sản',
      details: `${request.id} / ${documentId}: ${request.currentLocation} → ${request.destinationLocation}; người nhận: ${request.recipientName}` }],
  };
}
