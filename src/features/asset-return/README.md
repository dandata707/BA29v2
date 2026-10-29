# Thu hồi tài sản

Được tích hợp từ `hệ-thống-thu-hồi-tài-sản/src`, sử dụng menu, tài khoản và phong cách AssetFlow của ứng dụng chính.

- Nhân viên quản lý tài sản: lập biên bản nháp → gửi thông báo → chờ bàn giao → tiếp nhận, đối chiếu mã/serial → ghi nhận tình trạng hoặc báo mất → hoàn tất. Có thể hủy khi nháp hoặc chờ bàn giao. Nếu nhân viên chưa xác nhận, bắt đầu tiếp nhận phải ghi rõ lý do.
- Nhân viên: chỉ xem biên bản đã gửi của chính mình, xác nhận cam kết khi đang chờ bàn giao, in/lưu PDF biên bản hoàn tất. Tài khoản mẫu Nguyễn Minh Anh tương ứng `EMP01` trong dữ liệu thu hồi.
- Không cho thu hồi trùng tài sản trong biên bản đang xử lý, chọn tài sản của người khác hoặc hoàn tất khi chưa ghi nhận đủ tình trạng/lý do mất. Khi hoàn tất, tài sản trong kho thu hồi được gỡ người sử dụng và chuyển thành đã thu hồi hoặc mất.

Đây là giao diện với dữ liệu mô phỏng theo mã nguồn gốc. Biên bản, kho tài sản thu hồi và thông báo được lưu bằng localStorage; thông báo chưa gửi email thật và chưa có API phân quyền phía máy chủ. Kho mô phỏng thu hồi giữ mô hình dữ liệu riêng của mã nguồn gốc (`qlts_assets_v1`), khác danh mục tài sản hiện có (`qlts_assets_v2`).

Chạy kiểm tra: `npm run test:asset-return`, `npm run lint`, `npm run build`.
