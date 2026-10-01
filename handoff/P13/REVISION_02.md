# P13 r02 — làm gọn viền, lề và tác vụ phần Thông báo

Đã thực hiện theo ảnh `C:/Users/TAN MIE/Desktop/1.png` và yêu cầu khắc phục ngay. [Phương án/nguồn số đo](UI_UX_REVISION_02.md). Source HEAD vẫn `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype. Không thay baseline, footer hay code P12 đang được chat khác chỉnh.

## Thay đổi

- S01 nền trắng liền: bỏ lề card chồng, radius/border/shadow và gap16px giữa card. Padding dòng20px/24px; icon44px tại x24; text tại x82; divider1px cùng trục text. Bỏ chevron lặp trên từng dòng.
- Chưa đọc/Tất cả dùng tab chữ + gạch dưới, cao52px, không khung nền phụ. Tab đứng ngoài scroller và giữ nguyên vị trí khi danh sách cuộn.
- Bỏ khối tác vụ Theo dõi Web trên S01. Tại S02 của phiếu nhập/xuất đang chờ, link phụ **Các phiếu chờ Web** mở S03; tiếp tục mở S04 như cũ. Bốn panel được giữ.
- S02 bỏ card và bảng metadata có nền/padding lồng; nội dung dùng cùng lề24px. CTA dock trắng, không tạo footer trống cho thông báo không có chứng từ.
- Giữ icon pastel, unread nguồn, trạng thái, mô tả3 dòng/ghi chú2 dòng và reader. Giữ đầy đủ nội dung, không đổi limit nhập hoặc API/permission/record/stock.

## Kiểm chứng thực tế

- `node scripts/check_notifications.cjs`: **14/14 nhóm PASS**, ghi vào revision-02. Bao gồm4 panel ×6 viewport, filter/read failure, đúng ID P12, dialog/Back/focus, Unicode/newline/từ liền, late receipt, logout và footer Home/P03/P13 cùng chuẩn. [Log JSON](evidence/revision-02/browser-results.json).
- `node scripts/capture_notifications_revision.cjs`:14 ảnh Chưa đọc/Tất cả ở7 viewport:494×950,459×874 (gần ảnh user),360×800,430×932,1440×900,340×420,1869×940. **Không tràn ngang; tab/footer cố định trong cả14 trạng thái**. Reader2997 ký tự khớp nguyên văn, focus trả đúng; không pageerror. [Số đo](evidence/revision-02/layout-observations.json).
- `node --check docs/flows/notifications/notifications.mjs`: PASS. Không viết lại test logic cho thay đổi trình bày;36 Node PASS ở r01 là bằng chứng lịch sử, không ghi là chạy mới.
- Đã xem ảnh actual S01/S02 và459×874; dải nền xanh dọc/ngang user khoanh đã được bỏ, trục chữ và icon thống nhất. S03/S04 giữ thiết kế r01. Visual vẫn cần user review, không tự LOCKED.

[S01 mới](evidence/revision-02/P13-S01.png) · [S02 mới](evidence/revision-02/P13-S02.png) · [Kích thước gần ảnh user](evidence/revision-02/inbox-unread-459x874.png) · [Reader trong danh sách](evidence/revision-02/inbox-reader.png).

File sửa: `notifications/notifications.mjs`, `notifications/style.css`, stylesheet revision trong `auth-session/index.html`; script kiểm tra P13 cập nhật đường vào S03 và output riêng revision. Mới: script capture/báo cáo/phương án. Đã lưu source trước sửa trong evidence, giữ nguyên evidence r01. Coverage/RUN_STATE cập nhật r02; các revision khác bảo toàn.

Behavior: PASS prototype. Integration: BLOCKED production như r01; không phát sinh backend hoặc phần cứng đã nghiệm thu.
