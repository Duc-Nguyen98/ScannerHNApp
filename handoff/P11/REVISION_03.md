# P11 r03 — cân màn kết quả, dialog xác nhận và kết quả

2026-09-28. User yêu cầu sửa cuộn dư của P11.S03, chuyển dòng kết quả đăng xuất từ xa thành dialog, khóa contract này cho màn sau. Source gốc `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype trong `docs/flows/`. Giữ 4 panel, backend/credential/session logic r02 và thay đổi của các chat khác.

## Đã áp dụng

- **S03:** gom nội dung vào một nhóm dọc cân giữa, giảm vòng check140→120px, giảm gap/chiều cao hàng metadata và cân typography. CTA đáy giữ vị trí. Nội dung ngắn vừa khung tự nhiên, không dùng overflow hidden để giấu dữ liệu.
- Khung494×950: vùng cuộn đo được **clientHeight=scrollHeight=756**, scrollTop0. Wheel lên/xuống1200px không đổi vị trí content/header/footer hoặc pageScroll trên **6 viewport**. Nội dung tên dài thật vẫn cuộn trong app, footer đứng yên.
- **Revoke:** dialog **Hủy / Đăng xuất** trước thao tác. Sau receipt và danh sách xác minh, dialog **Đã đăng xuất thiết bị / Đã hiểu**. Không có Hủy/Không sau thành công vì thao tác đã hoàn tất và không hỗ trợ hoàn tác.
- Bỏ `.p11-message` và dòng trạng thái cam khỏi nội dung. Thất bại tổng quát/blocked cũng dùng dialog; UNKNOWN dùng **Để sau / Đối chiếu**, giữ request và khóa retry. Field validation vẫn tại input, hint tĩnh và data empty/loading vẫn là nội dung trang. Panel kết quả S03 vẫn giữ ID, không bị thay bằng một popup.
- Component mới `shared/action-dialog.mjs`/`.css`: tiêu đề, mô tả, nút chính/phụ, icon có nguồn; text gán qua textContent. Dùng `openAppModal` và `dialog-route.mjs` hiện có, không thêm hệ thống overlay song song.
- Overlay nằm trong app, một lớp, nền inert, Tab/Shift+Tab trong dialog, Enter xác nhận. Back/Escape đóng dialog trước, không hoàn tác việc đã xong. Bấm nền không đóng và không làm mất focus. Đóng trả focus về trigger còn tồn tại hoặc heading màn hiện tại.
- `openAppModal` có tùy chọn `dismissOnBackdrop` mặc định true để giữ các caller cũ; action dialog dùng false. P10 và P03 hồi quy đạt.

## Contract đã khóa cho màn sau

**HN-action-feedback-v1** được ghi trong [UI_STANDARD.md](../../docs/flows/shared/UI_STANDARD.md), [AGENTS.md](../../AGENTS.md) và [CONTRACT_CONTEXT.md](../CONTRACT_CONTEXT.md). Chỉ thị mới của user là nguồn phê duyệt, có hiệu lực bổ sung Contract v2.0:

1. Confirm trước mutation: Hủy / tên hành động.
2. Kết quả đã xác minh: Đã hiểu / Đóng; không đặt Hủy giả sau khi hoàn tất.
3. Lỗi/UNKNOWN bằng dialog tương ứng, không chèn toast/status vào body làm đổi bố cục.
4. Giữ validation tại field, hint tĩnh, empty/loading và panel có ID. Không tự sửa hàng loạt các board đã chốt ngoài yêu cầu.

## Kiểm chứng

- `SECURITY_LAYOUT_EVIDENCE_DIR=handoff/P11/evidence/revision-03/layout-dialog-final node scripts/check_security_dialog_layout.cjs`: **7/7 nhóm**, S03/confirm/result mỗi loại6 viewport. Kiểm mouse wheel thật, scroll/page/layout giữ nguyên, focus trap, backdrop, Hủy, Đã hiểu, Back/Escape, failure/UNKNOWN, stress tên dài. [Kết quả/metrics](evidence/revision-03/layout-dialog-final/results.json).
- `SECURITY_EVIDENCE_DIR=handoff/P11/evidence/revision-03/regression node scripts/check_security.cjs`: **20/20 nhóm**, **24 layout captures** đủ4 panel×6 viewport. Tests được cập nhật để đóng dialog thông báo/Để sau trước bước tiếp theo, không bỏ assertion nghiệp vụ. [Kết quả](evidence/revision-03/regression/browser-results.json).
- `SECURITY_LIVE_EVIDENCE_DIR=handoff/P11/evidence/revision-03/live-preview node scripts/check_security_live_preview.cjs`: **11/11 nhóm**, vẫn kiểm đổi password→logout→P01 bằng password mới, revoke không tự hồi sinh, không persist secret. [Kết quả](evidence/revision-03/live-preview/results.json).
- `PROFILE_EVIDENCE_DIR=handoff/P11/evidence/revision-03/profile-regression node scripts/check_profile.cjs`: **12/12 nhóm**. [Kết quả](evidence/revision-03/profile-regression/browser-results.json).
- `DIALOG_EVIDENCE_DIR=handoff/P11/evidence/revision-03/dialog-regression node scripts/check_dialogs.cjs`: **16/16 nhóm**. [Kết quả](evidence/revision-03/dialog-regression/browser-results.json).
- `node --test tests/dialog-route.test.mjs`: **6/6 PASS**. [Log](evidence/revision-03/dialog-route-tests.txt). Không chạy lại bộ97 logic r02 vì không sửa model/adapter/auth; kết quả r02 được giữ, không gán là lượt chạy mới.
- Tổng **66 nhóm browser** trong các suite trên. `node --check` security/action-dialog/app-modal PASS. Biến môi trường được đặt bằng `$env:...` trong PowerShell. Không kiểm toàn repo hoặc production/hardware.

Lượt layout đầu phát hiện bấm nền không đóng nhưng làm mất focus nút Đã hiểu, nên Enter chưa kích hoạt nút. Đã sửa `pointerdown` chỉ cho dialog explicit-dismiss; lượt cuối7/7 PASS. Giữ [failure gốc](evidence/revision-03/layout-dialog/failure.json), không ghi đè bằng chứng lỗi.

## Visual và bàn giao

- Đã xem [màn kết quả cân lại](evidence/revision-03/layout-dialog-final/success-494x1000.png), [dialog xác nhận](evidence/revision-03/layout-dialog-final/confirm-494x1000.png), [dialog thành công](evidence/revision-03/layout-dialog-final/result-494x1000.png).
- Viewports:494×1000,360×800,430×932,1440×900,340×420,1869×940. App494×950, DPR1, Arial; giữ baseline B11. Font Designer/pixel match chưa xác minh; visual chờ user review.
- Behavior PASS trong phạm vi trên; integration production vẫn BLOCKED như r02. Màn/dialog không tạo thành công thật từ dữ liệu chưa xác minh.
- Sửa source: `security/security.mjs`, `security/style.css`, shared `app-modal.mjs`; thêm `action-dialog.mjs`/`.css`, nạp CSS trong auth entry. Thêm script layout/dialog; cập nhật hai script P11 để kiểm flow dialog mới. Cập nhật contract, coverage và RUN_STATE, không sửa dist/gallery/push/deploy.
