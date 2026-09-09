# P06 — INBOUND Review / Submit / Result

Ngày09/09/2026. Phạm vi duy nhất: Review phiếu nhập, gửi duyệt và Result. Không thực thi P07.

## 1. Executive summary / precondition

P04 và P05 đã PASS; P01–P04 là visual baseline được người dùng chốt. Đã đọc P06, COMMON, RUN_CODEX_MASTER_COMMAND, positive/negative reference, P04 report và P05 report. Chỉ thay presentation/integration của Inbound Review/Result; không redesign business flow.

Đã triển khai Review với summary mã/số lượng, exceptions từ validator hiện có, danh sách compact, ghi chú phiếu và CTA **Gửi duyệt**. Submit dùng app-local confirm. Result phân biệt rõ phiếu vừa gửi và trạng thái **Chờ duyệt**, kèm **Xem chứng từ** / **Về trang chủ**.

- [Gallery Before / After](artifacts/scanner-p06-inbound-review/index.html)
- [QA P06](artifacts/scanner-p06-inbound-review/after/qa.json)
- [State QA offline/server/viewer/paused](artifacts/scanner-p06-inbound-review/states-qa.json)
- [E2E regression](artifacts/scanner-p06-inbound-review/e2e/e2e.json)
- [Prompt/reference inputs](artifacts/scanner-p06-inbound-review/input/)

## 2. Changes implemented

| Area | Before | After |
|---|---|---|
|Header/context|Generic “Kiểm tra phiếu”|Header Nhập kho kế thừa P04/P05, Kho Hoa Nam + INBOUND|
|Summary|Thông tin/tổng nằm trong card equal-weight|Một summary surface ưu tiên tên phiếu, mã đã quét và tổng số lượng|
|Exceptions|Không có vùng cảnh báo Review|Warning surface hiển thị reason từ `validateLine`, không tạo validator mới|
|Items|Mỗi mã một card|Danh sách chia hàng: tên, mã/SKU, qty, divider nhẹ|
|Note|Textarea generic|Ghi chú phiếu có label và optional marker, giữ draft|
|Submit|“Xác nhận gửi phiếu” chung|Primary **Gửi duyệt** + confirm summary app-contained|
|Result|Result chung khó phân biệt pending/post|Success acknowledgement, PN ID, Chờ duyệt, metadata và CTA theo flow|
|Error|Error chung dưới body|Dialog giữ draft, alert “Chưa gửi được phiếu”, retry không tạo doc trùng|

Không card hóa từng field, không thêm bước nghiệp vụ, không Post/ghi sổ trong P06.

## 3. Business/state freeze

- `submitDoc`, `run`, `addCode`, `postDocument`, RBAC/policy/model/intent và Outbound/Warranty/NFC handlers được snapshot/hash trước/sau; không đổi semantics.
- Exception Review chỉ đọc store/draft. Submit vẫn recheck tại domain boundary; nếu item bị đổi trạng thái giữa Review và gửi, dialog báo lỗi và không tạo document một phần.
- Scan/Review/Submit không đổi tồn. Result pending thể hiện tồn chưa thay đổi; tồn chỉ thay đổi khi Post ở flow hiện có.
- Busy lock chặn double submit. Offline/server error giữ draft, ghi chú và scanned lines.
- Hủy confirm, quay lại scanner và đổi global context giữ draft protection cũ.
- Viewer/warehouse paused bị chặn CTA write; lookup/read-only giữ nguyên.
- Result phụ thuộc `result.docId` trong phiên submit hiện tại; không thêm persistence/session rule cho deep-link reload.

## 4. Visual grammar

- Public Sans, Hoa Nam palette, deep operational warehouse header, surface trắng/blue-white, radius 12–16, divider nhẹ và primary deep blue theo P04/P05.
- Summary 2 cột, list một surface, note và CTA có hierarchy; không gradient màu mới, không asset stock, không glassmorphism.
- Confirm là custom AppDialog trong `.sc-app-overlay-root`, có max-height/scroll và fade-only để không có frame animation nào vượt viewport.
- Result success icon biểu đạt “đã gửi”, badge Chờ duyệt biểu đạt trạng thái chứng từ; không dùng màu xanh để ngụ ý đã ghi sổ.

## 5. E2E / state matrix

| Case | Expected / Actual | Result |
|---|---|---|
|2 mã NEW-001 + NEW-LK-001|Summary2 mã/2 cái,2 rows|PASS|
|Edit note trước gửi|Giá trị giữ sau Hủy confirm|PASS|
|Gửi duyệt|Confirm nêu kho/số lượng, không stock mutation|PASS|
|Escape/Back|Dialog đóng, focus restore, draft giữ nguyên|PASS|
|Exception sau scan|Review cảnh báo; submit domain chặn atomically|PASS|
|Offline/server error|Alert rõ, draft/rows/note giữ nguyên|PASS|
|Double click|Một document duy nhất|PASS|
|Result|PN ID + Chờ duyệt + CTA chi tiết/Home|PASS|
|Viewer / paused|Không có CTA write; lookup vẫn được phép|PASS|
|Quay lại scanner / context switch|Confirm/Hủy không mất draft|PASS|

Browser state QA độc lập đã chạy offline, server-error, Viewer, paused, resume và submit pending trên 360/390/430px: [states-qa.json](artifacts/scanner-p06-inbound-review/states-qa.json).

## 6. Mobile / keyboard / accessibility

| Viewport | State captures | Axe violations | Console/page errors | Result |
|---|---:|---:|---:|---|
|360×800|15 + state QA|0|0|PASS|
|390×844|15 + state QA|0|0|PASS|
|430×932|15 + state QA|0|0|PASS|
|Desktop1440×1000 (app390)|15|0|0|PASS|

- 24 audited captures trong core QA (Review, Confirm, Draft Confirm, Exceptions, Validation-error, Result ×4 viewports), cộng9 audited captures offline/server/paused trong state QA ở3phone sizes: tổng33 lượt axe,0 violations. Viewer được kiểm tra riêng về khóa write.
- Review note field và list có scroll clearance; sticky CTA không che nội dung sau khi scroll. `--mobile-bottom-reserved-space`/ResizeObserver hiện có được giữ.
- Keyboard proxy giảm `visualViewport.height`340px; textarea vẫn đưa lên trên sticky action. Short height420px, safe-area top24/bottom34px và reduced motion PASS.
- AppDialog có accessible title/description, focus trap/restore, Escape/Back và app-contained bounds. Field label, error association, live region và target≥44px PASS.
- Camera/NFC/IME/VoiceOver/TalkBack native chưa được kiểm thử trên thiết bị thật; proxy/axe không thay thế AT UAT.

## 7. Evidence

- [Gallery](artifacts/scanner-p06-inbound-review/index.html)
- [390 Review comparison](artifacts/scanner-p06-inbound-review/comparison-review-390.png)
- [390 Confirm comparison](artifacts/scanner-p06-inbound-review/comparison-confirm-390.png)
- [390 Result comparison](artifacts/scanner-p06-inbound-review/comparison-result-390.png)
- [After states](artifacts/scanner-p06-inbound-review/after/)
- [Before/After responsive captures](artifacts/scanner-p06-inbound-review/after/)

BEFORE là implementation ngay trước P06; AFTER là bản Review/Submit/Result mới. Gallery có các state exceptions, validation-error, offline/server error, draft confirm, keyboard proxy, safe-area, paused và Result.

## 8. Baseline regression

- **15/15 ảnh Login/Shift/Home/P04/P05 tại360/390/430px giống byte-for-byte với baseline:0 pixel thay đổi.** Không ghi đè golden images. Lần chụp đầu diễn ra khi transition chưa hoàn tất nên P04 có chênh lệch tối đa4/255; đã sửa thời điểm capture và chạy lại với gate≤1/255 ban đầu, không nới gate để PASS. [Raw comparison cuối](artifacts/scanner-p06-inbound-review/baseline-regression.json).
- Approved source files P01–P05, auth/policy/model/intent/outbound/launcher và core business sections khớp hash; hai component Review/Result là phần mới. [Source hashes](artifacts/scanner-p06-inbound-review/after/source-hashes.json).
- Unit/domain: 31/31 PASS. Existing E2E: 36/36 checkpoints PASS trên 360/390/430, gồm inbound/outbound/Post, stock trace, docs, parts, warranty, NFC và history. Script regression tên P05 không phải thực thi P07.
- TypeScript scanner, scoped oxlint, `git diff --check` PASS.
- Static artifact build hoàn tất; Windows libuv post-prerender warning được xử lý như baseline và browser đã test đúng artifact4174.

## 9. Files changed / open decisions

Implementation:

1. `components/scanner-inbound-review.tsx`
2. `components/scanner-inbound-review.css`
3. `components/scanner-preview.tsx` — P06 branch/class/presentation only
4. `scripts/build-scanner-pages.mjs`

QA/evidence:

5. `scripts/qa-p06-inbound-review.mjs`
6. `scripts/qa-p06-states.mjs`
7. `scripts/qa-p06-baseline.mjs`
8. `scripts/build-p06-evidence.mjs`
9. `scripts/qa-scanner-p05-e2e.mjs` — locator regression only
10. Report và `artifacts/scanner-p06-inbound-review/`

OPEN DECISION: Không có ambiguity nghiệp vụ mới. Result deep-link sau reload vẫn theo session behavior hiện có; không tự thêm persistence. Native AT/hardware ngoài scope.

## 10. Acceptance / Stop gate

| Acceptance P06 | Result |
|---|---|
|Review thông tin phiếu/tổng scan/exceptions/item list|PASS|
|Summary/list Operational Pro, không generic/card-heavy|PASS|
|CTA Gửi duyệt|PASS|
|Submit confirm app-contained|PASS|
|Success/error Result rõ|PASS|
|Không đổi Post semantics|PASS|
|Draft/error/double-submit protection|PASS|
|RBAC/paused/keyboard/safe-area/sticky|PASS|
|360/390/430 + regression|PASS|
|Console/page/accessibility|PASS —0 errors,0 axe violations|
|P01–P05 baseline không drift|PASS —15/15 ảnh identical,0 pixel thay đổi|
|Đúng scope, không P07|PASS|

P06 PASS — READY FOR P07
