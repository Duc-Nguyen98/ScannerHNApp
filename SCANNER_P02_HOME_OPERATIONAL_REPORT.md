# P02 — HOME OPERATIONAL DASHBOARD

## Kết luận

**P02 PASS — READY FOR P03**

Scope duy nhất: Home content/operational header. Không redesign Bottom Navigation; không thay business logic/data. Điểm review nội bộ riêng Home: **93/100**. Đây không phải điểm hay nghiệm thu toàn app.

Precondition: `SCANNER_P01_ENTRY_OPERATIONAL_REPORT.md` đã PASS. Đã đọc đầy đủ P02, COMMON, RUN_CODEX_MASTER_COMMAND; đối chiếu positive Operational Pro và negative modal-overflow reference. Giữ các thay đổi P00/P01 chưa commit, không reset worktree.

## 1. Baseline issues và plan

Home cũ: hai KPI surface tách rời; task tiles có icon boxes/border dày cảm giác generic; hero sáng và chưa có status trong nội dung; Tra cứu nhanh giống CTA riêng lẻ; mỗi chứng từ là card lớn, không có timestamp ở Home.

Plan thực thi: capture BEFORE + source hashes → tách Home presentation component dùng đúng callbacks/data cũ → CSS scope Home → build static/test3 viewport/axe/domain/regression → report → STOP.

Ảnh reference được dùng cho hierarchy, deep operational header, summary chung, density và compact list. Không sao chép giờ08:30, số thông báo hoặc phiếu PX/BH từ ảnh vì không có dữ liệu đó trong store. Không dùng bitmap tham chiếu làm ảnh kho nền.

## 2. Changes implemented

- Header Home Deep Operational #073B52/#083E55; tên HOA NAM SCANNER, nhãn WMS · Vận hành kho; hero chứa KHO HOA NAM, greeting từ session và status active/paused. Không ảnh trang trí vì chưa có asset kho độc lập phù hợp.
- Summary **một surface 3 cột** với vertical dividers: Phiếu chờ duyệt, Bảo hành đang mở, Ca bắt đầu. Giữ công thức đếm pending docs và cases không Đã trả/Đã huỷ như baseline.
- Dữ liệu chưa có thời điểm start shift: cột Ca bắt đầu hiện **—** và trạng thái **Đã vào ca** theo boolean session. Không dùng login time hoặc giờ hiện tại để thay thế (OPEN DECISION phía dưới).
- Tác vụ kho giữ 2×2 Nhập/Xuất/Bảo hành/NFC; icon Lucide không box riêng; tile12px nhẹ border. Nhập kho có primary visual emphasis, không đổi quyền/ưu tiên nghiệp vụ.
- Quick lookup đổi nhãn theo yêu cầu **Quét hoặc nhập mã sản phẩm**, supporting **QR · Serial · SKU**, surface #073B52. Callback vẫn lookup read-only; nút QR footer vẫn global launcher, không thay IA ở đây.
- Chứng từ gần đây dùng một group list với icon loại, code, type/name, timestamp từ d.at, semantic status, chevron, divider. Giữ `db.docs.slice(0,3)` và thứ tự hiện có, không tự tạo/sắp xếp dữ liệu mới.
- Phiếu đang soạn vẫn có Tiếp tục quét với count thật, không mất callback/draft.

## 3. Data / navigation mapping không đổi

| Home item | Dữ liệu | Action |
|---|---|---|
| Greeting | access.session.name | Không sửa identity |
| Warehouse status | warehouseStatus(db), readiness/storage-error | Hiển thị, không mutate |
| Phiếu chờ duyệt | pending.length | setDocFilter(Chờ duyệt) → docs như cũ |
| Bảo hành đang mở | Cases loại Đã trả/Đã huỷ | setCaseFilter(Tất cả) → warranty như cũ |
| Ca bắt đầu | session.shiftStarted, không timestamp | Readonly, không tạo shift |
| Nhập/Xuất | inbound.create / outbound.request.manual_create + warehouse state | start(in/out), giữ form bắt buộc |
| Bảo hành task | Permission/flow hiện có | go(warranty), không ép reset filter khác baseline |
| Thẻ NFC | Flow hiện có | go(nfc) |
| Lookup surface | Read-only | go(lookup) |
| Chứng từ | d.id/name/kind/at/status thật từ store | openDoc(id) |
| Xem tất cả | Không mutate | setDocFilter(Tất cả) → docs |
| Draft | draft.lines/kind | go(scan), không reset |

Viewer: Nhập/Xuất disabled + lý do; Bảo hành/NFC list còn truy cập đọc. Kho paused vẫn chặn writes theo policy cũ; không tự khóa read-only lookup.

## 4. BEFORE / AFTER

Gallery: `artifacts/scanner-operational-p02/index.html`.

- BEFORE: `before/{360,390,430}-home.png`, `before/qa.json` — current workspace sau P01.
- AFTER: `after/{width}-home.png`, `*-recent-scroll.png`, `*-viewer.png`, `*-paused.png`, `*-overlay.png`, `*-short.png`.
- Data regression: `regression/{width}-updated-summary.png` (summary tăng từ1 lên2 sau gửi phiếu pending; không tăng tồn).

Đã xem trực quan bản cuối Home360/390 và recent-scroll430. Lượt đầu bị CSS task grid cũ đẩy icon sang phải/làm nhãn primary khó đọc; sửa override **chỉ trong Home**, chạy lại QA trước kết luận.

## 5. Mobile validation và accessibility

| Viewport | Layout2×2 / summary3 cột | Tasks/KPI/lookup/docs | Viewer/paused | No errors | Result |
|---|---|---|---|---|---|
|360×800|Đạt|Đạt|Đạt|Đạt|PASS|
|390×844|Đạt|Đạt|Đạt|Đạt|PASS|
|430×932|Đạt|Đạt|Đạt|Đạt|PASS|

`scripts/qa-operational-home.mjs` → `after/qa.json`:
- Đo hai task cùng hàng bằng y-coordinate; bốn nút hiện diện và touch target≥44×44.
- Cuộn record cuối tới phía trên navigation và assert record.bottom≤nav.top; không horizontal overflow.
- Short-height420 screenshot/scroll; không keyboard form mới trong Home nên không thêm keyboard business UX.
- 3 axe WCAG2A/AA +2.1AA runs, **0 automatic violations**. Incomplete gradient color-contrast kiểm bổ sung foreground/background endpoint trong `after/contrast.json`; không coi axe là AT certification.
- Status có icon+text; disabled có lý do; button có name; summary là section có accessible label, Ca bắt đầu là readonly section. Focus visible giữ màu Hoa Nam.
- Body không cuộn ngoài shell; overlay launcher sau login vẫn contained trong P00 viewport.
- Chưa test VoiceOver/TalkBack/keyboard OS thật; kết quả là Chromium mobile emulation, không chứng nhận native release.

## 6. Regression

Source hashes trong `before/source-hashes.json` và `after/source-hashes.json` so sánh tự động và assert bằng nhau cho:
- JSX Bottom Navigation trong Scanner (nguyên vẹn).
- Entry/auth component và CSS P01.
- P00 shell/overlay component và CSS.
- Global mobile CSS, auth/session services, model/policy.

`qa-home-regression.mjs` → `regression/qa.json`,3/3:
- Login→Forgot→Login→Shift/reload→Home không hỏng.
- Home→Nhập→scan NEW-001→Home→Tiếp tục quét còn1 mã→submit.
- Pending count cập nhật lên2 từ chính store, list2 records có phiếu mới; NEW-001 vẫn Chờ nhập vì chưa Post.
- Logout rồi private Home vẫn redirect Login.

`qa-shell-p00.mjs` output `regression-shell/qa.json`:44 containment states (3 phone +desktop), no pageerror, Back/Escape/focus/draft/warehouse/NFC/warranty/avatar/password overlays không regression.

31/31 unit/domain tests scanner-intent/model/policy/auth/account đạt. Các thao tác test chỉ ghi fixture trong context browser riêng, không dữ liệu production.

## 7. Code quality / build

- Scoped TypeScript `tsc -p tsconfig.scanner.json --pretty false`:exit0.
- `oxlint --tsconfig tsconfig.scanner.json components/scanner-home.tsx components/scanner-preview.tsx`:exit0.
- `npm run build:scanner`: prerender/static artifact hoàn tất. Windows Node26 có libuv assertion khi đóng server như baseline; artifact static được test trực tiếp tại port4174.
- `git diff --check`:đạt. Không tuyên bố global lint/typecheck cả archived repository.
- Runtime Home QA capture cả console.error và pageerror:errors[] tại mỗi viewport.

## 8. Score riêng Home /100

Rubric nội bộ chuyên gia,10 tiêu chí bằng trọng số; dựa screenshot và test ở phase này, không phải tỷ lệ unit pass hay đánh giá toàn app. Không dùng điểm93 Login cũ để thay điểm Home.

| Tiêu chí | Baseline /10 | Sau /10 | Evidence |
|---|---:|---:|---|
|Operational hierarchy|6|9.5|Deep header→summary→tasks→lookup→recent|
|Brand/color maturity|7|9.5|Hoa Nam restrained, không icon boxes tràn lan|
|Summary density|6|9|3 cột trong1 surface, dividers; thời gian chưa có|
|Data honesty|8|9|Giữ counts/data; không dựng giờ/record giả|
|Task clarity|7|9.5|2×2, labels/reasons, icon phân biệt|
|Quick lookup distinction|7|9.5|Label yêu cầu + supporting, callback read-only|
|Recent list readability|6|9.5|Code/type/context/time/status, group/dividers|
|Typography/spacing|7|9.5|Title26, KPI28, section17, primary14–15, support12|
|Mobile interaction|7|9|3 viewport,44px,final record clearance; chưa native device|
|Accessibility|7|9|3 axe+contrast+labels; chưa AT thật|
|**Tổng**|**68**|**93**|**Đạt Home target≥93 trong scope**|

## 9. OPEN DECISION

- **Giờ bắt đầu ca:** session hiện chỉ có shiftStarted/expiresAt, không startedAt. UI hiện —/Đã vào ca. Cần backend/BA cung cấp field trước khi hiển thị giờ chính xác. Không đổi session schema hoặc tạo timestamp trong prompt Home.
- Không có asset kho độc lập phù hợp: dùng deep tonal header thay vì crop ảnh reference/stock photo.
- Reference có notification badge, ba record nhiều loại và08:30; không đưa vào app khi dữ liệu chưa có. List hiện chỉ1 seed doc là đúng store, không nhân bản cho đẹp.
- Các gate toàn app cũ/API/hardware integration không tự thay đổi bởi điểm Home phase này.

## 10. Files affected / scope control

Mới: `components/scanner-home.tsx`, `components/scanner-home.css`, `scripts/qa-operational-home.mjs`, `scripts/qa-home-regression.mjs`, gallery/evidence và report này.

Sửa trong P02: `components/scanner-preview.tsx` (Home branch dùng presentation component, Home-only class/header; bỏ imports không dùng); `scripts/build-scanner-pages.mjs` (copy Home component/CSS).

Các thay đổi dirty worktree P00/P01 vẫn được giữ và không gán nhầm là thay đổi P02. Không sửa Bottom Navigation hoặc business/domain; không chạy P03. Chưa commit/push/deploy; local preview sẵn tại `http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/`.

## Acceptance

| Yêu cầu | Kết luận |
|---|---|
|Home nhìn rõ khác baseline|PASS —BEFORE/AFTER|
|Không plastic UI|PASS review —surface ít hơn, icon không box riêng, divider/hierarchy|
|Ít card hơn|PASS —2 KPI riêng→1 summary; per-record cards→1 compact group|
|Hierarchy mạnh hơn|PASS —header/summary/tasks/list có cấp độ rõ|
|Không thay data/business|PASS —hash protected files/callback mapping/store assertions|
|360/390/430 PASS|PASS —runtime/axe/interaction/errors logs|
|Home target≥93|PASS —93/100 rubric riêng Home|

**P02 PASS — READY FOR P03**

Dừng sau report P02, không tự chạy P03.
