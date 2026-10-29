import { Asset, AssetCategory, AssetFormData } from '../types/asset.ts';

export function parseNumber(valStr: string | number): number {
  if (typeof valStr === 'number') return isNaN(valStr) ? 0 : valStr;
  if (!valStr) return 0;
  // Strip dots, commas, spaces, currency symbols
  const clean = String(valStr).replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function formatVND(value: number | string): string {
  const num = parseNumber(value);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try YYYY-MM-DD
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTimeVN(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
}

export function getRemainingWarrantyMonths(warrantyDateStr?: string): number | null {
  if (!warrantyDateStr) return null;
  try {
    const wDate = new Date(warrantyDateStr);
    if (isNaN(wDate.getTime())) return null;
    const today = new Date();
    if (wDate < today) return 0;
    
    const yearDiff = wDate.getFullYear() - today.getFullYear();
    const monthDiff = wDate.getMonth() - today.getMonth();
    return yearDiff * 12 + monthDiff;
  } catch (e) {
    return null;
  }
}

export function generateAssetCode(catCode: string, year: number, nextIndex: number): string {
  const codePrefix = catCode ? catCode.toUpperCase() : 'GEN';
  const indexStr = String(nextIndex).padStart(5, '0');
  return `TS-${codePrefix}-${year}-${indexStr}`;
}

export function validateDateRange(fromDateStr?: string, toDateStr?: string): { isValid: boolean; errorMessage?: string } {
  if (fromDateStr && toDateStr) {
    if (fromDateStr > toDateStr) {
      return {
        isValid: false,
        errorMessage: 'Từ ngày không được lớn hơn Đến ngày',
      };
    }
  }
  return { isValid: true };
}

export function checkSoftDeleteEligibility(asset: Asset): { canDelete: boolean; errorCode?: string; reason?: string } {
  if (asset.trangThai === 'Đang sử dụng') {
    return {
      canDelete: false,
      errorCode: 'ERR_ASSET_IN_USE',
      reason: 'Tài sản đang được gán sử dụng cho nhân sự/phòng ban.',
    };
  }
  if (asset.trangThai === 'Đang sửa chữa / bảo trì') {
    return {
      canDelete: false,
      errorCode: 'ERR_ASSET_IN_MAINTENANCE',
      reason: 'Tài sản đang trong quá trình bảo trì/sửa chữa.',
    };
  }
  if (asset.hasTransactionHistory) {
    return {
      canDelete: false,
      errorCode: 'ERR_ASSET_HAS_TRANSACTIONS',
      reason: 'Tài sản đã phát sinh lịch sử bàn giao/thu hồi trước đây.',
    };
  }
  return { canDelete: true };
}

export function validateAssetForm(
  formData: AssetFormData,
  selectedCategory?: AssetCategory,
  existingAssets: Asset[] = [],
  currentAssetId?: string
): {
  isValid: boolean;
  errorCount: number;
  errors: Record<string, string>;
  errorsByCategory: { generalInfo: number; originAndValue: number };
} {
  const errors: Record<string, string> = {};
  let generalInfoErrors = 0;
  let originAndValueErrors = 0;

  // 1. Category
  if (!formData.categoryId) {
    errors.categoryId = 'Vui lòng chọn danh mục tài sản';
    generalInfoErrors++;
  }

  // 2. Name
  if (!formData.tenTaiSan || formData.tenTaiSan.trim() === '') {
    errors.tenTaiSan = 'Vui lòng nhập tên tài sản';
    generalInfoErrors++;
  } else if (formData.tenTaiSan.trim().length > 200) {
    errors.tenTaiSan = 'Tên tài sản không được vượt quá 200 ký tự';
    generalInfoErrors++;
  }

  // 3. Serial
  if (selectedCategory?.isITorElectronic) {
    if (!formData.soSerial || formData.soSerial.trim() === '') {
      errors.soSerial = 'Số serial là bắt buộc đối với thiết bị CNTT & Điện tử';
      generalInfoErrors++;
    }
  }

  // Serial uniqueness among non-deleted assets
  if (formData.soSerial && formData.soSerial.trim() !== '') {
    const cleanSerial = formData.soSerial.trim().toLowerCase();
    const duplicate = existingAssets.find(
      (a) =>
        !a.isDeleted &&
        a.id !== currentAssetId &&
        a.soSerial &&
        a.soSerial.trim().toLowerCase() === cleanSerial
    );
    if (duplicate) {
      errors.soSerial = `Số serial đã tồn tại trên tài sản ${duplicate.maTaiSan} (${duplicate.tenTaiSan})`;
      generalInfoErrors++;
    }
  }

  // 4. Initial Condition
  if (!formData.tinhTrangBanDau) {
    errors.tinhTrangBanDau = 'Vui lòng chọn tình trạng ban đầu';
    generalInfoErrors++;
  }

  // 5. Origin
  if (!formData.nguonTaiSan) {
    errors.nguonTaiSan = 'Vui lòng chọn nguồn tài sản';
    originAndValueErrors++;
  }

  // 6. Purchase Date
  const todayStr = new Date().toISOString().split('T')[0];
  if (!formData.ngayMuaNhan) {
    errors.ngayMuaNhan = 'Vui lòng chọn ngày mua/nhận tài sản';
    originAndValueErrors++;
  } else if (formData.ngayMuaNhan > todayStr) {
    errors.ngayMuaNhan = 'Ngày mua/nhận không được lớn hơn ngày hiện tại';
    originAndValueErrors++;
  }

  // 7. Original Price
  if (formData.nguyenGia === '' || formData.nguyenGia === undefined || formData.nguyenGia === null) {
    errors.nguyenGia = 'Vui lòng nhập nguyên giá tài sản';
    originAndValueErrors++;
  } else {
    const numPrice = parseNumber(formData.nguyenGia);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.nguyenGia = 'Nguyên giá phải là số hợp lệ lớn hơn hoặc bằng 0';
      originAndValueErrors++;
    }
  }

  // 8. Warranty
  if (formData.hanBaoHanh && formData.ngayMuaNhan) {
    if (formData.hanBaoHanh < formData.ngayMuaNhan) {
      errors.hanBaoHanh = 'Hạn bảo hành không được nhỏ hơn ngày mua/nhận';
      originAndValueErrors++;
    }
  }

  const errorCount = Object.keys(errors).length;
  return {
    isValid: errorCount === 0,
    errorCount,
    errors,
    errorsByCategory: {
      generalInfo: generalInfoErrors,
      originAndValue: originAndValueErrors,
    },
  };
}
