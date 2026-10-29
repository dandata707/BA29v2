import * as XLSX from 'xlsx';
import { AssetCategory, AssetFormData, Supplier } from '../types/asset.ts';

export interface SampleExcelRow {
  tenTaiSan: string;
  categoryCodeOrName: string;
  soSerial: string;
  tinhTrangBanDau: 'Mới' | 'Tốt' | 'Đã qua sử dụng';
  nguonTaiSan: 'Mua mới tập trung' | 'Điều chuyển đến' | 'Tài trợ / Biếu tặng' | 'Thu hồi tái cấp phát';
  nhaCungCap: string;
  ngayMuaNhan: string;
  nguyenGia: number;
  hanBaoHanh: string;
  soChungTu: string;
  phuKienDiKem: string;
  viTriLuuKho: string;
  ghiChu: string;
}

export const SAMPLE_EXCEL_DATA: SampleExcelRow[] = [
  {
    tenTaiSan: 'Laptop Dell Latitude 5440 i7-1355U / 16GB / 512GB SSD',
    categoryCodeOrName: 'Laptop',
    soSerial: 'SN-DL5440-99214',
    tinhTrangBanDau: 'Mới',
    nguonTaiSan: 'Mua mới tập trung',
    nhaCungCap: 'Công ty Cổ phần Máy tính Trần Anh',
    ngayMuaNhan: '2026-03-15',
    nguyenGia: 24500000,
    hanBaoHanh: '2028-03-15',
    soChungTu: 'HD-2026-00412',
    phuKienDiKem: 'Sạc Type-C 65W, Túi chống sốc Dell, Chuột không dây',
    viTriLuuKho: 'Kho Tổng A – Tầng 2 (Kệ 04)',
    ghiChu: 'Cấu hình tiêu chuẩn cấp phát cho nhân viên khối Công nghệ & Khai thác'
  },
  {
    tenTaiSan: 'Màn hình Dell UltraSharp U2723QE 27 inch 4K IPS',
    categoryCodeOrName: 'Màn hình',
    soSerial: 'CN-0M381K-74261-39A-0012',
    tinhTrangBanDau: 'Mới',
    nguonTaiSan: 'Mua mới tập trung',
    nhaCungCap: 'Công ty TNHH CNTT Phong Vũ',
    ngayMuaNhan: '2026-03-10',
    nguyenGia: 12800000,
    hanBaoHanh: '2029-03-10',
    soChungTu: 'HD-2026-00388',
    phuKienDiKem: 'Cáp DisplayPort, Cáp Type-C, Chân đế xoay 360',
    viTriLuuKho: 'Kho Tổng A – Tầng 2 (Kệ 02)',
    ghiChu: 'Màn hình đồ họa cao cấp chuẩn 4K cho Khối Thiết kế Product'
  },
  {
    tenTaiSan: 'Bàn làm việc Ergonomic nâng hạ chiều cao tự động FlexiSpot E7',
    categoryCodeOrName: 'Nội thất',
    soSerial: '',
    tinhTrangBanDau: 'Mới',
    nguonTaiSan: 'Mua mới tập trung',
    nhaCungCap: 'Công ty Nội thất Văn phòng Hòa Phát',
    ngayMuaNhan: '2026-02-28',
    nguyenGia: 8900000,
    hanBaoHanh: '2028-02-28',
    soChungTu: 'HD-2026-00215',
    phuKienDiKem: 'Bộ điều khiển cảm ứng memorized, Khay quản lý dây cáp',
    viTriLuuKho: 'Kho B3 - Khu vực Nội thất Văn phòng',
    ghiChu: 'Trang bị cho phòng điều hành & trưởng phòng chuyên môn'
  },
  {
    tenTaiSan: 'Máy in đa chức năng HP LaserJet Pro MFP M428fdw',
    categoryCodeOrName: 'Máy in',
    soSerial: 'VNB3K89124',
    tinhTrangBanDau: 'Mới',
    nguonTaiSan: 'Mua mới tập trung',
    nhaCungCap: 'Công ty Cổ phần Máy tính Trần Anh',
    ngayMuaNhan: '2026-03-01',
    nguyenGia: 11500000,
    hanBaoHanh: '2027-03-01',
    soChungTu: 'HD-2026-00299',
    phuKienDiKem: 'Hộp mực HP 76A gốc, Dây nguồn, Cáp USB 2.0 High-Speed',
    viTriLuuKho: 'Kho Tổng A – Tầng 1 (Kệ 01)',
    ghiChu: 'Máy in laser đen trắng In/Scan/Copy/Fax mạng LAN/Wifi'
  }
];

export function mapExcelRowToFormData(
  row: Partial<SampleExcelRow> & Record<string, any>,
  categories: AssetCategory[],
  suppliers: Supplier[]
): AssetFormData {
  const todayStr = new Date().toISOString().split('T')[0];

  // Try to match category by name or code
  const catInput = String(row.categoryCodeOrName || row['Danh mục'] || row['Category'] || '').trim().toLowerCase();
  let matchedCat = categories.find(
    (c) => c.name.toLowerCase() === catInput || c.code.toLowerCase() === catInput
  );
  if (!matchedCat && catInput) {
    matchedCat = categories.find(
      (c) => c.name.toLowerCase().includes(catInput) || catInput.includes(c.name.toLowerCase())
    );
  }

  // Try to match supplier
  const supplierInput = String(row.nhaCungCap || row['Nhà cung cấp'] || row['Supplier'] || '').trim().toLowerCase();
  let matchedSupplier = suppliers.find((s) => s.name.toLowerCase().includes(supplierInput));

  const priceVal = row.nguyenGia ?? row['Nguyên giá'] ?? row['Price'] ?? 0;

  return {
    categoryId: matchedCat ? matchedCat.id : categories.length > 0 ? categories[0].id : '',
    tenTaiSan: String(row.tenTaiSan || row['Tên tài sản'] || row['Asset Name'] || '').trim(),
    soSerial: String(row.soSerial || row['Số Serial'] || row['Serial'] || '').trim(),
    tinhTrangBanDau: (row.tinhTrangBanDau || row['Tình trạng'] || 'Mới') as any,
    nguonTaiSan: (row.nguonTaiSan || row['Nguồn tài sản'] || 'Mua mới tập trung') as any,
    nhaCungCapId: matchedSupplier ? matchedSupplier.id : '',
    nhaCungCapTen: matchedSupplier ? matchedSupplier.name : supplierInput ? String(supplierInput) : '',
    ngayMuaNhan: String(row.ngayMuaNhan || row['Ngày mua'] || todayStr).trim(),
    nguyenGia: String(priceVal),
    hanBaoHanh: String(row.hanBaoHanh || row['Hạn bảo hành'] || '').trim(),
    soChungTu: String(row.soChungTu || row['Số chứng từ'] || '').trim(),
    phuKienDiKem: String(row.phuKienDiKem || row['Phụ kiện'] || '').trim(),
    viTriLuuKho: String(row.viTriLuuKho || row['Vị trí kho'] || 'Kho Tổng A – Tầng 2 (Kệ 04)').trim(),
    ghiChu: String(row.ghiChu || row['Ghi chú'] || '').trim(),
  };
}

export function parseExcelFile(
  buffer: ArrayBuffer,
  categories: AssetCategory[],
  suppliers: Supplier[]
): { success: boolean; rows: AssetFormData[]; errorMessage?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { success: false, rows: [], errorMessage: 'File Excel không có sheet dữ liệu.' };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!rawData || rawData.length === 0) {
      return { success: false, rows: [], errorMessage: 'Không có dữ liệu trong sheet Excel.' };
    }

    const mappedRows: AssetFormData[] = rawData.map((item) =>
      mapExcelRowToFormData(item, categories, suppliers)
    );

    return { success: true, rows: mappedRows };
  } catch (err: any) {
    return {
      success: false,
      rows: [],
      errorMessage: `Lỗi đọc file Excel: ${err.message || 'Định dạng không hợp lệ'}`,
    };
  }
}

export function downloadExcelTemplate() {
  const templateData = [
    {
      'Tên tài sản (*)': 'Laptop Dell Latitude 5440 i7-1355U',
      'Danh mục (*)': 'Laptop',
      'Số Serial': 'SN-DL5440-99214',
      'Tình trạng': 'Mới',
      'Nguồn tài sản': 'Mua mới tập trung',
      'Nhà cung cấp': 'Công ty Cổ phần Máy tính Trần Anh',
      'Ngày mua (*)': '2026-03-15',
      'Nguyên giá (*)': 24500000,
      'Hạn bảo hành': '2028-03-15',
      'Số chứng từ': 'HD-2026-00412',
      'Phụ kiện': 'Sạc 65W, Túi chống sốc, Chuột không dây',
      'Vị trí kho': 'Kho Tổng A – Tầng 2 (Kệ 04)',
      'Ghi chú': 'Ghi nhận theo HĐ 00412',
    },
    {
      'Tên tài sản (*)': 'Màn hình Dell UltraSharp U2723QE 27 inch 4K',
      'Danh mục (*)': 'Màn hình',
      'Số Serial': 'CN-0M381K-74261',
      'Tình trạng': 'Mới',
      'Nguồn tài sản': 'Mua mới tập trung',
      'Nhà cung cấp': 'Công ty TNHH CNTT Phong Vũ',
      'Ngày mua (*)': '2026-03-10',
      'Nguyên giá (*)': 12800000,
      'Hạn bảo hành': '2029-03-10',
      'Số chứng từ': 'HD-2026-00388',
      'Phụ kiện': 'Cáp DP, Cáp Type-C, Chân đế',
      'Vị trí kho': 'Kho Tổng A – Tầng 2 (Kệ 02)',
      'Ghi chú': 'Màn hình 4K cho Khối Thiết kế',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Tai_San');

  XLSX.writeFile(wb, 'File_Mau_Nhap_Tai_San_QLTS.xlsx');
}
