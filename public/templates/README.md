# Mẫu biên bản bàn giao tài sản

`bien-ban-ban-giao-tai-san.docx` là bản sao nguyên trạng của mẫu Word người dùng cung cấp (`bien-ban-giao-tai-san-2.doc_.docx`). SHA-256: `F12F7E0252FBE029D2CBF300DA9CE2E08E5AB83F3FF0D92E6A9FC46B23403A9A`.

`src/utils/handoverDocument.ts` tạo file Word tải xuống bằng cách điền `word/document.xml` và giữ nguyên các phần khác trong gói DOCX, bao gồm styles, theme, settings và các quan hệ.

Các trường điền: số/ngày biên bản, phiếu yêu cầu liên quan, bên giao/nhận, mã nhân viên, phòng ban, chức vụ, các dòng tài sản, tổng số lượng/giá trị, số tiền bằng chữ, người nhận trách nhiệm quản lý và họ tên tại phần chữ ký. Không chèn chữ ký điện tử hay suy diễn trạng thái đã ký.

Mẫu không có trường riêng cho loại tài sản; giữ nguyên bảy cột của mẫu. Tên cơ quan, địa điểm, chủ tọa, thư ký và các thành viên khác chưa có dữ liệu được giữ trống theo mẫu.

Khi đổi mẫu, cập nhật ánh xạ và chạy `npm run test:handover-document`. Kiểm thử xác nhận cấu trúc gói DOCX và nội dung; cần mở file bằng Word để kiểm tra phân trang thực tế.
