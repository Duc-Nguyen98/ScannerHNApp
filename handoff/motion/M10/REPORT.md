# MOTION_P10 — Cá nhân / Tài khoản của tôi

2026-10-01 · **PASS_SCOPED_UI_FIXTURE** cho motion của4/4 panel ở auto, OS reduced và off. Visual actual vẫn chờ review; production/backend/hardware chưa được nghiệm thu. Không deploy.

## Gate, source và fixture

- Đã đọc MOTION_P10, MOTION_CONTRACT v1.0, Contract gốc v2.0 đã dùng, `handoff/flow/FLOW_REPORT.md`/`FLOW_GATE.json` PASS và M00 REPORT/OWNERSHIP. Gate gốc675 test,24 board/91 panel là evidence lịch sử; không tính thành test mới của M10.
- HEAD thực: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Target: native HTML/CSS/ES modules, prototype local. Working copy chứa các consumer M01–M09 và các sửa flow được duyệt sau baseline.
- Baseline chính của lượt này: snapshot source/actual trước M10 tại `before/`; giữ P10-r10 và tiêu đề **Tài khoản của tôi căn giữa** đã chốt. Không quay về bố cục B10 cũ để thuận tiện animate. [Quyết định trước triển khai](DECISIONS.md).
- Fixture giữ nguyên: B10 contact theo `fixture-minhanh`, identity từ auth namespace hiện có; không sinh record, quyền hay seed mới. Hash `profile-model.mjs` trước/sau bằng nhau. Fault injection kiểm save hold/exception và role display chỉ nằm trong browser harness, không phải API/schema/permission mới.

## Sửa flow trước motion

Adapter preview throw khiến Save bị kẹt busy và không có thông báo. Đã sửa đúng owner P10: catch lỗi tổng quát, giữ draft, `finally` thả busy, giữ guard route/view; retry chỉ theo thao tác người dùng. [Before](preflight/save-throw-before.json) ghi busy=true, disabled=true, unhandled exception; [after](preflight/save-throw-after.json) ghi busy=false,2 calls/2 submits, draft còn nguyên, không lỗi JS. Kiểm này chạy trước khi thêm motion.

Đây là kiểm biên adapter **preview không ghi tài khoản**; chưa định nghĩa policy UNKNOWN/idempotency cho API profile production chưa có. Không giả đã lưu hoặc cho phép retry mutation production chưa đối chiếu.

## Ownership và từng panel

| Panel | Áp dụng | Auto | OS reduced | Off |
|---|---|---|---|---|
| P10.S01 | SettingsRows opacity press100ms; selected nav do M02; avatar và tên không zoom/parallax, không entrance hàng | PASS | PASS: press0ms | PASS:0ms |
| P10.S02 | FormFeedback140ms trong slot22px hiện hữu; pending/disabled cập nhật ngay; input/caret/IME và geometry tĩnh | PASS | PASS: feedback80ms | PASS:0ms, đầy đủ phản hồi |
| P10.S03 | Nội dung quyền read-only. Khi metadata identity hợp lệ thay đổi tại cùng panel: opacity140ms; không toggle quyền, không replay khi Back | PASS | PASS:80ms | PASS:0ms, dữ liệu/quyền như nhau |
| P10.S04 | Menu dùng cùng SettingsRows; navigation dùng RouteTransition M02 theo panel-key; P11/Back theo router hiện hữu | PASS | PASS | PASS |

- Reuse nguyên vẹn M00 `pressFeedback`, `noticeFeedback`, `dataState`, mode/media/visibility/cancel/dispose; token/easing và primitive source không sửa. Mode off không tạo WAAPI của M10. Reduced không có transform và không bị auto vượt OS.
- Home/M02 là route owner duy nhất. Key P10 theo panel, không theo giá trị field, dirty, query hoặc quyền. Không snapshot outgoing, không animate scale `.hn-screen`, không giữ nội dung sau logout/security guard.
- `profile/motion.mjs` chỉ là consumer theo owner hiện hữu, không provider/scroller mới. Lifecycle Home fan-out mode/cancel cho P10; hide dispose controller, logout dispose listeners. Không callback animation nào gọi save, đổi quyền, navigation hoặc lưu dữ liệu.
- Error tổng quát/blocked vẫn qua `action-dialog`/`app-modal` theo contract đã khóa, không tạo error banner ở form. M10 không tạo animator overlay thứ hai. Validation field cụ thể còn thiếu API policy: không bịa regex/length/required từ dấu sao. Error dialog có geometry/scroll/focus cố định của owner chung; nội dung cần quyết định giữ đầy đủ.
- Settings ngắn: **virtualization NOT_NEEDED**. Không thêm dependency, GSAP, Lenis hoặc smooth scrolling. Existing native scroll/keyboard/hit-area controllers được giữ.

## Kiểm chứng

| Lệnh | Kết quả |
|---|---|
| `node scripts/check_motion_p10.cjs --before` |12 ảnh4 panel×3mode, source snapshot,3 trace trước |
| `node scripts/check_motion_p10.cjs` |**24/24 nhóm PASS**:8 nhóm mỗi mode,12 ảnh settle,3 trace thật + WAAPI/RAF samples |
| `$env:MOTION_P02_EVIDENCE_DIR='handoff/motion/M10/shell-regression'; node scripts/check_motion_p02.cjs` |**36/36 nhóm PASS**:12 nhóm mỗi mode, kiểm consumer/guards/nav/scroll/footer |
| `node --test tests/profile.test.mjs tests/motion-p01.test.mjs tests/motion-p02.test.mjs tests/dialog-route.test.mjs` |**26/26 PASS**, [log](node-tests.txt) |

Runner M02 cần `before.json`; lần đầu thiếu file nên dừng trước kiểm. Đã dùng đúng baseline M02 tại `handoff/motion/M02/evidence/before.json`, copy nguyên vẹn vào thư mục hồi quy M10, rồi chạy lại đạt. Không dùng lỗi setup này làm lỗi UI hoặc đánh dấu PASS từ lần chạy chưa xong.

Các ca M10 bao gồm:

- Pointer/keyboard press, disabled, avatar static; IME compose/caret/value và DOM input còn nguyên.
- Pending slot không đổi bounding box footer; submit lặp trong lúc chờ chỉ1 call; throw rồi retry giữ tên và allowlist. Mỗi mode có đúng2 calls và cùng2 payload `{name: "Nguyễn Minh Ánh"}`; không gửi role/kho/email.
- Quyền vẫn chỉ đọc qua deep link, mode off, metadata change và Back. Không replay identity/row khi repaint hoặc quay lại.
- Back P11 trả đúng P10.S04; rapid navigation chỉ còn1 app; dirty Back/confirm giữ policy cũ.
-10 vòng vào/ra mỗi mode không tăng listener visibility; đổi OS/mode giữa animation, document-hidden, hide/logout đều hủy hiệu ứng. Guard/nội dung không chờ duration.
- Viewport494×950 và360×420, DPR1, zoom1; footer trong app, field cuộn nội bộ, không tràn ngang. Viewport thấp chỉ mô phỏng vùng nhìn, không chứng minh keyboard thiết bị thật.

## Visual, trace và hiệu năng

- **12/12 phép so geometry/DOM count/text sau settle bằng snapshot trước** tại cùng panel/mode. Đã xem trực quan4 ảnh auto sau settle. Đây là kiểm bảo toàn giao diện, không phải user visual acceptance mới.
- [Kết quả/samples](evidence/results.json), [tóm tắt](SUMMARY.json), [review trước–sau](REVIEW.html).
- Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Screenshot không được dùng làm bằng chứng duy nhất của motion. Frames opacity và duration từng primitive được lưu trong results.
- Signature ghi nhận: auto SettingsPress100/FormFeedback140/Identity140; OS reduced chỉ FormFeedback80/Identity80; off không có M10 effect. Số operation và kết quả domain như nhau.
- Delta source scoped **+3411 bytes** (plain source, không phải gzip/production bundle). Không tăng node count của panel. Không đo dropped frames/input latency/FPS trên thiết bị mục tiêu, nên **không tuyên bố60fps**. Trace chịu overhead của harness; không lấy số frame quan sát làm benchmark.
- Camera calls quan sát0 trong cả3 mode. Không chỉnh scanner/NFC service hoặc mở session mới vì motion. Physical camera/NFC/IME/touch, backend và persistence production **NOT_RUN/BLOCKED** như trước.

## Files và tracking

- Mới `docs/flows/profile/motion.mjs`, `scripts/check_motion_p10.cjs` và `handoff/motion/M10/`.
- Sửa `docs/flows/profile/profile.mjs`: consumer, pending label, exception release/guard, panel-key/lifecycle. Sửa `docs/flows/home/home.mjs`: fan-out mode/security cancellation và dùng P10 panel-key với M02. Không sửa CSS hình thức, fixture source hoặc M00 primitives.
- [Source manifest](SOURCE_MANIFEST.json), [diff scoped](changes.patch). Cập nhật `handoff/motion/MOTION_COVERAGE.csv`, `MOTION_RUN_STATE.json` và ownership M00. Giữ nguyên `RUN_STATE.json`/`SCREEN_COVERAGE.csv` nghiệp vụ và integration status.
- Phần tiếp theo: user review motion M10; MOTION_P11 chỉ thực hiện khi được yêu cầu. Toàn rollout M01–M24 chưa hoàn tất; không deploy.
