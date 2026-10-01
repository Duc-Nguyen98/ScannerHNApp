# P08 r08 — nhấn tổng quan và thống nhất lề S04

Phạm vi user: làm nổi bật Tổng quan trong ngày, căn lề/bố cục toàn màn Hoạt động theo ngày. Chỉ S04; không đổi dữ liệu, panel, nav hoặc màn khác.

## Áp dụng

- Tổng quan có nền xanh nhạt, viền rõ, nhấn trên3px, tiêu đề22px; ô Tổng cộng nền riêng và số30px. Sáu ô vẫn grid3×2, cùng kích thước, chỉ đọc.
- Lề ngoài18px, inset các thẻ16px, gap giữa khối16px. Bộ chọn ngày/tổng quan/danh sách thẳng hai mép.
- Đưa tiêu đề Danh sách hoạt động và Tổng vào trong thẻ danh sách, thẳng lề tiêu đề tổng quan/grid/các hàng. Giữ5 hàng, vùng bấm>=60px.
- Ngày, số liệu, fixture, thứ tự và drilldown không đổi. Ngày thiếu vẫn unavailable, không0.

## Kiểm chứng r08

-3/3 nhóm daily-layout PASS;6 viewport. Assertion đo mép trái/phải ngoài và trong lệch<1px; padding/gap18/16/16px;6 ô cùng rộng/cao; ô Tổng khác nền. Shell494×950, không tràn ngang, nav ổn định.
- Hồi quy r04 trên source r08:7/7 PASS; evidence riêng revision-08/r04-regression, không ghi đè lịch sử.
-21/21 test Node liên quan PASS; kiểm hash baseline/history-fixtures/P07 trong test.
-09/09=30,08/09=8; chọn lịch một overlay, Back giữ ngày, nhóm warranty đúng scope;01/10 unavailable. Search vẫn không viền focus bên trong.
- Đã xem ảnh daily494×1000. Visual chờ user nghiệm thu; backend/hardware NOT_RUN. P03/P05 ngoài scope không sửa/không chạy lại toàn bộ, không tuyên bố toàn hệ thống PASS.

## Evidence

- evidence/revision-08/browser-results.json (gồm số đo alignment)
- evidence/revision-08/daily-494x1000.png và5 viewport khác
- evidence/revision-08/daily-calendar.png, search-focused.png
- evidence/revision-08/r04-regression/browser-results.json
- evidence/revision-08/node-tests.txt

Giữ24 prompt/91 panel, baseline không sửa, không push/merge/deploy.
