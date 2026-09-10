# Dialog — header color correction v2

Ngày: 10/09/2026. Người dùng cho phép xử lý ảnh cục bộ bằng mã và cập nhật Pages.

## Phạm vi

Ảnh cần sửa: `01_dialog_fixed.png` (1774×887). Tham chiếu màu: nền header của `02_nhap_kho.png`. Bốn vùng header “Quét mã” được chuyển từ xanh sáng sang xanh đậm theo ảnh tham chiếu. Nội dung, bố cục và các ảnh baseline Đăng nhập/Xác nhận phiên/Trang chủ không đổi.

Ảnh mới: `01_dialog_header_aligned_v2.png`, có cùng kích thước nguồn. Bản gốc vẫn giữ nguyên. Gallery và liên kết file gốc trong card Dialog trỏ tới bản mới; đường dẫn phiên bản mới tránh cache của ảnh cũ.

## Cách xử lý

`scripts/sync_dialog_header.py` dùng Pillow/NumPy cục bộ, không gọi API tạo ảnh. Lấy mẫu nền xanh của header Nhập kho, loại trừ chữ trắng và biên bo góc, ước lượng bề mặt màu mượt rồi áp dụng vào bốn header. Giữ nguyên pixel chữ/icon sáng; các pixel biên chữ hòa vào nền xanh mới theo độ phủ. Không vẽ lại chữ, icon hoặc nội dung bên dưới.

## QA

- 149.285 pixel thay đổi trong bốn vùng header; **0 pixel ngoài bốn header thay đổi**.
- **0 pixel chữ/icon trắng sáng được bảo vệ thay đổi**.
- Cả 18 ảnh nguồn trước chỉnh sửa giữ nguyên SHA-256, gồm hai ảnh chứa ba màn baseline được khóa.
- Bốn header mới có RGB trung bình xấp xỉ (1, 67, 104); nền tham chiếu được lấy mẫu xấp xỉ (1, 67, 105). Sai số trung bình từng kênh so với bề mặt mẫu dưới 3/255. Đây là phối màu theo ảnh raster, không khẳng định trùng từng pixel của hai ảnh khác bố cục.
- Bản ảnh trong `design/` và `docs/design/` có SHA-256 giống nhau.

Chi tiết: `pixel-audit.json`. Đối chiếu trực quan: `header-before-after-reference.png`. Vùng thay đổi: `changed-pixels-mask.png`.
