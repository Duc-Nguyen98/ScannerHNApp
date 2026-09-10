# WMS Hoa Nam — Bộ thiết kế mobile v2

## Mở thư viện trực quan

Xem toàn bộ board trên GitHub Pages: **https://duc-nguyen98.github.io/ScannerHNApp/**

Nền ảnh và overlay dùng trực tiếp trong app: **https://duc-nguyen98.github.io/ScannerHNApp/assets/scanner-background-pack-v1.zip**. Danh mục trực quan nằm ở cuối thư viện; file gốc được lưu trong [`assets/scanner-approved/`](assets/scanner-approved/).

Ngày bàn giao: 09/09/2026. Đây là ảnh mockup thiết kế, không phải ứng dụng đã sửa code hoặc đã kiểm thử end-to-end.

## Xem bộ thiết kế

- `00_LOCKED_ORIGINALS/`: nguyên bản Đăng nhập + Xác nhận phiên làm việc (chung một ảnh) và Trang chủ. Giữ nguyên byte, không chỉnh màu, không vẽ lại.
- `01_UPDATED_BOARDS/`: các bảng ảnh cập nhật cho 10 nhóm màn hình có sẵn.
- `02_NEW_BOARDS/`: các bảng ảnh bổ sung trạng thái và luồng còn thiếu.
- `03_HANDOFF/`: nhật ký thay đổi, danh mục màn, mapping icon/màu và các điểm cần chốt trước khi lập trình.

Mỗi bảng có 4 màn/trạng thái, đọc từ trái sang phải. Đây là bảng trình bày thiết kế; các màn cạnh nhau có thể là nhánh ngoại lệ, không nhất thiết là bốn bước liên tục. Đặc biệt màn xuất thiếu 7/10 KHÔNG đi thẳng sang gửi duyệt thành công 10/10: phải quay lại soạn đủ.

## Phạm vi khóa

Ba màn được người dùng chốt không nằm trong phạm vi redesign. Bản gốc trong thư mục khóa là nguồn ưu tiên cao nhất. Các mã màu kèm theo là token chuẩn hóa đề xuất dựa trên ảnh JPEG, không phải mã CSS gốc đã lấy từ repository. Icon trong ảnh được mapping theo ý nghĩa/kiểu hiển thị của Trang chủ, không phải bộ SVG gốc trích xuất được.

## Giới hạn chất lượng

Ảnh được tạo bằng công cụ tạo ảnh để trình bày hướng thiết kế. Chữ nhỏ, nét icon, mã màu từng pixel và dữ liệu phụ có thể còn sai khác. Không dùng PNG làm nguồn duy nhất để lập trình; ưu tiên quy tắc và nội dung trong tài liệu bàn giao. Chưa chứng nhận pixel-perfect, accessibility hay mọi nhánh nghiệp vụ đã PASS. Không công bố chức năng backend, phân quyền, gửi thông báo, khôi phục tài khoản hoặc phần cứng NFC đã hoạt động.

Các luồng khôi phục tài khoản, kết thúc ca, quản lý phiên, điều kiện đóng hồ sơ bảo hành và phê duyệt chi tiết là đề xuất UI cần BA Main chốt cơ chế triển khai. Không tự bổ sung OTP, 2FA, tự ghi sổ, tự chuyển tồn hoặc tự gửi tin cho khách hàng.
