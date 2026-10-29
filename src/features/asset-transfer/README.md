# Điều chuyển tài sản

Các màn hình nghiệp vụ được chuyển từ `điều-chuyển-tài-sản/src/components` và tích hợp vào shell chung của AssetFlow. Không sử dụng sidebar, header, CSS toàn cục, bộ tài khoản hoặc kho tài sản mẫu riêng của prototype.

- `employee`: đề nghị điều chuyển, xem hồ sơ mà mình là người đề nghị hoặc người nhận, xác nhận đúng bên mình tham gia.
- `asset_manager`: thẩm định, yêu cầu bổ sung, từ chối, phê duyệt, lập biên bản, hoàn tất sau khi hai bên xác nhận; xem sổ theo dõi và báo cáo.
- `director`: không tham gia phân hệ điều chuyển.

Danh sách người nhận lấy từ `EMPLOYEE_PROFILES`, dùng cùng ID với phần chuyển tài khoản. Không tạo thêm role người đề nghị hoặc người nhận.

Danh mục gốc dùng `useAssetCatalog` và khóa lưu trữ `qlts_assets_v2`, cùng với màn hình quản lý tài sản. Adapter `toTransferAsset` chỉ chuyển tên trường phục vụ các màn hình prototype, không lưu một bản danh mục riêng. Các hồ sơ nghiệp vụ lưu tại `qlts_transfer_v1`, khởi tạo rỗng để tránh hồ sơ mẫu tham chiếu tài sản hoặc nhân viên ngoài danh mục chung.

Tài sản bị xóa, thanh lý, sửa chữa/bảo trì hoặc đang có hồ sơ điều chuyển chưa kết thúc không được đề nghị mới. Tài sản đã xác định người sử dụng chỉ được người đó đề nghị; tài sản chưa có người sử dụng không bị gán một nhân viên mẫu. Người nhận phải là một nhân viên khác người đề nghị.

Hoàn tất cập nhật vị trí, đơn vị quản lý, người sử dụng, trạng thái đang sử dụng, phiên bản và lịch sử trên tài sản gốc. Các xác nhận đã lưu và hồ sơ hoàn tất không được sửa lại. Các điều kiện quyền và trạng thái được kiểm tra tại context, ngoài việc khóa điều khiển trên giao diện.

Kiểm tra: `npm.cmd run test:asset-transfer`, `npm.cmd run lint`, `npm.cmd run build`.
