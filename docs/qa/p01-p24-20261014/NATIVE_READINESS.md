# Native app readiness — 14/10/2026

User đã chọn **apps/wms-mobile** và preview cùng origin BE. Bản primary ở native-same-origin/ là React Native Web build thật, không fixture/gallery. Bản native-app/ trước đó dùng /wms-api local proxy và giữ riêng làm trace, không chọn làm gói cùng origin.

## Đã kiểm

- Build riêng Vite, 1048 modules; relative assets cho mount subpath.
- Preview-only build config dùng environment DEV canonical của native; không sửa env.web.ts/vite.config.mjs/app source hoặc kích hoạt watcher.
- Login render local PASS, không page error. Client gọi GET public health thật tại khohoanamdev.lptech.info.vn; không đăng nhập, 0 mutation.
- Health server khai SHA 709744875a039178f432574ce1b59aaa3b42395c và tier dev-test.

## Chặn nghiệm thu full 24

1. **Typecheck full native FAIL**: P11Frame DOM types, test P09 và các bản source handoff P12 bị đưa vào chương trình TypeScript. Không sửa ngoài scope hoặc loại test để lấy PASS.
2. **Jest full native có FAIL** ở wmsContract.test.ts (assertion allowlist If-Match chưa khớp source hiện có). Full run cần kết luận riêng; build Vite không thay TS/Jest.
3. **P13 native adapter còn legacy**: services/wms/notifications.ts dùng page; mapNotification fallback raw.notification_id; writeNotification gửi body:{}; có read-all. Khác revision 2 yêu cầu recipient ID/cursor/PATCH no body/query và không mở read-all. Chưa sửa trong lượt preview này.
4. **P20 native adapter còn fallback thiếu proof**: warrantyComponentRead.ts lấy postedAt từ created_at, itemQuantity fallback scanned_qty/required_qty/0; hasMore có suy từ page.items.length. Chưa áp header/schema/proof p20-component-history-v1 như handoff mới. Chưa sửa trong lượt này.
5. **Contract owner mới chưa chứng minh đủ native binding**: chưa thấy p22-nfc-history-v1, component-issue-requests hoặc attachments/requests call-site trong native src; P23 chưa có collection scan-sessions riêng. Không suy route BE đã có thành 24 màn app đã nối.
6. **Runtime pin riêng chưa đồng bộ**: P09 DEV read đang pin 026f4f75; P11 pin 27e69d21; server health đã là 70974487. Giữ guard fail-closed, không tự nâng pin hoặc bật command.
7. **Same-origin URL chưa deploy**: /test-preview/ trên BE trả 404; SSH triển khai qua cấu hình hiện hữu timeout. Static Pages đã có nhưng browser API bị CORS; không cấp token/admin để bypass.

## Handoff đúng phạm vi

DEV nhận ZIP native same-origin và manifest, mount tại /test-preview/p01-p24-20261014/ sau release được duyệt. Đây là URL mục tiêu, chưa URL đã chạy. Không đổi schema/cờ hoặc seed để tạo evidence.

Kiểm bằng tài khoản tester được phép: runtime/identity/kho, list/detail/null/totals/paging/deny/UNKNOWN, rồi owner mutation riêng theo dữ liệu thử đã duyệt. Không báo “all 24 PASS” từ entry login hoặc 91 panel HTML mock.

P14_SHIFT_ENABLED, P19_COMMAND_RECOVERY_ENABLED và mixed rollout giữ policy đã duyệt riêng; không đổi trong packaging. Token/password/proof/PII không có trong public artifacts.
