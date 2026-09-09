# P03 — GLOBAL NAVIGATION + SCANNER LAUNCHER

## Kết luận

**P03 PASS — READY FOR P04**

Precondition: `SCANNER_P02_HOME_OPERATIONAL_REPORT.md` đã kết luận P02 PASS. Đã đọc đầy đủ P03, COMMON và RUN_CODEX_MASTER_COMMAND; đối chiếu positive Operational Pro và negative overlay-overflow. Chỉ sửa Bottom Navigation, center action và Global Scanner Sheet. Không chạy P04; không commit/push/deploy.

## 1. Baseline và kế hoạch

Baseline là workspace sau Operational Pro P02, giữ toàn bộ thay đổi chưa commit P00–P02. Launcher đã là action nhưng còn label cũ “Quét mã — Hoa Nam Tool”, dùng imperative AppDialog trực tiếp và các card rows/box icon khá lớn.

Plan đã thực hiện: chụp BEFORE và hash protected source → dùng AppBottomSheet P00 → compact rows/dividers + label mới → build/test mobile/desktop/accessibility/regression → report và STOP.

## 2. Thay đổi P03

- Accessible name center đổi thành **Mở tác vụ quét mã**. Nhãn hiển thị vẫn Quét mã; QR icon54px giữ nguyên, không quay lại chữ HN/TOOL.
- Giữ5 mục: Trang chủ, Chứng từ, Quét mã, Lịch sử, Cá nhân. Center là button `aria-haspopup=dialog`, `aria-expanded`; không có aria-current như tab.
- Active mapping giữ đúng: docs/doc → Chứng từ; create/scan/review không gắn active Chứng từ; center chỉ có contextual treatment nhẹ như baseline. Không đổi route hoặc callback.
- Active background nav giảm radius20→14px để hợp Operational Pro; không đổi chiều cao/vị trí/safe-area/reserved space.
- Launcher dùng **AppBottomSheet** từ P00. Shared AppModal mở rộng props tùy chọn className/closeLabel và handle sheet, không thay core AppDialog focus/Back/portal.
- Sheet đổi từ4 bordered cards thành4 compact rows chia divider #DBE8ED; bỏ nền box icon. Title21px/700, item15px/650, supporting12px; row min76px, icon24px.
- Disabled có icon khóa và lý do dưới action; không dùng opacity làm chữ khó đọc. Kho paused hiển thị “Kho đang tạm dừng hoạt động”.
- Sheet mặc định đúng4 actions: Nhập kho, Xuất kho, Bảo hành, Tra cứu sản phẩm. Không NFC hoặc Warranty Parts. Draft confirm vẫn dùng3 lựa chọn/callback trước đó.

## 3. Business / state giữ nguyên

| Action | Flow hiện có |
|---|---|
| Nhập kho | Thông tin phiếu → scanner INBOUND → review/submit |
| Xuất kho | Người nhận/số lượng → scanner OUTBOUND → review/submit |
| Bảo hành | Scanner WARRANTY → hồ sơ/eligibility, không tự tạo case |
| Tra cứu sản phẩm | Scanner LOOKUP → detail read-only |

NFC giữ Home; Warranty Parts giữ case context. Giữ domain permissions và paused: write disabled, lookup/read-only được phép. Giữ draft confirmation trước khi đổi tác vụ, không tự xóa draft. Scan không thay đổi tồn; Post rule nguyên vẹn.

## 4. BEFORE / AFTER

Gallery: `artifacts/scanner-operational-p03/index.html`.

- BEFORE: `before/{360,390,430,1440}-navigation.png`, `*-launcher.png`.
- AFTER: `after/{width}-navigation.png`, `*-launcher.png`, `*-draft-confirm.png`, `*-viewer.png`, `*-paused.png`, `*-short-safe.png`.
- Source snapshot: `before/source-hashes.json`, `after/source-hashes.json`; protected files assert bằng nhau.

Đã xem trực quan ảnh launcher360 và paused390. Sheet bớt card/border, action hierarchy rõ; backdrop chỉ trong app, không phủ desktop. Không dùng ảnh xử lý để giả containment.

## 5. Viewport và accessibility

`scripts/qa-operational-nav.mjs` → `after/qa.json`:

| Browser viewport | Action/4 rows | Active/route/draft | Back/focus/Escape | Paused/viewer | Result |
|---|---|---|---|---|---|
|360×800|PASS|PASS|PASS|PASS|PASS|
|390×844|PASS|PASS|PASS|PASS|PASS|
|430×932|PASS|PASS|PASS|PASS|PASS|
|1440×1000 desktop host|PASS|PASS|PASS|PASS|PASS|

- URL Home không đổi khi mở sheet; không route lookup trực tiếp.
- Tab/Shift+Tab trap, Back/Escape đóng; focus về center. Swipe handle >60px đóng được, có close button44px thay thế.
- Native modal count0; rect sheet/backdrop nằm trong app viewport; bodyScroll0; portal thuộc sc-app-overlay-root.
- Height420 + safe bottom34px proxy: action cuối scroll đến và pointer hit-test đạt, không bị lớp khác che.
- Reduced-motion: computed animationName=none.
- Axe WCAG2A/AA +2.1AA trên launcher/viewer/paused ×4 viewport = **12 lượt, 0 automated violation**. Caption/disabled reasons đủ tương phản trong các lượt kiểm.
- Close name tùy chỉnh, title/description association do AppBottomSheet tạo; disabled reason liên kết aria-describedby khi có. Không label tham chiếu tới ID không tồn tại.
- Chưa VoiceOver/TalkBack/IME/Android Back OS thật; không xem axe/browser emulation là chứng nhận AT/native.

## 6. Regression

- `qa-nav-shell-regression.mjs` là test P00 đổi locator center sang label mới; không nới geometry/business assertions. `regression-shell/qa.json`: **44 containment states**,3 phone +desktop, focus/Back/Escape/manual/warehouse/NFC/warranty/logout/avatar/password/short-safe đều PASS, errors[].
- `qa-scanner-p05-e2e.mjs` với ?qa=1, output `regression-e2e/e2e.json`:3 viewport nhập→submit→post→xuất→server error→retry→post; stock/trace; linh kiện LK-001 + BOX-001×3; warranty tabs/status; NFC bind/revoke; history. PASS, không console/pageerror mới.
- **31/31 unit/domain tests** scanner-intent/model/policy/auth/account PASS.
- Home component/CSS, entry P01 component/CSS, shell P00 component/CSS, auth/session/model/policy/intents: hash trước/sau không đổi. Không chỉnh data/permission matrix/Warranty/NFC/Post.

## 7. Build và file affected

- `node node_modules/typescript/bin/tsc -p tsconfig.scanner.json --pretty false`: exit0.
- `npx oxlint --tsconfig tsconfig.scanner.json components/scanner-launcher.tsx components/scanner-app-overlay.tsx components/scanner-preview.tsx`: exit0.
- `npm run build:scanner`: export hoàn tất. Node26 Windows vẫn có assertion lúc đóng prerender sau build như baseline; QA dùng chính static artifact port4174. Không tuyên bố global lint/typecheck archives.
- `git diff --check`: đạt.

Implementation P03:
1. `components/scanner-launcher.tsx`: chuyển sang AppBottomSheet, giữ4 actions/draft handlers.
2. `components/scanner-app-overlay.tsx`: props presentation tùy chọn và drag handle trong AppModal sheet. Các consumer khác giữ defaults; hồi quy44 overlay states.
3. `components/scanner-global.css`: style `.sg-operational` compact và handle, không đổi scanner context layout.
4. `components/scanner-mobile-layout.css`: chỉ radius active nav14px.
5. `components/scanner-preview.tsx`: chỉ label center mới trong phần nav của phase này.

QA mới: `scripts/qa-operational-nav.mjs`, `scripts/qa-nav-shell-regression.mjs`, gallery/evidence/report này. Các thay đổi P00–P02 đang có được giữ nguyên, không tính nhầm vào scope P03.

## 8. Acceptance / OPEN DECISION

| Acceptance P03 | Result |
|---|---|
|Quét mã không route lookup trực tiếp|PASS — URL nền giữ khi mở action sheet|
|Sheet4 actions|PASS — count4; no NFC/parts|
|Active nav không sai create/scan/review|PASS — không aria-current tab Chứng từ; docs/doc có đúng|
|Back đóng sheet|PASS —4 viewports|
|Focus restore|PASS —center focus sau đóng|
|360/390/430 PASS|PASS —runtime/axe/geometry/regression|

OPEN DECISION/giới hạn: không mở rộng sang API/hardware/AT thật; rule paused/draft và auth giữ nguyên. P03 không yêu cầu score nên không tự chấm hoặc thay điểm toàn app. Không copy dữ liệu/ảnh kho trong reference. Không cần quyết định nghiệp vụ mới để hoàn tất scope.

Preview static local: `http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/`. Chưa commit/push/deploy.

**P03 PASS — READY FOR P04**

Dừng tại P03, không chạy P04.
