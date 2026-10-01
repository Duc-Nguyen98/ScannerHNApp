# MOTION_P02 — Trang chủ / AppShell

**PASS_SCOPED_UI_FIXTURE**, 30/09/2026. P02.S01 được kiểm auto, OS reduced và off. Hình thức motion chờ user review; không nâng business integration hoặc toàn bộ motion P03–P24 thành PASS. Không deploy.

## Nguồn và quyết định

[SOURCE_DECISIONS.md](SOURCE_DECISIONS.md) ghi mapping trước sửa, FLOW_GATE PASS, setup M00/M01, contract v2 được lưu và MOTION_CONTRACT từ bộ user cung cấp. Commit tham chiếu `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; fixture gate `hn-flow-gate-2026-09-30-v1`, auth `hn-scanner-auth-preview-v1`. Không đổi seed, ID hoặc adapter nghiệp vụ. Hash nguồn/diff hiện hành: [source-manifest.json](evidence/source-manifest.json); scoped before/after: [before-source](evidence/before-source.json), [after-source](evidence/after-source.json).

Dòng “Xem tất cả vào hub lịch sử” trong file motion được đối chiếu với chỉ thị user đã chốt: **Xem tất cả → P12 Chứng từ**, tab Lịch sử → hubP22. Không đổi nghiệp vụ theo dòng cũ. Common contract Downloads cũ được M01 ghi nhận không còn ở đường dẫn đó; tái sử dụng context đã lưu, không suy thêm quy tắc.

## Thực thi

| Vùng | Auto | OS reduced / off | Owner |
| --- | --- | --- | --- |
| Tap nút/tile Home | Opacity100ms, không scale |0ms /0ms|pressFeedback M00|
| Menu được chọn | Opacity140ms; aria-current cập nhật ngay |≤80ms /0ms|noticeFeedback M00, NavFeedback tại shell|
| Chuyển module | Fade nội dung đến180ms |0ms /0ms|routeTransition M00, một shell controller|
| Hero, lưới, badge, số KPI, giờ ca, geometry/footer |STATIC_BY_DESIGN; dữ liệu đổi tức thì|Giống auto|Code hiện hữu|

Route fade dùng primitive M00 trên **một cây nội dung live**. Cây đi được hidden/thay thế ngay theo router; không giữ snapshot/cloned outgoing để cross-fade hai lớp, không đợi animation mới commit route. Home chỉ fade `.hn-main`, không fade hero/footer hoặc animate transform `.hn-screen`. Đích dùng `#hn-destination`. Query/filter/panel repaint trong cùng module không tạo entrance mới; Home Back không stagger/replay từng hàng. Không tạo thêm provider, scroller, modal manager, virtualizer hoặc package.

CSS feedback120ms cũ của nút Home được tắt trong scope motion để tránh hiệu ứng chồng; màu hover/active cũ vẫn cập nhật tức thì, geometry và màu tĩnh không đổi. Security/expired/forbidden/suspend/dispose/P03 mở đều hủy motion ngay. `commit` chỉ nhận kết quả route đã qua guard. Không callback animation nào gọi nghiệp vụ. Listener media/visibility dùng lại primitiveM00; shell chỉ thêm pointer/key và được dispose cùng phiên.

Control review ngoài app “Motion P02 / AppShell” tiếp nhận policy từ P01, có auto/reduced/off và đồng bộ về P01; auto không vượt OS reduced. Không remount form hoặc reset fixture khi đổi mode.

## Kiểm thử và bằng chứng

| Panel | Auto | OS reduced | Off | Flow |
| --- | --- | --- | --- | --- |
|P02.S01|PASS|PASS|PASS|PASS_UI_FIXTURE|

- **36 nhóm browser**:12nhóm×3mode. Geometry trước–sau, tap/token, UNKNOWN tức thì, routeRAF, rapid Nhập→Back→Tra cứu, recent/Back/scroll/focus, P12/P22 mapping, P03Cancel, các entry P05/P07/P09/P10/P13, off/live OS cancellation, màn nhỏ/chiều cao bàn phím, kho dừng/mất quyền/logout/Back. [Results](evidence/results.json).
- Mỗi hành trình: authenticate1, startShift1, record0, check0; instrumentation chỉ trong response tab QA, không sửa adapter. Camera/NFC invocation0 trên các đường đi này; không mở phần cứng. Số liệu KPI, IDs recent và giờ ca giữ nguyên sau quay lại; UNKNOWN không giả0/success.
- **82/82 test tập trung**: M01/M02 primitives và lifecycle, auth/Home/Vietnam time.10lần mount/dispose shell đều về0listener/media/visibility/handle. [Node log](evidence/node-tests.txt).
- **6 nhóm KPI regression PASS**; **4viewport footerLOCK PASS**, Home/P03 paint/geometry parity. [KPI](evidence/kpi/results.json), [Footer](evidence/footer/results.json). Không chạy lại toàn app không cần thiết.
- Syntax Home/motion/auth app và git diff --check đạt. Các consumer khác chỉ kiểm đường đi tại shell; motion nội bộ board đó chưa được tuyên bố hoàn tất.

Lệnh: `node scripts/check_motion_p02.cjs --before` trước sửa; `node scripts/check_motion_p02.cjs` sau sửa; `node --test tests/motion-p01.test.mjs tests/motion-p02.test.mjs tests/home*.mjs tests/auth-session*.mjs tests/vietnam-clock.test.mjs`; footer/KPI dùng env evidence riêngM02; `node scripts/finalize_motion_p02.cjs` xác minh artifact và cập nhật tracking.

## Visual và trace

[Before Home](evidence/before-home.png) / [Auto](evidence/auto-home.png) / [OS reduced](evidence/os-reduced-home.png) / [Off](evidence/off-home.png). CùngChromium494×950,DPR1, clock30/09/2026 08:15:20VN, scroll0. RGB comparison nguyên ảnh không mask/không threshold: **không khác pixel** cho ba ảnh Home sau settle so với before. Điều này chỉ chứng minh bảo toàn ảnh actual của bản hiện tại, không chứng minh khớp thiết kế B02/font/asset tuyệt đối.

Thêm360×800 và360×420 (mô phỏng chiều cao bàn phím) cho ba mode, cuộn tới recent cuối và không overflow ngang. Ảnh trong evidence. Actual autoHome đã xem trực tiếp; geometry modeparity được kiểm từ số đo, không suy visual approval.

Đã mở source mới và xác nhận ca fixture trong tab preview hiện tại: [ảnh in-app thực](evidence/in-app-home.png). Đường viền focus heading ở ảnh này là focus sau chuyển từ P01, giữ hành vi accessibility hiện có; ảnh QA trước–sau dùng cùng trạng thái focus để so sánh.

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Mỗi route capture16mẫu RAF: auto opacity thực tế khoảng0.739→1; reduced/off luôn1. Bounds giữ nguyên; route/hidden của cây đi đã cập nhật ở mẫu đầu. WAAPI duration180 được ghi/assert trong test. [Summary](evidence/summary.json). Đây là trace kiểm hành vi motion, **không phải chứng nhận60fps**.

## Giới hạn / phụ thuộc / file sửa

- Thêm3747byte source scoped không nén; không phải bundle/transfer benchmark. Long-task/input-latency/dropped-frame benchmark chuẩn hóa:NOT_MEASURED. Hardware camera/NFC/bàn phím thật:NOT_RUN. WMS/API/durable persistence:giữ integration cũ.
- P02 không cần virtualization: grid nhỏ, max3recent; không sinh thêmfixture. M00 listprofile/virtualization của board khác giữ nguyên.
- Không có blocker scopeM02. Thiết kế motion và asset chính xác vẫn chờ review như trước. Những lỗi chạy test ban đầu là selector control review đang đóng và test dùng footerHome ởP05.S01 vốn ẩn footer; sửa test theo UI/Back hiện tại, không sửa domain để épPASS.
- App đổi: `home/motion.mjs`, `home/motion.css` mới; `home/home.mjs` nối shell lifecycle; `auth-session/app.mjs` truyền/sync mode; `auth-session/index.html` tải CSS. **Không sửa shared primitive/token, Home style, footer, domain adapter hoặc business coverage/state**.
- Test mới: `tests/motion-p02.test.mjs`, `scripts/check_motion_p02.cjs`, `scripts/finalize_motion_p02.cjs`. Tracking: MOTION_COVERAGE/MOTION_RUN_STATE; ownershipM00 bổ sung consumerM02, không ghi đè bằng chứng M00/M01.

Tiếp tục user reviewM02. M03 và các board motion tiếp theo chỉ thực thi khi được yêu cầu.
