# MOTION_P23 — Bảo hành & phiên quét
Ngày 01/10/2026 · **PASS_SCOPED_UI_FIXTURE** · Motion visual **USER_REVIEW_PENDING**.
Giữ P23 r03 tạm chốt trong source hiện hành; business integration **BLOCKED_PRODUCTION**, hardware **NOT_RUN** không thay đổi.

[Review trước–sau](REVIEW.html) · [Quyết định/nguồn](DESIGN_TRACE.md) · [Kết quả](SUMMARY.json) · [Source manifest](SOURCE_MANIFEST.json) · [Diff](changes.patch).

## Thực thi
FLOW_GATE PASS UI_FIXTURE và M00 ready đã được kiểm trước triển khai. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` + working copy hiện hành; HTML/CSS/ES modules, target prototype local. Không cài thư viện, provider, scroller hoặc virtualizer.

| Panel | Auto | OS reduced | Off | Quyết định |
|---|---|---|---|---|
| P23.S01 | Selected/filter140ms; press100ms | Selected80ms; press tĩnh | Tĩnh, đủ chức năng | APPLIED |
| P23.S02 | Route180ms từ M02; timeline hiện ngay | Route tĩnh; nội dung giữ nguyên | Tĩnh, đủ chức năng | STATIC_BY_DESIGN cho timeline; REUSED shell |
| P23.S03 | Selected/filter140ms; press100ms; native scroll | Selected80ms; press tĩnh | Tĩnh, đủ chức năng | APPLIED |
| P23.S04 | Route180ms từ M02; selection nhỏ | Tĩnh | Tĩnh, đủ chức năng | REUSED; mã/count static |

- Reuse M00 `pressFeedback` và `noticeFeedback`; M02 là owner duy nhất của route opacity. Route key theo scene+ID, không theo query/filter; không outgoing clone.
- Timeline, mã, số lượng, kết quả và quyền cập nhật ngay. Không vẽ đường timeline, stagger, replay từng event/code, count-up hoặc animate height.
- Auto tôn trọng OS reduced. Đổi mode/ẩn trang/overlay/đổi route/mất phiên hủy effect; callback animation không gọi nghiệp vụ. Listener và RAF phục hồi focus được cleanup.
- Home chuyển mode/security cancellation tới consumer P23; không sửa M00 core/tokens, Home footer hoặc shared overlay implementation.

## Flow phát hiện và đã sửa trước khi bật motion
Test-only interception thêm20phiên và1phiên mới vào nguồn đọc, không đổi seed B23 shipped. Trước sửa, dòng đang xem lệch **243 CSS px** khi thêm phiên ở đầu và node cũ bị tháo. P23 renderer nay tái sử dụng hàng/day heading đúng ID, nhớ anchor ID+offset; append/list→detail→Back giữ dòng và focus ở cả3mode. Sai khác vị trí sau restore trong phép đo là1px do lượng tử hóa scroll, nằm trong dung sai kiểm geometry2px; không dùng dung sai này để tuyên bố pixel-perfect.

P23 chưa có API phân trang/tải thêm production; nghiệm thu append thực hiện trên nguồn đọc mở rộng, **không tạo nút/API tải thêm giả**. Detail giữ offset cũ, không neo nhầm vào code nằm ngoài vùng nhìn. Virtualization **DEFERRED theo M00**, chưa có profile đủ để áp dụng.

## Kiểm chứng
- `node scripts/check_motion_p23.cjs --before`:12ảnh/3trace trước; `--flow-only`: kiểm lại append ở3mode trước motion; chạy không cờ: **24 nhóm motion** (8×3), traces/screenshots thật.
- Ba mode có cùng ID cuối, **7 lần đọc fixture, 0 HTTP mutation**, cùng nội dung và kết quả. Không service camera/NFC được mở bởi P23.
- **12/12 geometry và số node sau settle bằng trước sửa**, text panel bằng nhau. Đã xem ảnh actual; chưa phải user nghiệm thu motion hoặc pixel-perfect Designer.
- `node scripts/regression_motion_p23.cjs logic`: **153/153 logic**, gồm4test consumer motion về changed-filter, OS/off/hidden, guard và8vòng cleanup.
- Hồi quy **67 nhóm**: P23 chính9 + edges7 + UX8 + audit14 + guards4 + P22 7 + P20 7 + P09 11.
- AppShell M02: **36 nhóm** (12×3mode), vì nối route key và mode/security fanout.
- **50 tổ hợp layout P23**, **4 viewport footer**; syntax module sửa và `git diff --check` đạt. Layout/footer không cộng vào số nhóm hành vi.
- `node scripts/verify_motion_p23.cjs` kiểm evidence, geometry, operation parity, hash nguồn giữ nguyên, review links và tracking91panel.

Lệnh hồi quy dùng wrapper trên với `check_p23.cjs`, `check_p23_edges.cjs`, `check_p23_r02.cjs`, `audit_p23_r03.cjs`, `check_p23_r03_guards.cjs`, `check_p22.cjs`, `check_p20.cjs`, `check_warranty_navigation.cjs`, `check_home_footer_locked.cjs`, `check_motion_p02.cjs`. Wrapper giữ assertion; chỉ đổi evidence path/selector busy và cập nhật vị trí notice closed P20 theo M20/P24 hiện hành.

Lượt flow-recheck đầu giữ node nhưng làm mất focus khi dọn read-status: đã sửa reconciliation và kiểm lại3mode. Lượt regression đầu detail reload bị đổi scroll vì neo nhầm code: đã giới hạn ID anchor ở list và chạy lại. Test P20 cũ tìm notice trong footer; source M20/P24 đã đưa notice vào body, nên dùng adapter đã có từ M20, không sửa app để khớp test cũ. `failure.json` giữ làm chẩn đoán; `results.json`/SUMMARY là kết quả cuối.

## Source và giới hạn
App thêm `history/warranty-session-motion.mjs`; sửa `history/warranty-session-view.mjs`, `home/home.mjs`. Source byte delta **+5518 bytes**, không phải production bundle. CSS P23, model/fixture/experience, Home motion primitive, M00 core/tokens, business RUN_STATE/SCREEN_COVERAGE/handoff P23 được kiểm hash **không đổi byte**.

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Raw long-task entries có trong kết quả; workload trước/sau khác nhau nên không suy cải thiện tốc độ/FPS. Input latency riêng/dropped frames trên thiết bị thật **NOT_MEASURED**. Backend/session schema/quyền/lưu bền chưa xác minh; preview reload/logout mất dữ liệu. Giữ UNKNOWN và timeout15s chỉ đọc. Không sửa baseline/dist/gallery, không push/merge/deploy. MOTION_P24 chưa chạy.

Preview: http://localhost:8766/flows/auth-session/?v=motion-p23 · `minhanh / preview` → xác nhận phiên → Lịch sử → Bảo hành/Phiên quét. Chọn Mẫu B23 ngoài app. Bộ chọn **Motion P02/AppShell** bên ngoài khung đổi auto/reduced/off.
