export type AssetCondition = 'Mới' | 'Tốt' | 'Đã qua sử dụng';

export type AssetOrigin =
  | 'Mua mới tập trung'
  | 'Điều chuyển đến'
  | 'Tài trợ / Biếu tặng'
  | 'Thu hồi tái cấp phát';

export type AssetStatus =
  | 'Chưa cấp phát'
  | 'Đang sử dụng'
  | 'Đang sửa chữa / bảo trì'
  | 'Đã thanh lý'
  | 'Đã xóa';

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  isITorElectronic: boolean;
  defaultUsefulLifeMonths: number;
}

export interface Supplier {
  id: string;
  name: string;
  taxCode: string;
}

export interface AuditLog {
  id: string;
  assetId: string;
  timestamp: string;
  operatorName: string;
  operatorRole: string;
  actionType: string;
  details: string;
}

export interface Asset {
  id: string;
  maTaiSan: string;
  tenTaiSan: string;
  donViTinh?: string;
  categoryId: string;
  categoryName: string;
  isITorElectronic: boolean;
  soSerial?: string;
  tinhTrangBanDau: AssetCondition;
  nguonTaiSan: AssetOrigin;
  nhaCungCapId?: string;
  nhaCungCapTen?: string;
  ngayMuaNhan: string;
  nguyenGia: number;
  hanBaoHanh?: string;
  soChungTu?: string;
  phuKienDiKem?: string;
  viTriLuuKho?: string;
  donViQuanLy?: string;
  nguoiSuDungId?: string;
  nguoiSuDungTen?: string;
  ghiChu?: string;
  trangThai: AssetStatus;
  isDeleted: boolean;
  lyDoXoa?: string;
  ngayXoa?: string;
  nguoiXoa?: string;
  nguoiGhiNhan: string;
  ngayGhiNhan: string;
  nguoiCapNhat?: string;
  ngayCapNhat?: string;
  phienBan: number;
  soLanInQR: number;
  hasTransactionHistory?: boolean;
  lichSu?: AuditLog[];
}

export interface AssetFormData {
  categoryId: string;
  tenTaiSan: string;
  soSerial: string;
  tinhTrangBanDau: AssetCondition;
  nguonTaiSan: AssetOrigin;
  nhaCungCapId: string;
  nhaCungCapTen: string;
  ngayMuaNhan: string;
  nguyenGia: string;
  hanBaoHanh: string;
  soChungTu: string;
  phuKienDiKem: string;
  viTriLuuKho: string;
  ghiChu: string;
}

export type QRLabelSize = '50x30' | '70x40' | 'A4_24';
