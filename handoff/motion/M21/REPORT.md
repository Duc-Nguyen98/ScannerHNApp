# MOTION_P21 — Tiếp tục phiếu linh kiện

Đã thực thi **P21.S01–S04 trong auto, OS reduced và off**. Giữ bản P21 r03 hiện hành đã tạm chốt và các nâng cấp FLOW/M01–M20. Motion mới chờ review; không nâng backend/hardware thành PASS. [Review](REVIEW.html) · [Nguồn/quyết định](DESIGN_TRACE.md) · [Source manifest](SOURCE_MANIFEST.json) · [Diff](changes.patch).

## Source và ownership

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78 + working tree hiện hành. Target prototype-local-ui-fixture. FLOW_GATE PASS UI_FIXTURE, M00 ready; scope nguồn đã đọc tại inputs/, M00 REPORT/OWNERSHIP/LIST_AUDIT, FLOW_REPORT, Contract2.0/AGENTS/UI_STANDARD. Không cài library, chuyển stack hoặc deploy. B21 fixture XLK-0002/BH-001 và owner P19 trong phiên giữ nguyên; networkfail được giả lập bằng throw ở adapter read qua Playwright interception, không sửa fixture shipped.

- **DraftList:** M00 pressFeedback opacity100ms; background feedback dùng token100ms. Reduced/off tĩnh. ID/status/count/order có ngay, không reorder/reveal/row entrance.
- **ResumeFeedback:** route fade180ms do M02 AppShell, key theo panel + doc đã resolve + sample scope, không theo field/version/checkpoint. Reduced/off0. Nội dung/recorded rows/guard/checkpoint là STATIC_BY_DESIGN; không remount owner/store.
- **ReconcileNotice:** M00 noticeFeedback trên icon con140ms, reduced80ms opacity-only, off0; chỉ sau kết quả đọc cần đối chiếu. Dedup theo checkpoint/cause, không phát lại Back/ẩn/đổi mode. Không flash hay mở CTA sửa recorded.
- **Post-check:** glyph trong ô38×38 đổi thành spinner chỉ trong explicit status-check pending. CSS900ms linear; reduced/off tĩnh, hidden/inert/overlay pause. Request/result/guard không đợi animation. Không polling hay retryPost; POSTED chỉ từ matching receipt của owner.
- Native scroll/reader/overlay tiếp tục thuộc owner hiện có. Không thêm provider/scroller/virtualizer hoặc motion vào counter/ID/input/camera. M00 chưa có profile quyết định virtualization P21; giữ native list.

## Mapping panel / mode

| Panel | Auto | OS reduced | Off |
|---|---|---|---|
| P21.S01 | PASS · press100 | PASS · static | PASS · static |
| P21.S02 | PASS · shell route180 / data static | PASS · static | PASS · static |
| P21.S03 | PASS · notice140 | PASS · opacity80 | PASS · static |
| P21.S04 | PASS · request-only spinner | PASS · static glyph/text | PASS · static glyph/text |

12 geometry comparisons sau settle khớp source trước motion; nội dung4panel và domain result/operation counts giống nhau3mode. UUID scanSession khác giữa context được chuẩn hóa khi so cross-mode; trong từng lượt Back/resume, session/document/version/lines được so chính xác nguyên bản. Không dùng UUID chuẩn hóa để bỏ kiểm danh tính nội bộ.

## Kiểm tra và bằng chứng

- `node scripts/check_motion_p21.cjs --before`: 12 ảnh trước, số đo và 3 trace tại [before](before/results.json).
- `node scripts/check_motion_p21.cjs`: **18 nhóm/3mode PASS**, [kết quả](evidence/results.json); 3 trace thực [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Cover press/rapid tap, Back/recorded locks, guide Escape/Back/focus, networkfail UNKNOWN giữ request không Post lại, spinner pause/off/OS/cancel, matching receipt,4cycles hide/remount và security removal.
- `node scripts/regression_motion_p21.cjs test_p21.cjs`: **166/166 PASS**, gồm6 motion lifecycle tests và160 test logic cũ; [log](regression/p21/after/node-tests.txt). 8cycles unit kiểm remove listener/media/observer, cancel WAAPI, hidden/off consumed.
- `node scripts/regression_motion_p21.cjs check_p21.cjs`: **9 nhóm +20 tổ hợp layout PASS**, [kết quả](regression/p21/after/browser-results.json), [layout](regression/p21/after/layout.json). Có cạnh P19/P20, hồ sơ đóng, UNKNOWN, exact receipt.
- `node scripts/regression_motion_p21.cjs check_p21_edges.cjs`: **6 nhóm PASS**, [kết quả](regression/p21/edges/results.json).
- `node scripts/regression_motion_p21.cjs check_p21_r02.cjs`: **9 nhóm PASS**, [kết quả](regression/p21-r02/ux/results.json).
- `node scripts/regression_motion_p21.cjs audit_p21_r03.cjs`: **16 nhóm PASS**, [kết quả](regression/p21-r03/after/audit/results.json). Có focus/scroll khi đang tải, reader, copy/newlines, date/count bất thường, Back và callbacks muộn.
- `node scripts/regression_motion_p21.cjs check_home_footer_locked.cjs`: **4viewport PASS**, [kết quả](regression/footer/results.json).
- Tổng **18 nhóm motion +40 nhóm hồi quy trình duyệt**. Layout/footer không cộng vào nhóm. Syntax modules sửa và git diff --check đạt. Shared M00 core/tokens không thay nên không chạy lại toàn app.

## Diff, hiệu năng và giới hạn

App files: resume-motion.mjs mới; resume-view.mjs lifecycle/notice/check spinner/routeKey; resume.css token/visibility spinner; home.mjs truyền mode/securitycancel và shell routeKey. Không thay domain model/fixture/owner Post. [Manifest](SOURCE_MANIFEST.json) xác minh M00 core/tokens, business RUN_STATE/SCREEN_COVERAGE và handoff/P21/RUN_STATE giữ nguyên byte. Tracking chỉ cập nhật handoff/motion.

Source delta **4409 bytes**, không phải bundle production. DOM count sau settle giữ như trước theo [summary](SUMMARY.json). Capture timings/raw longtask có lưu; đây là single runs, lượt sau có thêm tương tác và máy đang chạy test, không suy FPS hay kết luận cải thiện tốc độ. Input latency/dropped frames trên thiết bị mục tiêu NOT_MEASURED. Trace là bằng chứng runtime thật, ảnh static chỉ chứng minh trạng thái sau settle.

Lượt đầu phát hiện notice replay ở trạng thái loading trung gian: đã giới hạn kết quả readIssue, kiểm lại PASS. Chênh UUID cross-mode là fixture random có chủ đích: test chuẩn hóa cross-context sau khi đã so exact identity trong cùng context. failure.json cũ là chẩn đoán lịch sử, results.json/SUMMARY mới là evidence cuối.

**Visual motion: USER_REVIEW_PENDING. Behavior: PASS_SCOPED_UI_FIXTURE. Integration/hardware: NOT_RUN/BLOCKED như trạng thái nghiệp vụ cũ.** Reload/logout vẫn mất phiếu preview; WMS API/URL, camera/NFC/keyboard thật/lưu bền chưa xác minh. Không sửa dist/gallery, ảnh baseline hoặc deploy.
