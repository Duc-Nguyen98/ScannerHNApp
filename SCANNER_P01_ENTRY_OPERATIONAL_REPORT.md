# P01 — ENTRY EXPERIENCE OPERATIONAL PRO

## Kết luận / precondition

**P01 PASS — READY FOR P02**

Precondition đã xác nhận: `SCANNER_P00_REAL_APP_SHELL_REPORT.md` kết luận P00 PASS — READY FOR P01. Đã đọc đầy đủ P01, COMMON và RUN_CODEX_MASTER_COMMAND đính kèm; đối chiếu hai ảnh positive/negative.

Kết luận chỉ áp dụng scope Login / Forgot Password / Start Shift của chuỗi Operational Pro. Không thay thế điểm/gate toàn app trong chuỗi cũ. Không chạy P02. Không commit/push/deploy trong phase này; kết quả ở workspace và static preview local.

## 1. Baseline và implementation plan

Baseline là workspace sau P00, gồm shell có clipping/overlay-root và scroll riêng. P00 chưa commit, vì vậy không reset về Git HEAD. Snapshot SHA256 trước/sau trong `artifacts/scanner-operational-p01/{before,after}/source-hashes.json` chứng minh các file bảo vệ nguyên vẹn.

Vấn đề entry trước sửa:
- Login/Shift dùng treatment sáng, card bo22px/shadow; ngôn ngữ chưa Operational Pro.
- Forgot Password vẫn là bề mặt generic cũ, không cùng card/header sequence.
- Các màn ngắn chưa thống nhất nền/chiều cao entry trong viewport P00.

Plan thực thi: capture baseline → chỉ sửa JSX entry + CSS scoped → build static → test3 viewport/guard/accessibility/P00 containment → tạo gallery/report → STOP.

## 2. Changes Implemented

- Cả ba màn dùng `.sc-entry.sc-entry-op`, header Deep Operational #073B52→#083E55, wordmark Hoa Nam Scanner hiện hữu, Lucide scan không thêm container trang trí.
- Header title26px/700, eyebrow11px, subtitle13px; mặt form trắng radius18px, border #DBE8ED và shadow rất nhẹ. Không glassmorphism, không ảnh kho/marketing, không copy KPI/dữ liệu trong ảnh reference.
- Login giữ label/helper rõ, input50px/font16px, eye46px, primary50px, inline validation icon/text, loading có lock và kích thước ổn định như baseline. Next/Go/Enter, autocomplete giữ nguyên.
- Forgot Password dùng cùng header/card/CTA/footer. Nội dung vẫn hướng dẫn liên hệ quản trị viên cấp tài khoản và không chia sẻ mật khẩu/mã xác thực. Không thêm OTP/reset API, số hỗ trợ hoặc request gửi giả.
- Start Shift giữ user/name/role từ session, Kho Hoa Nam, trạng thái active/paused/error từ props hiện có. Avatar fallback giảm còn52px tròn; layout user→warehouse→status→CTA rõ ràng.
- Paused: giải thích vào ca chỉ xem/tra cứu, write khóa theo rule hiện có. Không tự cấm ca readonly hoặc mở quyền ghi.
- Entry-only CSS đặt height chain đủ app viewport, giữ footer thông tin cuối màn; không đổi P00 scroll/overlay system.
- QA hints vẫn chỉ render khi ?qa=1; không hiện mặc định trước auth. Giữ Public Sans và toàn bộ palette COMMON.

## 3. Screen inventory / state contract

| Screen | Nội dung | Primary / điều hướng | State |
|---|---|---|---|
| Login | Header Hoa Nam, title, username/password, helper, eye, recovery link | Đăng nhập → Shift | Default, filled, focus, validation, loading, invalid, locked, disabled, offline, server, session message |
| Forgot Password | Header recovery, hướng dẫn quản trị viên, privacy note | Quay lại đăng nhập → Login | Read-only instruction, không gửi OTP/reset |
| Start Shift | User, role, fixed Kho Hoa Nam, status, permission note | Bắt đầu ca làm việc → Home | Active, paused readonly, loading, unknown/read error theo baseline |

Không phát sinh overlay mới trong 3 màn. Lỗi/session dùng inline alert/output; không toast phủ host.

## 4. BEFORE / AFTER

Gallery: `artifacts/scanner-operational-p01/index.html`.

- BEFORE: `before/{360,390,430}-login.png`, `*-forgot.png`, `*-shift.png` (9 ảnh), capture trong P00 shell trước sửa P01.
- AFTER: `after/{width}-login.png`, `*-forgot.png`, `*-shift.png`, `*-validation.png`, `*-loading.png`, `*-error.png`, `*-locked.png`, `*-disabled.png`, `*-offline.png`, `*-server.png`, `*-paused.png`, `*-short-login.png`, `*-safe-area.png`, `*-P00-overlay-regression.png`.
- Desktop sequence: `desktop/login.png`, `forgot.png`, `shift.png`, geometry `desktop/qa.json`.

Ảnh là runtime thực từ static artifact, không edit bitmap/crop để che lỗi containment. Đã xem trực quan cả ba màn360 và Forgot390 sau sửa; sự khác biệt rõ về header, grouping, shape và density.

## 5. Viewport / keyboard / safe-area

| Viewport | Login | Forgot | Shift active/paused | Auth/guard | Result |
|---|---|---|---|---|---|
|360×800|PASS|PASS|PASS|PASS|PASS|
|390×844|PASS|PASS|PASS|PASS|PASS|
|430×932|PASS|PASS|PASS|PASS|PASS|

`scripts/qa-operational-entry.mjs` → `after/qa.json`:
- Test viewport height420 như keyboard proxy; scroll input/CTA vào vùng nhìn và pointer hit-test, không mất CTA hoặc field.
- Test entry safe top47px/bottom34px qua token; CTA vẫn cuộn tới được.
- Browser bodyScroll=0 và document không overflow ngang; cuộn bên trong sc-screen-scroll.
- Eye/control trọng yếu ≥44×44; Login primary giữ chiều cao khi loading.
- Next ở username chuyển focus password; Go/Enter ở password submit.
- Desktop browser1440×1000: viewport app390px, entry cùng width, host không cuộn. Không redesign theo desktop.

Keyboard/safe-area ở đây là Chromium emulation/proxy. iOS/Android IME và thiết bị thật chưa test; không suy luận kết quả physical từ viewport resize.

## 6. Accessibility

- Axe-core WCAG2A/AA +2.1AA chạy Login/Forgot/error/Shift/paused ×3 = **15 lượt, 0 automated violation**.
- Incomplete color-contrast do gradient: bổ sung tính relative luminance trên endpoint header sáng nhất #083E55 và các solid surface trong `after/contrast.json`. Text trắng/nhạt ở header, body, helper, placeholder, error và CTA đạt ≥4.5:1 trong các cặp được kiểm.
- Label/ID, helper/error associations, aria-invalid, aria-live/alert, eye name/pressed state giữ nguyên. Không dùng màu để báo lỗi hoặc paused đơn độc.
- Focus visible, tab order tự nhiên, reduced-motion tắt transition/animation trong entry; computed transitionDuration input=0s ở test reduced-motion.
- Không thêm modal app mới; hồi quy overlay P00 xác nhận không thoát viewport.
- Axe không phải chứng nhận VoiceOver/TalkBack. Chưa kiểm thử AT vật lý; ghi rõ giới hạn thay vì tự chứng nhận AA toàn app.

## 7. Regression / no business change

Source-hash comparison trước/sau xác nhận **không thay đổi**:

- `useScannerAccess()` (bao gồm auth/session/route guard/leave guard sau P00).
- `lib/scanner-auth.ts`, `lib/scanner-auth-preview.ts`, `lib/scanner-policy.ts`, `lib/scanner-model.ts`, `lib/scanner-account-preview.ts`.
- `components/scanner-app-shell.tsx/.css`, `components/scanner-app-overlay.tsx`, `components/scanner-preview.tsx`.

Auth regression runtime:
- Chưa phiên mở Home → Login; sau logout/Back/reload và private deep-links không mở dữ liệu kho.
- Login hợp lệ → Shift; reload khi ca chưa bắt đầu vẫn Shift; Start Shift → Home.
- Warehouse paused hiển thị lý do trước vào ca; Home Nhập kho disabled như rule cũ.
- Đăng nhập sai/locked/disabled/offline/server trong QA vẫn đúng error contract; password được clear như trước.
- Sau vào Home, mở global sheet vẫn thuộc P00 overlay-root; Escape đóng và không native top-layer.

`qa-shell-p00.mjs` với output riêng `artifacts/scanner-operational-p01/regression-shell/qa.json`: **44 lượt containment**, 11 overlay states trên3 phone + desktop, no pageerror; focus/Back/Escape/safe area đều đạt. Không sửa source P00 để đạt test P01.

Unit/domain: **31/31 PASS** với scanner-intent/model/policy/auth/account tests. Không sửa RBAC, Inventory/Post, Warranty, NFC hoặc Warehouse Paused; không truy cập DB/API production.

## 8. Build / code quality

- `node node_modules/typescript/bin/tsc -p tsconfig.scanner.json --pretty false`: exit0.
- `npx oxlint --tsconfig tsconfig.scanner.json components/scanner-auth.tsx`: exit0.
- `npm run build:scanner`: prerender/static artifact hoàn tất. Windows Node26 vẫn có libuv assertion khi đóng prerender server sau build như baseline; kiểm chứng artifact bằng browser static port4174, không kết luận chỉ từ build.
- `git diff --check`: đạt. Không tuyên bố global lint/typecheck cho archived source ngoài Scanner.
- Test runtime cuối: 0 console.error và 0 pageerror trong entry suite ở cả3 viewport.

## 9. Files changed — chỉ P01

Implementation:
1. `components/scanner-auth.tsx`: JSX/wording/entry class; branch Forgot có cùng visual system. Không thay hooks/handlers/auth/session.
2. `components/scanner-entry-ui.css`: scoped Operational Pro style cho3 màn, height chain riêng entry.

QA/artifacts:
- `scripts/qa-operational-entry.mjs` (before/after/source hashes/behavior/axe).
- `scripts/qa-op-entry-desktop.mjs`.
- `artifacts/scanner-operational-p01/` (before/after/desktop/regression-shell/gallery).
- Report này.

Các file shell/overlay/guard trong dirty worktree thuộc P00 đã hoàn tất, **không tính là thay đổi P01 mới** và đã được snapshot kiểm tra không đổi. Không ghi đè chỉnh sửa khác của người dùng.

## 10. Acceptance / OPEN DECISION

| Acceptance P01 | Result | Evidence |
|---|---|---|
|3 màn là entry sequence thống nhất|PASS|Before/after và shared sc-entry-op treatment|
|Không overlay ngoài app|PASS|Không tạo overlay mới; 44 containment regression + local root|
|360/390/430 PASS|PASS|after/qa.json + screenshot states|
|No console error|PASS|errors:[] ở từng viewport|
|Auth/guard regression PASS|PASS|Source hash unchanged + runtime +31 unit/domain tests|

OPEN DECISION / giới hạn:
- Recovery backend chưa có contract, giữ nguyên liên hệ quản trị viên; không tự thêm form gửi mã.
- Paused vẫn cho bắt đầu ca readonly như rule trước; thay rule này cần yêu cầu riêng.
- Logo app/wordmark hiện hữu được giữ; không biến ảnh Home reference thành asset ảnh kho hoặc tự tạo dữ liệu KPI.
- Physical VoiceOver/TalkBack/IME/device permissions chưa test; cần device UAT trước native release.
- P01 không yêu cầu score nên không tự chấm/nâng điểm để PASS; đây là acceptance theo scope, không điểm toàn app.
- Chưa commit/push/deploy. Preview local: `http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/`.

**P01 PASS — READY FOR P02**

Dừng tại P01 sau báo cáo này; không tự chạy P02.
