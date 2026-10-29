# Thanh lý tài sản

Tích hợp từ `hệ-thống-quản-lý-thanh-lý-tài-sản/src`. Dùng sidebar duy nhất và tài khoản chung của AssetFlow; giữ các màn hình, biểu mẫu và luồng xử lý của mã nguồn gốc. Không nhập CSS toàn cục của dự án mẫu để giữ font chữ và phong cách ứng dụng chính.

- **Nhân viên:** lập/lưu nháp/gửi đề nghị thanh lý, sửa và gửi lại đề nghị bị trả về; danh mục tài sản và đề nghị theo phòng ban.
- **Nhân viên quản lý tài sản:** tiếp nhận, hẹn kiểm tra, lưu kết quả thẩm định, chuyển tài sản đủ điều kiện sang tờ trình; theo dõi tờ trình, thực hiện thanh lý theo từng đợt và đóng hồ sơ.
- **Giám đốc:** xem tờ trình, phê duyệt và ban hành quyết định hoặc trả hồ sơ yêu cầu bổ sung. Tài khoản Lê Hoàng Nam lấy từ dữ liệu mẫu của dự án nguồn.

Chốt chặn được kiểm tra ở cả màn hình và hàm xử lý: phân quyền thao tác, biên bản thẩm định đã lưu, tài sản đủ điều kiện, trạng thái chờ phê duyệt, tài sản thuộc quyết định và chưa bán, đủ hồ sơ và hoàn tất toàn bộ tài sản trước khi đóng.

Dữ liệu thanh lý mô phỏng được lưu trong localStorage, bao gồm biên bản thẩm định và thông báo; dữ liệu giữ nguyên khi chuyển phân hệ/tài khoản. Tài khoản mẫu Nguyễn Minh Anh và phòng ban trong dữ liệu thanh lý được đối chiếu với tài khoản hiện có của AssetFlow. Kho mô phỏng thanh lý giữ mô hình dữ liệu riêng của mã nguồn gốc, chưa đồng bộ API với danh mục tài sản hoặc kho thu hồi. Tệp đính kèm và bản xem trước theo mẫu, thao tác In/Lưu PDF dùng hộp thoại in trình duyệt; chưa có dịch vụ gửi thông báo hoặc ký duyệt thật.

Kiểm tra: `npm run test:asset-liquidation`, `npm run test:asset-return`, `npm run lint`, `npm run build`.
