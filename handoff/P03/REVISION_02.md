# P03 revision 02 — Menu, backdrop và màu nút

Theo chỉ thị mới của người dùng, đối chiếu hai ảnh Desktop/2.png và Desktop/3.png. Đây là thay đổi được yêu cầu cho P03, có ưu tiên hơn hình thức backdrop/màu CTA trong B03; không sửa ảnh baseline hoặc P01.

- Menu năm mục neo tuyệt đối vào đáy khung P03. Chiều cao khung bằng chiều cao viewport nhìn thấy, có tính scale đồng đều trên màn hẹp và safe area. Không còn khoảng hụt bên dưới menu khi cửa sổ cao hơn 692px. Đóng dialog trả lại kích thước Home/P04 và scroll/focus caller.
- Backdrop `rgb(0 0 0 / 80%)` phủ toàn vùng nội dung giữa header và menu, bao gồm khoảng trống dưới dialog. Chặn cuộn trang phía sau khi mở; cuộn trong dialog vẫn hoạt động để tiếp cận CTA ở chiều cao thấp. Header/menu giữ vị trí theo AppShell và inert khi modal mở.
- Nút chính lấy màu P01 `.primary`: nền #02517a, viền #075b83, chữ trắng, hover #034667. Nút phụ lấy `.secondary`: nền #f6fbff, viền #cbdbe5, chữ #004878. Nút chữ lấy `.forgot`: #006ec5. Nút quét giữa menu dùng #02517a. Giữ đỏ cho hành động bỏ phiếu; không lấy kích thước nút P01 áp vào P03.

File sửa: `docs/flows/scanner-dialogs/style.css`, `dialogs.mjs` (khóa/khôi phục cuộn trang), `docs/flows/home/home.mjs` (chiều cao riêng P03), `docs/flows/auth-session/index.html` và `app.mjs` (phiên bản tải tài nguyên), `scripts/check_dialogs.cjs` (kiểm tra hồi quy tương ứng). Giữ nguyên implementation P04 có trước.

## Bằng chứng

- [14 nhóm trình duyệt P03 PASS](evidence/revision-02/browser-results.json), [29 captures/metrics](evidence/revision-02/render-metrics.json).
- Kiểm menu sát đáy viewport ≤1px ở 394×692, 360×800, 430×932, 1440×900, 1495×752, 1869×940 và chiều cao bàn phím mô phỏng 394×420. Kiểm backdrop computed alpha=0.8; so sánh trực tiếp computed color P03 với P01; kiểm hover, wheel, resize và khôi phục khung Home.
- [14 nhóm Home PASS](evidence/revision-02/home-regression/browser-results.json); [11 nhóm P04 PASS](evidence/revision-02/inbound-regression/browser-results.json). Không page errors/external requests.
- [S01 actual](evidence/revision-02/P03-S01-1869x940.png), [S02 actual](evidence/revision-02/P03-S02-1869x940.png), [S03 actual](evidence/revision-02/P03-S03-1869x940.png), [S04 actual](evidence/revision-02/P03-S04-1869x940.png).

Các số tests Node trong báo cáo trước là kết quả lịch sử, không chạy lại trong lần sửa CSS/lifecycle này. Ba yêu cầu sửa trên PASS trong ma trận trình duyệt; không nâng toàn bộ visual B03 thành PASS vì font/icon/texture khác biệt cũ còn tồn tại. Integration production vẫn BLOCKED; bàn phím/thiết bị thật NOT_RUN. Evidence cũ giữ nguyên; bản hiện hành của lần sửa này nằm trong `evidence/revision-02/`.
