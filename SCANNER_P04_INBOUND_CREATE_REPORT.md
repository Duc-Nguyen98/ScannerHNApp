# P04 — Nhập kho → Thông tin phiếu

Ngày09/09/2026. Scope duy nhất: **Inbound Create / bước Thông tin phiếu**.

## 1. Executive summary / precondition

Đã triển khai màn P04 theo COMMON và visual grammar Operational Pro; giữ nguyên các field và nghiệp vụ. Hoàn tất BEFORE/AFTER, mobile/desktop, baseline regression, RBAC/paused/draft, keyboard proxy, accessibility và E2E.

Precondition được đối chiếu với `SCANNER_P03_GLOBAL_NAV_REPORT.md` (P03 PASS), xác nhận USER APPROVED của ba màn trong `SCANNER_APPROVED_UI_BASELINE.md`, và lệnh RUN P04 mới do người dùng chỉ định xác nhận P01–P03 đã Visual Lock. Báo cáo Visual Lock FAIL cũ được giữ nguyên như lịch sử; không giả sửa báo cáo cũ thành PASS.

Đã đọc đầy đủ README bundle, COMMON, P04, RUN command, placeholder previous-report; kiểm tra ba visual references, README/manifest trong asset ZIP và approved asset sheet. Bản sao các prompt/reference dùng cho lần này ở [input](artifacts/scanner-p04-inbound-create/input/).

**Không thực thi P05.** Scanner đang có chỉ được dùng để kiểm tra điểm chuyển tiếp/regression; không sửa UI, validation hay nghiệp vụ scanner bước sau.

## 2. Implementation

| Vùng | Trước | Sau P04 |
|---|---|---|
| Header | Header trắng “Thông tin phiếu”, có preview note | Hero kho dùng approved asset, title “Nhập kho”, Kho Hoa Nam và trạng thái hiện có |
| Workflow | Ba text nhỏ trên divider | Ba bước gọn trong cùng surface; bước1 có `aria-current=step` |
| Form | Card generic, badge nhập kho, kho lặp bên trong | Một nhóm Thông tin phiếu với divider; Tên phiếu bắt buộc và Ghi chú tùy chọn, không card hóa từng field |
| Draft | Không có chỉ báo trên form | “Phiếu mới” / “Đang soạn”; khi quay lại từ scanner hiển thị số mã đang có trong draft |
| Validation | Error chung dưới body | “Nhập tên phiếu.” ngay dưới field, `aria-invalid`, `aria-describedby`, live region, focus trở về field |
| CTA | Button trong luồng cuộn “Bắt đầu quét” | Sticky CTA **Tiếp tục quét mã**, scan icon/arrow, đo cùng hệ nav/CTA hiện có |
| Ghi sổ | Info card lớn | Info note gọn giữ nguyên nội dung: quét chỉ giữ mã, tồn thay đổi khi ghi sổ |

Tái sử dụng `bg_warehouse_main.jpg` hiện có. SHA256 khớp chính xác file cùng tên trong asset ZIP P04: `768953dd9a570452d35ffddf74f67bf14c8272fabb52948136cf8a28fc03148e`. Không thêm stock photo, illustration hoặc asset ngoài bộ đã duyệt. Icons Lucide hiện có theo COMMON/asset README.

## 3. Business / state contract

- Field nghiệp vụ vẫn chỉ gồm `draft.name`, `draft.note`; kho thực hiện vẫn duy nhất Kho Hoa Nam, không thêm kho chọn hoặc field nghiệp vụ mới.
- Required-name rule vẫn `!draft.name.trim()`. Không thêm maxlength, hạn chế mã/lô hay validation mới. CTA không tự khóa khi tên trống; user nhận inline error khi tiếp tục, như rule cũ.
- Form submit/Enter chỉ chuyển `create → scan` bằng callback đã có; scanner context vẫn **INBOUND**.
- Không tạo chứng từ, không submit/post, không thay stock tại P04. Test nhập form và quét NEW-001 xác nhận store không đổi.
- State “Đang soạn” không có nghĩa đã persist draft lên máy chủ/local storage; giữ cơ chế draft trong lần mở app hiện có. Không tự thêm autosave hoặc draft recovery sau reload.
- Quay lại từ scanner giữ nguyên tên, ghi chú và mã đã quét. Global launcher chuyển context vẫn mở confirm cũ; chọn Hủy giữ dữ liệu.
- Viewer và kho paused vẫn bị chặn tại `actionDenied`; không render form write để vượt gate. Paused warning/read-only lookup dùng overlay/route hiện có.
- Outbound, Warranty, Parts, NFC, auth/session/route guard và Post/ledger không thay đổi.

## 4. BEFORE / AFTER evidence

- [Gallery đầy đủ](artifacts/scanner-p04-inbound-create/index.html)
- [390px: Before / After / Home baseline](artifacts/scanner-p04-inbound-create/before-after-baseline-390.png)
- [360px: Before / After](artifacts/scanner-p04-inbound-create/before-after-360.png)
- [430px: Before / After](artifacts/scanner-p04-inbound-create/before-after-430.png)
- [Validation / Filled / Draft retained](artifacts/scanner-p04-inbound-create/states-390.png)
- [Tất cả ảnh AFTER](artifacts/scanner-p04-inbound-create/after/)

BEFORE có7 state captures×4viewports. AFTER có14 state captures×4viewports: login, shift, home, create, validation, filled, scan-boundary, draft-retained, draft-confirm, short-height, keyboard-proxy, safe-area, viewer, paused.

Không có wireframe P04 riêng trong bundle; do đó đây là áp dụng visual grammar đã khóa, không tự tuyên bố pixel-match một bản vẽ P04 không tồn tại.

## 5. Mobile / keyboard / overlay

| Viewport | Form/validation | Draft/back | Sticky/no overlap | Keyboard proxy/safe-area | RBAC/paused | Result |
|---|---|---|---|---|---|---|
|360×800|PASS|PASS|PASS|PASS|PASS|PASS|
|390×844|PASS|PASS|PASS|PASS|PASS|PASS|
|430×932|PASS|PASS|PASS|PASS|PASS|PASS|
|Desktop1440×1000/app390×844|PASS|PASS|PASS|PASS|PASS|PASS|

[Raw QA](artifacts/scanner-p04-inbound-create/after/qa.json).

Ở390×844: CTA container y673/h79/bottom752; nav y752/h92/bottom844. Hai vùng tiếp giáp, không chồng. Form có khoảng cuộn theo `--mobile-bottom-reserved-space` từ ResizeObserver; không dùng per-screen fixed bottom spacer.

- Chiều cao420px: textarea cuộn hoàn toàn lên trên CTA.
- Keyboard proxy: focus field rồi giảm `visualViewport.height`340px; shell co app viewport, nav ẩn theo cơ chế hiện có, CTA nằm trong vùng nhìn thấy và không che textarea. Khôi phục VisualViewport trả lại nav/CTA bình thường.
- Safe-area top24/bottom34px: CTA vẫn contained; không horizontal overflow.
- Draft confirm và paused warning nằm100% trong `.sc-app-viewport`; không native browser top-layer, không body portal mới.

Keyboard proxy không phải chứng nhận iOS/Android IME hoặc nút Back hệ điều hành trên thiết bị thật. Không tích hợp hardware trong P04.

## 6. Accessibility / errors

- Label rõ, `required` semantic, placeholder không thay label.
- Error association và live region có text/icon, không chỉ màu. Input lỗi được focus.
- Name Enter submit; textarea Enter giữ xuống dòng. CTA dùng button submit có accessible name chính xác.
- Focus visible, buttons/touch targets quan trọng≥44px, textarea/input16px, disabled state kế thừa quyền.
- Reduced-motion giữ nguyên và được test.
- 0 axe WCAG2A/AA/2.1AA violations trong24 audited states (6×4viewports).
- 0 console errors và0 page errors/unhandled exceptions trong bản test cuối.
- Chưa VoiceOver/TalkBack thực tế; axe PASS không được xem là chứng nhận AT.

## 7. Baseline / business regression

**9/9 ảnh Login/Shift/Home tại360/390/430px giống byte-for-byte với approved baseline v1:0 pixel thay đổi.** Không ghi đè bất kỳ golden image nào.

[Golden comparison](artifacts/scanner-p04-inbound-create/approved-baseline-regression.json).

Hashes của các source baseline ngoài main integration file không đổi; auth/policy/model/intent/outbound/launcher giữ nguyên. Phần scan và các business views được snapshot/hash trước và sau. [Before hashes](artifacts/scanner-p04-inbound-create/before/source-hashes.json) / [After hashes](artifacts/scanner-p04-inbound-create/after/source-hashes.json).

- Unit auth/shift/policy/model/intent/design-fixtures: **31/31 PASS**.
- E2E: **36 checkpoints PASS** (12×3viewports): login→shift→Home, inbound submit→Post, outbound recipient/quantity→error/retry→Post, stock trace/docs search, parts submit→Post, warranty transition/tabs, NFC bind/revoke và history. [E2E evidence](artifacts/scanner-p04-inbound-create/e2e/e2e.json).
- `qa-scanner-p05-e2e.mjs` là tên script regression lịch sử, không phải thực thi prompt P05. Chỉ đổi locator CTA Nhập kho sang nhãn P04 mới; outbound CTA/test assertions giữ nguyên.
- TypeScript scanner, scoped oxlint và `git diff --check` PASS.
- Build artifact thành công, kiểm thử trên đúng static artifact4174. Runtime Windows có thể cảnh báo libuv sau prerender; artifact được validate rồi test bằng browser, không coi build đơn thuần là PASS.

## 8. Visual QA — tự đánh giá có evidence

P04 không đặt ngưỡng điểm số. Không tự tạo điểm/đẩy điểm để PASS; đánh giá từng dimension dựa trên ảnh đã xem:

| Dimension | Đánh giá |
|---|---|
|Operational Pro visual grammar|PASS — hero kho, context rõ và surface nhẹ cùng baseline|
|Typography|PASS — Public Sans; page26/700, section20/700, labels14, supporting12, input16|
|Color|PASS — Hoa Nam deep/primary, white/blue-white, status semantic hiện có|
|Spacing|PASS — padding16–18, một form group, không field cards, CTA measured|
|Radius|PASS — major16, input10, CTA11, badge8|
|Form quality|PASS — labels/optional marker, inline validation, focus/filled state|
|CTA consistency|PASS — deep primary, scanner affordance và arrow như hệ đã duyệt|
|Information hierarchy|PASS — nghiệp vụ→kho→bước→form→primary action|
|Enterprise feeling|PASS — compact operational form, không marketing/illustration/card-in-card|
|Mobile usability|PASS — 3phone sizes, scroll/keyboard proxy, no overlap|

## 9. Files affected / open decisions

Implementation:
1. `components/scanner-inbound-create.tsx` — presentation/form mới, callbacks vào draft parent.
2. `components/scanner-inbound-create.css` — chỉ scope `.sc-phone.sc-phone-inbound-create`, không đổi shared styles.
3. `components/scanner-preview.tsx` — import/early inbound presentation branch, class và header title riêng cho inbound create. Existing fallback và business handlers giữ nguyên.
4. `scripts/build-scanner-pages.mjs` — copy2file mới vào build.

QA/report:
5. `scripts/qa-p04-inbound.mjs` — Before/After và checks phạm vi P04.
6. `scripts/build-p04-evidence.mjs` — baseline pixel comparison/gallery.
7. `scripts/qa-scanner-p05-e2e.mjs` — cập nhật locator Nhập kho cho regression.
8. Report này và artifacts P04.

Giữ nguyên mọi thay đổi chưa commit có trước; không reset working tree. Không thay source/ảnh baseline v1.

OPEN DECISION: không có ambiguity nghiệp vụ mới chặn scope P04. API, native keyboard/AT/hardware thật ngoài scope; P04 không thêm rule để xử lý các phần đó. Draft persistence giữ hiện trạng, không mở rộng thành autosave.

## 10. Acceptance / stop gate

| Yêu cầu bắt buộc | Result |
|---|---|
|Chỉ Inbound Create, không P05|PASS|
|COMMON/visual grammar, không generic/card-heavy|PASS — Before/After và review mục8|
|Field/rule/RBAC/paused/draft/context/Post giữ nguyên|PASS — hashes, unit/E2E, state tests|
|CTA đúng “Tiếp tục quét mã”|PASS|
|360/390/430, keyboard/safe-area/sticky/nav no overlap|PASS|
|App-contained overlays|PASS|
|Focus/labels/error association/reduced motion|PASS|
|Console/page error checks|PASS —0 errors|
|Approved Login/Shift/Home không drift|PASS —9/9 golden images identical|
|Evidence/report đầy đủ|PASS|

Dừng sau P04. Không thực thi P05, không commit/push/deploy.

P04 PASS — READY FOR P05
