# MOTION_P22 — Lịch sử thao tác & NFC

Đã thực thi P22.S01–S04 trong **auto, OS reduced và off**. Giữ P22 r03 tạm chốt và source FLOW/M01–M21 hiện hành. **Motion visual USER_REVIEW_PENDING; behavior PASS_SCOPED_UI_FIXTURE; business integration BLOCKED_PRODUCTION/hardware NOT_RUN giữ nguyên.**

[Review trước–sau](REVIEW.html) · [Nguồn và quyết định](DESIGN_TRACE.md) · [Kết quả tổng hợp](SUMMARY.json) · [Source manifest](SOURCE_MANIFEST.json) · [Diff](changes.patch).

## Thực thi

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` + working tree hiện hành, target prototype-local-ui-fixture. FLOW_GATE PASS UI_FIXTURE và M00 ready; không thêm library/provider/scroller, không chuyển stack, không deploy.

| Panel | Auto | OS reduced | Off | Ownership |
|---|---|---|---|---|
| P22.S01 | PASS: hub/nav press100, shell selected140 | PASS: press0, selected80 | PASS: static | HistoryHub + M02 |
| P22.S02 | PASS: filter140/indicator140, native scroll | PASS: opacity80 | PASS: static | NfcAuditViewport |
| P22.S03 | PASS: shell route180 | PASS: route0 | PASS: static | M02; raw data static |
| P22.S04 | PASS: cảnh báo có ngay | PASS: có ngay | PASS: có ngay | STATIC_BY_DESIGN |

- Reuse M00 `pressFeedback`, `dataState`, `noticeFeedback`, `routeTransition`; primitive/token core không đổi. M02 vẫn là owner duy nhất của route opacity, không tạo outgoing clone hoặc animate AppShell transform.
- Route key là list/detail/event ID; query/filter/reload không tạo route entrance. Filter effect tiêu thụ ngay cả off/hidden, không replay khi bật mode hoặc Back. IDs, count, status, input và nguồn unavailable luôn có ngay; không row stagger/typewriter/count-up.
- P22 giữ native scroll. Các event không đổi và heading ngày được tái sử dụng khi cập nhật, không tháo dòng đang focus chỉ vì append/tải lại. Không thêm phân trang/API hoặc sinh event shipped mới.
- Hub iframe dùng cùng M00 qua adapter; Home truyền mode/cancel và dispose listener khi rời hub. Overlay/security/hidden ngắt effects, không gọi command khi animation kết thúc. P07 service, domain model, fixture và trạng thái tồn không sửa.
- Virtualization **DEFERRED theo M00**: chưa có profile/decision đủ để cài virtualizer. Fixture shipped vẫn bốn event; ca append dùng interception riêng trong test, không thay seed để làm hiệu ứng.

## Kiểm chứng

- `node scripts/check_motion_p22.cjs --before`: 12 ảnh/số đo trước ở494×950/DPR1/fixed clock2026-10-01, ba trace thực; [before/results.json](before/results.json).
- `node scripts/check_motion_p22.cjs`: **21 nhóm motion** (7×3 mode); [results](evidence/results.json). Bao gồm route đúng ID, raw UID, filter/IME, anchor/Back, append giữ node/focus, reader/picker, mode/OS/hidden cancellation, hub/nav, lifecycle3vòng và security removal.
- Cả3mode cùng **8 lần đọc fixture, 0 HTTP mutation request**, cùng danh sách ID cuối. Đây không phải chứng minh backend đã tích hợp; không gọi service NFC trong P22. Read source/payload và mode được kiểm độc lập, không suy số operation từ duration.
- **12/12 so sánh geometry và số node sau settle bằng trước sửa**, nội dung từng panel giữ nguyên giữa before/after. Không phải pixel-perfect Designer hoặc nghiệm thu motion của user.
- `node scripts/regression_motion_p22.cjs test_p22.cjs`: **100/100 logic**, gồm4test lifecycle M22,3test shell và các test hiện hành auth/home/history/NFC. [Log](regression/p22/logic/node-tests.txt).
- Hồi quy P22: **43 nhóm** =7 chính +8 edges +9 UX r02 +12 audit r03 +7 kết hợp. Lệnh qua wrapper trên với `check_p22.cjs`, `check_p22_edges.cjs`, `check_p22_r02.cjs`, `audit_p22_r03.cjs`, `check_p22_r03_edges.cjs`. Evidence tại `regression/p22`, `p22-r02`, `p22-r03`.
- Vì mở rộng press nav hub ở shell hiện hữu, chạy `node scripts/regression_motion_p22.cjs check_motion_p02.cjs`: **36 nhóm** (12×3 mode), gồm Home/P12, nav, guard, scroll/focus, rapid navigation và logout. [Kết quả](regression/shell/results.json).
- **40 tổ hợp layout P22**, **4viewport Home/P03 footer**; [footer](regression/footer/results.json). Không cộng layout/footer vào số nhóm trình duyệt. Syntax module sửa và `git diff --check` đạt.
- Trace runtime thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Đã xem ảnh hub/list/detail/unavailable. Không tuyên bố60fps từ ảnh hoặc cảm giác.

Trong kiểm append phát hiện heading ngày mới làm di chuyển lại dòng giữ focus; đã sửa tại P22 renderer, kiểm lại ba mode và regression đạt. Harness cũ dùng data-screen-id cho P23 iframe; nay P23 đã có native owner nên wrapper chấp nhận đúng panel qua data-panel, không đổi app để làm test xanh. Lượt shell đầu thiếu bản before.json ở thư mục output mới; wrapper sao chép evidence tham chiếu gốc và chạy lại đạt. Lượt audit đầu dùng tên script làm phase; đã sửa wrapper phase=after và chạy lại. failure.json/nhánh harness cũ giữ để truy vết; results.json và SUMMARY là evidence cuối.

## Files và giới hạn

App sửa: `history/nfc-audit-view.mjs`, `history/embedded-history.mjs`, `home/home.mjs`, `home/motion.mjs`; thêm `history/nfc-audit-motion.mjs` và `.css`. Test thêm `tests/motion-p22.test.mjs`; scripts check/regression/verify M22. CSS giao diện P22, model/fixture, M00 core/tokens và business RUN_STATE/SCREEN_COVERAGE/handoff P22 được kiểm hash **không đổi byte**. Tracking chỉ cập nhật handoff/motion; không ghi đè acceptance/integration nghiệp vụ.

Source byte delta được đo trong SOURCE_MANIFEST/SUMMARY, không phải production bundle. Raw long-task entries có trong kết quả, nhưng trước/sau khác lượng thao tác và chạy Chromium emulation; **không kết luận nhanh hơn hoặc đạt FPS mục tiêu**. Input latency/dropped frames/physical NFC-camera-keyboard NOT_MEASURED/NOT_RUN. Không có stress profile mới để chốt virtualizer.

Backend event/mapping/quyền/cursor/lưu bền chưa xác minh; preview reload/logout mất dữ liệu đang thử. Không sửa dist/gallery, ảnh baseline, không push/merge/deploy. Motion P23/P24 thuộc lượt sau, không chạy vượt scope.

Preview: http://localhost:8766/flows/auth-session/?v=motion-p22 · `minhanh / preview` → xác nhận phiên → Lịch sử → NFC. Chọn Mẫu B22 trong bộ mô phỏng ngoài app. Bộ chọn Motion P02/AppShell ở công cụ ngoài khung: auto/reduced/off; auto luôn tôn trọng OS reduced.
