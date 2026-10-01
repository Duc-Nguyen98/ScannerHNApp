# P10 · Context trước triển khai · r01

- Source HEAD/baseline: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Target: `prototype`, `docs/flows/profile/`, trong AppShell P02/P01 hiện có. Working copy có nhiều thay đổi P01–P09 chưa commit; bảo toàn.
- User 2026-09-28 tạm chốt P09 r09; bổ sung state sau. Không thay source P09.
- Đọc P10, Contract 2.0, BOARD_INDEX, B10 đính kèm, AGENTS, UI_STANDARD, auth/home sources, HANDOFF và các phần liên quan DEV_PROPOSAL. P11 chỉ đọc mapping dependency, không triển khai board P11.

## Số đo trước code

| Thành phần | Nguồn / số đo |
|---|---|
| AppShell | VERIFIED_SOURCE `home/style.css`, các module P04–P09: 494×950 CSS px, scale toàn app, nav 75px, không status bar giả |
| Crop B10 | OBSERVED_IMAGE estimated: S01 x61–413, S02 x459–814, S03 x858–1215, S04 x1258–1613; y39–856. Không kéo dãn ảnh thành viewport |
| Header | B10 estimated: title/back khoảng56–64px sau khi bỏ status bar; hero S01 avatar trái/tên phải khoảng190–210px trong shell494 |
| Body | B10 estimated: trắng, góc trên20–24px, padding18–20px, gap10–14px; menu card khoảng90px ở shell494 |
| Control | B10 estimated: field52–56px, radius12px, viền1px nhạt; CTA60px, footer riêng S02; avatar104–112px |
| Typography | B10 estimated: title24–26px, menu20–22px, body18px, hint16px. Arial từ AppShell; không có bằng chứng font gốc B10 |
| Icon | VERIFIED_SOURCE UI_STANDARD: ô pastel lg56/icon30/stroke1.8/radius12; sáu nghiệp vụ dùng operation-icons.css. Lock/status/nav giữ màu ngữ nghĩa |
| Background/crop | Header gradient navy→teal theo B10/P09; avatar initials từ identity, không thêm ảnh ngoài repo, không render board thành UI |

## Quyết định và giới hạn

- VERIFIED_SOURCE auth fixture là nguồn actor ID/name/initials/role và warehouse. Không sửa P01/P02 identity để khớp fixture B10. Contact/alias B10 chỉ là fixture riêng gắn đúng fixture-minhanh; actor khác thiếu dữ liệu hiển thị chưa có.
- UNKNOWN profile PATCH validation/upload: chỉ form preview, allowlist name/nickname/phone; Lưu thông báo chưa kết nối, không commit session, không báo thành công. Dấu sao theo ảnh không suy regex/length/API requirement. Avatar bấm hiển thị chưa có upload adapter, giữ avatar cũ.
- VERIFIED_SOURCE auth chỉ có warehouseOperations; không suy sáu quyền riêng. Grid read-only dùng trạng thái chưa xác minh; tick chỉ khi adapter nhận boolean true riêng từng capability. Không tạo permission editor.
- P11 password→S01, sessions→S04; P14 end-shift. Pending dependency có target/context/returnTo, không fake đổi mật khẩu/thiết bị/end-shift. Security info chỉ copy bảo vệ tài khoản trong B10.
- Shared `openAppModal` giữ dialog trong app, trap focus/inert. Dirty Back/nav cần xác nhận bỏ hoặc tiếp tục chỉnh, không tự lưu. Logout gọi teardown P01, không localStorage.clear; phiếu dở giữ nguyên.
- Không có metadata build production: footer lấy metadata riêng prototype P10-r01, không ghi version1.0.0 của ảnh.
