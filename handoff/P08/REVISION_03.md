# P08 r03 — Lịch sử thao tác theo ảnh user 1.png

Phạm vi: đúng history hub nhúng trong app. User tạm duyệt r02, yêu cầu bỏ hai vùng khoanh đỏ và nâng cấp vùng bấm/icon truy cập. Không thiết kế dialog notification; không chuyển P09.

## Đã áp dụng

- Bỏ nhãn Dữ liệu mô phỏng và shortcut Tiếp tục phiếu dở khỏi hub nhúng. Không xóa bản nháp, session hay chức năng xử lý phiếu dở ở nguồn.
- Sáu mục nghiệp vụ giữ nguyên. Một button cho cả hàng, gồm icon bên trái, chữ và chevron phải; không có button lồng hoặc hành động khác nhau giữa các vùng bấm.
- Thay mũi tên dài bằng chevron từ bộ icon sẵn có. Thêm hover/active/focus-visible, giảm chuyển động; nút Back 44×44 CSS px.
- Back từ P08 trả focus về mục đã mở. Không thay đổi route nghiệp vụ.
- Standalone và các panel P08 khác giữ r02. Nhãn nguồn trong tools ngoài app vẫn giữ trung thực. Thay đổi trình bày không biến fixture thành dữ liệu WMS thật.

## Kiểm chứng r03

- 6/6 nhóm hub PASS; 6 viewport, shell 494×950, sáu hàng hiện đầy đủ trên nav, không tràn ngang.
- 14/14 nhóm hồi quy P08 PASS. File hồi quy vẫn ghi tên suite P08-r02 vì chạy nguyên bộ assertion r02 trên source r03; không dùng evidence r02 cũ để kết luận r03.
- Home 14/14 PASS; P03 16/16 PASS trên workspace hiện tại.
- Test Node riêng history và warranty history: 18/18 PASS.
- Toàn bộ Node hiện tại: 118 test, 113 PASS, 5 FAIL tại tests/outbound.test.mjs (P05). Các assertion kỳ vọng 7/10 lượt và trạng thái valid nhưng hiện nhận 1/invalid. Chưa kết luận nguyên nhân, không sửa P05 trong task này. Cần user cho phép trước khi mở rộng điều tra/sửa.
- Không tuyên bố toàn hệ thống PASS. Backend/NFC thật NOT_RUN.
- Lần kiểm tra focus đầu tiên FAIL do test refocus row trước Shift+Tab, không phải thiếu CSS focus. Đã sửa thao tác test sang keyboard thực, chạy lại 6/6 PASS. failure.png giữ để truy vết, kết quả cuối hub-results.json.

## Bằng chứng

- evidence/revision-03/hub-results.json
- evidence/revision-03/hub-494x1000.png và 5 viewport còn lại
- evidence/revision-03/history-regression/browser-results.json
- evidence/revision-03/home-regression/browser-results.json
- evidence/revision-03/dialog-regression/browser-results.json
- evidence/revision-03/node-tests.txt (gồm 5 FAIL, không che giấu)

Baseline, dữ liệu lịch sử và P07 không sửa. Không push/merge/deploy. Visual r03 chờ user kiểm tra.
