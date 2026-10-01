# P04 revision 02 — sửa thu nhỏ, lệch và nhảy bố cục Bước 1–3

Người dùng xác nhận lỗi chính là màn/chữ bị thu nhỏ, lệch hoặc nhảy bố cục. Đã tái hiện trên Codex in-app browser 1280×720: khung ban đầu rộng khoảng 289px, mở đủ 12 lượt làm rộng chỉ 191.7px (scale 0.563821). Nguyên nhân `fitPreview` chia theo chiều cao toàn bộ nội dung đang thay đổi; textarea/danh sách/ghi chú dài tăng chiều cao và làm co toàn app. Cuộn trang tới công cụ bên ngoài còn kéo header khỏi viewport. Thanh cuộn dọc chiếm diện tích nên `100vw` có thể tạo tràn ngang trên Windows.

## Bản sửa

- P04 dùng khung cao `min(847px,100dvh)`, rộng tối đa340px theo **clientWidth** thực, scale1. Header/footer không co theo nội dung. Home/P03 vẫn theo cơ chế preview cũ.
- Thông tin phiếu, nhập tay, lịch sử mã và ghi chú cuộn trong vùng riêng giữa header và CTA. Không phóng/thu chữ theo số dòng; textarea cuộn trong ô, không kéo cao app.
- Giữ scroll trong cùng bước; chuyển bước về đầu nội dung/app. Khi nạp fixture từ công cụ ngoài app, trả focus/header về app; tắt scroll anchoring cho P04. Action trong app không để cuộn trang kéo header ra ngoài.
- Thông báo lỗi/dependency mới được đưa vào vùng nhìn thấy. Footer không che control hoặc feedback.
- Cache version P04 r02 trên entry/import/CSS để lần tải tiếp nhận đúng bản sửa.

## Bằng chứng lần chạy này

- [Kết quả đo/assertions trình duyệt thực](evidence/revision-02/browser-results.json): scale1, header top0, footer trong viewport, không tràn ngang theo clientWidth; giữ cỡ chữ khi mở đủ 12 lượt, mở Nhập tay, ghi chú dài, Back và P03→P04.
- Ma trận quan sát 340×847, 360×800, 430×932, 320×640, 340×420 và cửa sổ mặc định1280×720. Trình duyệt Windows dùng scrollbar15px: ví dụ viewport340 thì clientWidth325; app dùng325 để không tràn ngang. Capture reference dùng viewport355×847 để app340×847, DPR1.
- [Bước1](evidence/revision-02/P04-S01-340.png), [Bước2](evidence/revision-02/P04-S02-340.png), [Bước3](evidence/revision-02/P04-S03-340.png), [danh sách mở rộng](evidence/revision-02/S02-expanded-final.png), [Nhập tay màn thấp](evidence/revision-02/S02-manual-340x420-final.png), [ghi chú dài](evidence/revision-02/S03-long-note-final.png).
- 57/57 Node tests PASS: `node --test tests/*.mjs tests/*.cjs`, [output](evidence/revision-02/node-tests.txt). Syntax checks home.mjs/inbound.mjs/check_inbound.cjs PASS.
- Kiểm trực tiếp Home khôi phục width494, bỏ class P04; P03 picker mở và quay lại P04; nút CTA nhận Tab và nằm trọn trong viewport420px. Console browser không có error tại lần kiểm cuối.
- Script `check_inbound.cjs` bổ sung assertions scale1/width thực/height cố định và capture expanded; **chưa chạy lại script headless trong revision này**. Số nhóm 11/14/13 tại REPORT là kết quả lần bàn giao trước, không được xem là chạy lại toàn bộ lần này.

Không đổi nghiệp vụ, fixture adapter, số mã/phiếu, submit/timeout hoặc backend. Visual tổng thể vẫn cần duyệt font/icon/ảnh theo B04; sửa này chỉ xác nhận lỗi layout/co giãn đã tái hiện. Backend vẫn BLOCKED. Không push/merge/deploy.
