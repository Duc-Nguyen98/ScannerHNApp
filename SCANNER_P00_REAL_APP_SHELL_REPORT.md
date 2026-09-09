# P00 — REAL MOBILE APP PREVIEW SHELL

## Kết luận / phạm vi

**P00 PASS — READY FOR P01**

Đạt acceptance P00 về app shell và containment trên bản build tĩnh local. Không phải PASS nghiệm thu toàn app, không thay các gate P05/P02 cũ và không chạy P01 tiếp theo. Chưa commit/push/deploy: giữ thay đổi trong workspace và bản static local để người dùng review, đúng yêu cầu dừng sau report.

Baseline source: `6dfb8aad0402660ef73593dbd108eefccc801b1a`. Đã đọc đầy đủ `P00_REAL_MOBILE_APP_PREVIEW_SHELL.md`, `COMMON_HOANAM_SCANNER_OPERATIONAL_PRO.md`, `RUN_CODEX_MASTER_COMMAND.md`; ảnh positive/negative do người dùng cung cấp. P00 là phase đầu, không có gate report phase trước.

Positive reference dùng làm định hướng runtime mobile / hierarchy và clipping; negative reference xác định lỗi backdrop phủ desktop. Không copy Home hero/ảnh kho/KPI giả trong reference vào app vì P00 chỉ sửa shell, không redesign Home hoặc business flow.

## 1. Trước sửa / nguyên nhân gốc

- Không có app viewport cố định: `.sc-phone` cao theo nội dung, cuộn window/body.
- Global scanner, warehouse dialog, manual/confirm dùng `<dialog>.showModal()` nên nằm trên native browser top-layer. `overflow` của phone không thể clip top-layer hoặc `::backdrop`.
- Avatar sheet và recipient picker cũng dùng native dialog; dirty confirm ở profile/password và tạo phiếu mới dùng `window.confirm`, busy alert dùng `window.alert`.
- Footer/CTA đo theo browser/phone rộng nhưng không có một runtime root ổn định.

BEFORE: `artifacts/scanner-shell-p00/before/{360,390,430,1440}-launcher.png`, `geometry.json`. Cả 4 lượt đều xác nhận `nativeModal: true`. Desktop trước có backdrop phủ toàn vùng ngoài phone.

## 2. Kiến trúc sau sửa

```text
.sc-app-shell                 preview host; ngoài app không bị dim
└─ .sc-device                desktop device frame / mobile full screen
   └─ .sc-app-viewport       relative + overflow:hidden + isolation
      ├─ .sc-screen-scroll  vùng cuộn runtime riêng; body không cuộn
      │  └─ Scanner content/header/navigation/CTA
      └─ .sc-app-overlay-root  absolute inset:0; cùng kích thước app
         └─ .sc-overlay-layer
            ├─ .sc-app-backdrop  absolute inset:0
            └─ .sc-app-dialog   form/confirm/sheet scroll bên trong
```

- Desktop mặc định viewport390×844 (thu ngắn nếu browser thấp), không tính border vào kích thước nội dung; có CSS variables device width/height để QA đúng360/390/430.
- Mobile≤600px: device100vw×100dvh; viewport theo visualViewport khi bàn phím thu hẹp vùng nhìn; cùng overlay components, không tách implementation desktop/mobile.
- `.sc-screen-scroll` cuộn riêng, overscroll contain; `.sc-app-viewport` clip cả nội dung và overlay. Body/host không cuộn. Footer/CTA absolute trong viewport, không bám browser desktop; reserved space vẫn lấy chiều cao thực của nav/orb/CTA.
- Một lỗi triển khai trung gian (nav absolute bám nhầm scroll container) đã được tìm qua test Thu hồi NFC bị che, sửa scroll container không làm containing block cho footer. Lượt cuối đã bấm được CTA và chạy E2E đầy đủ.
- Route đổi màn dùng `scrollAppTop()` thay window.scrollTo. Không thay route names hay navigation intent.

## 3. Shared overlay components

`components/scanner-app-overlay.tsx`:

| Component | Vai trò |
|---|---|
| AppDialog | Core ARIA dialog, imperative adapter giữ open/close callbacks hiện có |
| AppModal | Controlled dialog có title/description/close |
| AppBottomSheet | AppModal variant sheet |
| AppActionSheet | Alias bottom sheet cho lựa chọn hành động |
| AppConfirmDialog | Xác nhận bỏ thay đổi trong app, Promise giữ semantics accept/cancel |
| AppToast | Feedback portal trong root, không portal body |

Lưu ý `AppDialogHandle.showModal()` là tên phương thức **adapter React**, chỉ setState rồi render div role=dialog vào app root; KHÔNG gọi HTMLDialogElement.showModal, KHÔNG có native top-layer. Có thể đổi tên adapter khi DEV tích hợp nhưng không đổi behavior.

Mọi dialog/sheet app hiện có đã đổi qua AppDialog hoặc AppConfirmDialog. Các thông báo thành công/lỗi vốn là inline output/alert vẫn inline trong vùng scroll, không biến chúng thành overlay hoặc toast mới. AppToast là primitive dùng chung sẵn cho feedback layer; không thêm toast nghiệp vụ ngoài scope.

## 4. Overlay migration / coverage

| Overlay | Sau sửa |
|---|---|
| Global Scanner Sheet | AppDialog sheet; đúng4 actions; NFC/parts không thêm |
| Discard draft khi đổi tác vụ | Nội dung confirm trong sheet hiện có; không reset trước xác nhận |
| Tạo phiếu mới khi có draft | AppConfirmDialog thay window.confirm; cancel giữ draft |
| Warehouse status | AppDialog với nguyên permission, reason, confirm và audit callback |
| Camera fallback + manual input + box qty | AppDialog sheet; data-app-autofocus do core điều khiển |
| NFC confirm/revoke | AppDialog dùng callback hiện có, giữ reason/state |
| Warranty status/media confirm | AppDialog; không đổi state machine |
| Logout confirm | AppDialog; cancel giữ session, confirm chạy nguyên clear/logout |
| Avatar source sheet | AppDialog sheet; file input/capture giữ như cũ |
| Profile/password dirty warning | AppConfirmDialog; rời màn chỉ tiếp tục sau Promise accept; cancel giữ form |
| Outbound recipient picker | AppDialog sheet, nội dung danh mục scroll nội bộ |
| Busy profile message | Inline error thay window.alert; không làm mất dữ liệu |

Không còn native app `<dialog>` / window.confirm / window.alert trong các Scanner component đã migrate. Native browser beforeunload (đóng/reload trang có draft), file chooser và OS permission prompt là giao diện do browser/OS sở hữu, không phải app overlay và không thể portal; **giữ bảo vệ baseline**, không giả chúng thành hộp thoại app hoặc bỏ cảnh báo để pass. Thiết bị thật vẫn cần test riêng.

## 5. Focus / Back / safe area

- Semantics role=dialog, aria-modal, title ID; descriptions được truyền khi có (launcher/global confirm). Close/button quan trọng≥44px. Trình duyệt tự động không được dùng native top-layer.
- Focus vào field được đánh dấu data-app-autofocus hoặc control đầu; MutationObserver đưa focus về control hợp lệ khi nội dung camera→manual thay đổi. Tab/Shift+Tab cycle; Escape cancel. Khi đóng, focus trở về opener còn tồn tại, không làm cuộn nhảy.
- Background scroll được inert khi overlay mở; các layer bên dưới inert khi có layer mới. Khi đóng restore inert/focus; confirm logout đã kiểm tra runtime không còn bị inert sau quay lại Login.
- Back sử dụng marker history app overlay, popstate + watcher100ms cho static Vinext bootstrap đang chặn popstate framework. Back đóng top overlay trước, không thực hiện action xác nhận.
- Profile dirty guard được mở rộng **cơ chế trình bày** để chờ Promise từ confirm app. Điều kiện cho phép/không cho phép, auth/session/role/warehouse guard không thay. Có khóa yêu cầu confirm lặp và chỉ tiếp tục navigation sau accept.
- Insets top/bottom lấy env; safe proxy20/34 và height420 đã thử. Nội dung sheet dài cuộn được tới action cuối, có hit-test xác nhận không bị lớp khác chặn.

## 6. Test matrix / evidence cuối

### Containment chính

`scripts/qa-shell-p00.mjs` → `artifacts/scanner-shell-p00/after/qa.json`:

| Browser viewport | Số trạng thái đo | Page errors | Kết quả |
|---|---:|---:|---|
|360×800|11|0|PASS|
|390×844|11|0|PASS|
|430×932|11|0|PASS|
|1440×1000 desktop|11|0|PASS|

11 trạng thái: launcher, discard-draft, camera, manual, warehouse, nfc-confirm, warranty-confirm, logout, avatar, password-dirty, short-safe-area. Tổng44 lượt assert rectangles của dialog/layer/backdrop nằm trong viewport, portal là con overlay root, bodyScroll=0, nativeModal count=0. App background inert=true. Desktop hit-test ngoài phone vẫn là sc-app-shell, không backdrop.

Focus restore được assert cho launcher, warehouse, NFC, warranty; Back/Escape có trong từng nhóm. Hủy draft/password giữ đúng giá trị nhập; accept password dirty chuyển màn theo yêu cầu, không native JS dialog.

### Desktop device sizes thực

`scripts/qa-shell-desktop.mjs` → `desktop/qa.json` và `desktop/{360x800,390x844,430x932}-contained.png`.
Đo app viewport/background đúng360×800,390×844,430×932 trong browser1440×1100. Hai phía ngoài frame trả hit-test host; overlay không tràn ra desktop.

### Accessibility và interaction bổ sung

`scripts/qa-shell-extra.mjs` → `extra/qa.json`: launcher, recipient sheet, replace draft, profile/password dirty, logout ×4 browser sizes =20 axe WCAG2A/AA +2.1AA runs, **0 automated violations**. Kiểm tra backdrop-close, recipient focus restore, browser Back từ dirty modal, logout cleanup inert.

Axe không phải chứng nhận VoiceOver/TalkBack. Không tự suy luận AT vật lý/Android Back hệ điều hành đã test từ browser Back.

### BEFORE / AFTER gallery

`artifacts/scanner-shell-p00/index.html`: desktop trước/sau và từng phone360/390/430; ảnh44 trạng thái trong after; recipient/dirty/axe screenshots trong extra. Đây là screenshot runtime, không chỉnh/ghép hình để làm overlay có vẻ vừa viewport.

## 7. Regression nghiệp vụ

- `tests/scanner-intent.test.mjs`, `scanner-model.test.mjs`, `scanner-policy.test.mjs`, `scanner-auth.test.mjs`, `scanner-account.test.mjs`: **31/31 PASS**.
- `qa-scanner-p05-e2e.mjs` với ?qa=1 → `artifacts/scanner-shell-p00/regression-e2e/e2e.json`: 3 viewport. Login/Shift→nhập→submit→post→xuất→server-error→retry→post; product trace; docs search; parts LK-001 + BOX-001×3; warranty transition; NFC bind/revoke; history. Store assertions xác nhận scan không đổi tồn, Post mới đổi tồn; no console/pageerror.
- `qa-scanner-p02.mjs` → `regression-policy/matrix.json`: 4 roles×active/paused×3 =24 tổ hợp; cross-tab paused giữ draft và Post theo quyền. PASS.
- `qa-shell-profile.mjs` → `regression-profile/qa.json`: 3 viewport; readonly identity, dirty cancel/footer/Back, nickname, phone mock verification, avatar crop/upload retry, password cũ bị từ chối/new được nhận, logout cancel. **PASS 3/3**, không pageerror. Script cập nhật từ cách dismiss native confirm sang bấm custom confirm; không nới validation/business assertions.
- `git diff --exit-code -- lib`: **exit0**. Tất cả file domain/auth-service/RBAC/Post/Warranty/NFC giữ nguyên. Không mutate production DB/API, không nhập dữ liệu thật.

## 8. Build / TypeScript / lint

- `npm run build:scanner`: prerender/export hoàn tất; buildRoot client phục vụ độc lập tại localhost4174. Node26 Windows có một warning/assert libuv sau khi đóng prerender server như baseline; script chỉ nhận mã đặc thù đó và artifact đã được chạy trực tiếp. Không chỉ dựa build để PASS.
- `node node_modules/typescript/bin/tsc -p tsconfig.scanner.json --pretty false`: exit0.
- Scoped oxlint các shell/overlay/auth/launcher/account/outbound/preview/mobile-layout/wrapper: exit0. Suppression hẹp trong AppDialog cho ARIA div dialog là có chủ ý theo P00 cấm native dialog top-layer; keyboard/focus đã implement/test.
- `git diff --check`: đạt. Không tuyên bố global lint/typecheck cho archived source toàn repository.

## 9. File affected / DEV handoff

Mới:
- `components/scanner-app-shell.tsx`: provider/viewport/confirm service.
- `components/scanner-app-shell.css`: shell, clipping, scroll, backdrop, safe area.
- `components/scanner-app-overlay.tsx`: reusable modal primitives và imperative adapter.
- `scripts/qa-shell-before.mjs`, `qa-shell-p00.mjs`, `qa-shell-extra.mjs`, `qa-shell-desktop.mjs`, `qa-shell-profile.mjs`; evidence/gallery và report này.

Sửa tối thiểu:
- `components/warranty-scanner-app.tsx`: wrap app bằng shell.
- `components/scanner-preview.tsx`: thay dialog/ref, app-scroll reset, tạo draft confirm async, không đổi nghiệp vụ callback.
- `components/scanner-launcher.tsx`: bỏ native dialog/history riêng, dùng shared containment/back/focus.
- `components/scanner-outbound.tsx`: recipient sheet adapter và scroll container.
- `components/scanner-account.tsx`: avatar sheet và dirty/busy warning trong app.
- `components/scanner-auth.tsx`: leave confirmation Promise (không đổi auth/private-route decisions).
- `components/scanner-mobile-layout.tsx`: đo viewport/chrome heights và chia sẻ reserved tokens.
- `scripts/build-scanner-pages.mjs`: copy shell/overlay/CSS vào isolated Scanner artifact.

DEV phải mount mọi overlay vào provider root, không portal body. Chrome nav/CTA thuộc viewport, screen body thuộc sc-screen-scroll. AppToast sẵn dùng cho overlay feedback; inline error/status vẫn inline, không phải portal. Không nhân bản business state trong shell.

## 10. Acceptance

| Acceptance P00 | Kết quả |
|---|---|
|Không app overlay vượt phone/app viewport|PASS —44 geometry checks, desktop device3 sizes|
|Backdrop không phủ desktop preview|PASS —screenshot và hit-test ngoài frame|
|Focus restore|PASS —opener checks launcher/warehouse/NFC/warranty/recipient|
|Back/Escape|PASS —đóng modal, cancel không thực hiện confirm/write|
|Safe area|PASS emulation —top20/bottom34 + height420; actual env implementation|
|Content cuối sheet truy cập được|PASS —scroll cuối + pointer hit-test|
|Không regression business flow|PASS —31 tests + E2E/roles/paused/profile matrices; lib diff0|

## 11. OPEN DECISION / giới hạn

- P00 không yêu cầu score; không tự nâng UI score hoặc redesign Home theo ảnh positive.
- Thiết bị iOS/Android, VoiceOver/TalkBack, virtual keyboard và permission OS thật chưa thử; kết luận là runtime preview + Chromium emulation, không chứng nhận app native.
- Browser trước-unload/file picker/OS permissions không phải overlay do app render và không thuộc portal root. Giữ nguyên chúng để không phá draft protection hoặc giả quyền thiết bị.
- Desktop shell mặc định390×844; preview host là nền tĩnh, không phải ứng dụng quản trị. Dev có thể cấu hình device-width/height cho review nhưng không đổi phone runtime.
- Chưa push/deploy lên GitHub Pages trong phase này. Static preview local đã build ở `work/scanner-pages/app-scanner/`; mở `http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/`. QA simulator chỉ hiện khi ?qa=1 như baseline.
- Dừng ngay sau report, không chạy P01, không đổi trạng thái nghiệm thu toàn bộ các prompt cũ.

**P00 PASS — READY FOR P01**
