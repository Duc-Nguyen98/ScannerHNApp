# MOTION P01 Đăng nhập và xác nhận phiên

Status: **PASS trong phạm vi motion P01 và UI fixture**. Hình thức vẫn chờ user review; không phải visual100%, production hoặc hardware acceptance. Chỉ thực thi MOTION_P01, không deploy.

## Nguồn và phạm vi

- Đã đọc MOTION_P01/MOTION_CONTRACT từ bộ file user cung cấp, FLOW_GATE PASS, FLOW_REPORT, M00 REPORT/OWNERSHIP/STACK_DECISION và UI_STANDARD hiện hành.
- Gate source commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, trước motion appSourceHash `e968ad9ebd0875cfcf784d13754942b77d1cb8e515df7373c18ea3c1e5ff9767`. Source trước–sau và hash hiện hành tại `evidence/verification.json`, `evidence/source-manifest.json`.
- So với gate, các file app cũ ngoài auth app/index/bootstrap không đổi hash. Không thay source auth-flow/fixture-adapter, Home, overlay, scanner/NFC, CSS hình thức hoặc ảnh gốc.
- File common contract tại Downloads được nhắc trong lịch sử không còn tồn tại ở đường dẫn cũ. Dùng context v2 đã lưu trong `handoff/CONTRACT_CONTEXT.md`, AGENTS/UI_STANDARD và quyết định M00 còn hiệu lực; không tạo quy tắc nghiệp vụ thay thế.
- Fixture giữ `hn-scanner-auth-preview-v1`, nguồn gate `hn-flow-gate-2026-09-30-v1`, tài khoản thử minhanh/preview. Wrapper đếm call chỉ tồn tại trong response của tab kiểm thử, không đổi file adapter hoặc seed.

## Triển khai và ownership

| Phần | Thực thi | Owner |
|---|---|---|
| FormFeedback | Viền/focus100ms trong auto; reduced/off tức thì. Validation/guard luôn tức thì | P01 CSS opt-in |
| PressFeedback | Primitive M00 press100ms, không scale nút; mắt và nút trong dialog không bị gắn thêm motion P01 | P01 |
| SubmitFeedback | Đổi text đồng bộ, fade140ms trên span nhãn CTA hiện có; reduced80ms, off0ms. Nút giữ slot/kích thước, icon không bị thay | P01 |
| Form/card/hero/eye | STATIC_BY_DESIGN, không entrance/reveal/parallax, không remount input vì motion | P01 |
| Route/overlay | Không thêm local route/card fade hoặc overlay manager. Chuyển route vẫn tức thì hiện hành; rollout RouteTransition thuộc M02/AppShell, modal thuộc owner chung | Không nhận là đã triển khai trong M01 |

Primitive/token M00 được chuyển nguyên thuật toán sang `docs/flows/shared/motion/` để server docs tải được. Hai file đường dẫn harness cũ re-export/import cùng source, không có bản provider/scroller thứ hai. Unit test xác nhận identity của export và cả6primitive/lifecycle. Historical M00 hashes vẫn là bằng chứng trước promotion, không viết đè chúng.

Để đáp ứng yêu cầu giữ focus/selection khi submitting, username/password chuyển sang `readOnly` và aria-disabled thay vì native disabled; không cho chỉnh khi gửi. Submit/Forgot/eye vẫn disabled ngay. Không đổi password, trim, policy, auth request hay start request. Motion completion chỉ thu hồi handle.

Controller P01 dispose trước thay panel, sang Recovery/Home và pagehide. Mỗi lần mount chỉ có2listener pointer/key và1listener media/visibility; unit kiểm10vòng mount/dispose về0. OS change/modeoff/document hidden hủy hiệu ứng hiện hành. Không có RAF/timer chạy thường xuyên trong code motion.

## Kết quả theo panel và mode

| Panel | Auto | Auto với OS reduced | Off | Quyết định |
|---|---|---|---|---|
| P01.S01 | PASS UI fixture | PASS UI fixture | PASS UI fixture | APPLIED focus/press/CTA; STATIC input/eye/form/hero |
| P01.S02 | PASS UI fixture | PASS UI fixture | PASS UI fixture | APPLIED press/CTA; STATIC identity/card/hero/guard |

- **79/79 test liên quan đạt**: `node --test tests/motion-p01.test.mjs tests/auth-session*.mjs tests/home*.mjs tests/vietnam-clock.test.mjs`. Gồm9test motion mới; không chạy lại toàn app theo từng panel.
- `node scripts/verify_motion_p01_evidence.cjs` kiểm các evidence đã ghi, không chỉ kiểm tên class. Syntax và git diff --check đạt.
-3hành trình happy path: nhấn login/start hai lần cùng tick vẫn authenticate=1/startShift=1 ở cả3mode. Mật khẩu giữ nguyên, cùng input node, selection1–4, focus=password trong pending. Mắt không có animation. Guard disabled và aria-busy không chờ fade.
-21ca mode×state: sai credential, denied, kho dừng, authUNKNOWN, startUNKNOWN, expired, actor khác. Nội dung/panel và call count giống nhau; không mở Home khi chưa đủ guard. Trong JSON scenario valid được dùng với credential sai để kiểm rejected.
-7nhóm lifecycle đã lưu: off giữa submit hủy animation1→0 mà vẫn giữ focus và1auth; Escape logout không gọi logout; pagehide/pageshow trong request bỏ callback muộn, password xóa theo security,0animation; Recovery Back không replay; Hủy rồi xác nhận Đăng xuất ở từng mode chỉ gọi logout1lần.
-OS reduced đổi live được kiểm thêm: effective mode=reduced, active CTA animation=0 ngay sau đổi; không phát sinh domain operation. Unit bổ sung hidden/dispose/securitySensitive cancellation.
-18layout:2panel×3mode×494×950/360×800/360×420. Không overflow ngang; rect card/CTA/screen giống nhau giữa mode. Native scroll/focus thuộc code sẵn có, không thêm scroll controller.

Evidence: `modes-and-states.json`, `lifecycle.json`, `geometry.json`, `submit-actual-frame-trace.json` và ảnh actual trong `evidence/`.

## Bằng chứng motion và static

Trace thật gồm15mẫu RAF trong235.9ms: opacity CTA từ0.65→1; rect nhãn không đổi, focus=password và busy=true suốt mẫu. Trace lifecycle WAAPI ghi duration140/80/không tạo animation theo mode. Đây không phải clip hoặc benchmark FPS và không được diễn giải thành60fps.

Baseline M00 tại `../M00/before-evidence/flow-repaired-guard-final/`. Kích thước AppShell494×950 và số node gồm root56/66 vẫn khớp M00. Capture IAB hiện có x=0.2px thay vì0px của M00; ảnh raster giữa hai pipeline không identical. Đã ghi nguyên sai khác trong verification, không đặt ngưỡng pixel-diff để tự PASS hoặc gọi pixel-perfect. Hình thức CSS/asset cũ không đổi; ảnh sau settle đã xem trực tiếp.

## Hiệu năng và giới hạn

- Thêm4file motion phục vụ app, tổng6391byte source không nén; không thêm package/runtime dependency. Đây không phải production bundle/transfer delta.
- DOM trong screen không tăng; control review mode nằm ngoài app. Virtualization NOT_NEEDED cho P01, không thêm thư viện.
- Long-task/input-latency before/after chuẩn hóa, dropped frames/FPS và thiết bị thật: NOT_MEASURED/NOT_RUN. Không quảng cáo tốc độ từ screenshot hay cảm giác.
- WMS/auth/reconcile production, camera/NFC/keyboard thật: NOT_RUN; trạng thái business integration cũ giữ nguyên. Không có blocker của scope local FormFeedback/SubmitFeedback; AppShell route fade và các board sau chưa rollout.

## File thay đổi và bàn giao

- App: auth-session/app.mjs, index.html, bootstrap.mjs; mới motion.mjs/.css.
- Shared: promotion motion-primitives.mjs, motion-tokens.css; harness cũ forwarding.
- Tests: motion-p01.test.mjs; auth-session-visual-contract.test.mjs cập nhật cách kiểm span nhãn được truyền đúng helper, vẫn giữ kiểm icon/board checksum.
- Evidence verifier và tracking M01; không sửa SCREEN_COVERAGE.csv/business RUN_STATE hoặc gate lịch sử.

Next: user review motion P01 hoặc thực thi MOTION_P02 khi được yêu cầu. Giữ primitive shared hiện tại, route/overlay ownership như M00; không thêm fade card để thay phần AppShell.
