# MOTION_P09 — Bảo hành

Thực thi tài liệu MOTION_P09_Bao_hanh.md ngày01/10/2026. Hoàn tất bốn panel trên UI prototype với auto, OS reduced và off; giữ ID, fixture, guard và geometry sau settle. Hình thức motion chờ user review, không phải nghiệm thu production hoặc toàn bộ24board.

## Nguồn / điều kiện bắt đầu

- Đã đọc MOTION_P09 và MOTION_CONTRACT v1.0 trong bộ Desktop người dùng giao; Contract chung2.0, AGENTS, UI_STANDARD, FLOW_GATE, M00 REPORT/OWNERSHIP/STACK_DECISION/LIST_AUDIT và consumer M04–M08 liên quan.
- FLOW_GATE **PASS/UI_FIXTURE**, không còn blocker thiết yếu; M00 **PASS_HARNESS_READY**. Source native HTML/CSS/ES modules, không chuyển framework/cài library.
- Giữ baseline B09/trace r01–r11 và thay đổi flow/shared/P18/P19 hiện hành. Không đổi ảnh baseline, footerLOCK, seed hay nghiệp vụ. Nguồn commitda9f623a19d0359c3e80c14f8cc612636ec6ab78 cùng working tree hiện hữu.
- Actual trước motion: `before/source/` và bốn panel×3mode tại494×950,DPR1,Chromium,Asia/Ho_Chi_Minh,clock01/10/2026 12:00VN. Manifest có SHA256/bytes trước–sau, bao gồm source chưa track Git.

## Mapping và ownership

| Panel | Quyết định | Thực thi |
|---|---|---|
| P09.S01 | APPLIED | Tap opacity100ms qua M00 pressFeedback trên case/lọc nhanh; kết quả lọc dataState140ms. Input còn kết nối, không stagger/reveal hàng hoặc rung trạng thái. Bỏ animation highlight5giây cũ để Back không phát lại. |
| P09.S02 | APPLIED + static subregions | FormFeedback/ScanFeedback dùng validation slots140ms; camera/reticle/input/counter không animate. Radio chọn lỗi cập nhật ngay bằng shared picker, không thêm checkbox giả. Giữ native scroll và DOM của camera/ô nhập khi trạng thái validation/busy/error thay đổi. |
| P09.S03 | APPLIED | Chỉ báo gạch chân tab dùng noticeFeedback140ms, opacity-only. Selected semantics/background/count và CTA đổi ngay, chỉ một bộ CTA hoạt động. Native scroll riêng mỗi tab/case, không crossfade hai bộ nội dung/CTA. |
| P09.S04 | APPLIED | Checkmark của kết quả đã có receipt dùng rowFeedback160ms đúng một lần theo requestID. Nhãn Chờ bàn giao, nội dung và guard hiện ngay; không morph thành Đã trả khách. Back/off/hidden không phát lại receipt cũ. |

`warranty/motion.mjs` là consumer nhỏ của **createMotionController M00 hiện có**, không provider/engine/scroller mới. Home/M02 tiếp tục sở hữu route opacity khi vào/ra module; không thêm route transition của P09 hoặc key theo query/field/tab. Overlay owner cũ giữ dialog, focus trap, scroll lock và Back; không thêm exit clone. Checkbox/radio và status/quantity/camera là **STATIC_BY_DESIGN**, đã kiểm trạng thái trong cùng workflow.

Reduced: feedback80ms, press/success row0ms theo token M00; off0ms. Auto không vượt thiết lập reduced của OS. Thay mode, OS, hidden, hide/dispose và security fanout hủy presentation. Domain submit/Post/bàn giao không nằm trong completion/timer/animation.

## Source thay đổi tối thiểu

- Thêm `docs/flows/warranty/motion.mjs`.
- Sửa `docs/flows/warranty/warranty.mjs`: gọi feedback đúng event, giữ connected form, receipt dedup và focus trở về sau intake failure.
- Sửa `docs/flows/warranty/style.css`: underline có cùng hình học tĩnh, bỏ highlight replay và transition legacy của case để một owner quản lý property.
- Sửa `docs/flows/home/home.mjs`: truyền review mode và fanout cancel/security tới consumer P09.

Không sửa M00 primitive/token, warranty-model, WARRANTY_SEED/WARRANTY_LEDGER: hash trước–sau được assert bằng nhau. Fixtures giữ8case; BH-001 **2mã/3linh kiện**, không dùng con số2 từ ảnh cũ để kết luận dữ liệu production sai. Repair update/Post linh kiện/bàn giao vẫn là các action riêng.

## Sửa flow phục vụ motion

Renderer trước thay cả subtree S02 khi lỗi nhập hoặc busy/error. Nay patch phần cần đổi, giữ camera/product section khi identity không đổi, giữ notes/accessories, native caret/IME/focus; không key input theo giá trị. Chọn sản phẩm khác hoặc đổi cấu trúc Khác vẫn do hành động người dùng quyết định. Failure giữ serial/ghi chú/request và khi đóng feedback trả focus về CTA tiếp nhận. Không dùng animation để che lỗi, không đổi validation200 hoặc layout tĩnh.

## Kiểm chứng

| Mode | Panel | M09 browser | Shell browser | Domain |
|---|---:|---:|---:|---|
| Auto, OS no-preference |4PASS|9PASS|12PASS|4write hợp lệ, camera0|
| Auto, OS reduced |4PASS|9PASS|12PASS|Giống Auto|
| Off |4PASS|9PASS|12PASS|Giống Auto|

- **69/69 Node PASS**: warranty suites + motionP02/P09; `evidence/node-tests.log`.
- **27 nhóm browser M09 PASS**: press/filter duration, tab140/rapid/current case/scroll, input/camera còn kết nối, viewport360×420 mô phỏng keyboard-height, intake failure/retry cùng request, success receipt160 và Back không replay, UNKNOWN/reconcile chống ghi trùng, case đóng ngay lúc P19 quantity sheet mở chặn lines/Post, mode/OS/hidden/cancel,10chu kỳ vào/ra không tích lũy controller listener, P18 Back và logout.
- **36 nhóm AppShell regression PASS** do chạm Home mode/security fanout. Reuse before.json M02 gốc, không chụp source mới giả làm baseline.
- Domain parity assert cả9case sau workflow, status/version/event labels, ledger ID/quantity và4write hợp lệ. P19 case-close test không thêm dòng và Postcount0; dữ liệu test đóng tạm được phục hồi sau assertion. Không ghi thêm audit vì mount/mode.
- **12/12 geometry** theo tọa độ tương đối AppShell bằng đúng actual trước: `evidence/geometry-comparison.json`. Đã xem ảnh Hồ sơ và kết quả thực tế; không suy geometry thành Designer pixel-perfect hoặc user acceptance.

## Trace / profile / giới hạn

- Bằng chứng cuối: `evidence/verified/results.json`, ba `*-trace.zip` có screenshot/snapshot/source; WAAPI duration/keyframes/cancel và RAF opacity thực nằm trong results. Auto có frame trung gian trên node còn kết nối. Ảnh tĩnh không được dùng để giả chứng minh motion.
- List8rows/149nodes ở cả3mode. Native scroll phù hợp seed hiện tại; virtualization **NOT_NEEDED** trong phạm vi này, backend long-list **DEFERRED** vì chưa có profile đủ căn cứ. Không thêm TanStack/Lenis/Locomotive/GSAP.
- Source runtime delta **5990bytes** theo scoped manifest, không phải bundle minified/gzip. Dropped frames, input-latency delta và FPS phần cứng **NOT_MEASURED**; không khẳng định60/120fps.
- Physical camera/NFC, keyboard/IME thật, WMS API và durable storage **NOT_RUN**. Hiệu ứng không mở thêm camera; test interception kiểm camera calls0. Production integration cũ không nâng trạng thái.
- Lượt đầu hết dung lượng C khi ghi trace sau Auto/reduced. Playwright kết thúc đã giải phóng phần tạm; không xóa tệp người dùng/evidence cũ. Lượt đầy đủ dùng TEMP/TMP riêng `D:/CodexTemp/ScannerHNApp-M09`, kết quả xác minh nằm ở `evidence/verified`. Các file ở `evidence/` ngoài thư mục này gồm smoke/partial và log, không thay kết quả cuối.

## Lệnh và tracking

```text
node scripts/check_motion_p09.cjs --before
MOTION_P09_EVIDENCE_DIR=handoff/motion/M09/evidence/verified node scripts/check_motion_p09.cjs
node --test tests/warranty*.test.mjs tests/motion-p09.test.mjs tests/motion-p02.test.mjs
MOTION_P02_EVIDENCE_DIR=handoff/motion/M09/evidence/shell-regression node scripts/check_motion_p02.cjs
```

Lượt verified có TEMP/TMP riêng như trên. `MOTION_COVERAGE.csv` chỉ cập nhật4dòngM09, vẫn91dòng; `MOTION_RUN_STATE.json` giữ M01–M08, completed M09, remaining từ P10. Không đổi business SCREEN_COVERAGE hoặc RUN_STATE bằng kết quả motion; không tự làm M10, push/merge/deploy.
