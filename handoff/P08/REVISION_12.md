# P08 r12 — calendar gọn và thanh ngày đồng nhất6 trang

Phạm vi user: bỏ phần hướng dẫn dài khoanh đỏ trong các trang Lịch sử; đồng bộ thanh ngày cho Lịch sử chung/Theo ngày/Nhập-xuất/NFC/Bảo hành/Phiên quét.

## Áp dụng
- Bỏ đoạn queryDateHelp hiển thị thường trực trong shared picker (cả filter/day/calendar). Calendar cân lại header/body/week-grid/footer, không chừa khoảng trống của đoạn đã bỏ.
- Rút trợ giúp dưới2 ô nhập về Định dạng dd/mm/yyyy. Lỗi nhập ngoài miền chỉ nêu khoảng ngày ngắn, không lặp hướng dẫn dài.
- Không xóa quy tắc90 ngày: disabled day/month, kiểm lại nhập tay/submit và biên nửa đêm vẫn giữ.
- Thanh ngày dùng chung chiều cao44px, full width458px tại shell494, padding10px12px, radius10px, font15px, icon22px, cùng background/border/color trên6 trang.
- Chuyển Xóa lọc từ cạnh ngày xuống hàng kết quả. Trạng thái lọc đang chọn nằm trên dòng riêng để không kéo cao/thu hẹp thanh ngày.
- Không đổi nội dung ngày thành Tất cả ngày giả: daily vẫn1 ngày; list có khoảng ngày hoặc Tất cả ngày theo state. Đây là đồng nhất thiết kế, không đổi dữ liệu hoặc cách thống kê.
- Không chỉnh P06 date UI trong lượt này; không đổi3 selector P05. Các control đã dùng shared picker tự nhận phần bỏ hướng dẫn phù hợp mode.

## Kiểm chứng revision12
- check_history_datebar.cjs PASS6 trang×6 viewport=36 ảnh +6 calendar. So sánh computed width/height/background/radius/padding/font/lineheight/icon bằng nhau, fullwidth không co khi có Xóa lọc.
- Calendar không còn đoạn khoanh đỏ; disabled D+1 vàD-91, cho chọnD-90; Escape trả focus vào đúng thanh ngày; status vẫn hiển thị, clear đúng.
- Unified regression7/7 PASS, date-policy regression6/6 PASS, lưu thư mục revision12 riêng.
- Node toàn workspace142/142 PASS,0FAIL.
- Đã xem ảnh General/Daily/NFC calendar. Visual chờ user nghiệm thu. Integration NOT_RUN; không dùng kết quả local để xác nhận backend.

## Bằng chứng
evidence/revision-12/datebar-results.json; history-general-494x1000.png; history-daily-494x1000.png; nfc-calendar.png; các scene/viewport còn lại; unified-regression/browser-results.json; date-regression/browser-results.json; node-tests.txt.

Chỉ sửa shared history controls/picker/CSS và cache label; không thay baseline, dữ liệu,91 panel hay các phạm vi khác. Không push/merge/deploy.
