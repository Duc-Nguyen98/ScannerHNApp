# P13 r06 — chi tiết ưu tiên nội dung

Đã triển khai đề xuất user yêu cầu áp dụng: tiêu đề → một thời gian → nguồn gửi/kho → nội dung → thông tin bổ sung. [Bảng nguồn và phương án trước sửa](UI_UX_REVISION_06.md). Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype; bảo toàn các sửa P12 từ chat khác.

## Thay đổi

- Nội dung chính xuất hiện ngay sau khối tiêu đề. Dòng nguồn gọn `Điều phối kho · Kho Hoa Nam`; không còn bảng metadata dài phía trước thông điệp.
- Thời gian chỉ xuất hiện một lần. `Thông tin chi tiết` mặc định thu gọn, mở ra có nhãn **Loại thông báo / Người tạo / Kho**, không gọi thông báo kho hoặc NFC là loại chứng từ.
- Thông báo có chứng từ hiển thị **mã, loại, trạng thái** trong vùng Chứng từ liên quan ngay sau nội dung. Vẫn mở đúng ID bằng CTA Xem chứng từ; đường theo dõi Web hiện có được giữ.
- Không thêm CTA vào thông báo kho/NFC. Retry đánh dấu đã đọc chỉ hiện khi thất bại; không nhấp nháy nút thao tác khi auto mark-read đang chờ. Không thay read receipt/count/permission.
- Disclosure native hỗ trợ Enter/Space, không thêm history entry; nhớ mở/đóng riêng theo event khi qua chứng từ rồi Back. Source và narrative dài dùng reader AppShell, không thêm overlay/controller riêng.
- Giữ nền trắng/lề24px, khoảng nhóm24px, leading1.5, narrative3 dòng, menu5 mục và dock tránh scan-circle r05. S01/S03/S04 không thiết kế lại.

## Kiểm chứng thực chạy

- `node --check docs/flows/notifications/notifications.mjs`: PASS.
- `P13_DETAIL_EVIDENCE_DIR=handoff/P13/evidence/revision-06 P13_DETAIL_PHASE=before/after node scripts/capture_notification_detail.cjs`:8 ảnh trước/sau4 nhánh tại494×950,DPR1,Arial,Asia/Ho_Chi_Minh (biến môi trường đặt qua PowerShell).
- `node scripts/check_notification_content_first.cjs`: **5 nhóm PASS**. Kiểm5 loại thông báo, đúng thứ tự và timestamp đơn, CTA theo đối tượng; keyboard disclosure/no-history/per-event state;28 geometry (2 nhánh ×7 viewport ×2 trạng thái); Unicode/newline/từ liền >2000 ký tự trong narrative/source, reader/Back/focus; read-error/count/retry. [Kết quả](evidence/revision-06/content-first-results.json).
- `NOTIFICATIONS_EVIDENCE_DIR=handoff/P13/evidence/revision-06/regression node scripts/check_notifications.cjs`: **14 nhóm PASS**, regression4 panel/P12/reader/dialog/count/pagination-context/footer/logout. [Kết quả](evidence/revision-06/regression/browser-results.json).
- `P13_DETAIL_EVIDENCE_DIR=handoff/P13/evidence/revision-06/nav-regression node scripts/check_notification_detail_nav.cjs`: **5 nhóm PASS**, nav35 geometry, P03/Escape/Back, các menu chính,20 rows/All/scroll. [Kết quả](evidence/revision-06/nav-regression/detail-nav-results.json).

Tổng **24 nhóm browser**, không pageerror. Không chạy lại unit backend/model vì không đổi model/cursor; không ghi21 tests lịch sử thành kết quả mới. Không chạy WMS/phần cứng.

## Hình thức

[Kho trước](evidence/revision-06/before-warehouse.png) / [sau](evidence/revision-06/after-warehouse.png) · [Chứng từ trước](evidence/revision-06/before-document.png) / [sau](evidence/revision-06/after-document.png) · [Thông tin mở rộng](evidence/revision-06/warehouse-expanded.png) · [NFC](evidence/revision-06/nfc-collapsed.png).

Đã xem actual kho/chứng từ: nội dung nằm phía trên metadata, thời gian không lặp, khoảng trống giữ cho đọc thoáng. Phần disclosure/related là implementation của đề xuất được phép thực hiện, **actual visual vẫn USER_REVIEW_PENDING**, không tự LOCKED. Behavior PASS_PROTOTYPE; integration BLOCKED_PRODUCTION giữ nguyên.

Sửa `notifications.mjs`, `style.css`, revision CSS trong auth entry, README. Thêm script kiểm/capture và evidence; scripts cũ nhận output directory để không đè revision trước. Coverage/RUN_STATE cập nhật. Footer chung/source các module khác không sửa; đủ4 IDs/91 panels. Không push/merge/deploy.
