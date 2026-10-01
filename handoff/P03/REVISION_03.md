# P03 revision 03 — Lề, góc backdrop và footer

Yêu cầu người dùng: khắc phục lề/padding, bỏ bo góc backdrop và chỉnh footer trên cả bốn panel. Tiếp tục giữ backdrop đen 80% và màu nút theo P01 từ revision 02. Không đổi B03/P01/P02 baseline.

## Thay đổi thực tế

- Backdrop và modal host có radius=0, border/margin=0; phủ kín từ đáy header tới mép trên footer. Bỏ lớp bo góc giả `p03-header::after` để không hở nền ở hai góc. Header cao 47px + safe area.
- S01 chạy hết chiều ngang, lề ngoài hai bên bằng 0; padding ngang 20px, padding dưới 32px, cạnh dưới sát footer. Grip/nút đóng và các hàng tác vụ nằm trong sheet; bỏ margin âm ở chevron để nội dung dài không đè icon.
- S02–S04 dùng chung lề ngoài 8px mỗi bên, padding ngang 20px. Căn giữa vùng nội dung khả dụng với vùng đệm trên 16px/dưới 32px dành cho nút quét nhô lên; nội dung dài cuộn trong dialog. Đây là phương án thực hiện trong phạm vi yêu cầu sửa lề, đã thông báo; không ghi rằng người dùng đã duyệt riêng vị trí mới.
- Footer vuông góc, nền trắng đặc, không gap/padding ngang và không bóng đổ tạo đường hở. Năm cột bằng nhau, nhãn cùng cao độ. Nút quét 62px nằm giữa, nhô lên đúng 21px, không phụ thuộc margin âm/flex của Home.
- Khắc phục thêm **scrollbar-gutter 15px** từ CSS được tải cùng P04: chỉ khi P03 mở, chuyển gutter sang auto để tránh cắt mép phải dù rect màn vẫn đủ 394px. Home/P04 giữ gutter có trước.
- Sheet có scroll-padding-bottom 32px để Tab tới tác vụ cuối không bị nút quét đè. Menu vẫn neo đáy viewport như revision 02; safe area vẫn được tính.

File sửa: `docs/flows/scanner-dialogs/style.css`, `docs/flows/auth-session/index.html` (cache version r03), `scripts/check_dialogs.cjs` (assertions hình học/scrollbar/focus). Không đổi nghiệp vụ/controller/adapter hoặc code P04.

## Kiểm tra

- [14 nhóm trình duyệt P03 PASS](evidence/revision-03/browser-results.json), [29 ảnh và metrics](evidence/revision-03/render-metrics.json).
- Kiểm 394×692, 360×800, 430×932, 1440×900, 1495×752, 1869×940, 394×420. Sai lệch hình học cho phép tối đa 1 CSS px do làm tròn: cạnh backdrop nối header/footer, lề đối xứng, footer sát đáy, nhãn thẳng hàng, scan offset21, sheet gap0. Đây là tolerance kiểm layout, không phải ngưỡng pixel-perfect B03.
- `body.clientWidth === innerWidth` và app căn giữa; không còn dải gutter/cắt cạnh phải. Backdrop computed rgba(0,0,0,0.8); host/backdrop/footer radius0. P03 button computed colors vẫn so trực tiếp với P01.
- Kiểm Tab/cuộn: tác vụ cuối khi focus hiển thị phía trên phần nút quét nhô lên, CTA nằm trong dialog. Kho dừng/UNKNOWN/lưu/bỏ phiếu và focus restore vẫn qua các ca có trước.
- [14 nhóm Home PASS](evidence/revision-03/home-regression/browser-results.json); [11 nhóm P04 PASS](evidence/revision-03/inbound-regression/browser-results.json). Không lỗi JS hay request ngoài localhost trong các lần chạy cuối.
- Đã xem actual cả bốn panel. [Ảnh tổng hợp](evidence/revision-03/P03-overview.png). Ảnh r03 giữ riêng; `browser-failure.json`/`failure.png` là lịch sử lần test phát hiện yêu cầu cuộn ở viewport thấp, không phải kết quả hiện hành.

Lệnh: `DIALOG_EVIDENCE_DIR=handoff/P03/evidence/revision-03 node scripts/check_dialogs.cjs`; tương tự HOME_EVIDENCE_DIR và INBOUND_EVIDENCE_DIR cho hai bộ hồi quy. Các biến được đặt bằng `$env:...` trong PowerShell. Không chạy lại Node unit tests cho thay đổi CSS này; số 57 tests trong RUN_STATE là bằng chứng lịch sử của lần trước.

Các lỗi layout nêu trên đã được kiểm chứng trong ma trận trình duyệt. Visual toàn bộ B03 vẫn cần người dùng review (font/icon/texture cũ chưa được xác minh tuyệt đối), không tuyên bố pixel-perfect. Integration production vẫn BLOCKED; thiết bị/bàn phím thật NOT_RUN.
