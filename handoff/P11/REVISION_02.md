# P11 r02 — khắc phục luồng preview mặc định

2026-09-28. User báo Đổi mật khẩu/Phiên đăng nhập không hoạt động bằng `Desktop/1.png`, `Desktop/2.png`, yêu cầu đề xuất và áp dụng khắc phục. Phạm vi P11 và dependency trực tiếp P01/Home; giữ 4 panel, CSS/baseline và mọi thay đổi chat khác (bao gồm P10 đang cập nhật).

**Kết quả:** preview mặc định dùng được ngay, không cần chọn kịch bản. Đổi mật khẩu cập nhật nguồn xác thực thử chung; logout rồi đăng nhập bằng mật khẩu mới được. Danh sách thiết bị có thể thu hồi đúng phiên khác; phiên đã thu hồi không tự trở lại khi rời màn hoặc logout/login. Visual chờ user; behavior PASS prototype; production integration vẫn BLOCKED.

## Nguyên nhân và phương án đã áp dụng

1. r01 đặt `scenario='blocked'` làm mặc định. Điều này đáp ứng ranh giới backend nhưng làm preview đưa cho user không thao tác được. r02 thêm **preview account store dùng chung P01–P11**, chọn mặc định `preview`; chế độ chưa kết nối chuyển thành kịch bản kiểm lỗi chủ động.
2. Adapter r01 giữ credential/danh sách riêng trong P11; credential P01 vẫn cố định, remount/logout làm mất hiệu lực đổi mật khẩu. Store mới được tạo theo vòng đời auth adapter và tồn tại qua logout; P11 dispose chỉ tháo controller, không xóa account. P01 kiểm đúng credential trong store, mỗi lần đăng nhập cấp authSessionId mới. Logout đóng đúng phiên hiện tại.
3. `message` và `scroll` dùng chung giữa form và danh sách nên báo lỗi đổi mật khẩu đi theo sang S04. Nay xóa lỗi/ngữ cảnh cuộn khi đổi loại màn hoặc rời màn. UNKNOWN chỉ khôi phục thông điệp có tên thao tác đang chờ; không bỏ pending request.
4. Response tải danh sách bị bỏ qua khi Back rồi mở lại trước khi tải xong có thể để UI chờ mãi. Nay kết quả của đúng model/phiên cập nhật màn danh sách đang hoạt động; model cũ/dispose vẫn bị bỏ qua. Danh sách được tải lại khi reentry.
5. Receipt thành công cũ có thể còn sau lần đổi mật khẩu tiếp theo bị từ chối. Bắt đầu submit mới xóa receipt cũ; identity key thêm authSessionId để không nhận kết quả thuộc phiên cũ của cùng actor/kho.

Store dùng bộ nhớ, không localStorage/sessionStorage, không log password. Metadata thiết bị/vị trí vẫn là mẫu B11; không suy từ user-agent/IP. Thời điểm đăng nhập/đổi mật khẩu của luồng mặc định lấy từ hoạt động thử hiện tại. Các kịch bản B11/error cũ vẫn cô lập và được kiểm hồi quy, không thay dữ liệu account mặc định. Không thêm API mạng, phần cứng, OTP, policy production hoặc sửa dist/gallery.

## Giới hạn được thể hiện rõ ngoài app

- Tài khoản ban đầu `minhanh` / `preview`; sau đổi, dùng mật khẩu mới để đăng nhập trong **cùng trang đang mở**.
- Logout không reset account và không hồi sinh thiết bị đã thu hồi. **Reload trang hoặc Đặt lại fixture** tạo store thử mới và khôi phục dữ liệu ban đầu. Không lưu credential lâu dài để giả làm backend.
- Policy preview chỉ kiểm các trường bắt buộc và giữ current session sau đổi; đây là cấu hình test công khai, **không xác nhận policy backend**.
- Chưa có backend policy/change/receipt/session effects/list/revoke/reconcile. P15 chưa triển khai; expired vẫn dùng P01 logout guard.

## Kiểm chứng

- Tái hiện trước sửa: [failure.json](evidence/revision-02/before-fix/failure.json) — mở Phiên đăng nhập mặc định không có nút revoke sau chờ; [ảnh](evidence/revision-02/before-fix/failure.png).
- `node --test tests/security.test.mjs tests/security-shared-preview.test.mjs tests/profile.test.mjs tests/home.test.mjs tests/auth-session.test.mjs tests/auth-session-stability.test.mjs tests/dialog-route.test.mjs tests/scanner-dialogs.test.mjs`: **97/97 PASS**, gồm 32 P11 cũ + 12 ca mới dùng chung P01–P11. [Log](evidence/revision-02/node-tests.txt).
- `SECURITY_LIVE_EVIDENCE_DIR=handoff/P11/evidence/revision-02/verified node scripts/check_security_live_preview.cjs`: **11/11 nhóm** [kết quả](evidence/revision-02/verified/results.json): default không mở tools, Back/reentry khi đang tải, revoke/hủy/reentry, mismatch, đổi thật vào store, password cũ sai/password mới đăng nhập được, logout guard, credential và revoke tồn tại qua phiên đăng nhập mới, error không đi theo màn, không persist secret.
- `SECURITY_EVIDENCE_DIR=handoff/P11/evidence/revision-02/regression node scripts/check_security.cjs`: **20/20 nhóm**, 24 layout captures, 4 panel × 6 viewport. Chuyển test disconnected sang chọn kịch bản `blocked` rõ ràng, không bỏ coverage lỗi. [Kết quả](evidence/revision-02/regression/browser-results.json).
- `PROFILE_EVIDENCE_DIR=handoff/P11/evidence/revision-02/profile-regression node scripts/check_profile.cjs`: **12/12 nhóm**. [Kết quả](evidence/revision-02/profile-regression/browser-results.json).
- `HOME_EVIDENCE_DIR=handoff/P11/evidence/revision-02/home-regression node scripts/check_home.cjs`: **14/14 nhóm**. [Kết quả](evidence/revision-02/home-regression/browser-results.json).
- `DIALOG_EVIDENCE_DIR=handoff/P11/evidence/revision-02/dialog-regression node scripts/check_dialogs.cjs`: **16/16 nhóm**. [Kết quả](evidence/revision-02/dialog-regression/browser-results.json).
- Tổng **73 nhóm browser**, không pageerror/request ngoài localhost trong các suite. Các biến môi trường trên được đặt bằng `$env:...` trong PowerShell trước command Node. Không chạy toàn bộ repo hoặc kiểm production/hardware.
- Đã reload tab in-app browser của user, đăng nhập fixture P01, vào P10 → S04 P11 và xác nhận danh sách có thiết bị/nút revoke mặc định. Không đổi mật khẩu người dùng qua tab này; kiểm đổi credential thử trong browser kiểm thử riêng.
- Đã xem screenshot success và sessions thực tế, cùng khung 494×950; CSS r01 được giữ. Ảnh danh sách cuối chờ `aria-busy=false` trước capture, tránh chụp lúc reload tạm khóa nút. Font Designer/pixel match vẫn chưa được xác minh.

## Files

Mới: `docs/flows/auth-session/preview-account-store.mjs`, `tests/security-shared-preview.test.mjs`, `scripts/check_security_live_preview.cjs`.

Sửa: P01 `fixture-adapter.mjs`, `app.mjs`, metadata ngoài app trong `index.html`; Home truyền account store vào P11; P11 `security.mjs`, `security-model.mjs`, `preview-adapter.mjs`; script `check_security.cjs`; bàn giao, coverage và RUN_STATE. Không sửa P01 layout/CSS, P10 UI hoặc các board khác.

[Phiên đăng nhập hoạt động mặc định](evidence/revision-02/verified/sessions-default.png) · [Đổi mật khẩu thành công](evidence/revision-02/verified/password-changed.png) · [Sau thu hồi](evidence/revision-02/verified/session-revoked.png) · [Review hiện tại](REVIEW.html).
