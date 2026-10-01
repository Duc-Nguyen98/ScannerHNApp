# MOTION_P03 — Dialog cố định

**PASS_SCOPED_UI_FIXTURE**, 30/09/2026. Đã triển khai bốn panel và kiểm auto, OS reduced, off. Motion/hình thức chờ user review; không nâng business integration thành PASS, không deploy hoặc tự triển khai M04.

## Nguồn / phạm vi

[SOURCE_DECISIONS.md](SOURCE_DECISIONS.md) ghi contract, component và quyết định triển khai. FLOW_GATE=PASS; tái sử dụng M00 primitive đã promote/M01/M02 consumers. Reference commit da9f623a19d0359c3e80c14f8cc612636ec6ab78, fixture gate hn-flow-gate-2026-09-30-v1. Domain adapter, seed và identity không sửa. [Before source](evidence/before-source.json), [after source](evidence/after-source.json), [manifest/diff hash](evidence/source-manifest.json).

## Áp dụng theo panel

| Panel | Auto | OS reduced | Off | Kết quả |
|---|---|---|---|---|
| P03.S01 | Backdrop fade140ms, sheet opacity+translateY8px/220ms | Backdrop≤80ms, panel0ms |0ms|PASS3mode; focus tác vụ đầu, không tự chọn nghiệp vụ|
| P03.S02 | Cùng primitive220ms, giữ nguyên document/session/version/codes | Panel0ms |0ms|PASS3mode; focus Tiếp tục, data/UNKNOWN không đổi|
| P03.S03 | Backdrop140ms, panel chỉ opacity220ms | Panel0ms |0ms|PASS3mode; warning/guard hiện ngay, không bounce/countdown|
| P03.S04 | Enter220ms; exit160ms chỉ trình bày | Panel/exit0ms |0ms|PASS3mode; focus Quay lại, trap trong confirmation, discard đúng một lần|

Nội dung/counter/list mã/guard/identity là STATIC_BY_DESIGN bên trong panel. Reduced dùng fallback0ms của token M00 hiện hành cho panel, vẫn đầy đủ nội dung/phản hồi; auto không vượt OS. Motion mode theo control hiện có của P01/AppShell, không thêm provider hoặc setting riêng cho P03.

## Vòng đời và shared owner

- M03 controller đặt trên host P03, chỉ sở hữu opacity/translate của panel và backdrop; không animate transform AppShell hoặc footer. Không cài engine/library/virtualizer.
- Khi đóng, domain state/route/focus/scroll-lock đổi ngay. Cây đi không còn semantics hoặc nhận pointer/focus: inert, aria-hidden, pointer-events:none, bỏ ID/role. Animation hoàn tất chỉ dọn DOM; không submit/discard/audit hoặc sửa dữ liệu.
- Mở lại/route mới/security/visibility/reduced/off/dispose hủy animation cũ. Không timer chờ nghiệp vụ hoặc queue overlay cũ; không clone fixture.
- `overlay-scroll-lock.mjs` là nguồn khóa cuộn có reference count cho P03 và app-modal. Lớp trên đóng không mở khóa khi lớp dưới còn. Khôi phục inline overflow/priority ban đầu đúng một lần. Các owner bị inert không bắt Escape/Tab/focus của lớp trên.
- Giữ backdrop click không đóng, footerLOCK, native overflow, guard save/discard hiện hữu. Không xóa dòng server-recorded/POSTED; UNKNOWN không được đổi thành success.

## Kiểm thử đã chạy

- **49/49 Node PASS**: primitives M01/M02/M03, counted lock, dialog-route, P03 flow và stock-owner. [Log](evidence/node-tests.txt).
- **36 nhóm browser M03 PASS**:12nhóm×3mode. Bốn panel;10open/close liên tục mỗi mode; exitRAF/rapid reopen; nested lock/Escape; confirm rồi đóng nhanh; server/POSTED; UNKNOWN giữ ID/codes và chặn resend; deep link kho dừng; mode/OS cancellation; compact360×420; logout giữa motion. [Results](evidence/results.json), [summary](evidence/summary.json). Mỗi mode ghi discard1/save1; không nghiệp vụ nào được gọi từ completion.
- **36 nhóm M02 shell regression PASS**: default primitive và mode handoff, route/Back/focus/scroll, guard/security, entry các board liên quan. Có instrument camera/NFC0 trên đường đi đã kiểm. [Results](evidence/shell-regression/results.json).
- **7 ca shared feedback lifecycle PASS**, **2 nhóm dialog dài PASS** (6viewport), **4viewport footerLOCK PASS**. [Feedback](evidence/shared-feedback/shared-feedback-lifecycle.json), [long dialog](evidence/long-dialog/results.json), [footer](evidence/footer/results.json).
- **2 hành trình Flow Gate J08/J12 PASS**: legacy fixture không giả live owner; P03 resume/save/cancel/discard đúng owner P04/P05, qua P14 giữ identity, không record/inventory mutation. [Flow](evidence/flow-regression/results.json). Chỉ lọc hai hành trình liên quan, không ghi thành chạy lại toàn91panel.
- Syntax source sửa và git diff --check đạt. Không chạy lại toàn app sau từng panel.

Lệnh chính: `node scripts/check_motion_p03.cjs --before`; `node scripts/check_motion_p03.cjs`; Node6file theo log; `FLOW_JOURNEY_FILTER=J08,J12 node scripts/check_flow_gate.cjs`; các suite feedback/long/footer/M02 dùng evidence override riêngM03. [Finalizer](../../../scripts/finalize_motion_p03.cjs) xác minh artifact trước khi cập nhật tracking.

## Ảnh / trace / giới hạn

494×950,DPR1,Chromium,scroll0,cùng fixture và sourceCSS. Bốn actual trước sửa so với ba mode sau settle: **12/12 ảnh không khác pixel RGB**, không mask/resize/threshold; geometry, padding/font/paint cũng bằng nhau. Đây là bảo toàn actual, không khẳng định khớp tuyệt đối B03/font/texture. [Before S01](evidence/before-P03.S01.png) / [auto S01](evidence/auto-P03.S01.png), [S02](evidence/auto-P03.S02.png), [S03](evidence/auto-P03.S03.png), [S04](evidence/auto-P03.S04.png).

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). RAF samples đo exit opacity theo thời gian, cùng panel=null ngay từ đầu, host cuối đã hidden; trace không phải chứng nhận60fps. Thêm compact360×420 mô phỏng chiều cao bàn phím. Scoped source tăng4407byte không nén, không phải production bundle. Long-task/input-latency/dropped-frame benchmark chuẩn hóa:NOT_MEASURED. Backend, camera/NFC và bàn phím/safe-area thiết bị thật:NOT_RUN.

File ứng dụng sửa/thêm: `scanner-dialogs/{dialogs,motion}.mjs`, `shared/overlay-scroll-lock.mjs`, `shared/app-modal.mjs`, `shared/motion/motion-primitives.mjs`, `home/home.mjs`. Không đổi CSS panel/footer/token, domain adapters hoặc business tracking. Thêm `tests/motion-p03.test.mjs`, test/finalizer M03; scriptsM02/flowgate chỉ thêm evidence/filter override để bảo toàn báo cáo cũ. MOTION_COVERAGE giữ91dòng và chỉ cập nhật bốnP03; MOTION_RUN_STATE lưu checkpointM03, không ghi đè RUN_STATE/SCREEN_COVERAGE nghiệp vụ.

Không có blocker trong scope motionM03. Preview: http://127.0.0.1:8766/flows/auth-session/ → minhanh/preview → xác nhận phiên → Quét mã. Với tab mở từ trước cần tải lại source; fixture không có persistence production.
