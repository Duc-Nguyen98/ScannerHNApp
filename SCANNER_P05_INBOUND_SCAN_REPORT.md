# P05 — INBOUND Scanner

Ngày09/09/2026. Precondition: `SCANNER_P04_INBOUND_CREATE_REPORT.md` kết luận P04 PASS; người dùng xác nhận P01–P04 là visual baseline.

## 1. Executive summary

Hoàn tất **chỉ màn quét Nhập kho/INBOUND và presentation của overlay phát sinh từ màn này**. Đã đọc prompt P05, COMMON, approved baseline và report P04. Không triển khai P06; màn Review đang có chỉ được mở để kiểm tra boundary/regression.

Màn mới có header Nhập kho, context INBOUND, khung ngắm được ghi rõ **Camera mô phỏng trong preview**, input nhanh/manual fallback, count, feedback theo nghiệp vụ, danh sách compact và sticky CTA **Kiểm tra phiếu**.

Không đổi dữ liệu mẫu, validation domain, auth/route guard/RBAC, warehouse paused, draft protection, Inventory/Post, Warranty, Parts hoặc NFC. Quét chỉ thay draft trong bộ nhớ, không đổi stock/store.

- [Preview/evidence gallery](artifacts/scanner-p05-inbound-scan/index.html)
- [Browser QA](artifacts/scanner-p05-inbound-scan/after/qa.json)
- [Baseline regression](artifacts/scanner-p05-inbound-scan/baseline-regression.json)

## 2. Before → After

| Vùng | Before | After P05 |
|---|---|---|
| Header/context | Header trắng “Quét mã”, context riêng bên dưới | Header Nhập kho cùng P04, kho thực hiện + INBOUND rõ ràng |
| Progress | Các text trên divider | Cùng grammar3 bước P04, bước2 có `aria-current=step` |
| Viewfinder | Khung lớn, CTA camera, trạng thái mô phỏng chưa nổi rõ | Focal area gọn, reticle/scan line tĩnh, count lớn, disclosure mô phỏng dễ thấy |
| Manual | Generic card “Mã linh kiện / hộp / hiện vật” | Input “Mã QR / Barcode” + Kiểm tra mã cùng hàng; Enter để kiểm tra tiếp |
| Feedback | Notice/error tách xa, notice cũ có thể còn sau lỗi | Error ưu tiên; success có mã + tên + số lượng; clear feedback khi sửa input/bỏ dòng |
| Scanned list | Mỗi mã một card riêng, metadata rời | Một danh sách semantic UL/LI, divider, tên/code/SKU/qty, nút bỏ44px |
| Footer action | Count rồi button dài | Sticky Kiểm tra phiếu, số lượng và ghi chú không đổi tồn; dùng hệ đo geometry hiện có |
| Camera/manual overlay | Shared styling cũ | App-contained sheet đồng bộ Operational Pro, input/error association, Enter/focus/Back |

Không có card-in-card: viewfinder là một surface độc lập, manual controls nằm trên nền màn, danh sách là một surface chia hàng. Không vẽ live video/không gọi camera thật.

## 3. Camera / business preservation

- Dòng **Camera mô phỏng trong preview** luôn hiển thị trong viewfinder; giải thích “Chưa kết nối camera thật”. Đây là yêu cầu explicit của P05, không phải QA control bị lộ.
- Mở camera hiển thị sheet mô phỏng, có fallback Nhập mã thủ công. Kịch bản denied được ghi rõ là mô phỏng, không giả quyền/hardware đã được kiểm tra thật.
- Hàm `addCode` nguyên văn/SHA256 giữ nguyên: normalize code, permission/warehouse check, `validateLine`, duplicate protection, quantity và haptic/sound behavior không đổi.
- Handler nhận mã vẫn vào domain hiện tại; không có bộ validator giả song song để tự cho PASS.
- Success/duplicate/invalid/pending/remove/re-add không đổi chuỗi local store. Không tạo chứng từ hay Post ở P05.
- Chỉ đổi wording số lượng hộp thành **Số lượng cần nhập*** khi context là INBOUND. Field/outbound/parts label cũ và quy tắc số lượng giữ nguyên.
- Draft name/note/scanned lines còn nguyên khi quay lại P04 hoặc quay từ Review về scanner. Đổi tác vụ vẫn dùng confirm cũ; Hủy không mất draft.
- Không thêm autosave/recovery mới. Reload vẫn tuân theo draft/session behavior hiện có.

## 4. Test matrix theo nghiệp vụ

| Case | Expected/Actual | Result |
|---|---|---|
| Empty | Count0; Kiểm tra phiếu disabled | PASS |
| NEW-001 | Thêm1 dòng, đúng code/tên/qty; stock không đổi | PASS |
| NEW-001 lần2 | “Mã này đã có trong danh sách. Không cộng thêm lần thứ hai.”; count vẫn1 | PASS |
| MAY-001 | Đã trong kho, báo không thể nhập lại; count không đổi | PASS |
| KHONG-TON-TAI | Không tìm thấy mã, hướng dẫn kiểm tra tem/nhập lại | PASS |
| NEW-002 | Đang thuộc phiếu chờ duyệt; không thêm | PASS |
| NEW-LK-001 | Thêm dòng hợp lệ thứ2, count/qty đúng | PASS |
| Bỏ/re-add | Bỏ chỉ đổi draft; kiểm tra lại thêm đúng1lần | PASS |
| Sheet manual Enter | Mã pending giữ sheet/error; mã hợp lệ đóng sheet/thêm đúng dòng | PASS |
| Offline | Giữ draft, báo chưa xác minh được mã; không thêm | PASS |
| Camera denied | Sheet ghi rõ kịch bản mô phỏng + fallback | PASS |
| BOX-001 qty0 | Rule số nguyên dương hiện có báo lỗi | PASS |
| BOX-001 qty1 | Rule trạng thái nhập hiện có từ chối item trong kho | PASS |
| Viewer / paused | Write route bị khóa, không render input scan; lookup vẫn mở | PASS |
| Review boundary | Chỉ mở Review hiện có; quay lại giữ2 mã | PASS |

Các case trên được kiểm tra trong browser, không suy PASS chỉ từ code.

## 5. Mobile / overlay / accessibility

| Viewport | Scanner/states | Manual/focus/Back | Keyboard/sticky/safe-area | RBAC/draft | Console/page errors |
|---|---|---|---|---|---|
|360×800|PASS|PASS|PASS|PASS|0|
|390×844|PASS|PASS|PASS|PASS|0|
|430×932|PASS|PASS|PASS|PASS|0|
|1440×1000 desktop/app390|PASS|PASS|PASS|PASS|0|

- Inline Enter kiểm tra mã và giữ focus cho lượt nhập tiếp theo; không mở keyboard tự động ngay khi vào scanner.
- Bottom sheet có label, error association, live region, focus trap, Escape/Back, focus restore về nút camera. Core AppDialog/portal không đổi.
- Draft confirm, camera/manual và paused warning được đo trong `.sc-app-viewport`; không có overlay tràn desktop.
- Keyboard proxy giảm `visualViewport.height`340px: shell co viewport, nav ẩn theo cơ chế đang có; input và sticky CTA đều truy cập được.
- Short-height420px, safe top24/bottom34px, last row scroll clearance và reduced motion PASS.
- Important buttons/remove targets≥44px. Input16px; labels không phụ thuộc placeholder.
- 0 axe WCAG A/AA violations trong52 audited state captures (13×4viewports). Output có chữ/icon, không chỉ màu.
- Chưa kiểm thử hardware camera, âm thanh/rung, VoiceOver/TalkBack hay IME/OS Back trên thiết bị thật. Proxy/axe không phải chứng nhận native AT.

## 6. Visual evidence / baseline regression

BEFORE:13 states×4viewports. AFTER:24 states×4viewports, bao gồm empty, success, duplicate, invalid-status, unknown, pending, list/list-scrolled, camera/manual, review boundary, draft confirm, short/keyboard/safe, offline/denied/box, viewer/paused và baseline screens.

- [390: Before / After / P04 baseline](artifacts/scanner-p05-inbound-scan/before-after-baseline-390.png)
- [360 Before / After](artifacts/scanner-p05-inbound-scan/before-after-360.png)
- [430 Before / After](artifacts/scanner-p05-inbound-scan/before-after-430.png)
- [Success / Duplicate / Invalid](artifacts/scanner-p05-inbound-scan/feedback-390.png)
- [Toàn bộ ảnh AFTER](artifacts/scanner-p05-inbound-scan/after/)

**12/12 ảnh Login, Shift, Home và P04 ở360/390/430px giống byte-for-byte với baseline tương ứng:0 pixel thay đổi.** Không cập nhật/ghi đè golden images để làm test pass.

Hashes của source P01–P04, domain, auth, policy, intent, outbound, launcher, shared shell/overlay/layout giữ nguyên. Main app chỉ integration P05; các đoạn `addCode`, legacy scanner (outbound/parts) và Review/các business views được hash riêng trước/sau và khớp. [Source freeze](artifacts/scanner-p05-inbound-scan/after/source-hashes.json).

## 7. Regression / build

- Unit auth/policy/model/intent/design-fixtures/shift: **31/31 PASS**.
- Full existing E2E: **36 checkpoints PASS** trên3phone sizes: nhập submit→Post, xuất recipient/quantity→retry→Post, trace/docs search, parts, warranty status/tabs, NFC bind/revoke, history. [E2E](artifacts/scanner-p05-inbound-scan/e2e/e2e.json).
- TypeScript scanner + scoped oxlint PASS; diff whitespace check PASS.
- Standalone artifact build thành công và chạy được tại4174. Windows runtime có thể cảnh báo libuv sau prerender; artifact được validate và kiểm thử bằng browser, không dựa riêng vào build exit.
- Review/submit/Post được chạy như regression của code hiện có, không thực thi hoặc redesign prompt P06.

## 8. Visual review theo Operational Pro

P05 không yêu cầu ngưỡng điểm số; không tự tạo điểm số để PASS. Đã xem Before/After và các state quan trọng:

| Dimension | Đánh giá |
|---|---|
|Color/header|PASS — deep operational cùng P04, Hoa Nam primary/surfaces|
|Typography|PASS — Public Sans, page26/700, count28, metadata10–12, item13/650|
|Spacing/radius|PASS — major16, viewfinder/list12, input/controls10, CTA11|
|Focal area|PASS — dark viewfinder và count rõ, không giả live hardware|
|Information density|PASS — input nhanh, feedback gần input, list compact không card-per-item|
|CTA hierarchy|PASS — kiểm tra mã secondary; Kiểm tra phiếu primary sticky|
|Feedback|PASS — reason từ domain, error ưu tiên notice, success code/name/qty|
|Overlay grammar|PASS — app-contained sheet, fields/actions đồng bộ baseline|
|Mobile usability|PASS — thao tác/scroll/keyboard proxy ở3viewport|

Không có bản vẽ P05 độc lập kèm prompt; đây là triển khai theo visual grammar P01–P04 đã chốt, không tự tuyên bố pixel-match một reference P05 chưa được cung cấp. Asset hero tái sử dụng file approved đang dùng ởP04, không thêm stock asset.

## 9. Files changed / open decisions

Implementation:
1. `components/scanner-inbound-scan.tsx` — P05 presentation + form/list/feedback.
2. `components/scanner-inbound-scan.css` — scoped INBOUND scan và dialog khởi phát từ context này.
3. `components/scanner-preview.tsx` — early P05 branch, header/class, camera mock copy, UI feedback clearing, conditional manual Enter/error association/disabled and inbound quantity wording. `addCode` và model/policy không sửa.
4. `scripts/build-scanner-pages.mjs` — copy2file mới.

QA/evidence:
5. `scripts/qa-p05-inbound-scan.mjs`.
6. `scripts/build-p05-evidence.mjs`.
7. `scripts/qa-scanner-p05-e2e.mjs` — helper locator nhận input P05 mới, giữ fallback cho outbound/parts; không nới business assertions.
8. Report này và artifacts P05.

OPEN DECISION: không có quyết định nghiệp vụ mới cần chốt để hoàn thành P05. Kết nối hardware/API/native AT là ngoài phạm vi. Thứ tự xử lý hộp/quantity giữ nguyên domain hiện có; không tự đổi validation trước/sau quantity.

Giữ nguyên các thay đổi chưa commit trước đó. Không reset, không commit/push/deploy.

## 10. Acceptance / Stop

| Acceptance | Result |
|---|---|
|Header Nhập kho / context INBOUND rõ|PASS|
|Viewfinder + manual fallback|PASS|
|Camera mock ghi rõ simulation|PASS|
|Scanned count/success/compact list|PASS|
|Duplicate không cộng|PASS|
|Invalid reason theo nghiệp vụ|PASS|
|No stock mutation khi scan|PASS|
|Sticky Kiểm tra phiếu|PASS|
|Keyboard/manual/safe-area/overlays contained|PASS|
|360/390/430 + regression|PASS|
|RBAC/paused/draft protection giữ nguyên|PASS|
|P01–P04 không visual drift|PASS —12/12ảnh identical|
|Evidence/report/console/accessibility|PASS trong phạm vi test đã nêu|

Dừng sau report này. **Không thực thi P06.**

P05 PASS — READY FOR P06
