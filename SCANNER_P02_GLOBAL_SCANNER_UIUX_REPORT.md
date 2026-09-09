# P02 — Global Scanner Action + Navigation + Scan Flow

## 1. Executive Summary

Triển khai trên code sau P01 (`614f137`), đã kiểm tra `SCANNER_P01_LOGIN_START_SHIFT_UIUX_REPORT.md` kết luận P01 PASS — READY FOR P02. Mốc IA tham chiếu cũ `7de19bb` được thay bằng code mới nhất theo yêu cầu.

Đã triển khai global launcher, 4 tác vụ, scan read-only theo ngữ cảnh, nhánh bảo hành, draft confirmation, QA opt-in và nav active đúng nghĩa. T01–T12 đạt trong mock ở 360×800 /390×844 /430×932. 31/31 unit/domain tests đạt. Không đổi Post/inventory rule, auth/session hay Make UI Login/Shift.

**Quality gate tổng thể: P02 FAIL — FIX REQUIRED**, vì AC22 yêu cầu **final app ≥92/100**, trong khi lần này chỉ đủ bằng chứng cập nhật IA/launcher và hồi quy; đánh giá toàn app bảo thủ vẫn dưới92 (xem mục14). Không dùng điểm riêng launcher hoặc điểm93 của hai màn entry để tự chứng nhận toàn hệ thống. Bản chức năng mới sẵn sàng review; không tự triển khai prompt tiếp theo.

## 2. Before IA

Nút Quét mã ở giữa hoạt động như tab `lookup`, trùng intent với Tra cứu nhanh. Create/scan/review highlight Chứng từ; thiếu lựa chọn nghiệp vụ trước quét. Context transaction dựa draft nhưng không có scanner riêng cho warranty eligibility. QA controls/hints còn hiện mặc định trong app.

## 3. After IA

User intent → Quét mã → **Chọn tác vụ quét** → context → kiểm tra mã → review/submit/post theo luồng đã có. Không đoán nghiệp vụ sau scan.

| Entry | Tác vụ | Route / flow |
|---|---|---|
| Center Quét mã | Mở sheet, không đổi URL nền | Đúng 4 action bên dưới |
| Sheet Nhập kho | INBOUND | create (name required) → scan → review → submit → doc |
| Sheet Xuất kho | OUTBOUND | create recipient → quantity → scan → review → submit → doc |
| Sheet Bảo hành | WARRANTY | scan-warranty → active case hoặc warranty-product |
| Sheet Tra cứu sản phẩm | LOOKUP | scan-lookup → product; mã SKU nhiều hiện vật yêu cầu chọn |
| Home Tra cứu nhanh | Tìm trực tiếp read-only | lookup giữ nguyên |
| Home Tác vụ kho | Nhập / Xuất / Bảo hành / NFC | Giữ nguyên các card |
| Hồ sơ bảo hành | WARRANTY_PARTS | Context caseId → scan (parts) → review/submit |

NFC và xuất linh kiện **không nằm trong global sheet**. NFC vẫn ở Home; linh kiện luôn cần case context như trước.

## 4. Navigation Mapping

- Trang chủ active chỉ Home; Chứng từ chỉ docs/doc; Lịch sử chỉ history; Cá nhân và các profile-* active Cá nhân.
- Center là button aria-haspopup=dialog, aria-expanded phản ánh sheet. Không aria-current như tab. Trong create/scan/review/read scanner dùng viền contextual nhẹ quanh QR54px, không đánh dấu Chứng từ sai.
- URL `scan-lookup` / `scan-warranty` là phương án routing tương đương `scan?context=...`; không dùng lookup URL cho outbound scanner.
- Sheet mở push cùng URL kèm marker history. Back đóng sheet; Escape/Close/swipe và backdrop có đường đóng; native dialog focus restore. Static Pages bootstrap chặn popstate của framework nên sheet theo dõi marker trong lúc mở để Back vẫn đóng (100ms). Không đổi auth hook.
- Scanner Back về workflow trước bằng router hiện có; thiếu thông tin khi deep-link scan sẽ hiện hướng dẫn bổ sung, không render scanner ghi context-less.

## 5. Scanner Context Matrix

| Context | Validation / result | Mutation |
|---|---|---|
| INBOUND | Existing item, Chờ nhập, không pending, không duplicate; trước quét phải có phiếu | Không đổi stock |
| OUTBOUND | Trong kho, đủ tồn, không reserved/duplicate, không vượt target; recipient/quantity trước scan | Không đổi stock |
| WARRANTY | Active case (không Đã trả/Đã huỷ) → mở case; đã xuất + chưa active → offer intake; chưa xuất → lý do cụ thể | Không tự tạo case |
| LOOKUP | Code QR/barcode/optional serial/SKU lookup; SKU nhiều kết quả chọn hiện vật | Read-only |
| WARRANTY_PARTS | Eligible case đang kiểm tra/sửa chữa + linh kiện từng mã hoặc box qty | Stock chỉ đổi Post |

`resolveScan` và `assertLaunch` là domain read/action guard riêng. Không invent serial cho fixture; chỉ resolve trường serial khi dữ liệu có. QR/barcode trong preview là chuỗi mã nhập thủ công, chưa decoder camera.

Thông báo chưa đủ điều kiện: “Sản phẩm hiện chưa ở trạng thái đã xuất nên chưa đủ điều kiện tiếp nhận bảo hành.” Duplicate dùng “Mã này đã có trong danh sách. Không cộng thêm lần thứ hai.”

## 6. RBAC Matrix

| Role | Nhập/Xuất launcher | Warranty lookup | Intake / component issue | Lookup |
|---|---|---|---|---|
| Nhân viên kho | Theo inbound.create / outbound.request.manual_create | warranty.view | warranty.manage / warranty.component_issue | inventory.view |
| Người duyệt kho | Khóa nếu không grant create | Cho đọc | Theo permission; không tự cấp mới | Cho đọc |
| Chỉ xem | Disabled + reason; domain từ chối | Cho đọc | Disabled + reason; domain guard giữ | Cho đọc |
| Super Admin | Theo grant hiện tại | Cho đọc | Theo grant và warehouse state | Cho đọc |

Không sửa profiles/permissions hiện tại. UI guard + action `assertLaunch` + domain write guard hiện có. Không tự gắn quyền bằng tên hiển thị role.

## 7. Warehouse State Matrix

Paused: Nhập/Xuất sheet disabled với “Kho đang tạm dừng hoạt động”. Warranty scan vẫn read-only để xem active case/eligibility; **CTA tiếp nhận bị khóa**. Đây là phân biệt read/write đúng yêu cầu, không tắt toàn bộ tra cứu bảo hành. LOOKUP/docs/history còn xem được. Domain assertWrite ngăn mọi submit/post khi paused.

## 8. Draft Protection

Khi phiếu có tên/người nhận/note/scanned lines hoặc intake chưa hoàn tất, chọn tác vụ mới từ sheet mở confirmation ba lựa chọn chính xác:

- Tiếp tục phiếu hiện tại: không reset; ưu tiên trả về workflow step trước khi mở sheet.
- Bỏ phiếu và bắt đầu tác vụ mới: chỉ reset sau xác nhận, re-check permission/state trước thực thi.
- Hủy: đóng sheet, giữ route/draft.

Test giữ 1 mã NEW-001 khi Cancel/Resume rồi xác nhận bỏ khi chuyển Outbound. Draft vẫn theo policy RAM của baseline, không triển khai durable draft/offline queue. Profile dirty guard và session-expiry logic giữ nguyên.

## 9. E2E Results

`scripts/qa-global-scanner.mjs` → `artifacts/scanner-global-launcher/qa.json`, 3 viewport × T01–T12 (T03/T12 cùng bước):

| Tests | Kết quả / bằng chứng |
|---|---|
| T01 | Sheet mở trên Home, URL vẫn #home, 4 rows |
| T02 | Inbound form → name → scan, data-scan-context INBOUND |
| T03 | Outbound recipient/phone/address → quantity → scan, OUTBOUND |
| T04 | LOOKUP MAY-001 → product, serialized store không thay đổi |
| T05 | WARRANTY MAY-003 → BH-001 |
| T06 | WARRANTY MAY-007 → offer intake, không tự thêm case |
| T07 | MAY-001 in stock → error eligibility, không intake CTA |
| T08 | Paused: 2 disabled launch actions, lookup chạy, warranty intake disabled |
| T09 | Viewer: create disabled, lookup được, intake disabled |
| T10 | Draft 1 item giữ qua Cancel/Resume; discard explicit trước tác vụ mới |
| T11 | Browser Back đóng sheet, URL nền giữ, focus về center |
| T12 | Back từ Outbound scan về create, recipient không mất |

## 10. Regression Results

- `qa-scanner-entry-ui.mjs`: Login/Shift 3 viewport, QA login ?qa=1, paused readonly, lỗi/loading/next/enter/guard; kết quả `artifacts/scanner-entry-ui/after/qa.json`. Code UI Login/Start Shift không chỉnh; `components/scanner-auth.tsx` giữ nguyên.
- `qa-scanner-p05-e2e.mjs` với base `...?qa=1`: nhập→submit→post→xuất→retry→post→trace; parts LK-001 + BOX-001×3 và stock20→17 chỉ sau post; warranty transition/tabs; NFC gán/thu hồi; docs/history. 3 viewport đạt, no console/pageerror.
- `qa-scanner-p03.mjs` với ?qa=1: profile/dirty/avatar/phone/password/support/logout 3 viewport đạt.
- 31/31 unit tests (28 trước + 3 intent): quyền, paused, active/eligible/ineligible, no-mutation, SKU ambiguity và optional serial.

## 11. Accessibility

Native dialog aria-labelledby/description, focus trap Tab/Shift+Tab, named close44px, action rows≥80px, visible disabled reason và aria-describedby khi có lý do. Drag handle swipe down >60px là bổ sung cho nút Close/Escape, không yêu cầu drag để sử dụng. Animation180ms và reduced-motion tắt. Axe sheet tại 3 viewport không violation tự động. Chưa là chứng nhận WCAG toàn app hoặc screen reader/OS thật.

## 12. Mobile Screens

`artifacts/scanner-global-launcher/{360,390,430}-T*.png`; layout checks trong `layout/qa.json`: actual actions ≥44×48, hit test không overlay; sheet còn cuộn đến action cuối ở height420, input và CTA đọc mã thao tác được ở height420; swipe/Escape/reduced-motion đều đạt. Safe bottom env được dùng. Không giả iPhone keyboard/hardware là đã kiểm thử vật lý.

## 13. Open Decisions

- QA controls, credential hints, role/offline/OTP/device scenarios chỉ render với ?qa=1; chưa dùng VITE_SCANNER_QA vì query flag đáp ứng yêu cầu. Đây không phải bảo mật deployment.
- Camera chưa tích hợp: scanner ghi rõ và dùng nhập mã thủ công, không giả permission/hardware thật. NFC workflow mô phỏng giữ nguyên.
- Read warranty scan khi paused vẫn được phép; write intake riêng phải active/grant. Không tự đổi business rule.
- Không sửa quy trình post, quyền CMS hoặc kho. Serial vật lý, barcode decoding, API/state concurrency vẫn cần integration.
- Toàn app còn gate P05 BLOCKED và điểm85,7 từ audit trước; work này không bao gồm đóng mọi accessibility/backend/device gap.

## 14. Final UI/UX Score

Không lấy điểm93 của Login/Shift làm final app score. Theo 14 tiêu chí bằng trọng số từ audit P05, chỉ nâng phần có bằng chứng mới: IA92→95, Navigation88→93, Feedback82→86, Error prevention85→89, Business-flow86→92. Các chiều khác giữ nguyên (90/90/88/86/90/85/82/84/72). Trung bình mới **87,3/100** (1222/14), vẫn <92. Đây là điểm chuyên gia tạm thời cho app preview, không tỷ lệ pass test hoặc chứng nhận production. Muốn đạt92 cần đóng các gap toàn app đã ghi trong P05 và audit lại, không đổi rubric để pass.

## 15. Acceptance / PASS–FAIL

AC01–21: đạt trong phạm vi preview có evidence nêu trên; có giới hạn hardware/API/AT thật, không che dưới chữ PASS.
**AC22: FAIL — final app87,3 <92.** Vì user yêu cầu chỉ PASS khi đủ mọi AC, gate tổng thể chưa đạt mặc dù global flow đã được triển khai.

File mới: `components/scanner-launcher.tsx`, `components/scanner-intent-scan.tsx`, `components/scanner-global.css`, `lib/scanner-intent.ts`, `tests/scanner-intent.test.mjs`, QA global/layout scripts, report/evidence.
File sửa: `components/scanner-preview.tsx` tích hợp launcher/routes/hide QA; `lib/scanner-auth.ts` chỉ thêm private route names; `lib/scanner-model.ts` chỉ duplicate copy; build script copy isolated dependencies. Không sửa UI entry hoặc footer palette/icon54px. Static artifact được build để review.

Build/typecheck/scoped lint đạt; Node26 Windows có assertion đóng prerender quen thuộc, static artifact đã được kiểm thử. Không khẳng định global lint archives.

**P02 FAIL — FIX REQUIRED**
