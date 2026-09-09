# Giờ bắt đầu ca — cập nhật theo yêu cầu người dùng

- Lưu `shiftStartedAt` (epoch milliseconds) trong sessionStorage tại lần `startShift()` đầu tiên.
- Home hiển thị HH:mm theo giờ thiết bị và nhãn “Ca bắt đầu”; bỏ dòng “Đã vào ca” khi có giờ.
- Reload, gọi startShift lặp lại và đổi role không ghi đè timestamp.
- Logout/new login tạo phiên mới chưa có giờ; lần vào ca tiếp theo ghi giờ mới.
- Phiên cũ đã vào ca nhưng không có timestamp không được gán giờ giả. Hiển thị “— / Chưa ghi nhận giờ”; đăng xuất/đăng nhập và vào ca mới để kiểm tra.
- Đây là metadata trình bày local được người dùng duyệt bổ sung sau Visual Lock; không thay đổi expiry, route guard, RBAC, kho paused hoặc stock/Post.

Kiểm thử: 17/17 unit tests auth/policy/shift-time; TypeScript scanner PASS. Browser 360×800,390×844,430×932 PASS: timestamp trong khoảng nhấn vào ca, reload giữ nguyên, HH:mm không đè icon, không lỗi console/page. Evidence: `qa.json` và 3 ảnh Home trong thư mục này.

Build preview local đã cập nhật; chưa commit/push/deploy. Báo cáo Visual Lock trước đó là snapshot lịch sử, không được dùng hash freeze cũ để đánh giá thay đổi timestamp đã được duyệt riêng này. Chưa chạy P04.
