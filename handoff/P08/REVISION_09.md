# P08 r09 — thiết kế lại Hoạt động theo ngày
User chưa hài lòng thiết kế r08. Đã thông báo phạm vi là màn S04 đang được chỉnh, không phải màn login trong ambient preview.
## Hướng thiết kế mới
- Một nền trung tính #f5f8fb, thẻ trắng; bỏ nền gradient, vạch trên và các lớp viền ô thống kê của r08.
- Metrics chuyển sang bố cục số bên trái/icon nhỏ bên phải/nhãn bên dưới. Sáu ô cùng kích thước; không đổi thứ tự hay giá trị.
- Chỉ Tổng cộng dùng nền xanh đậm #155c76 và chữ trắng. Không coi các số thống kê là nút.
- Danh sách bên dưới dùng icon nhỏ24px/tile40px, các hàng nhẹ, hover/active riêng. Giữ toàn bộ vùng bấm và5 nhóm.
- Nhịp lề18px/inset16px/gap16px; phần mô tả tổng quan có khoảng cách14px trước grid. Nội dung dài vẫn cuộn trên nav.
- Thay khối CSS daily r07/r08 bằng một khối r09, không chồng thêm các lớp ghi đè daily cũ.
## Xác minh
- Daily r09:3/3 nhóm PASS ở6 viewport, giữ assertion hình học/6 ô đều nhau/không tràn/nav/date/drilldown/Back/ngày thiếu.
- Hồi quy r04:7/7 PASS trong thư mục riêng revision-09/r04-regression; trước tinh chỉnh spacing cuối. Suite daily r09 chạy lại sau spacing cuối và PASS.
- Đã xem ảnh actual494×1000 trước và sau tinh chỉnh, không dùng baseline làm UI.
- Đây là kết quả kỹ thuật/fixture, không thay user nghiệm thu thẩm mỹ. Visual r09 chờ duyệt.
- Không chạy lại Node vì CSS-only; không dùng test cũ để báo PASS mới. Không sửa logic/fixture, source baseline giữ nguyên.
- Backend/hardware NOT_RUN. P03/P05 ngoài scope chưa xử lý lại. Không tuyên bố toàn hệ thống hoặc vấn đề thẩm mỹ đã được xử lý tuyệt đối.
## Bàn giao
evidence/revision-09/browser-results.json; daily-494x1000.png và5 viewport; daily-calendar.png; r04-regression/browser-results.json.
RUN_STATE/SCREEN_COVERAGE giữ91 panel. Không push/merge/deploy; không sửa login/P01–P07.
