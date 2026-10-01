# P13 r04 — badge gọn và số lượng lớn

User2026-09-29 yêu cầu cải tiến chuông/tab/đếm cuối trang khi100 hoặc1000 tin. [Bảng nguồn và lựa chọn trước code](UI_UX_REVISION_04.md). Không tự coi các ngưỡng mới là visual contract đã khóa.

## Đã triển khai

| Tổng chưa đọc thật | Chuông | Tab Chưa đọc |
|---|---|---|
| 0 | Ẩn badge | Chưa đọc(0) |
| 1–9 | Số thật | Số thật |
| 10–99 | 9+ | Số thật |
| ≥100 | 9+ | 99+ |
| Chưa xác minh | ?; nhãn chưa xác định | —; nhãn chưa xác định |

Chuông dùng hộp22×18px, không giãn sang avatar. Helper chung `notification-count.mjs` áp dụng cả lần render Home đầu, đồng bộ sau đọc và tabP13. Title/aria-label giữ số thật dạng tiếng Việt, ví dụ1.000; số nguồn không bị cắt. Tổng chính xác còn thấy ở thống kê của tab Chưa đọc, dùng được trên màn hình cảm ứng.

Cuối danh sách còn trang: `Đã tải10 /1.000 thông báo` và nút **Xem thêm**. Accessible label cho biết tải tiếp10 hoặc số còn lại7, nhãn ngắn không nhảy độ dài. Đã hết: chỉ **Đã tải đủ37 thông báo**, không hai dòng lặp hoặc nút chết. Không dùng “đã xem hết” để tránh nhầm thành read receipt. Rỗng giữ empty state, không thêm0/0.

Vẫn10+10 theo nút; không tải1000 bản ghi vào DOM ngay, không tải tất cả để suy badge. Các trang do user chủ động tải vẫn giữ như r03, không tự xóa cache hoặc thay luồng điều hướng. Đây không phải tuyên bố virtualized/benchmark hàng nghìn DOM hay nghiệm thu API production.

## Kiểm chứng

- `node scripts/check_notification_counts.cjs`: **5 nhóm PASS**. Matrix0/1/9/10/99/100/999/1000 ở494×950,360×800,1440×900 (24 geometry cases). Chuông không chạm avatar; tab không overflow; số source/page đúng. Transition10→9 và100→99, unread không bị thay khi chỉ tải tin, UNKNOWN khác0. Nguồn1000 chỉ có10 rồi20 row sau một lần bấm. [Log](evidence/revision-04/count-browser-results.json).
- `NOTIFICATION_PAGES_EVIDENCE_DIR=handoff/P13/evidence/revision-04/pagination node scripts/check_notification_pages.cjs`: **9 nhóm PASS**. Label assertions cập nhật theo ngữ nghĩa mới, giữ checks số trang, cursor/retry/focus/scope. [Log](evidence/revision-04/pagination/pagination-browser-results.json).
- `NOTIFICATIONS_EVIDENCE_DIR=handoff/P13/evidence/revision-04/regression node scripts/check_notifications.cjs`: **14 nhóm PASS**, đủ4 panel, reader/dialog/Home/P03/footer/logout. [Log](evidence/revision-04/regression/browser-results.json).
- `node --test tests/notifications.test.mjs tests/notification-pages.test.mjs`: **21/21 PASS**. [Log](evidence/revision-04/node-tests.txt). Hai biến môi trường browser trên được đặt qua PowerShell. Không pageerror. Không chạy full repository/WMS/hardware.

## Hình thức và bằng chứng

Before/after cùng494×950,DPR1,nguồn37: [cuối10 tin trước](evidence/revision-04/before-all-first10-bottom.png) / [sau](evidence/revision-04/after-all-first10-bottom.png); [hết37 trước](evidence/revision-04/before-all-end37.png) / [sau](evidence/revision-04/after-all-end37.png). [Chuông với1000 chưa đọc](evidence/revision-04/bell-count-1000.png) · [Tab99+ và thống kê1.000](evidence/revision-04/count1000-page10.png).

Đã xem actual badge, tab1000, footer sau; nền/lề/icon/footer đã khóa giữ nguyên. Badge22×18, caps9+/99+ và copy mới là adaptation theo yêu cầu user, visual **USER_REVIEW_PENDING**. Behavior **PASS_PROTOTYPE**, integration **BLOCKED_PRODUCTION** như trước.

Chỉ sửa Home badge markup/styles, P13 count presentation/preview data và revision CSS entry; không sửa source các module khác. Thêm stress fixtures0–1000 ở công cụ ngoài AppShell, không phải notifications thật. `notification-pages.mjs` không đổi. Không thêm gửi push/mark-all-read/xóa tin, không đổi4 IDs/91 panel, không push/merge/deploy.
