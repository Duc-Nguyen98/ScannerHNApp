# P13 r03 — tải thêm thông báo theo từng đợt

Đã triển khai **10 tin đầu +10 mỗi lần bấm Xem thêm** cho cả Tất cả và Chưa đọc. Đây là lựa chọn UI cần user review, không tự coi là chuẩn Designer/backend đã khóa. [Bảng nguồn và phương án trước code](UI_UX_REVISION_03.md).

## Trải nghiệm

- Tin mới nhất trước;10 là kích thước đợt tải, không ép10 tin vừa viewport. Tab/header/footer đứng yên; nội dung vẫn cuộn trong shell494×950 và có khoảng đáy48px để nút tải thêm không bị scan-circle che.
- Có `Đang hiển thị10 /37 thông báo`, `Xem thêm10 thông báo`; đợt cuối hiển thị đúng số còn lại (ví dụ7). Đang tải khóa nút; hết nguồn chuyển nhãn Đã xem hết. Dưới10 hiển thị đúng dữ liệu và không có nút tải thêm giả.
- Mỗi tab giữ trang và scroll riêng; Back từ chi tiết giữ context. Không tự tải khi cuộn, không tự nạp bù sau mark-read. Tổng unread lấy nguồn độc lập với số đang hiển thị.
- Tải lỗi giữ nguyên các trang trước/cursor/scroll; dialog báo lỗi theo contract, đóng rồi thử lại cùng trang. Chống request trùng và row trùng. Hồi đáp khác phiên/actor/kho/dataset không được áp dụng.

## Thực thi và nguồn dữ liệu

`notification-pages.mjs` quản lý cache riêng hai tab; adapter local `loadPage` trả tối đa10 events. UI không dùng `store.list()` để nạp toàn bộ rồi ẩn. `read(id)` phục vụ chi tiết; cursor local dựa mốc thời gian/ID nên mark-read không làm dịch offset và bỏ sót tin. Không tự đặt endpoint/API/permission mới.

Dữ liệu mặc định giữ5 tin /3 chưa đọc. Công cụ ngoài AppShell có bộ37 tin /24 chưa đọc để review phân trang;32 tin bổ sung là synthetic trong nguồn preview. UI không có badge demo, không giả là events WMS. Reload đặt lại dữ liệu ban đầu. Bộ37 cho phép kiểm10→20→30→37; khi đọc một tin thì tab Chưa đọc cập nhật đúng và không tự tải thêm.

## Bằng chứng thực chạy

- `node --test tests/notifications.test.mjs tests/notification-pages.test.mjs`: **21/21 PASS**. Bao gồm cursor khi anchor đã đọc, tie-break thời gian, scope/dispose/reset, retry, dedup, độc lập hai tab, tổng unread sau đọc tin chưa nằm trong cache. [Log](evidence/revision-03/node-tests.txt).
- `node scripts/check_notification_pages.cjs`: **9/9 nhóm PASS**, số lượng10/20/30/37, không auto-load, double-click, focus vào tin mới đầu tiên, giữ scroll, lỗi/retry, count unread, race đổi tab và logout. Nút tải thêm nằm trên footer, không tràn ngang ở6 viewport. [Kết quả](evidence/revision-03/pagination-browser-results.json).
- `NOTIFICATIONS_EVIDENCE_DIR=handoff/P13/evidence/revision-03/regression node scripts/check_notifications.cjs` (biến môi trường đặt bằng PowerShell): **14/14 nhóm PASS** hồi quy4 panel, P12 IDs, reader, dialog, footer và logout. [Kết quả](evidence/revision-03/regression/browser-results.json).
- Chromium/DPR1, Arial hệ thống, Asia/Ho_Chi_Minh. Geometry suite tại494×950,360×800,430×932,459×874,1440×900,340×420; regression thêm1869×940. Không pageerror ở hai suite. Không chạy lại toàn bộ repository hoặc WMS/hardware.

## Review hình thức

Before/after nguồn5 tin cùng494×950,DPR1: [Chưa đọc trước](evidence/revision-03/before-unread-494x950.png) / [sau](evidence/revision-03/after-unread-494x950.png); [Tất cả trước](evidence/revision-03/before-all-494x950.png) / [sau](evidence/revision-03/after-all-494x950.png). Phần mới cuối danh sách là adaptation theo yêu cầu user, không có baseline Designer cho pager.

[10/37 + Xem thêm](evidence/revision-03/all-first10-bottom.png) · [Đang tải](evidence/revision-03/loading-more.png) · [Đã nối20](evidence/revision-03/after-append20.png) · [Lỗi tải tiếp](evidence/revision-03/page-error-dialog.png) · [Hết37](evidence/revision-03/all-end37.png).

Visual: **USER_REVIEW_PENDING**; behavior: **PASS_PROTOTYPE**; integration: **BLOCKED_PRODUCTION** như trước. Không lấy test pass làm bằng chứng user đã duyệt. S03/S04,4 IDs và91 panel được giữ.

File sửa: model/controller/CSS/README P13, CSS revision tại auth entry, script regression cập nhật chờ nguồn async. Thêm page-cache module, unit tests phân trang và browser suite riêng. RUN_STATE/SCREEN_COVERAGE cập nhật r03; evidence r01/r02 giữ nguyên. Không thay nguồn P12/Home hay footer, không push/merge/deploy.
