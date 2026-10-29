import React, { useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { NotificationDrawer } from './NotificationDrawer';

export const Header: React.FC = () => {
  const {
    globalSearch,
    setGlobalSearch,
    unreadNotifsCount,
    currentUser,
    resetToDefaults,
    navigateTo,
  } = useTransfer();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'flow' | 'spec' | 'rules'>('spec');

  return (
    <>
      <header className="h-14 shrink-0 px-6 border-b border-[#c2c6d5] bg-white flex items-center justify-between z-10">
        {/* Global Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-[#737784] text-[18px] absolute left-2.5 pointer-events-none">
              search
            </span>
            <input
              className="w-80 h-9 pl-9 pr-3 text-xs bg-white border border-[#c2c6d5] rounded-lg text-[#131b2e] placeholder:text-[#737784] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Tra cứu mã tài sản, số phiếu, người nhận..."
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (window.location.hash !== '') {
                  navigateTo('list');
                }
              }}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Quick reset demo data */}
          <button
            onClick={resetToDefaults}
            title="Khôi phục dữ liệu mẫu ban đầu"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span className="hidden md:inline">Reset mẫu</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#424753] hover:bg-[#eaedff] transition-colors relative cursor-pointer"
            title="Thông báo hệ thống"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] absolute top-2 right-2 animate-pulse" />
            )}
          </button>

          {/* Help Modal */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#424753] hover:bg-[#eaedff] transition-colors cursor-pointer"
            title="Quy trình & Tài liệu đặc tả giao diện"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>

          <div className="h-4 w-px bg-[#c2c6d5]" />

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {currentUser.systemRoleLabel}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Help & UI Specification Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  menu_book
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tài liệu Đặc tả Giao diện & Nghiệp vụ (UC04 - AD04)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mô-đun Điều chuyển tài sản nội bộ — Công ty TNHH TMDV An Phúc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Modal Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setModalTab('spec')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      modalTab === 'spec'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đặc tả giao diện (UI01 - UI05)
                  </button>
                  <button
                    onClick={() => setModalTab('flow')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      modalTab === 'flow'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chu trình nghiệp vụ
                  </button>
                  <button
                    onClick={() => setModalTab('rules')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      modalTab === 'rules'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quy tắc BR01 - BR10
                  </button>
                </div>

                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer ml-2"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 text-xs text-slate-700 leading-relaxed">
              {modalTab === 'spec' && (
                <div className="space-y-6">
                  {/* UI01 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono">
                        UI01: Danh sách yêu cầu điều chuyển tài sản
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Tác nhân: Người đề nghị & HCNS</span>
                    </div>
                    <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-12">STT</th>
                          <th className="p-2">Tên đối tượng</th>
                          <th className="p-2">Kiểu</th>
                          <th className="p-2">I/O</th>
                          <th className="p-2">Quy tắc & Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-mono">08</td>
                          <td className="p-2 font-semibold">Nút Tạo yêu cầu</td>
                          <td className="p-2">Button</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Mở màn hình UI02. Người đề nghị hoặc HCNS đều có thể lập phiếu mới.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">09</td>
                          <td className="p-2 font-semibold">Ô tìm kiếm</td>
                          <td className="p-2">Textbox [100]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Tìm kiếm tức thời theo mã yêu cầu (DC-...), mã TS (LT-...), tên TS, người nhận.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">10</td>
                          <td className="p-2 font-semibold">Bộ lọc trạng thái</td>
                          <td className="p-2">Dropdown</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Lọc 7 trạng thái: Tất cả, Chờ tiếp nhận, Chờ bổ sung, Đã phê duyệt, Chờ xác nhận bàn giao, Từ chối, Hoàn tất.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">13</td>
                          <td className="p-2 font-semibold">Nhãn trạng thái</td>
                          <td className="p-2">Badge</td>
                          <td className="p-2">Output</td>
                          <td className="p-2">Mã màu: Xám (Chờ tiếp nhận), Cam (Chờ bổ sung), Xanh dương (Đã duyệt), Tím (Chờ bàn giao), Đỏ (Từ chối), Xanh lá (Hoàn tất).</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">16</td>
                          <td className="p-2 font-semibold">Mũi tên & Click thẻ</td>
                          <td className="p-2">Card action</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Click vào thẻ chuyển đến màn hình xử lý tương ứng theo tiến trình nghiệp vụ (UI03 / UI04 / UI05).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* UI02 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                        UI02: Tạo yêu cầu điều chuyển
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Tác nhân: Người đề nghị</span>
                    </div>
                    <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-12">STT</th>
                          <th className="p-2">Tên đối tượng</th>
                          <th className="p-2">Kiểu</th>
                          <th className="p-2">I/O</th>
                          <th className="p-2">Quy tắc & Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-mono">10</td>
                          <td className="p-2 font-semibold">Mã tài sản *</td>
                          <td className="p-2">Combobox/Select</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc. Chọn trong 100 tài sản hệ thống. Nếu để trống báo viền đỏ "Vui lòng chọn tài sản".</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">11-12</td>
                          <td className="p-2 font-semibold">Tên & Vị trí hiện tại</td>
                          <td className="p-2">Textbox (Readonly)</td>
                          <td className="p-2">Output</td>
                          <td className="p-2">Khóa sửa (QT1.2, BR02). Tự động điền theo mã tài sản được chọn từ danh mục kiểm kê.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">13</td>
                          <td className="p-2 font-semibold">Vị trí nhận *</td>
                          <td className="p-2">Dropdown</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc. Chọn vị trí tiếp nhận mới (khác với vị trí hiện tại của thiết bị).</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">14</td>
                          <td className="p-2 font-semibold">Người dự kiến tiếp nhận *</td>
                          <td className="p-2">Dropdown</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc. Danh sách 40 nhân sự công ty. Hiển thị "Mã NV: Họ tên (Chức vụ - Phòng ban)".</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">15-16</td>
                          <td className="p-2 font-semibold">Lý do điều chuyển *</td>
                          <td className="p-2">Textarea [500]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc. Tối đa 500 ký tự. Có bộ đếm thời gian thực x/500 ký tự (QTC06).</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">17</td>
                          <td className="p-2 font-semibold">Tài liệu đính kèm</td>
                          <td className="p-2">File upload</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Tùy chọn. Nhận .PDF, .DOCX, .XLSX tối đa 15MB. Hỗ trợ xem trước và xóa tệp.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">21</td>
                          <td className="p-2 font-semibold">Gửi yêu cầu</td>
                          <td className="p-2">Button</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Kiểm tra đủ 4 trường bắt buộc (BR01). Tự sinh mã DC-YYYY-NNNN, chuyển "Chờ tiếp nhận".</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* UI03 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold font-mono">
                        UI03: Chi tiết và xử lý yêu cầu điều chuyển
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Tác nhân: HCNS (Lê Thu Hà - NV003)</span>
                    </div>
                    <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-12">STT</th>
                          <th className="p-2">Tên đối tượng</th>
                          <th className="p-2">Kiểu</th>
                          <th className="p-2">I/O</th>
                          <th className="p-2">Quy tắc & Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-mono">12-24</td>
                          <td className="p-2 font-semibold">Thông tin yêu cầu & tài sản</td>
                          <td className="p-2">2-Column Cards</td>
                          <td className="p-2">Output</td>
                          <td className="p-2">Đối chiếu trực tiếp mã tài sản, số serial, cấu hình, nguyên giá và người quản lý hiện hành.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">25-26</td>
                          <td className="p-2 font-semibold">Checklist thẩm định hồ sơ</td>
                          <td className="p-2">Checkbox [2]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Tích xác nhận "Hồ sơ đầy đủ" và "Đủ điều kiện điều chuyển". Bắt buộc tích cả 2 để phê duyệt (BR04).</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">27-28</td>
                          <td className="p-2 font-semibold">Ghi chú xử lý *</td>
                          <td className="p-2">Textarea [500]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc khi Yêu cầu bổ sung hoặc Từ chối để lưu lý do cụ thể gửi người đề nghị.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">29-31</td>
                          <td className="p-2 font-semibold">Bộ nút xử lý</td>
                          <td className="p-2">Button [3]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Yêu cầu bổ sung (về "Chờ bổ sung"), Từ chối (về "Từ chối"), Phê duyệt (về "Đã phê duyệt"). Chỉ HCNS có quyền (BR03).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* UI04 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold font-mono">
                        UI04: Lập biên bản bàn giao tài sản
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Tác nhân: HCNS</span>
                    </div>
                    <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-12">STT</th>
                          <th className="p-2">Tên đối tượng</th>
                          <th className="p-2">Kiểu</th>
                          <th className="p-2">I/O</th>
                          <th className="p-2">Quy tắc & Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-mono">11</td>
                          <td className="p-2 font-semibold">Số biên bản</td>
                          <td className="p-2">Textbox (Readonly)</td>
                          <td className="p-2">Output</td>
                          <td className="p-2">Tự sinh mã dạng BBBG-YYYY-NNNN theo Biểu mẫu số 04B/TS-2026.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">14-15</td>
                          <td className="p-2 font-semibold">Thời gian & Địa điểm bàn giao *</td>
                          <td className="p-2">DateTime & Textbox</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc nhập theo BR06 để xác định thời điểm và địa chỉ hiện trường bàn giao.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">20</td>
                          <td className="p-2 font-semibold">Phụ kiện kèm theo *</td>
                          <td className="p-2">Textarea [500]</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Gợi ý từ danh mục phụ kiện chuẩn của máy, cho phép chỉnh sửa bổ sung trước khi ký nhận.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">21-26</td>
                          <td className="p-2 font-semibold">Bên giao & Bên nhận</td>
                          <td className="p-2">User cards [2]</td>
                          <td className="p-2">Output</td>
                          <td className="p-2">Hiển thị đại diện bàn giao (mã NV, chức danh, bộ phận chuyển đi) và đại diện tiếp nhận.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">32</td>
                          <td className="p-2 font-semibold">Xác nhận điều khoản</td>
                          <td className="p-2">Checkbox</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Bắt buộc tích cam kết kiểm tra thực tế theo quy chế quản lý tài sản nội bộ.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">35</td>
                          <td className="p-2 font-semibold">Nút Lập biên bản</td>
                          <td className="p-2">Button</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Lưu biên bản, chuyển trạng thái yêu cầu sang "Chờ xác nhận bàn giao", dẫn tới UI05.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* UI05 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold font-mono">
                        UI05: Ghi nhận xác nhận bàn giao và tiếp nhận
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Tác nhân: Bên giao, Bên nhận, HCNS ghi nhận</span>
                    </div>
                    <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-12">STT</th>
                          <th className="p-2">Tên đối tượng</th>
                          <th className="p-2">Kiểu</th>
                          <th className="p-2">I/O</th>
                          <th className="p-2">Quy tắc & Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-mono">10-14</td>
                          <td className="p-2 font-semibold">Tệp biên bản đã ký</td>
                          <td className="p-2">File card</td>
                          <td className="p-2">Output/Action</td>
                          <td className="p-2">Hiển thị tệp PDF đã ký xác thực kèm nút "Xem trước" và "Tải xuống" biên bản.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">23-24</td>
                          <td className="p-2 font-semibold">Xác nhận Bên giao</td>
                          <td className="p-2">Checkbox & Textarea</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Tích "Đã xác nhận bàn giao trên biên bản" & ô ghi chú sai lệch khi xuất thiết bị.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">28-29</td>
                          <td className="p-2 font-semibold">Xác nhận Bên nhận</td>
                          <td className="p-2">Checkbox & Textarea</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Tích "Đã tiếp nhận và nghiệm thu tài sản" & ô ghi chú hiện trường.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">30</td>
                          <td className="p-2 font-semibold">Hoàn tất điều chuyển</td>
                          <td className="p-2">Sticky Button</td>
                          <td className="p-2">Input</td>
                          <td className="p-2">Chỉ kích hoạt khi CẢ 2 BÊN đều đã tích xác nhận (BR07). Tự động cập nhật vị trí và người quản lý mới vào Sổ theo dõi tài sản, ghi nhật ký kiểm toán và chuyển "Hoàn tất" (BR08, BR09, BR10).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'flow' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-sm mb-1">Chu trình điều chuyển tài sản 5 bước (UC04 / AD04)</h4>
                    <p className="text-[11px] text-blue-800 mb-3">
                      Toàn bộ vòng đời luân chuyển tài sản giữa các đơn vị nội bộ tuân thủ kiểm soát chặt chẽ từ khi lập yêu cầu tới khi cập nhật sổ tài sản.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                        <span className="font-bold block text-blue-800 text-xs">Bước 1 (UI02)</span>
                        <span className="font-semibold block mt-1">Lập yêu cầu</span>
                        <span className="text-[10px] text-slate-500">Chờ tiếp nhận</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                        <span className="font-bold block text-blue-800 text-xs">Bước 2 (UI03)</span>
                        <span className="font-semibold block mt-1">Thẩm định hồ sơ</span>
                        <span className="text-[10px] text-slate-500">Phê duyệt / Bổ sung</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                        <span className="font-bold block text-blue-800 text-xs">Bước 3 (UI04)</span>
                        <span className="font-semibold block mt-1">Lập biên bản</span>
                        <span className="text-[10px] text-slate-500">Biểu mẫu 04B/TS</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                        <span className="font-bold block text-blue-800 text-xs">Bước 4 (UI05)</span>
                        <span className="font-semibold block mt-1">Nghiệm thu 2 bên</span>
                        <span className="text-[10px] text-slate-500">Ký nhận biên bản</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-300 shadow-2xs">
                        <span className="font-bold block text-emerald-800 text-xs">Bước 5 (F06)</span>
                        <span className="font-semibold block mt-1">Cập nhật sổ TS</span>
                        <span className="text-[10px] text-emerald-700">Trạng thái Hoàn tất</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Các nhánh luồng phụ và luồng ngoại lệ:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                      <li><strong>Luồng A2 - Hồ sơ chưa đầy đủ:</strong> HCNS nhập lý do, chuyển trạng thái "Chờ bổ sung". Người đề nghị nhận thông báo và cập nhật thông tin bổ sung.</li>
                      <li><strong>Luồng A4 - Không đủ điều kiện:</strong> HCNS ghi nhận lý do từ chối, chuyển trạng thái "Từ chối". Luồng điều chuyển kết thúc.</li>
                      <li><strong>Luồng A5 - Sai lệch hiện trường khi nhận:</strong> Ghi nhận vào ô ghi chú của biên bản, giữ ở trạng thái "Chờ xác nhận bàn giao" cho tới khi HCNS phối hợp xử lý xong.</li>
                    </ul>
                  </div>
                </div>
              )}

              {modalTab === 'rules' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR01 — Thông tin bắt buộc</span>
                      <p className="text-[11px] text-slate-600">Yêu cầu phải có đủ 4 trường: mã tài sản, lý do điều chuyển, vị trí nhận, người dự kiến tiếp nhận trước khi gửi.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR02 — Đối chiếu dữ liệu gốc</span>
                      <p className="text-[11px] text-slate-600">Thông tin tài sản tự động truy xuất và đối chiếu trực tiếp từ Sổ theo dõi tài sản 100 mục của công ty.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR03 — Phân quyền thẩm định</span>
                      <p className="text-[11px] text-slate-600">Chỉ cán bộ HCNS (Lê Thu Hà - NV003) có thẩm quyền kiểm tra, phê duyệt, từ chối hoặc lập biên bản bàn giao.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR04 — Điều kiện phê duyệt</span>
                      <p className="text-[11px] text-slate-600">Yêu cầu chỉ được phê duyệt khi cán bộ tích xác nhận cả 2 điều kiện: "Hồ sơ đầy đủ" và "Đủ điều kiện điều chuyển".</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR05 — Chuyển tiếp bàn giao</span>
                      <p className="text-[11px] text-slate-600">Chỉ những yêu cầu đã ở trạng thái "Đã phê duyệt" mới được phép mở màn hình lập biên bản bàn giao (UI04).</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR06 — Nội dung biên bản bàn giao</span>
                      <p className="text-[11px] text-slate-600">Biên bản bắt buộc ghi nhận tài sản, đại diện bên giao, đại diện bên nhận, thời gian, địa điểm và danh mục phụ kiện.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR07 — Nghiệm thu hai bên</span>
                      <p className="text-[11px] text-slate-600">Nút hoàn tất điều chuyển chỉ kích hoạt khi cả Bên giao và Bên nhận đều đã xác nhận trên biên bản.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR08 — Cập nhật quyền quản lý mới</span>
                      <p className="text-[11px] text-slate-600">Hệ thống chỉ cập nhật vị trí, phòng ban sử dụng và người quản lý mới của tài sản sau khi hoàn tất xác nhận 2 bên.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR09 — Lưu vết nhật ký kiểm toán</span>
                      <p className="text-[11px] text-slate-600">Toàn bộ lịch sử luân chuyển (vị trí trước/sau, người quản lý trước/sau, thời điểm, người thao tác) được ghi nhận vĩnh viễn.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-bold font-mono text-primary text-xs">BR10 — Trạng thái cuối Hoàn tất</span>
                      <p className="text-[11px] text-slate-600">Chỉ chuyển trạng thái yêu cầu sang "Hoàn tất" khi việc cập nhật sổ tài sản và ghi nhật ký kiểm toán đã thành công.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Tài liệu đặc tả phiên bản 2.0 • Áp dụng cho Hệ thống quản lý tài sản Công ty An Phúc
              </span>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đóng tài liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
