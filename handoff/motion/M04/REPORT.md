# MOTION_P04 — Nhập kho

Triển khai theo MOTION_P04_Nhap_kho.md và MOTION_CONTRACT v1.0. Target `prototype-local-ui-fixture`, HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Gate đọc trước code: `handoff/flow/FLOW_GATE.json` PASS, blockers rỗng; M00 sẵn sàng, primitives đã được M01–M03 đưa về shared. Không deploy, không sửa baseline, không mở MOTION_P05.

## Consumer / ownership

| Panel | Normal/auto | OS reduced | Off | Quyết định |
|---|---|---|---|---|
| P04.S01 | Error/focus notice140ms; validation và guard ngay lập tức | Error opacity≤80ms; input đứng yên | Static, vẫn có lỗi/focus/guard | APPLIED: FormFeedback |
| P04.S02 | Mã hợp lệ mới fade160ms đúng1 lần theo eventId | Static row feedback | Static row feedback | APPLIED: ScanFeedback; camera/reticle/counters STATIC_BY_DESIGN |
| P04.S03 | Số cuối hiển thị ngay; không stagger/reorder/height motion | Như normal | Như normal | STATIC_BY_DESIGN; route owner M02 được reuse |
| P04.S04 | Hero xác nhận fade160ms chỉ sau receipt đúng request | Static confirmation | Static confirmation | APPLIED: SubmitFeedback; không success cho UNKNOWN |

Primitives reused: `createMotionController`, `noticeFeedback`, `rowFeedback` từ M00; tokens/easing dùng shared/motion. Không thêm thư viện/provider/scroller. P04 không animate `#hn-destination`, `.hn-screen`, input, video hoặc canvas; M02 giữ route opacity. Modal/sheet vẫn ở M03/shared owners.

Form error đặt vào slot cố định ở phần trống của hàng nhãn, giữ geometry control/body; text không bị cắt. Note/input không chuyển bước từ animation completion. Camera/reticle nguồn hiện là ảnh fixture (không stream thật); node camera được giữ **connected** qua cùng-step scan/filter/manual toggle. Ô nhập hiện có vẫn được giữ bởi renderManualEntry. Option preserveCamera chỉ P04 bật, P05 giữ default.

## Luồng, identity và cleanup

- Domain scan cấp `eventId` từ scanSessionId + sequence chỉ khi có lượt quét thật; duplicate/error vẫn có audit identity riêng. Motion không tạo event. Set đã xem ghi nhận cả event bị filter/off/hidden, không replay khi Back hoặc render lại.
- Bỏ CSS pulse/timer1.8giây cũ. Duplicate/error hiện ngay qua copy/icon/owner P17, không flash hoặc count-up. Dữ liệu fixture mặc định12 lượt/11accepted/1duplicate và3SKU5+4+2 không đổi.
- Callback nhập mã được bind vào epoch/scanSession hiện tại. Leave/review/Back/new document làm callback cũ không còn hiệu lực. Fix đúng inbound owner để đáp ứng ca pending callback, không chờ motion kết thúc. Không thêm API/backend/camera service.
- Phiếu success chỉ lấy receipt record đã khớp toàn payload; consumer chỉ phát1 lần theo requestId. P12 Back không replay success. Timeout không chạy success, nút Gửi lại của P17 vẫn disabled; check dùng nguyên request.
- Policy nhận từ selector AppShell, OS reduced luôn có hiệu lực. Cancel trước repaint/hide/overlay/security guard/dispose; hidden document hủy active effects. Không có timer/RAF do P04 consumer giữ; WAAPI được shared controller cleanup. Completion không submit/record/Post/check hoặc đổi state.

## Kiểm chứng

- **47/47 Node PASS**, gồm inbound+documents và2 tests mới event identity/pending callback. [Log](evidence/node-tests.txt).
- **39 nhóm M04 PASS**,13 nhóm×3mode: auto, OS reduced, off. [Kết quả/RAF/domain parity](evidence/results.json). Có assertion toàn snapshot domain bằng nhau ở3mode, cùng operation count `record=2/check=1/camera=0`. Quét12 vẫn11accepted trong từngmode; camera/input reference giữ nguyên. Kiểm rapid repaint, filter/Back, input/focus, permission guard, hidden-page, logout, viewport360×800/360×420.
- **36 nhóm AppShell M02 hồi quy PASS**,3mode: [kết quả](evidence/shell-regression/results.json). Home geometry/footer/nav, route, P03 cancel, guards, mode toggles đều giữ. Before Home reference được copy nguyên từ M02, không thay baseline.
- **11 nhóm manual-entry P04/P05 PASS**,12layoutcases: [kết quả](evidence/manual-regression/results.json). Cả hai consumer kiểm input DOM/IME/focus/counts, draft, UNKNOWN; P05 source confirmation và stale confirmation không đổi. Shared renderer optional branch được kiểm đúng consumer liên quan.
- Static geometry4panel trước/sau không khác ở các vùng đo: [comparison](evidence/geometry-comparison.json). Mỗi panel ở3mode cũng so geometry settle trực tiếp với trướcM04 trong `results.json`. Không lấy geometryPASS làm nghiệm thu raster toàn board.
- Before4 ảnh [before](evidence/before/geometry.json), actualnormal/reduced/off12ảnh: ví dụ [normal S02](evidence/auto-P04.S02.png), [reduced S02](evidence/os-reduced-P04.S02.png), [off S04](evidence/off-P04.S04.png). Viewport494×950 CSS,DPR1,clock fixture cố định2026-09-30T01:15:20Z.
- Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). RAF samples và WAAPI logs chứng minh opacity thay đổi normal; reduced row/off giữ1. Không báo60fps từ screenshot.

Lệnh chính: `node scripts/capture_motion_p04.cjs` (before; after với M04_PHASE=after); `node scripts/check_motion_p04.cjs`; `node --test tests/inbound.test.mjs tests/documents.test.mjs`; `node scripts/check_motion_p02.cjs` với PREVIEW_BASE_URL/MOTION_P02_EVIDENCE_DIR; `node scripts/check_manual_focus_upgrade.cjs` với MANUAL_UX_BASE/MANUAL_UX_OUTPUT. Server kiểm thử8774, không reload draft tab user.

Các failure trace cũ giữ để truy vết: test đầu kỳ vọng nút Gửi lại không tồn tại, nhưng source P17 có nút disabled hợp lệ; sửa assertion kiểm disabled và direct send=false. Test security recovery từng tìm Home sau Allow trong khi owner khôi phục P04; sửa test theo đúng route khôi phục và kiểm5mã còn nguyên. Không sửa nghiệp vụ để né test.

## Profile / giới hạn

Accepted-list seed chỉ11dòng, profile node/row thực nằm ở `listProfile` từngmode. Chưa có qualifying long-list profile từ owner M00 để áp virtualization: **NOT_NEEDED cho seed hiện hành / DEFERRED cho backend dài**, không thêm thư viện hoặc seed sản phẩm giả. Không tự coi số11 là ngưỡng performance chung.

Browser/emulation Chromium trên môi trường hiện tại; không có target-device FPS/dropped-frame benchmark. Source bytes/hash scoped lưu tại `SOURCE_MANIFEST.json`; không gọi đó là production bundle delta. Performance delta trên thiết bị thật, hardware camera/NFC, physical IME/safe-area và backend/durable storage: NOT_RUN. Motion không nâng các business integration status cũ thành PASS.

## File và bàn giao

Thêm inbound `motion.mjs`/`motion.css`; sửa inbound view/flow (event identity, callback epoch), optional renderManualEntry; Home truyền mode/cancel guard; entry imports/cache. Shared primitive/token không đổi. [Design trace](DESIGN_TRACE.md), ownership M00 được bổ sung; `MOTION_COVERAGE.csv` chỉ cập nhật4P04panel, giữ các panel khác. Checkpoint riêngM04 và checkpointmotion chung; không sửa SCREEN_COVERAGE/RUN_STATE business bằng kết quả animation.

Kết luận: motion/fixture behavior scoped đạt; visual motion chờ người dùng review. Các khác biệt B04 font/icon/texture đã ghi trước vẫn còn, không có xác nhận pixel-perfect hoặc integration production.
