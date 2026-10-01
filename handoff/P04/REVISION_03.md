# P04 revision03 — khớp kích thước Home P02 LOCKED

Người dùng cung cấp ảnh Desktop/2.png và 3.png, xác nhận P04 phải cùng kích thước Home. Revision02 giữ khung riêng340×847 là sai mục tiêu này; bị thay thế bởi revision03.

- P04 kế thừa width494px của `.hn-screen` Home, height/min-height950px; dùng cùng hàm fit đồng đều `min(1, clientWidth/494, clientHeight/950)`. Không sửa kích thước, nội dung hoặc style bên trong Home.
- Khung P04 cố định; nội dung dài cuộn trong `.p04-scroll`, header/footer giữ nguyên. Danh sách mở rộng/Nhập tay không tham gia tính chiều cao shell nên không làm thay đổi tỷ lệ.
- Giữ khoảng scrollbar trên trang preview khi Home hiện để công cụ P04 mở/ẩn không đẩy tâm app ngang. Không áp dụng màn đăng nhập.
- Cache r03 cho entry/module/CSS; cập nhật assertions trong `scripts/check_inbound.cjs` theo khung Home thay vì scale1/340px của revision02.

## Kiểm tra

57/57 Node tests PASS, [output](evidence/revision-03/node-tests.txt). Kiểm browser thực qua in-app browser: [metrics/assertions](evidence/revision-03/browser-results.json).

Đo Home rồi P04 trong cùng viewport và assert bằng nhau **x/y/width/height/transform**. Viewport mặc định577×728: cả hai rect378.560×728, x89.71875, scale0.766316; layout494×950. Các viewport thực khác1800×1125,450×1000,538×1165 cũng khớp. Kích thước yêu cầu tool1440×900,360×800,430×932 bị quy đổi bởi zoom trình duyệt hiện tại; báo số đo thực, không tuyên bố zoom1. Mở12 lượt, Nhập tay và Bước3 giữ nguyên rect. Không horizontal overflow hoặc console error ghi nhận.

Ảnh cùng cửa sổ: [Home](evidence/revision-03/P02-default.png), [Bước1](evidence/revision-03/P04-S01-default.png), [Bước2](evidence/revision-03/P04-S02-default.png), [Bước3](evidence/revision-03/P04-S03-default.png).

Không chạy lại toàn bộ headless suites; kết quả browser lần này là assertions trên tab thật. Không thay nghiệp vụ/adapter/ID. Visual font/icon/ảnh B04 vẫn chưa nghiệm thu tuyệt đối; backend BLOCKED. Đã để tab tại Bước1 bản mới, reset viewport override; không mở tab mới hoặc push/merge/deploy.
