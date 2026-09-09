# P01 — Make UI Login + Start Shift

## 1. Baseline Issues

Baseline đối chiếu: `21a96b04e4635efeaedbeb714058c6f9716332d0`, repo Duc-Nguyen98/WMS_UIUX_HoaNamv2. Đây là **P01 Make UI mới**, không ghi đè gate authentication P01 trước hoặc kết luận P05 toàn app.

Trước: Login là bề mặt trắng phẳng, chưa tách phần giới thiệu sản phẩm khỏi form; nhãn dài; Start Shift khác cấu trúc, không hiển thị trạng thái kho; các hint credential và control QA mặc định xuất hiện dưới form. Chưa có enterKeyHint và loading riêng cho Start Shift. Hệ thống auth đã hoạt động và không cần viết lại.

## 2. Changes Implemented

- Nhận diện Hoa Nam Scanner hiện có (biểu tượng scanner + wordmark HOA NAM / SCANNER), không thêm logo đối tác/stock photo hoặc tạo logo chính thức mới.
- Tiêu đề Login **Quản lý kho Hoa Nam**; subtitle **Đăng nhập để bắt đầu phiên làm việc**. Card riêng heading Đăng nhập, white surface, radius22, border/shadow nhẹ.
- Nền gradient/radial rất nhẹ #DCECF1/#F0F7F9 → #FAFCFC, dùng các tint Hoa Nam; primary #0C6286, brand #0C5D7D. Giữ Public Sans và semantic warning/error màu phụ.
- Card, typography, khoảng cách và CTA52px thống nhất cả Login/Shift. Trạng thái load/error/disabled không đổi kích thước button. Error có icon + text + live/alert, không toast.
- Label luôn hiện; identifier text input hỗ trợ username/email/phone như contract cũ. Next chuyển focus sang password; password Go/Enter submit. Eye48px, aria-pressed và label toggle. Validation focus field đầu tiên.
- QA auth UI chỉ render khi **?qa=1**. URL mặc định không có hint credential/OTP/role/debug. Không triển khai env VITE_SCANNER_QA vì query flag đã đáp ứng cơ chế cho phép của yêu cầu. Query flag không phải security boundary.
- Shift hiển thị session name/role thật của adapter hiện có, Kho Hoa Nam, trạng thái từ store hiện có. Không tạo user/warehouse mới. Active và paused có icon/text rõ.
- Kho paused: vẫn cho vào ca **chỉ xem/tra cứu**, giữ nguyên P02; không tự chặn ca readonly hoặc mở quyền write. Unknown/read-error: không giả hiển thị active, nút chờ kiểm tra dữ liệu.
- Shift có trạng thái **Đang bắt đầu ca…**, lock double-submit ở UI; delay180ms cho feedback hiển thị, gọi nguyên service synchronous cũ, không giả request backend.
- Đăng xuất giữ là text action phụ; Start Shift chỉ có một primary CTA. Không thêm kho selector/remember device hay feature auth mới.

## 3. Before / After

Evidence: `artifacts/scanner-entry-ui/before/{360,390,430}-login.png`, `*-shift.png` — chụp static baseline trước sửa; `before/capture.json`.

Sau: `artifacts/scanner-entry-ui/after/{width}-login.png`, `*-shift-active.png`, `*-shift-paused.png`, `*-inline-validation.png`, `*-loading.png`, `*-invalid-credentials.png`, `*-short-height-keyboard-proxy.png`, `*-safe-area.png`, `*-qa-locked/disabled/offline/server.png`, `*-home-unchanged.png`.

Ảnh full-page giữ chiều rộng viewport; chiều cao dài hơn nếu error/keyboard làm cần cuộn. Không giả ảnh resize thành evidence. Cặp 390 Login và Shift cho thấy đổi hierarchy/card/brand, không phải chỉ thay vài pixel.

## 4. Login States

| State | Hành vi |
|---|---|
| Default / filled | Header sản phẩm, card form; no QA; label/helper/placeholder rõ |
| Focus | Outline primary + halo nhẹ; control không đổi chiều rộng |
| Empty validation | Lỗi riêng có icon + text, aria-describedby, focus field đầu |
| Show/hide | Password toggle đúng type, current-password autofill không đổi |
| Loading | Đang đăng nhập… + spinner; inputs/button disabled; lock dùng lại, không double submit |
| Invalid | Message từ authErrors cũ, inline gần form với role alert; clear password cũ như baseline |
| Locked / disabled / offline / server | Giữ contract thông báo hiện có, chỉ scenario controls sau ?qa=1 |
| Session expired/logout | Giữ access.message trong output trên form |
| Forgot password | Giữ flow liên hệ quản trị viên; không redesign màn recovery ngoài scope |

## 5. Start Shift States

Active: session user/role + fixed Kho Hoa Nam + Đang hoạt động → Bắt đầu ca làm việc.

Paused: Kho đang tạm dừng hoạt động; giải thích vào ca chỉ để xem và tra cứu, nhập/xuất/cập nhật đang khóa → same CTA. Sau bắt đầu ca, test xác nhận Nhập kho disabled.

Session chưa start + reload: vẫn Shift. Session đã start: route guard cũ về Home; không tạo shift thứ hai. Loading180ms UI không sửa expiresAt/role/permissions. Role từ session, không cung cấp control chỉnh sửa trên Shift.

## 6. Mobile Viewport Validation

| Viewport | Login + Shift | Validation/loading | CTA và field khi thu nhỏ | Kết quả |
|---|---|---|---|---|
| 360×800 | Trước/sau, active/paused | Đạt | Height420, scrollIntoView + hit-test | PASS emulation |
| 390×844 | Trước/sau, active/paused | Đạt | Height420, scrollIntoView + hit-test | PASS emulation |
| 430×932 | Trước/sau, active/paused | Đạt | Height420, scrollIntoView + hit-test | PASS emulation |

Safe top47/bottom34 mô phỏng qua token; CTA vẫn cuộn tới được. Không fixed footer/action trên entry screens, native scrolling. Trường và CTA trong viewport, không overlay che tại tâm hit-test. Real iOS/Android IME/password-manager/VoiceOver **chưa test vật lý**; emulation không phải chứng nhận thiết bị.

## 7. Accessibility

- Axe-core WCAG2A/AA +2.1AA: Login, invalid, Shift active, Shift paused ×3 =12 lượt, **0 automatic violation**. Gradient vẫn có incomplete color-contrast vì engine không resolve nền; kiểm tra bổ sung bằng ratio endpoint trong `after/contrast.json` (tất cả foreground/surface text pairs ≥4.5:1).
- Label/input associations, helper/error IDs, icon aria-hidden, named eye48px, primary52px; no nav trước auth. Spinner có text đi kèm. Error vùng reserve64px tránh phần lớn dịch chuyển; thông báo dài vẫn mở rộng/scroll thay vì cắt chữ.
- Reduced-motion CSS tắt animation/transition trong `.sc-entry`. Screen-reader name/role/value kiểm qua semantic DOM/axe, không khẳng định AT thật.
- Password/identifier values không lưu mới, không đưa vào URL/log. Fixture adapter/hash/session giữ nguyên baseline.

## 8. Regression / phạm vi

`scripts/verify-entry-scope.mjs`: so sánh với 21a96b0 — **useScannerAccess nguyên vẹn**, auth/session adapter, role/policy/domain và toàn bộ CSS/logic global footer không đổi. `scanner-preview.tsx` chỉ thêm props trạng thái kho/readiness vào component auth; không sửa nội dung nghiệp vụ.

`scripts/qa-scanner-entry-ui.mjs`: 3/3 viewport; Next/Enter/toggle/invalid/loading, valid Login→Shift→Home, Shift reload, logout→Back/deep-link, warehouse paused vẫn readonly, QA opt-in. Một lịch sử rỗng khi browser Back có thể rời app về about:blank; không lộ private route. Script kiểm lại deep-link vào app phải về Login, không cố tạo rule chặn browser rời app.

28/28 tests: `tests/scanner-account.test.mjs`, `scanner-auth.test.mjs`, `scanner-policy.test.mjs`, `scanner-model.test.mjs`. Scoped TypeScript/lint exit0. `npm run build:scanner` export hoàn tất; Windows Node26 có assertion khi đóng prerender như baseline, nên QA chạy trực tiếp static artifact port4174. Không tuyên bố global build/type lint cả repo archives.

Home sau start vẫn có footer QR54px và active nav hiện hữu; entry CSS chỉ target `.sc-entry` / wrapper đang chứa `.sc-entry`. Không đổi Bottom Navigation, không chạy P02 Global.

## 9. Open Decisions

- Kho paused **được phép bắt đầu ca readonly** là rule đã tồn tại. Muốn cấm vào ca hoàn toàn cần prompt nghiệp vụ riêng; không tự sửa ở đây.
- Logo scanner mark/wordmark hiện hữu được dùng lại. Nếu muốn logo corporate chuẩn thay vì mark app, cần asset vector đã xác nhận.
- AC13 được áp dụng đúng phạm vi hai màn entry: no QA/hint mặc định. QA harness trong màn kho/Home được giữ nguyên theo yêu cầu KHÔNG thay global Scanner; việc dọn toàn app là scope khác.
- Không có API/auth production mới. ?qa=1 chỉ UI opt-in, không phải quyền truy cập hệ thống thật.
- Cần device UAT IME/safe area/autofill thật trước release. Không nâng kết luận P05 toàn app thành PASS vì hai màn này đạt UI gate.

## 10. Final UI/UX Score

Rubric review nội bộ **riêng Login/Shift**, 10 tiêu chí ×10 điểm. Đây là đánh giá thiết kế chuyên gia dựa trên ảnh và test, không phải chứng nhận khách hàng/WCAG hay điểm toàn app. Baseline và after cùng tiêu chí, không dùng điểm52 audit live app cũ để so hai màn mới.

| Tiêu chí | Baseline | Sau | Evidence |
|---|---:|---:|---|
| Hierarchy/layout |7|9.5|Product hero vs card form rõ ràng |
| Branding restrained |7|9.5|Mark cũ + wordmark, không imagery/marketing |
| Nhất quán Login/Shift |6|9.5|Cùng gradient/card/CTA typography |
| Form quality |8|9.5|Label/helper/toggle/focus và Next/Go |
| Error/feedback |7|9|Inline, live, không đổi kích thước CTA; dài vẫn cuộn |
| Loading stability |7|9.5|Button giữ size, lock Login/Shift |
| Keyboard/scroll |7|9|Next/Enter, small-height hit-test; chưa physical IME |
| Mobile/responsive |7|9|3 viewport, inset simulation, native scroll |
| Accessibility |8|9|12 axe checks + contrast endpoints; AT thật chưa test |
| Regression/integration fidelity |9|9.5|Hook/service/role/footer nguyên vẹn, paused đúng data |
| **Tổng /100** |**73**|**93**|Đạt mục tiêu92 trong scope UI |

## 11. Acceptance

| AC | Kết quả |
|---|---|
|01–03|PASS — rõ visual change, restrained brand, Login/Shift cùng hệ|
|04–08|PASS — labels, eye, inline errors, disabled loading, Next/Enter|
|09|PASS emulation — field/CTA scroll và hit-test không bị che, device thực nêu giới hạn|
|10–11|PASS — tên/role/store status; paused thông báo trước readonly shift|
|12|PASS — scope script chứng minh auth/session/guard/service nguyên vẹn|
|13|PASS entry scope — không QA trong mặc định; chỉ ?qa=1|
|14–16|PASS — Home không sửa, 0 console/pageerror, 3 viewport|
|17|PASS — giữ Hoa Nam primary/Public Sans, chỉ tint và semantic phụ|
|18|PASS — review score93/100 theo rubric công khai trên|

File mới: `components/scanner-entry-ui.css`, `scripts/qa-entry-before.mjs`, `scripts/qa-scanner-entry-ui.mjs`, `scripts/qa-entry-contrast.mjs`, `scripts/verify-entry-scope.mjs`, báo cáo và evidence `artifacts/scanner-entry-ui/`.
File sửa: `components/scanner-auth.tsx` (chỉ import/view component); `components/scanner-preview.tsx` (một dòng props); `scripts/build-scanner-pages.mjs` (copy CSS isolated); static artifact deployment.

**P01 PASS — READY FOR P02**
