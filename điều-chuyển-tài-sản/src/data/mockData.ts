import {
  Asset,
  Department,
  Employee,
  HandoverDocument,
  NotificationItem,
  TransferAuditLog,
  TransferRequest,
  UserPersona,
} from '../types/transfer';

// 1. DANH MỤC ĐƠN VỊ / PHÒNG BAN (10 ĐƠN VỊ)
export const RAW_DEPARTMENTS: Department[] = [
  { id_don_vi: 'DV001', ma_don_vi: 'CTY', ten_don_vi: 'Công ty TNHH Thương mại Dịch vụ An Phúc', ma_don_vi_cha: '', ma_truong_don_vi: 'NV001' },
  { id_don_vi: 'DV002', ma_don_vi: 'BGD', ten_don_vi: 'Ban Giám đốc', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV002' },
  { id_don_vi: 'DV003', ma_don_vi: 'HCNS', ten_don_vi: 'Phòng Hành chính Nhân sự', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV003' },
  { id_don_vi: 'DV004', ma_don_vi: 'TCKT', ten_don_vi: 'Phòng Tài chính Kế toán', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV004' },
  { id_don_vi: 'DV005', ma_don_vi: 'KD', ten_don_vi: 'Phòng Kinh doanh', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV005' },
  { id_don_vi: 'DV006', ma_don_vi: 'DVKH', ten_don_vi: 'Phòng Dịch vụ Khách hàng', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV006' },
  { id_don_vi: 'DV007', ma_don_vi: 'CNTT', ten_don_vi: 'Phòng Công nghệ Thông tin', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV007' },
  { id_don_vi: 'DV008', ma_don_vi: 'KHO', ten_don_vi: 'Bộ phận Kho và Giao nhận', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV008' },
  { id_don_vi: 'DV009', ma_don_vi: 'CNHCM', ten_don_vi: 'Chi nhánh TP. Hồ Chí Minh', ma_don_vi_cha: 'CTY', ma_truong_don_vi: 'NV009' },
  { id_don_vi: 'DV010', ma_don_vi: 'DA01', ten_don_vi: 'Tổ Dự án Triển khai 01', ma_don_vi_cha: 'DVKH', ma_truong_don_vi: '' },
];

export const DEPARTMENT_MAP: Record<string, string> = {
  CTY: 'Công ty TNHH Thương mại Dịch vụ An Phúc',
  BGD: 'Ban Giám đốc',
  HCNS: 'Phòng Hành chính Nhân sự',
  TCKT: 'Phòng Tài chính Kế toán',
  KD: 'Phòng Kinh doanh',
  DVKH: 'Phòng Dịch vụ Khách hàng',
  CNTT: 'Phòng Công nghệ Thông tin',
  KHO: 'Bộ phận Kho và Giao nhận',
  CNHCM: 'Chi nhánh TP. Hồ Chí Minh',
  DA01: 'Tổ Dự án Triển khai 01',
};

// 2. DANH MỤC NHÂN VIÊN (40 NHÂN SỰ)
export const RAW_EMPLOYEES: Employee[] = [
  { id_nhan_vien: 'EMP001', ma_nhan_vien: 'NV001', ho_ten: 'Nguyễn Minh Anh', ma_phong_ban: 'CTY', chuc_danh_chuc_vu: 'Tổng Giám đốc', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv001@anphuc.example.com' },
  { id_nhan_vien: 'EMP002', ma_nhan_vien: 'NV002', ho_ten: 'Trần Quốc Huy', ma_phong_ban: 'BGD', chuc_danh_chuc_vu: 'Phó Giám đốc', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv002@anphuc.example.com' },
  { id_nhan_vien: 'EMP003', ma_nhan_vien: 'NV003', ho_ten: 'Lê Thu Hà', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv003@anphuc.example.com' },
  { id_nhan_vien: 'EMP004', ma_nhan_vien: 'NV004', ho_ten: 'Phạm Ngọc Lan', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv004@anphuc.example.com' },
  { id_nhan_vien: 'EMP005', ma_nhan_vien: 'NV005', ho_ten: 'Hoàng Đức Long', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv005@anphuc.example.com' },
  { id_nhan_vien: 'EMP006', ma_nhan_vien: 'NV006', ho_ten: 'Vũ Thanh Hương', ma_phong_ban: 'DVKH', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv006@anphuc.example.com' },
  { id_nhan_vien: 'EMP007', ma_nhan_vien: 'NV007', ho_ten: 'Đặng Minh Tuấn', ma_phong_ban: 'CNTT', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv007@anphuc.example.com' },
  { id_nhan_vien: 'EMP008', ma_nhan_vien: 'NV008', ho_ten: 'Bùi Văn Thành', ma_phong_ban: 'KHO', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv008@anphuc.example.com' },
  { id_nhan_vien: 'EMP009', ma_nhan_vien: 'NV009', ho_ten: 'Đỗ Khánh Linh', ma_phong_ban: 'CNHCM', chuc_danh_chuc_vu: 'Trưởng đơn vị', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/1/2022', email: 'nv009@anphuc.example.com' },
  { id_nhan_vien: 'EMP010', ma_nhan_vien: 'NV010', ho_ten: 'Nguyễn Hoài Nam', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Chuyên viên Hành chính', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '1/5/2023', email: 'nv010@anphuc.example.com' },
  { id_nhan_vien: 'EMP011', ma_nhan_vien: 'NV011', ho_ten: 'Trần Thị Mai', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Kế toán viên', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '2/5/2024', email: 'nv011@anphuc.example.com' },
  { id_nhan_vien: 'EMP012', ma_nhan_vien: 'NV012', ho_ten: 'Lê Quang Vinh', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Chuyên viên Kinh doanh', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/5/2025', email: 'nv012@anphuc.example.com' },
  { id_nhan_vien: 'EMP013', ma_nhan_vien: 'NV013', ho_ten: 'Phạm Hải Yến', ma_phong_ban: 'DVKH', chuc_danh_chuc_vu: 'Chuyên viên Chăm sóc Khách hàng', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '4/5/2023', email: 'nv013@anphuc.example.com' },
  { id_nhan_vien: 'EMP014', ma_nhan_vien: 'NV014', ho_ten: 'Hoàng Anh Dũng', ma_phong_ban: 'CNTT', chuc_danh_chuc_vu: 'Kỹ thuật viên CNTT', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '5/5/2024', email: 'nv014@anphuc.example.com' },
  { id_nhan_vien: 'EMP015', ma_nhan_vien: 'NV015', ho_ten: 'Vũ Ngọc Ánh', ma_phong_ban: 'KHO', chuc_danh_chuc_vu: 'Nhân viên Kho', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '6/5/2025', email: 'nv015@anphuc.example.com' },
  { id_nhan_vien: 'EMP016', ma_nhan_vien: 'NV016', ho_ten: 'Đặng Thùy Trang', ma_phong_ban: 'CNHCM', chuc_danh_chuc_vu: 'Chuyên viên Dịch vụ', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '7/5/2023', email: 'nv016@anphuc.example.com' },
  { id_nhan_vien: 'EMP017', ma_nhan_vien: 'NV017', ho_ten: 'Bùi Đức Hải', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Chuyên viên Hành chính', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '8/5/2024', email: 'nv017@anphuc.example.com' },
  { id_nhan_vien: 'EMP018', ma_nhan_vien: 'NV018', ho_ten: 'Đỗ Minh Châu', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Kế toán viên', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '9/5/2025', email: 'nv018@anphuc.example.com' },
  { id_nhan_vien: 'EMP019', ma_nhan_vien: 'NV019', ho_ten: 'Nguyễn Văn Phúc', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Chuyên viên Kinh doanh', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '1/5/2023', email: 'nv019@anphuc.example.com' },
  { id_nhan_vien: 'EMP020', ma_nhan_vien: 'NV020', ho_ten: 'Trần Gia Bảo', ma_phong_ban: 'DVKH', chuc_danh_chuc_vu: 'Chuyên viên Chăm sóc Khách hàng', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '2/5/2024', email: 'nv020@anphuc.example.com' },
  { id_nhan_vien: 'EMP021', ma_nhan_vien: 'NV021', ho_ten: 'Lê Bảo Ngọc', ma_phong_ban: 'CNTT', chuc_danh_chuc_vu: 'Kỹ thuật viên CNTT', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/5/2025', email: 'nv021@anphuc.example.com' },
  { id_nhan_vien: 'EMP022', ma_nhan_vien: 'NV022', ho_ten: 'Phạm Thành Đạt', ma_phong_ban: 'KHO', chuc_danh_chuc_vu: 'Nhân viên Kho', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '4/5/2023', email: 'nv022@anphuc.example.com' },
  { id_nhan_vien: 'EMP023', ma_nhan_vien: 'NV023', ho_ten: 'Hoàng Thị Hạnh', ma_phong_ban: 'CNHCM', chuc_danh_chuc_vu: 'Chuyên viên Dịch vụ', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '5/5/2024', email: 'nv023@anphuc.example.com' },
  { id_nhan_vien: 'EMP024', ma_nhan_vien: 'NV024', ho_ten: 'Vũ Trung Kiên', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Chuyên viên Hành chính', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '6/5/2025', email: 'nv024@anphuc.example.com' },
  { id_nhan_vien: 'EMP025', ma_nhan_vien: 'NV025', ho_ten: 'Đặng Phương Thảo', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Kế toán viên', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '7/5/2023', email: 'nv025@anphuc.example.com' },
  { id_nhan_vien: 'EMP026', ma_nhan_vien: 'NV026', ho_ten: 'Bùi Tuấn Anh', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Chuyên viên Kinh doanh', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '8/5/2024', email: 'nv026@anphuc.example.com' },
  { id_nhan_vien: 'EMP027', ma_nhan_vien: 'NV027', ho_ten: 'Đỗ Mỹ Duyên', ma_phong_ban: 'DVKH', chuc_danh_chuc_vu: 'Chuyên viên Chăm sóc Khách hàng', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '9/5/2025', email: 'nv027@anphuc.example.com' },
  { id_nhan_vien: 'EMP028', ma_nhan_vien: 'NV028', ho_ten: 'Nguyễn Hữu Nghĩa', ma_phong_ban: 'CNTT', chuc_danh_chuc_vu: 'Kỹ thuật viên CNTT', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '1/5/2023', email: 'nv028@anphuc.example.com' },
  { id_nhan_vien: 'EMP029', ma_nhan_vien: 'NV029', ho_ten: 'Trần Thanh Tâm', ma_phong_ban: 'KHO', chuc_danh_chuc_vu: 'Nhân viên Kho', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '2/5/2024', email: 'nv029@anphuc.example.com' },
  { id_nhan_vien: 'EMP030', ma_nhan_vien: 'NV030', ho_ten: 'Lê Minh Khoa', ma_phong_ban: 'CNHCM', chuc_danh_chuc_vu: 'Chuyên viên Dịch vụ', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '3/5/2025', email: 'nv030@anphuc.example.com' },
  { id_nhan_vien: 'EMP031', ma_nhan_vien: 'NV031', ho_ten: 'Phạm Thị Trâm', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Chuyên viên Hành chính', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '4/5/2023', email: 'nv031@anphuc.example.com' },
  { id_nhan_vien: 'EMP032', ma_nhan_vien: 'NV032', ho_ten: 'Hoàng Quốc Bảo', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Kế toán viên', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '5/5/2024', email: 'nv032@anphuc.example.com' },
  { id_nhan_vien: 'EMP033', ma_nhan_vien: 'NV033', ho_ten: 'Vũ Kim Oanh', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Chuyên viên Kinh doanh', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '6/5/2025', email: 'nv033@anphuc.example.com' },
  { id_nhan_vien: 'EMP034', ma_nhan_vien: 'NV034', ho_ten: 'Đặng Anh Thư', ma_phong_ban: 'DVKH', chuc_danh_chuc_vu: 'Chuyên viên Chăm sóc Khách hàng', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '7/5/2023', email: 'nv034@anphuc.example.com' },
  { id_nhan_vien: 'EMP035', ma_nhan_vien: 'NV035', ho_ten: 'Bùi Hoàng Sơn', ma_phong_ban: 'CNTT', chuc_danh_chuc_vu: 'Kỹ thuật viên CNTT', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '8/5/2024', email: 'nv035@anphuc.example.com' },
  { id_nhan_vien: 'EMP036', ma_nhan_vien: 'NV036', ho_ten: 'Đỗ Thu Uyên', ma_phong_ban: 'KHO', chuc_danh_chuc_vu: 'Nhân viên Kho', trang_thai_lam_viec: 'Đang làm việc', ngay_bat_dau_lam_viec: '9/5/2025', email: 'nv036@anphuc.example.com' },
  { id_nhan_vien: 'EMP037', ma_nhan_vien: 'NV037', ho_ten: 'Nguyễn Đức Tài', ma_phong_ban: 'CNHCM', chuc_danh_chuc_vu: 'Chuyên viên Dịch vụ', trang_thai_lam_viec: 'Thử việc', ngay_bat_dau_lam_viec: '9/1/2026', email: 'nv037@anphuc.example.com' },
  { id_nhan_vien: 'EMP038', ma_nhan_vien: 'NV038', ho_ten: 'Trần Ngọc Minh', ma_phong_ban: 'HCNS', chuc_danh_chuc_vu: 'Chuyên viên Hành chính', trang_thai_lam_viec: 'Thử việc', ngay_bat_dau_lam_viec: '9/1/2026', email: 'nv038@anphuc.example.com' },
  { id_nhan_vien: 'EMP039', ma_nhan_vien: 'NV039', ho_ten: 'Lê Thảo Nhi', ma_phong_ban: 'TCKT', chuc_danh_chuc_vu: 'Kế toán viên', trang_thai_lam_viec: 'Tạm nghỉ', ngay_bat_dau_lam_viec: '9/1/2026', email: 'nv039@anphuc.example.com' },
  { id_nhan_vien: 'EMP040', ma_nhan_vien: 'NV040', ho_ten: 'Phạm Quang Hưng', ma_phong_ban: 'KD', chuc_danh_chuc_vu: 'Chuyên viên Kinh doanh', trang_thai_lam_viec: 'Đã nghỉ việc', ngay_bat_dau_lam_viec: '9/1/2026', email: 'nv040@anphuc.example.com' },
];

export const EMPLOYEE_MAP: Record<string, Employee> = RAW_EMPLOYEES.reduce(
  (acc, emp) => {
    acc[emp.ma_nhan_vien] = emp;
    return acc;
  },
  {} as Record<string, Employee>
);

// 3. PERSONAS (VAI TRÒ TRẢI NGHIỆM)
export const INITIAL_PERSONAS: UserPersona[] = [
  {
    id: 'NV003',
    name: 'Lê Thu Hà',
    department: 'Phòng Hành chính Nhân sự',
    roleTitle: 'Trưởng đơn vị',
    avatarText: 'LH',
    systemRole: 'admin_hr',
    systemRoleLabel: 'Quản trị viên (HCNS)',
  },
  {
    id: 'NV010',
    name: 'Nguyễn Hoài Nam',
    department: 'Phòng Hành chính Nhân sự',
    roleTitle: 'Chuyên viên Hành chính',
    avatarText: 'HN',
    systemRole: 'requester',
    systemRoleLabel: 'Nhân viên (Người đề nghị)',
  },
  {
    id: 'NV014',
    name: 'Hoàng Anh Dũng',
    department: 'Phòng Công nghệ Thông tin',
    roleTitle: 'Kỹ thuật viên CNTT',
    avatarText: 'AD',
    systemRole: 'requester',
    systemRoleLabel: 'Nhân viên (Người đề nghị/tiếp nhận)',
  },
  {
    id: 'NV011',
    name: 'Trần Thị Mai',
    department: 'Phòng Tài chính Kế toán',
    roleTitle: 'Kế toán viên',
    avatarText: 'TM',
    systemRole: 'requester',
    systemRoleLabel: 'Nhân viên (TCKT)',
  },
];

// Helper to parse currency string (e.g. "24.500.000" -> 24500000)
const parseVnd = (str: string): number => {
  if (!str) return 0;
  const cleaned = str.replace(/\./g, '').replace(/,/g, '').trim();
  return parseInt(cleaned, 10) || 0;
};

// Raw 100 assets from user specification
const RAW_ASSET_ROWS = [
  { id: 'AST00001', code: 'LT-2025-00001', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2025-00001', origin: 'Mua mới', date: '2/2/2025', price: '24.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: 'NV010', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0001', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00002', code: 'LT-2026-00002', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2026-00002', origin: 'Mua mới', date: '3/3/2026', price: '21.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV011', managerCode: 'NV004', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0002', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00003', code: 'LT-2024-00003', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2024-00003', origin: 'Mua mới', date: '4/4/2024', price: '22.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV012', managerCode: 'NV005', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0003', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00004', code: 'PC-2025-00001', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2025-00004', origin: 'Mua mới', date: '5/5/2025', price: '16.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV013', managerCode: 'NV006', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0004', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00005', code: 'MH-2026-00001', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2026-00005', origin: 'Mua mới', date: '6/6/2026', price: '4.200.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV014', managerCode: 'NV007', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0005', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00006', code: 'MH-2024-00002', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2024-00006', origin: 'Mua mới', date: '7/7/2024', price: '2.850.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV015', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0006', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00007', code: 'MIN-2025-00001', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2025-00007', origin: 'Mua mới', date: '8/8/2025', price: '4.300.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: '', managerCode: 'NV009', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2025-0007', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00008', code: 'MCH-2026-00001', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2026-00008', origin: 'Mua mới', date: '9/9/2026', price: '13.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2026-0008', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00009', code: 'DT-2024-00001', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2024-00009', origin: 'Mua mới', date: '1/10/2024', price: '7.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV018', managerCode: 'NV004', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2024-0009', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00010', code: 'NET-2025-00001', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2025-00010', origin: 'Mua mới', date: '2/11/2025', price: '2.400.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: '', managerCode: 'NV005', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2025-0010', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00011', code: 'BAN-2026-00001', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: 'DEMO-NET-2025-00011', origin: 'Mua mới', date: '3/12/2026', price: '1.650.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV020', managerCode: 'NV006', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2026-0011', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00012', code: 'GHE-2024-00001', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: 'DEMO-NET-2025-00019', origin: 'Mua mới', date: '4/13/2024', price: '1.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV021', managerCode: 'NV007', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2024-0012', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00013', code: 'DH-2025-00001', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2025-00013', origin: 'Mua mới', date: '5/14/2025', price: '12.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: '', managerCode: 'NV008', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2025-00013', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00014', code: 'QR-2026-00001', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2026-00014', origin: 'Mua mới', date: '6/15/2026', price: '2.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: '', managerCode: 'NV009', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2026-0014', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00015', code: 'LT-2024-00004', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2024-00015', origin: 'Mua mới', date: '7/16/2024', price: '24.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: 'NV024', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0015', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00016', code: 'LT-2025-00005', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2025-00016', origin: 'Mua mới', date: '8/17/2025', price: '21.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV025', managerCode: 'NV004', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0016', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00017', code: 'LT-2026-00006', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2026-00017', origin: 'Mua mới', date: '9/18/2026', price: '22.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV026', managerCode: 'NV005', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0017', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00018', code: 'PC-2024-00002', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2024-00018', origin: 'Mua mới', date: '1/19/2024', price: '16.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV027', managerCode: 'NV006', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0018', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00019', code: 'MH-2025-00003', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2025-00019', origin: 'Mua mới', date: '2/20/2025', price: '4.200.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV028', managerCode: 'NV007', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0019', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00020', code: 'MH-2026-00004', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2026-00020', origin: 'Mua mới', date: '3/21/2026', price: '2.850.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV029', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0020', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00021', code: 'MIN-2024-00002', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2024-00021', origin: 'Mua mới', date: '4/22/2024', price: '4.300.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: '', managerCode: 'NV009', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2024-0021', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00022', code: 'MCH-2025-00002', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2025-00022', origin: 'Mua mới', date: '5/23/2025', price: '13.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2025-0022', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00023', code: 'DT-2026-00002', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2026-00023', origin: 'Mua mới', date: '6/24/2026', price: '7.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV032', managerCode: 'NV004', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2026-0023', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00024', code: 'NET-2024-00002', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2024-00024', origin: 'Mua mới', date: '7/1/2024', price: '2.400.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: '', managerCode: 'NV005', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2024-0024', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00025', code: 'BAN-2025-00002', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '8/2/2025', price: '1.650.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV034', managerCode: 'NV006', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2025-0025', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00026', code: 'GHE-2026-00002', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '9/3/2026', price: '1.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV035', managerCode: 'NV007', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2026-0026', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00027', code: 'DH-2024-00002', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2024-00027', origin: 'Mua mới', date: '1/4/2024', price: '12.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: '', managerCode: 'NV008', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2024-0027', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00028', code: 'QR-2025-00002', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2025-00028', origin: 'Mua mới', date: '2/5/2025', price: '2.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2025-0028', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00029', code: 'LT-2026-00007', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2026-00029', origin: 'Mua mới', date: '3/6/2026', price: '24.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV011', managerCode: 'NV004', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0029', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00030', code: 'LT-2024-00008', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2024-00030', origin: 'Mua mới', date: '4/7/2024', price: '21.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV012', managerCode: 'NV005', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0030', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00031', code: 'LT-2025-00009', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2025-00031', origin: 'Mua mới', date: '5/8/2025', price: '22.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV013', managerCode: 'NV006', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0031', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00032', code: 'PC-2026-00003', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2026-00032', origin: 'Mua mới', date: '6/9/2026', price: '16.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV014', managerCode: 'NV007', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0032', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00033', code: 'MH-2024-00005', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2024-00033', origin: 'Mua mới', date: '7/10/2024', price: '4.200.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV015', managerCode: 'NV008', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0033', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00034', code: 'MH-2025-00006', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2025-00034', origin: 'Mua mới', date: '8/11/2025', price: '2.850.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: 'NV016', managerCode: 'NV009', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0034', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00035', code: 'MIN-2026-00003', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2026-00035', origin: 'Mua mới', date: '9/12/2026', price: '4.300.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2026-0035', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00036', code: 'MCH-2024-00003', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2024-00036', origin: 'Mua mới', date: '1/13/2024', price: '13.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: '', managerCode: 'NV004', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2024-0036', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00037', code: 'DT-2025-00003', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2025-00037', origin: 'Mua mới', date: '2/14/2025', price: '7.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV019', managerCode: 'NV005', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2025-0037', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00038', code: 'NET-2026-00003', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2026-00038', origin: 'Mua mới', date: '3/15/2026', price: '2.400.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: '', managerCode: 'NV006', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2026-0038', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00039', code: 'BAN-2024-00003', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '4/16/2024', price: '1.650.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV021', managerCode: 'NV007', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2024-0039', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00040', code: 'GHE-2025-00003', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '5/17/2025', price: '1.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV022', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2025-0040', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00041', code: 'DH-2026-00003', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2026-00041', origin: 'Mua mới', date: '6/18/2026', price: '12.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: '', managerCode: 'NV009', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2026-0041', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00042', code: 'QR-2024-00003', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2024-00042', origin: 'Mua mới', date: '7/19/2024', price: '2.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2024-0042', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00043', code: 'LT-2025-00010', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2025-00043', origin: 'Mua mới', date: '8/20/2025', price: '24.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: 'NV025', managerCode: 'NV004', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0043', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00044', code: 'LT-2026-00011', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2026-00044', origin: 'Mua mới', date: '9/21/2026', price: '21.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV026', managerCode: 'NV005', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0044', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00045', code: 'LT-2024-00012', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2024-00045', origin: 'Mua mới', date: '1/22/2024', price: '22.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV027', managerCode: 'NV006', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0045', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00046', code: 'PC-2025-00004', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2025-00046', origin: 'Mua mới', date: '2/23/2025', price: '16.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV028', managerCode: 'NV007', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0046', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00047', code: 'MH-2026-00007', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2026-00047', origin: 'Mua mới', date: '3/24/2026', price: '4.200.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV029', managerCode: 'NV008', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0047', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00048', code: 'MH-2024-00008', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2024-00048', origin: 'Mua mới', date: '4/1/2024', price: '2.850.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: 'NV030', managerCode: 'NV009', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0048', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00049', code: 'MIN-2025-00004', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2025-00049', origin: 'Mua mới', date: '5/2/2025', price: '4.300.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2025-0049', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00050', code: 'MCH-2026-00004', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2026-00050', origin: 'Mua mới', date: '6/3/2026', price: '13.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: '', managerCode: 'NV004', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2026-0050', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00051', code: 'DT-2024-00004', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2024-00051', origin: 'Mua mới', date: '7/4/2024', price: '7.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV033', managerCode: 'NV005', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2024-0051', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00052', code: 'NET-2025-00004', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2025-00052', origin: 'Mua mới', date: '8/5/2025', price: '2.400.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: '', managerCode: 'NV006', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2025-0052', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00053', code: 'BAN-2026-00004', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '9/6/2026', price: '1.650.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV035', managerCode: 'NV007', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2026-0053', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00054', code: 'GHE-2024-00004', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '1/7/2024', price: '1.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV036', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2024-0054', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00055', code: 'DH-2025-00004', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2025-00055', origin: 'Mua mới', date: '2/8/2025', price: '12.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2025-0055', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00056', code: 'QR-2026-00004', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2026-00056', origin: 'Mua mới', date: '3/9/2026', price: '2.350.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: '', managerCode: 'NV004', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2026-0056', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00057', code: 'LT-2024-00013', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2024-00057', origin: 'Mua mới', date: '4/10/2024', price: '24.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: 'NV012', managerCode: 'NV005', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0057', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00058', code: 'LT-2025-00014', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2025-00058', origin: 'Mua mới', date: '5/11/2025', price: '21.500.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV013', managerCode: 'NV006', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0058', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00059', code: 'LT-2026-00015', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2026-00059', origin: 'Mua mới', date: '6/12/2026', price: '22.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / CNTT', dept: 'CNTT', userCode: 'NV014', managerCode: 'NV007', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0059', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00060', code: 'PC-2024-00005', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2024-00060', origin: 'Mua mới', date: '7/13/2024', price: '16.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Kho trung tâm Hà Nội', dept: 'KHO', userCode: 'NV015', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0060', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00061', code: 'MH-2025-00009', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2025-00061', origin: 'Mua mới', date: '8/14/2025', price: '4.200.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: 'NV016', managerCode: 'NV009', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0061', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00062', code: 'MH-2026-00010', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2026-00062', origin: 'Mua mới', date: '9/15/2026', price: '2.850.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: 'NV017', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0062', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00063', code: 'MIN-2024-00005', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2024-00063', origin: 'Mua mới', date: '1/16/2024', price: '4.300.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / TCKT', dept: 'TCKT', userCode: '', managerCode: 'NV004', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2024-0063', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00064', code: 'MCH-2025-00005', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2025-00064', origin: 'Mua mới', date: '2/17/2025', price: '13.900.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / KD', dept: 'KD', userCode: '', managerCode: 'NV005', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2025-0064', note: 'Tài sản dùng chung, trưởng đơn vị chịu trách nhiệm quản lý.' },
  { id: 'AST00065', code: 'DT-2026-00005', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2026-00065', origin: 'Mua mới', date: '3/18/2026', price: '7.800.000', condition: 'Tốt', status: 'Đang sử dụng', location: 'Trụ sở Hà Nội / DVKH', dept: 'DVKH', userCode: 'NV020', managerCode: 'NV006', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2026-0065', note: 'Cấp phát cá nhân, đã ký biên bản bàn giao.' },
  { id: 'AST00066', code: 'NET-2024-00005', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2024-00066', origin: 'Mua mới', date: '4/19/2024', price: '2.400.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2024-0066', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00067', code: 'BAN-2025-00005', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '5/20/2025', price: '1.650.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2025-0067', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00068', code: 'GHE-2026-00005', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '6/21/2026', price: '1.350.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2026-0068', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00069', code: 'DH-2024-00005', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2024-00069', origin: 'Mua mới', date: '7/22/2024', price: '12.900.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2024-0069', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00070', code: 'QR-2025-00005', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2025-00070', origin: 'Mua mới', date: '8/23/2025', price: '2.350.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2025-0070', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00071', code: 'LT-2026-00016', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2026-00071', origin: 'Mua mới', date: '9/24/2026', price: '24.500.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0071', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00072', code: 'LT-2024-00017', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2024-00072', origin: 'Mua mới', date: '1/1/2024', price: '21.500.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0072', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00073', code: 'LT-2025-00018', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2025-00073', origin: 'Mua mới', date: '2/2/2025', price: '22.800.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0073', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00074', code: 'PC-2026-00006', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2026-00074', origin: 'Mua mới', date: '3/3/2026', price: '16.800.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0074', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00075', code: 'MH-2024-00011', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2024-00075', origin: 'Mua mới', date: '4/4/2024', price: '4.200.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0075', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00076', code: 'MH-2025-00012', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2025-00076', origin: 'Mua mới', date: '5/5/2025', price: '2.850.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0076', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00077', code: 'MIN-2026-00006', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2026-00077', origin: 'Mua mới', date: '6/6/2026', price: '4.300.000', condition: 'Tốt', status: 'Sẵn sàng cấp', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2026-0077', note: 'Đã kiểm tra đạt, sẵn sàng cấp phát.' },
  { id: 'AST00078', code: 'MCH-2024-00006', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2024-00078', origin: 'Tiếp nhận biếu tặng', date: '7/7/2024', price: '13.900.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: '', doc: 'BB-TANG-2026-001', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00079', code: 'DT-2025-00006', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2025-00079', origin: 'Mua mới', date: '8/8/2025', price: '7.800.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2025-0079', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00080', code: 'NET-2026-00006', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2026-00080', origin: 'Mua mới', date: '9/9/2026', price: '2.400.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2026-0080', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00081', code: 'BAN-2024-00006', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '1/10/2024', price: '1.650.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2024-0081', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00082', code: 'GHE-2025-00006', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '2/11/2025', price: '1.350.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2025-0082', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00083', code: 'DH-2026-00006', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2026-00083', origin: 'Mua mới', date: '3/12/2026', price: '12.900.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2026-0083', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00084', code: 'QR-2024-00006', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2024-00084', origin: 'Mua mới', date: '4/13/2024', price: '2.350.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2024-0084', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00085', code: 'LT-2025-00019', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2025-00085', origin: 'Mua mới', date: '5/14/2025', price: '24.500.000', condition: 'Chưa kiểm tra', status: 'Chưa cấp phát', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2025-0085', note: 'Mới nhập, chờ nghiệm thu và kiểm tra.' },
  { id: 'AST00086', code: 'LT-2026-00020', name: 'HP ProBook 440 G10', type: 'LT', serial: 'DEMO-LT-2026-00086', origin: 'Mua mới', date: '6/15/2026', price: '21.500.000', condition: 'Cần kiểm tra', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2026-0086', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00087', code: 'LT-2024-00021', name: 'Lenovo ThinkPad E14', type: 'LT', serial: 'DEMO-LT-2024-00087', origin: 'Mua mới', date: '7/16/2024', price: '22.800.000', condition: 'Cần sửa chữa', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2024-0087', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00088', code: 'PC-2025-00007', name: 'Dell OptiPlex 7010', type: 'PC', serial: 'DEMO-PC-2025-00088', origin: 'Mua mới', date: '8/17/2025', price: '16.800.000', condition: 'Cần kiểm tra', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2025-0088', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00089', code: 'MH-2026-00013', name: 'Dell P2422H 24 inch', type: 'MH', serial: 'DEMO-MH-2026-00089', origin: 'Mua mới', date: '9/18/2026', price: '4.200.000', condition: 'Cần sửa chữa', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2026-0089', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00090', code: 'MH-2024-00014', name: 'LG 24MP400 24 inch', type: 'MH', serial: 'DEMO-MH-2024-00090', origin: 'Mua mới', date: '1/19/2024', price: '2.850.000', condition: 'Cần kiểm tra', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC002', doc: 'HD-DEMO-2024-0090', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00091', code: 'MIN-2025-00007', name: 'Brother HL-L2366DW', type: 'MIN', serial: 'DEMO-MIN-2025-00091', origin: 'Mua mới', date: '2/20/2025', price: '4.300.000', condition: 'Cần sửa chữa', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC003', doc: 'HD-DEMO-2025-0091', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00092', code: 'MCH-2026-00007', name: 'Epson EB-X49', type: 'MCH', serial: 'DEMO-MCH-2026-00092', origin: 'Mua mới', date: '3/21/2026', price: '13.900.000', condition: 'Cần kiểm tra', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC003', doc: 'HD-DEMO-2026-0092', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00093', code: 'DT-2024-00007', name: 'Samsung Galaxy A35', type: 'DT', serial: 'DEMO-DT-2024-00093', origin: 'Mua mới', date: '4/22/2024', price: '7.800.000', condition: 'Cần sửa chữa', status: 'Đã thu hồi', location: 'Trụ sở Hà Nội / Kho tài sản', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC006', doc: 'HD-DEMO-2024-0093', note: 'Đã thu hồi về kho, chờ đánh giá để tái cấp.' },
  { id: 'AST00094', code: 'NET-2025-00007', name: 'TP-Link TL-SG1024D', type: 'NET', serial: 'DEMO-NET-2025-00094', origin: 'Mua mới', date: '5/23/2025', price: '2.400.000', condition: 'Không xác định', status: 'Mất', location: 'Trụ sở Hà Nội / KHO', dept: 'KHO', userCode: '', managerCode: 'NV008', recordUser: 'NV007', supplier: 'NCC006', doc: 'HD-DEMO-2025-0094', note: 'Lập biên bản mất ngày 2026-10-15. Người giữ trước đó: NV022. Vị trí cuối: KHO.' },
  { id: 'AST00095', code: 'BAN-2026-00007', name: 'Bàn làm việc 1,2 m', type: 'BAN', serial: '', origin: 'Mua mới', date: '6/24/2026', price: '1.650.000', condition: 'Không xác định', status: 'Mất', location: 'Chi nhánh HCM', dept: 'CNHCM', userCode: '', managerCode: 'NV009', recordUser: 'NV003', supplier: 'NCC004', doc: 'HD-DEMO-2026-0095', note: 'Lập biên bản mất ngày 2026-10-15. Người giữ trước đó: NV023. Vị trí cuối: CNHCM.' },
  { id: 'AST00096', code: 'GHE-2024-00007', name: 'Ghế xoay lưng lưới', type: 'GHE', serial: '', origin: 'Mua mới', date: '7/1/2024', price: '1.350.000', condition: 'Không xác định', status: 'Mất', location: 'Trụ sở Hà Nội / HCNS', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC004', doc: 'HD-DEMO-2024-0096', note: 'Lập biên bản mất ngày 2026-10-15. Người giữ trước đó: NV024. Vị trí cuối: HCNS.' },
  { id: 'AST00097', code: 'DH-2022-00007', name: 'Daikin Inverter 12000 BTU', type: 'DH', serial: 'DEMO-DH-2022-00097', origin: 'Mua mới', date: '3/2/2022', price: '12.900.000', condition: 'Hỏng, không còn sử dụng', status: 'Đã thanh lý', location: 'Kho thanh lý', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC005', doc: 'HD-DEMO-2022-0097', note: 'Đã hoàn tất thanh lý ngày 2026-09-30. Không còn người giữ hiện tại.' },
  { id: 'AST00098', code: 'QR-2022-00007', name: 'Zebra DS2208', type: 'QR', serial: 'DEMO-QR-2022-00098', origin: 'Mua mới', date: '3/3/2022', price: '2.350.000', condition: 'Hỏng, không còn sử dụng', status: 'Đã thanh lý', location: 'Kho thanh lý', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC007', doc: 'HD-DEMO-2022-0098', note: 'Đã hoàn tất thanh lý ngày 2026-09-30. Không còn người giữ hiện tại.' },
  { id: 'AST00099', code: 'LT-2022-00022', name: 'Dell Latitude 5440', type: 'LT', serial: 'DEMO-LT-2022-00099', origin: 'Mua mới', date: '3/4/2022', price: '24.500.000', condition: 'Hỏng, không còn sử dụng', status: 'Đã thanh lý', location: 'Kho thanh lý', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV003', supplier: 'NCC001', doc: 'HD-DEMO-2022-0099', note: 'Đã hoàn tất thanh lý ngày 2026-09-30. Không còn người giữ hiện tại.' },
  { id: 'AST00100', code: 'FAX-2022-00001', name: 'Panasonic KX-FT983', type: 'FAX', serial: 'DEMO-FAX-2022-0100', origin: 'Mua mới', date: '3/5/2022', price: '3.200.000', condition: 'Hỏng, không còn sử dụng', status: 'Đã thanh lý', location: 'Kho thanh lý', dept: 'HCNS', userCode: '', managerCode: 'NV003', recordUser: 'NV007', supplier: 'NCC008', doc: 'HD-DEMO-2022-0100', note: 'Đã hoàn tất thanh lý ngày 2026-09-30. Không còn người giữ hiện tại.' },
];

const getCategoryName = (type: string): string => {
  switch (type) {
    case 'LT': return 'Máy tính xách tay (Laptop)';
    case 'PC': return 'Máy tính để bàn (PC)';
    case 'MH': return 'Màn hình máy tính';
    case 'MIN': return 'Máy in';
    case 'MCH': return 'Máy chiếu';
    case 'DT': return 'Điện thoại';
    case 'NET': return 'Thiết bị mạng';
    case 'BAN': return 'Bàn văn phòng';
    case 'GHE': return 'Ghế văn phòng';
    case 'DH': return 'Điều hòa nhiệt độ';
    case 'QR': return 'Máy quét mã vạch';
    case 'FAX': return 'Máy Fax';
    default: return 'Thiết bị / Tài sản';
  }
};

const getImageForType = (type: string): string => {
  switch (type) {
    case 'LT': return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
    case 'PC': return 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80';
    case 'MH': return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80';
    case 'MIN': return 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80';
    case 'MCH': return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80';
    case 'DT': return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
    case 'NET': return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
    case 'BAN': return 'https://images.unsplash.com/photo-1530629013299-6cb10d168419?auto=format&fit=crop&w=800&q=80';
    case 'GHE': return 'https://images.unsplash.com/photo-1580481077195-c340d2d3a953?auto=format&fit=crop&w=800&q=80';
    case 'DH': return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80';
    default: return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80';
  }
};

const getDefaultAccessories = (type: string): string => {
  switch (type) {
    case 'LT': return 'Bộ sạc zin theo máy, chuột quang, túi chống sốc.';
    case 'PC': return 'Thân máy PC, dây nguồn, bàn phím USB, chuột quang.';
    case 'MH': return 'Chân đế màn hình, dây nguồn, cáp HDMI / DisplayPort.';
    case 'MIN': return 'Dây nguồn, cáp USB kết nối, khay nạp giấy tiêu chuẩn.';
    case 'MCH': return 'Điều khiển từ xa, dây nguồn, cáp HDMI 5m, túi đựng máy chiếu.';
    case 'DT': return 'Củ sạc, cáp Type-C, hộp máy, que chọc sim.';
    case 'NET': return 'Cáp nguồn, tai gắn rack 19", bộ ốc vít bắt tủ rack.';
    case 'BAN': return 'Hộp luồn dây, khóa hộc tủ 3 ngăn kèm 02 chìa khóa.';
    case 'GHE': return 'Tựa đầu rời, bộ ốc siết chân ghế, phiếu bảo hành.';
    case 'DH': return 'Điều khiển điều hòa gắn tường, cục nóng, cục lạnh.';
    case 'QR': return 'Đế gác máy quét, dây cáp kết nối USB 2m.';
    default: return 'Phụ kiện tiêu chuẩn theo máy.';
  }
};

export const INITIAL_ASSETS: Asset[] = RAW_ASSET_ROWS.map((row) => {
  const activeUser = row.userCode ? EMPLOYEE_MAP[row.userCode] : null;
  const managerUser = row.managerCode ? EMPLOYEE_MAP[row.managerCode] : null;
  const custodianDisplayName = activeUser ? activeUser.ho_ten : (managerUser ? `${managerUser.ho_ten} (Quản lý)` : 'Kho tài sản');
  const custodianDisplayCode = activeUser ? activeUser.ma_nhan_vien : (managerUser ? managerUser.ma_nhan_vien : 'HCNS');

  return {
    id: row.code,
    id_tai_san: row.id,
    ma_tai_san: row.code,
    name: row.name,
    ten_tai_san: row.name,
    ma_loai: row.type,
    serialNumber: row.serial || row.code,
    so_seri: row.serial || row.code,
    nguon_goc: row.origin,
    ngay_nhap: row.date,
    nguyen_gia_vnd: row.price,
    originalPrice: parseVnd(row.price),
    tinh_trang: row.condition,
    trang_thai: row.status,
    status: `${row.status} (${row.condition})`,
    currentLocation: row.location,
    vi_tri: row.location,
    currentDepartment: row.dept,
    ma_bo_phan_su_dung: row.dept,
    ma_nguoi_su_dung: row.userCode,
    ma_nguoi_quan_ly: row.managerCode,
    ma_nguoi_ghi_nhan: row.recordUser,
    ma_nha_cung_cap: row.supplier,
    so_chung_tu: row.doc,
    thong_tin_bo_sung: row.note,
    custodianName: custodianDisplayName,
    custodianCode: custodianDisplayCode,
    specs: [
      getCategoryName(row.type),
      `Nguyên giá: ${row.price} VNĐ`,
      `Nhập: ${row.date}`,
      row.condition,
    ],
    imageUrl: getImageForType(row.type),
    defaultAccessories: getDefaultAccessories(row.type),
    category: getCategoryName(row.type),
  };
});

// Danh sách các địa điểm / vị trí chuẩn
export const INITIAL_LOCATIONS: string[] = [
  'Trụ sở Hà Nội / HCNS',
  'Trụ sở Hà Nội / TCKT',
  'Trụ sở Hà Nội / KD',
  'Trụ sở Hà Nội / DVKH',
  'Trụ sở Hà Nội / CNTT',
  'Trụ sở Hà Nội / Kho tài sản',
  'Kho trung tâm Hà Nội',
  'Chi nhánh HCM',
  'Trụ sở Hà Nội / BGD',
  'Tổ Dự án Triển khai 01 (DA01)',
  'Kho thanh lý',
];

// Danh sách người nhận (từ bảng nhân viên)
export const INITIAL_RECIPIENTS = RAW_EMPLOYEES.filter(
  (emp) => emp.trang_thai_lam_viec === 'Đang làm việc' || emp.trang_thai_lam_viec === 'Thử việc'
).map((emp) => ({
  id: emp.ma_nhan_vien,
  name: emp.ho_ten,
  role: emp.chuc_danh_chuc_vu,
  dept: DEPARTMENT_MAP[emp.ma_phong_ban] || emp.ma_phong_ban,
}));

// 4. DANH SÁCH YÊU CẦU ĐIỀU CHUYỂN BAN ĐẦU THEO BỘ DỮ LIỆU MỚI
export const INITIAL_REQUESTS: TransferRequest[] = [
  {
    id: 'DC-2026-0001',
    assetId: 'LT-2025-00001',
    assetName: 'Dell Latitude 5440',
    assetSerial: 'DEMO-LT-2025-00001',
    requesterId: 'NV010',
    requesterName: 'Nguyễn Hoài Nam',
    requesterDept: 'Phòng Hành chính Nhân sự',
    requesterRole: 'Chuyên viên Hành chính',
    createdDate: '18/10/2026 - 09:30',
    updatedDate: '2026-10-18',
    currentLocation: 'Trụ sở Hà Nội / HCNS',
    destinationLocation: 'Trụ sở Hà Nội / CNTT',
    recipientEmployeeId: 'NV014',
    recipientName: 'Hoàng Anh Dũng',
    recipientRole: 'Kỹ thuật viên CNTT',
    recipientDept: 'Phòng Công nghệ Thông tin',
    reason: 'Điều chuyển máy tính xách tay cấu hình cao hỗ trợ bộ phận kỹ thuật cài đặt hệ thống mạng server nội bộ.',
    status: 'pending', // Chờ tiếp nhận -> Click để duyệt UI03
    attachments: [
      {
        id: 'att-1',
        name: 'Phieu_de_xuat_dieu_chuyen_LT001.pdf',
        size: '1.8 MB',
        uploadTime: '09:35',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'DC-2026-0002',
    assetId: 'LT-2026-00002',
    assetName: 'HP ProBook 440 G10',
    assetSerial: 'DEMO-LT-2026-00002',
    requesterId: 'NV011',
    requesterName: 'Trần Thị Mai',
    requesterDept: 'Phòng Tài chính Kế toán',
    requesterRole: 'Kế toán viên',
    createdDate: '17/10/2026 - 11:15',
    updatedDate: '2026-10-17',
    currentLocation: 'Trụ sở Hà Nội / TCKT',
    destinationLocation: 'Trụ sở Hà Nội / KD',
    recipientEmployeeId: 'NV012',
    recipientName: 'Lê Quang Vinh',
    recipientRole: 'Chuyên viên Kinh doanh',
    recipientDept: 'Phòng Kinh doanh',
    reason: 'Bàn giao thiết bị hỗ trợ chuyên viên kinh doanh đi công tác thực địa dài ngày.',
    status: 'supplement', // Chờ bổ sung
    reviewNotes: 'Yêu cầu phòng TCKT bổ sung xác nhận đã sao lưu và bàn giao dữ liệu sổ kế toán trước khi chuyển máy tính.',
    attachments: [
      {
        id: 'att-2',
        name: 'Giay_de_xuat_cap_thiet_bi_KD.docx',
        size: '890 KB',
        uploadTime: '11:20',
        type: 'docx',
      },
    ],
  },
  {
    id: 'DC-2026-0003',
    assetId: 'PC-2025-00001',
    assetName: 'Dell OptiPlex 7010',
    assetSerial: 'DEMO-PC-2025-00004',
    requesterId: 'NV013',
    requesterName: 'Phạm Hải Yến',
    requesterDept: 'Phòng Dịch vụ Khách hàng',
    requesterRole: 'Chuyên viên Chăm sóc Khách hàng',
    createdDate: '16/10/2026 - 08:45',
    updatedDate: '2026-10-16',
    currentLocation: 'Trụ sở Hà Nội / DVKH',
    destinationLocation: 'Chi nhánh HCM',
    recipientEmployeeId: 'NV016',
    recipientName: 'Đặng Thùy Trang',
    recipientRole: 'Chuyên viên Dịch vụ',
    recipientDept: 'Chi nhánh TP. Hồ Chí Minh',
    reason: 'Chi viện bộ máy trạm văn phòng chất lượng cao cho tổng đài chăm sóc khách hàng chi nhánh phía Nam.',
    status: 'approved', // Đã phê duyệt -> Sẵn sàng lập biên bản bàn giao UI04!
    isDocComplete: true,
    isEligible: true,
    reviewedBy: 'Lê Thu Hà (NV003)',
    reviewedAt: '16/10/2026 15:30',
    reviewNotes: 'Hồ sơ đầy đủ, máy tính hoạt động ổn định, đủ điều kiện điều chuyển liên chi nhánh.',
    attachments: [
      {
        id: 'att-3',
        name: 'To_trinh_dieu_dong_tai_san_DVKH.pdf',
        size: '1.2 MB',
        uploadTime: '08:50',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'DC-2026-0004',
    assetId: 'MH-2026-00001',
    assetName: 'Dell P2422H 24 inch',
    assetSerial: 'DEMO-MH-2026-00005',
    requesterId: 'NV014',
    requesterName: 'Hoàng Anh Dũng',
    requesterDept: 'Phòng Công nghệ Thông tin',
    requesterRole: 'Kỹ thuật viên CNTT',
    createdDate: '15/10/2026 - 10:20',
    updatedDate: '2026-10-15',
    currentLocation: 'Trụ sở Hà Nội / CNTT',
    destinationLocation: 'Trụ sở Hà Nội / DVKH',
    recipientEmployeeId: 'NV020',
    recipientName: 'Trần Gia Bảo',
    recipientRole: 'Chuyên viên Chăm sóc Khách hàng',
    recipientDept: 'Phòng Dịch vụ Khách hàng',
    reason: 'Lắp thêm màn hình phụ hiển thị dashboard giám sát ticket CSKH 24/7.',
    status: 'handover', // Chờ xác nhận bàn giao -> Mở UI05!
    handoverDocId: 'BBBG-2026-0001',
    isDocComplete: true,
    isEligible: true,
    reviewedBy: 'Lê Thu Hà (NV003)',
    reviewedAt: '15/10/2026 11:30',
    attachments: [
      {
        id: 'att-4',
        name: 'Bien_ban_kiem_dinh_man_hinh.pdf',
        size: '2.1 MB',
        uploadTime: '10:25',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'DC-2026-0005',
    assetId: 'MCH-2026-00001',
    assetName: 'Epson EB-X49',
    assetSerial: 'DEMO-MCH-2026-00008',
    requesterId: 'NV010',
    requesterName: 'Nguyễn Hoài Nam',
    requesterDept: 'Phòng Hành chính Nhân sự',
    requesterRole: 'Chuyên viên Hành chính',
    createdDate: '12/10/2026 - 09:00',
    updatedDate: '2026-10-12',
    currentLocation: 'Trụ sở Hà Nội / HCNS',
    destinationLocation: 'Trụ sở Hà Nội / KD',
    recipientEmployeeId: 'NV005',
    recipientName: 'Hoàng Đức Long',
    recipientRole: 'Trưởng đơn vị',
    recipientDept: 'Phòng Kinh doanh',
    reason: 'Trang bị máy chiếu phục vụ hội thảo đào tạo đối tác và đại lý bán hàng quý 4.',
    status: 'completed', // Hoàn tất
    isDocComplete: true,
    isEligible: true,
    handoverDocId: 'BBBG-2026-0002',
    attachments: [
      {
        id: 'att-5',
        name: 'Bien_ban_ban_giao_da_ky_EBX49.pdf',
        size: '1.4 MB',
        uploadTime: '12/10/2026 15:00',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'DC-2026-0006',
    assetId: 'DT-2024-00001',
    assetName: 'Samsung Galaxy A35',
    assetSerial: 'DEMO-DT-2024-00009',
    requesterId: 'NV018',
    requesterName: 'Đỗ Minh Châu',
    requesterDept: 'Phòng Tài chính Kế toán',
    requesterRole: 'Kế toán viên',
    createdDate: '10/10/2026 - 14:00',
    updatedDate: '2026-10-10',
    currentLocation: 'Trụ sở Hà Nội / TCKT',
    destinationLocation: 'Trụ sở Hà Nội / DVKH',
    recipientEmployeeId: 'NV013',
    recipientName: 'Phạm Hải Yến',
    recipientRole: 'Chuyên viên Chăm sóc Khách hàng',
    recipientDept: 'Phòng Dịch vụ Khách hàng',
    reason: 'Chuyển điện thoại nghiệp vụ hotline.',
    status: 'rejected', // Từ chối
    isDocComplete: true,
    isEligible: false,
    reviewedBy: 'Lê Thu Hà (NV003)',
    reviewedAt: '10/10/2026 16:45',
    reviewNotes: 'Từ chối do điện thoại đang kích hoạt tài khoản OTP ngân hàng của kế toán, không thể chuyển đổi trước kỳ quyết toán.',
    attachments: [],
  },
];

// 5. BIÊN BẢN BÀN GIAO MẪU
export const INITIAL_HANDOVERS: Record<string, HandoverDocument> = {
  'BBBG-2026-0001': {
    id: 'BBBG-2026-0001',
    requestId: 'DC-2026-0004',
    formCode: 'Biểu mẫu số 04B/TS-2026',
    handoverDate: '15/10/2026 14:30',
    handoverLocation: 'Trụ sở Hà Nội / DVKH (Bàn CSKH-02)',
    accessories: 'Chân đế xoay đa hướng, cáp nguồn zin, cáp HDMI 1.8m chuẩn Dell.',
    termsAccepted: true,
    createdAt: '15/10/2026 14:30',
    senderConfirmed: true,
    senderNotes: 'Đại diện Phòng CNTT đã kiểm tra chất lượng hiển thị, không điểm chết, bàn giao đủ cáp.',
    senderConfirmedAt: '15/10/2026 14:45',
    senderName: 'Hoàng Anh Dũng',
    senderCode: 'NV014',
    senderRole: 'Kỹ thuật viên CNTT',
    senderDept: 'Phòng Công nghệ Thông tin',
    recipientConfirmed: true,
    recipientNotes: 'Đại diện Phòng DVKH đã nhận bàn giao hiện trường, kiểm tra kết nối với máy tính hoạt động tốt.',
    recipientConfirmedAt: '15/10/2026 15:05',
    recipientName: 'Trần Gia Bảo',
    recipientCode: 'NV020',
    recipientRole: 'Chuyên viên Chăm sóc Khách hàng',
    recipientDept: 'Phòng Dịch vụ Khách hàng',
    attachments: [
      {
        id: 'att-bb-1',
        name: 'Bien_ban_ban_giao_BBBG-2026-0001_signed.pdf',
        size: '2.8 MB',
        uploadTime: '15:10',
        type: 'pdf',
      },
    ],
  },
  'BBBG-2026-0002': {
    id: 'BBBG-2026-0002',
    requestId: 'DC-2026-0005',
    formCode: 'Biểu mẫu số 04B/TS-2026',
    handoverDate: '12/10/2026 14:00',
    handoverLocation: 'Trụ sở Hà Nội / KD (Phòng họp lớn)',
    accessories: 'Điều khiển từ xa, cáp nguồn, cáp HDMI 5m, túi chống sốc chính hãng Epson.',
    termsAccepted: true,
    createdAt: '12/10/2026 14:00',
    senderConfirmed: true,
    senderNotes: 'Bàn giao đầy đủ phụ kiện theo danh mục.',
    senderConfirmedAt: '12/10/2026 14:15',
    senderName: 'Nguyễn Hoài Nam',
    senderCode: 'NV010',
    senderRole: 'Chuyên viên Hành chính',
    senderDept: 'Phòng Hành chính Nhân sự',
    recipientConfirmed: true,
    recipientNotes: 'Đã nghiệm thu bóng chiếu, độ sáng tốt, nhận đủ phụ kiện.',
    recipientConfirmedAt: '12/10/2026 14:25',
    recipientName: 'Hoàng Đức Long',
    recipientCode: 'NV005',
    recipientRole: 'Trưởng đơn vị',
    recipientDept: 'Phòng Kinh doanh',
    attachments: [
      {
        id: 'att-bb-old',
        name: 'Bien_ban_ban_giao_da_ky_EBX49.pdf',
        size: '1.4 MB',
        uploadTime: '12/10/2026 15:00',
        type: 'pdf',
      },
    ],
  },
};

// 6. NHẬT KÝ KIỂM TOÁN
export const INITIAL_AUDIT_LOGS: TransferAuditLog[] = [
  {
    id: 'LOG-001',
    requestId: 'DC-2026-0005',
    assetId: 'MCH-2026-0001',
    assetName: 'Epson EB-X49',
    fromLocation: 'Trụ sở Hà Nội / HCNS',
    toLocation: 'Trụ sở Hà Nội / KD',
    fromCustodian: 'Nguyễn Hoài Nam (NV010)',
    toCustodian: 'Hoàng Đức Long (NV005)',
    completedAt: '12/10/2026 15:30',
    operator: 'Lê Thu Hà (Quản trị viên HCNS)',
    notes: 'Hoàn tất bàn giao theo biên bản BBBG-2026-0002. Cập nhật thẻ tài sản cố định và sổ theo dõi.',
  },
];

// 7. THÔNG BÁO HỆ THỐNG
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Yêu cầu điều chuyển mới',
    message: 'Nguyễn Hoài Nam vừa gửi yêu cầu DC-2026-0001 cho Dell Latitude 5440 (LT-2025-00001).',
    timestamp: '18/10/2026 09:30',
    read: false,
    type: 'info',
    targetRequestId: 'DC-2026-0001',
  },
  {
    id: 'notif-2',
    title: 'Phiếu DC-2026-0003 đã được duyệt',
    message: 'Yêu cầu điều chuyển Dell OptiPlex 7010 vào Chi nhánh HCM đã được phê duyệt. Sẵn sàng lập biên bản.',
    timestamp: '16/10/2026 15:30',
    read: true,
    type: 'success',
    targetRequestId: 'DC-2026-0003',
  },
  {
    id: 'notif-3',
    title: 'Biên bản đã ký nhận 2 bên',
    message: 'Biên bản BBBG-2026-0001 cho phiếu DC-2026-0004 đã được Bên giao và Bên nhận ký xác nhận.',
    timestamp: '15/10/2026 15:15',
    read: false,
    type: 'info',
    targetRequestId: 'DC-2026-0004',
  },
];
