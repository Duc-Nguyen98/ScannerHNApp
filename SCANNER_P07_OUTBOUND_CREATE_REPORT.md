# P07 — OUTBOUND Create / Thông tin yêu cầu

Ngày09/09/2026. Phạm vi duy nhất: **Xuất kho → Thông tin yêu cầu**. Không thực thi P08.

## 1. Executive summary / precondition

P06 PASS đã được đối chiếu. P01–P04/P05 là visual baseline bắt buộc; P06 Review/Result cũng được regression. Đã đọc P07, COMMON, RUN_CODEX_MASTER_COMMAND và positive/negative reference. Chỉ sửa presentation của `ScannerOutbound` và integration class/header/copy; không thay business flow.

Đã nâng cấp hai bước Xuất kho: **Người nhận và giao hàng** và **Số lượng cần soạn**. Recipient directory, phone/address, group, target quantity và notes vẫn là field/handler hiện có. CTA bước1 là `Tiếp tục: số lượng`; CTA bước2 là **`Bắt đầu soạn hàng`** rồi chuyển vào scanner OUTBOUND hiện tại.

- [Gallery Before / After](artifacts/scanner-p07-outbound-create/index.html)
- [QA P07](artifacts/scanner-p07-outbound-create/after/qa.json)
- [E2E regression](artifacts/scanner-p07-outbound-create/e2e/e2e.json)
- [Prompt/reference inputs](artifacts/scanner-p07-outbound-create/input/)

## 2. Implementation

| Vùng | Trước | Sau P07 |
|---|---|---|
|Header/context|Header trắng “Thông tin phiếu”, Kho nằm trong form|Deep warehouse hero, title Xuất kho, Kho Hoa Nam + trạng thái hoạt động|
|Progress|Text stepper generic|Hai bước có số bước, active state và surface theo P04/P05|
|Recipient|Các field dàn dài, picker chưa có hierarchy|Một surface “Thông tin giao / nhận”, group select và row recipient có icon/arrow; field phone/address mở rõ khi chọn hoặc có lỗi|
|Target|Field tổng số lượng nằm cùng card|Surface “Số lượng cần soạn”, input số lớn trong tonal focus box, recipient summary và note|
|CTA|“Tiếp tục: số lượng” / “Bắt đầu quét” generic|CTA theo intent, `Bắt đầu soạn hàng` với send icon/arrow, sticky và mobile-safe|
|Error|Validation hiện có nhưng có field ẩn khi recipient trống|Giữ validator; khi submit lỗi, recipient/phone/address hiển thị để sửa gần reason|
|Picker|Bottom sheet style cũ|App-local recipient sheet, bounded/focus-trapped, rows directory rõ ràng|

Không card hóa từng field; mỗi bước có một surface chính, không thêm business step hoặc recipient rule.

## 3. Business / RBAC freeze

- `outboundErrors` giữ nguyên: tên phiếu, recipient, phone10 số bắt đầu0, address, target integer1–99.999.
- `ScannerOutbound` vẫn gọi `update`, `onScan`, directory picker và parent `go('scan')`. Không tự đi thẳng vào scanner khi recipient/target chưa hợp lệ.
- Chọn group vẫn reset recipient/phone/address như trước. Picker dùng agency fixtures hiện có; không tạo API/directory mới.
- Target không đổi stock. Scanner OUTBOUND/Post và inventory ledger không thay đổi.
- Viewer và warehouse paused vẫn bị chặn ở parent `actionDenied`; không render form write. Lookup/read-only và route guard giữ nguyên.
- Existing draft protection: đổi context khi form đã có recipient/target mở confirm; Hủy giữ dữ liệu. Quay lại từ scanner khôi phục đúng bước Số lượng và field values.
- Auth/session, permission matrix, Inbound, Warranty/Parts, NFC, Warehouse Paused và Post semantics không đổi.

## 4. Responsive / interaction

- Header và hero dùng approved `bg_warehouse_main.jpg`; không stock image mới.
- Input phone dùng `tel`, target dùng numeric, tất cả label hiện rõ; error inline có `aria-invalid`/`aria-describedby` theo component cũ.
- Picker AppDialog có focus autofocus, Escape/Back close/restore, max-height scroll và contained bounds.
- Sticky CTA lấy geometry từ `useScannerMobileLayout`; không đặt spacer theo viewport riêng. Last field/textarea scroll lên trên CTA.
- 390×844 là target chính; style co kiểm soát cho 360×800 và430×932, không reorder layout.

## 5. QA matrix

| Case | Expected / Actual | Result |
|---|---|---|
|Recipient form mở|Thông tin giao/nhận, group, recipient trigger|PASS|
|Submit trống|Tên/recipient/phone/address reasons inline, focus tên|PASS|
|Picker|Sheet trong viewport; chọn agency điền recipient/phone/address|PASS|
|Phone/address|Giữ field có sẵn, không bypass read-only/manual rule|PASS|
|Step2|Target nổi bật, giá trị mặc định1, note và recipient summary|PASS|
|Target0|Reason integer1–99.999; focus giữ ở target|PASS|
|Target2 + note|CTA Bắt đầu soạn hàng chuyển scanner OUTBOUND|PASS|
|Back từ scanner|Khôi phục bước2, target/note giữ nguyên|PASS|
|Draft context switch|Confirm app-contained; Hủy giữ draft|PASS|
|Viewer|Không có surface/CTA write|PASS|
|Paused|Không có surface/CTA write; lookup vẫn được phép|PASS|
|Store|Không thay local store ở Create/recipient/quantity/scan boundary|PASS|

QA P07 chụp 15 states mỗi viewport: login, home, recipient, recipient-validation, picker, quantity, quantity-validation, quantity-filled, scanner-boundary, draft-confirm, short-height, keyboard-proxy, safe-area, viewer, paused.

## 6. Mobile / accessibility / overlay

| Viewport | States | Axe violations | Console/page errors | Result |
|---|---:|---:|---:|---|
|360×800|15|0|0|PASS|
|390×844|15|0|0|PASS|
|430×932|15|0|0|PASS|
|Desktop1440×1000 (app390)|15|0|0|PASS|

- 15 audited captures×4 viewports: 0 axe WCAG A/AA violations.
- Recipient sheet, draft confirm và paused warning đều bounded trong `.sc-app-viewport`; không native top-layer/body portal drift.
- Short height420px: note/target scroll hoàn toàn lên trên sticky CTA; 44px touch targets; no horizontal overflow.
- Keyboard proxy giảm `visualViewport.height`340px: target/note và sticky CTA không che nhau; safe-area top24/bottom34px PASS.
- Focus visible, labels, inline error association, reduced motion và Enter/submit flow PASS.
- Chưa VoiceOver/TalkBack/IME/OS Back/camera hardware thật; browser proxy/axe không thay thế native UAT.

## 7. Visual evidence

- [390 Before / After recipient + quantity](artifacts/scanner-p07-outbound-create/index.html)
- [Responsive Before / After](artifacts/scanner-p07-outbound-create/index.html)
- [Picker/validation/sticky states](artifacts/scanner-p07-outbound-create/after/)
- [Raw QA](artifacts/scanner-p07-outbound-create/after/qa.json)

BEFORE lấy từ regression form outbound trước P07; AFTER là component đã scope `sc-phone-outbound-create`. Gallery có P01–P04 baseline relationship, recipient picker, validation, quantity, draft, viewer/paused và scanner boundary.

## 8. Regression / baseline

- Existing E2E: **36/36 checkpoints PASS** trên 360/390/430, gồm login/shift/Home, inbound submit/Post, outbound recipient/quantity/retry/Post, trace/docs, Parts, Warranty, NFC và History. [E2E](artifacts/scanner-p07-outbound-create/e2e/e2e.json).
- Unit/domain suite: **31/31 PASS** (auth, policy, model, intent, design fixtures, shift).
- TypeScript scanner, scoped oxlint và `git diff --check` PASS.
- P01–P06 files/logic/visual baseline không thay đổi; P07 chỉ sửa `scanner-outbound.tsx`, thêm `scanner-outbound.css`, main integration và build/QA artifacts. Existing inbound scanner branch and P06 review/result remain intact.
- Static artifact build hoàn tất; Windows libuv post-prerender warning được xử lý như baseline, runtime browser không có page/console error.

## 9. Open decisions

Không có ambiguity nghiệp vụ mới. Recipient directory vẫn là fixtures hiện có; API/danh mục thật do bước tích hợp sau cung cấp. Không thêm rule ngoài `outboundErrors`, không thay target/Post/stock/RBAC. Native keyboard/AT/hardware ngoài phạm vi P07.

## 10. Acceptance / Stop gate

| Acceptance P07 | Result |
|---|---|
|Xuất kho hierarchy rõ|PASS|
|Recipient/phone/address/group/notes giữ đúng field|PASS|
|Target quantity nổi bật|PASS|
|Không bypass recipient/quantity|PASS|
|CTA Bắt đầu soạn hàng / Quét mã theo flow|PASS|
|Operational Pro kế thừa P01–P06|PASS —visual evidence|
|Picker/overlay contained|PASS|
|Keyboard/safe-area/sticky mobile|PASS|
|RBAC/paused/draft/Post freeze|PASS|
|360/390/430 + regression|PASS|
|Console/page/accessibility|PASS —0 errors,0 axe violations|
|Đúng scope, không P08|PASS|

Dừng sau P07. Không commit/push/deploy.

P07 PASS — READY FOR P08
