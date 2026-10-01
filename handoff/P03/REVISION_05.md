# P03 revision05 — Nền hở ở hai góc footer

Ảnh người dùng khoanh hai góc trên footer: bo góc của footer P02 để lộ nền app xanh phía sau, tạo hai mảng xanh tại chỗ nối sheet/footer.

Đã thêm lớp nền trắng thuộc `.hn-screen.p03-screen`, cao bằng chiều cao footer thực tế, nằm sau footer và không nhận pointer events. Giữ nguyên DOM/CSS footer P02 LOCKED: radius23, padding8, icon, nhãn, scan-circle. Giữ backdrop vuông80% và hành vi dialog. Chỉ sửa `scanner-dialogs/style.css` và version stylesheet p03-r05 trong auth-session/index.html; không sửa Home CSS/baseline.

- [14 nhóm P03 PASS](evidence/revision-05/browser-results.json), 29 captures; footer DOM/computed appearance vẫn được so với P02.
- [29 captures kiểm cả hai góc RGB PASS](evidence/revision-05/corner-checks.json). Reference394×692: điểm (1,620)/(392,620) đổi từ RGB(228,243,248) thành (253,253,253). Điểm (3,628)/(390,628) thành trắng255. Kiểm mẫu góc trung tính không phải ngưỡng pixel-perfect toàn board.
- [14 nhóm Home PASS](evidence/revision-05/home-regression/browser-results.json), không lỗi JS/external requests.
- [Crop trước/sau](evidence/revision-05/footer-before-after.png): trái r04, phải r05; không resize. [Actual S01](evidence/revision-05/P03-S01-394.png) đã xem.

Lệnh: `node scripts/check_dialogs.cjs` với DIALOG_EVIDENCE_DIR trỏ revision-05; `node scripts/check_home.cjs` với HOME_EVIDENCE_DIR trỏ home-regression trong đó. Không chạy lại unit tests cho sửa lớp nền CSS. Giữ evidence cũ; giới hạn visual/integration trước đây vẫn còn.

## Kiểm tra tiếp trên preview thực

Sau yêu cầu tiếp tục, phát hiện server8766 không chạy; các tab đang báo connection refused. Đã khởi động lại server local bằng tiến trình ẩn và thêm Cache-Control:no-store cho HTML/CSS/JS/MJS trong `scripts/serve_preview.py`. [Kiểm HTTP200/no-store](evidence/revision-05/preview-serving-check.json) trên entry HTML, CSS p03-r05 và Home module đều đạt. Không thay UI hay nghiệp vụ thêm trong lần này.

Đã mở tab mới khi tab lỗi không thể được công cụ điều khiển, đăng nhập fixture qua P01, xác nhận phiên, mở tab Quét mã và xem screenshot trực tiếp trong in-app browser. S01 hiển thị đầy đủ, hai góc footer trắng liền, không lộ nền xanh; giữ tab P03 mở để người dùng review. Đây là xác minh live S01 bổ sung; bằng chứng các panel khác là 29 captures của lần chạy trước, không ghi thành lần test mới.
