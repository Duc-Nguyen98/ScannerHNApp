# MOTION_P18 — Đính kèm bàn giao

**4/4 panel hoàn tất ở auto, OS reduced và off trong phạm vi prototype.** Giữ P18 r03, shell494×950, footerLOCK, ID/fixture và policy nghiệp vụ. Hình thức motion mới chờ user review; production/backend/hardware không được nâng thành PASS.

## Gate và nguồn

- Đã đọc MOTION_P18, MOTION_CONTRACT1.0, Contract v2.0/context, AGENTS/UI_STANDARD hiện hành, FLOW_REPORT/FLOW_GATE và M00 REPORT/OWNERSHIP/STACK_DECISION/LIST_AUDIT.
- FLOW_GATE `gate_status=PASS`,24board/91panel; M00 đã được promote thành primitive chung, M01–M17 hiện hữu. Không có blocker flow P18 thiết yếu được phát hiện trong lượt này.
- HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` cùng working copy đã giữ. Target vanilla HTML/CSS/ESM `docs/flows`; không cài library, không đổi stack, không sửa gallery/dist/deploy.
- [Quyết định trước sửa](DESIGN_TRACE.md), [source/diff và bytes](SOURCE_MANIFEST.json), [patch](changes.patch), [nguồn đầu vào](inputs/MOTION_P18_Dinh_kem_Ban_giao.md). Snapshot source và12 ảnh/3trace trước sửa nằm trong `before/`.

## Mapping panel / mode

| Panel | Auto | OS reduced | Off | Owner / quyết định |
|---|---|---|---|---|
| P18.S01 | PASS: fill theo giá trị xác nhận,≤100ms; trạng thái hàng160ms | PASS: progress/row static | PASS: static | **AttachmentRow**; text%/progress semantics cập nhật ngay; giữ cùng row/progress DOM trên tick, không animate list |
| P18.S02 | PASS: page-surface opacity140ms sau render ready | PASS: opacity80ms | PASS: static | **ViewerShell**; chỉ request Next/Prev mới; không replay load/Back/zoom; không transform PDF/container hoặc intercept scroll/pinch |
| P18.S03 | PASS: lỗi/check label140ms | PASS: opacity80ms | PASS: static | **FormFeedback**; input/value/guard/focus ngay lập tức. Restored values seeded, không replay. **Success STATIC_BY_DESIGN** vì chưa có response bàn giao được duyệt |
| P18.S04 | PASS: border-color/inset-shadow140ms | PASS: static | PASS: static | Selected outline; aria/text/occupancy đổi ngay. Không morph ô, move/unmap hoặc thay tồn |

Easing từ M00 `cubic-bezier(0.2,0,0,1)`. `noticeFeedback` và `rowFeedback` dùng controller chung; CSS dùng token press/feedback sẵn có. AppShell/M02 vẫn là chủ route opacity. AppModal vẫn giữ dialog/focus/scroll-lock hiện hành, không thêm overlay manager. Không animation callback/timer nào gửi request nghiệp vụ.

## File thay đổi

- Mới `docs/flows/attachments/motion.mjs`, `motion.css`: adapter M00 ở descendants, policy OS/reduced/off/hidden/inert và cleanup.
- `attachments/view.mjs`: nối lifecycle/mode, seed form feedback, marker page request/ready; bọc page surface để canvas không bị transform; giữ row trên progress tick và chỉ cập nhật thanh/text đúng task.
- `attachments/style.css`: import stylesheet motion cục bộ.
- `home/home.mjs`: truyền mode và fanout setMode/cancel tới M18 khi đổi policy, hiện system guard, hết phiên/suspend. Không thay router/domain hoặc CSS Home/footer.
- `attachments/model.mjs`, fixture-adapter, M00 primitive/token **không đổi byte**. Root `SCREEN_COVERAGE.csv` và `RUN_STATE.json` nghiệp vụ **không đổi byte**. Không sinh lại fixture để làm animation.

## Kiểm chứng thực chạy

- `node scripts/check_motion_p18.cjs --before`:12 ảnh trước và3 Playwright trace, cùng bốn scene.
- `node --test tests/motion-p18.test.mjs tests/attachments.test.mjs tests/attachment-experience.test.mjs tests/motion-p01.test.mjs`: **30/30 PASS**. [Log](node-tests.txt).
- `node scripts/check_motion_p18.cjs`: **18/18 nhóm PASS**,6×3mode. [Results](evidence/results.json). Có task fail trong lúc task khác75%, progress không vượt confirmed, native row giữ nguyên, rapid Next/Prev, file/page đúng sau settle, no replay Back, checked/selection không mutation, overlay/Escape/focus, hidden/OS/off cancellation,4vòng hide/mount không tích lũy listener, và hết phiên ẩn nội dung ngay.
- `P18_UX_DIR=handoff/motion/M18/regression/p18 node scripts/check_p18_ux.cjs`: **11 nhóm PASS**. [Log](regression/p18/ux-results.json).
- `P18_EDGES_DIR=handoff/motion/M18/regression/long-content node scripts/check_p18_edges.cjs`: **4 nhóm PASS**, Unicode/nội dung dài/note200/callback muộn/image viewer. [Log](regression/long-content/results.json).
- `MOTION_P02_EVIDENCE_DIR=handoff/motion/M18/regression/m02 node scripts/check_motion_p02.cjs`: **36 nhóm PASS**. Dùng bản `before.json` gốc của M02 làm đối chiếu, giữ provenance. [Log](regression/m02/results.json).
- `HOME_FOOTER_EVIDENCE_DIR=handoff/motion/M18/regression/footer node scripts/check_home_footer_locked.cjs`: **4viewport PASS**. [Log](regression/footer/results.json).
- Syntax module sửa và `git diff --check` đạt; untracked source có manifest/patch riêng. Không pageerror hoặc HTTP request ghi trong suite M18 hoàn tất.

**Operation parity:** mỗi mode đúng1 retry/begin,2 event transport fixture (50% và kết quả lỗi),1 cancel;0 case write,0 HTTP write,0 camera/NFC. Tệp đang upload75% giữ nguyên khi tệp kia thất bại. Checkbox/chọn ô không tự gửi mutation. Không khẳng định API upload production từ transport mô phỏng.

## Static / motion / performance evidence

- **12/12 geometry và text bằng trước sửa** sau settle. Raw pixel **9/12 ảnh bằng tuyệt đối**; ba ảnh còn lại chênh6 hoặc31pixel ở mép viền, mức chênh kênh màu tối đa1/255. [So sánh không mask](evidence/comparison.json). Không đặt ngưỡng để tự nghiệm thu visual, không tuyên bố pixel-perfect.
- Đã xem actual bốn panel. Capture494×950 CSSpx,DPR1,Arial,zoom1, reduced/no-preference tương ứng. Date fixture cố định `2026-10-01T05:00Z`; thời gian motion/RAF vẫn được đo trong browser.
- Motion có trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Có **98 mẫu opacity trung gian auto,65 reduced,0 off**, và12mẫu progress mỗi mode. Các giá trị/frames nằm trong results; ảnh tĩnh chỉ chứng minh settled view.
- Source ứng dụng tăng **5.907 byte không nén** trong scoped manifest, không phải production bundle. Không thêm dependency/engine. S04 cuối hành trình chuẩn có92DOM nodes cả trước/sau. Long tasks của cùng hành trình bốn panel: auto1→2,reduced1→2,off2→2; số liệu từ một lượt instrumented/emulation, không chứng minh cải thiện/tụt FPS có quan hệ nhân quả. [Profile](evidence/perf.json).
- Resource timing entries không khả dụng trong runner có clock instrumentation; không ghi thành0byte transfer. **Không đo/khẳng định60fps**, thiết bị thật NOT_RUN.
- List hiện có2tệp owner hoặc4tệp fixture; **virtualization NOT_NEEDED**. Không tạo stress dataset hoặc virtualize PDF khi chưa có profile cho thấy cần.

## Lifecycle và giới hạn

M18 hủy WAAPI/CSS đang chạy khi hidden/inert, đổi mode/security hoặc rời owner; hide/dispose gỡ observer/listener, không giữ RAF/timer riêng. Domain upload vẫn theo model/transport hiện hữu, không bị pause bởi motion. Số phần trăm, guard và trạng thái không đợi animation. Dialog/readers và native scroll/focus tiếp tục thuộc owner cũ.

Diagnostics từ các lượt đầu được giữ: selector review-mode còn đóng, xung đột specificity khiến slot dùng100ms thay140ms, và runner hồi quy thiếu file baseline M02 ở thư mục evidence mới. Đã sửa đúng scope/runner và chạy lại; không tính các lượt lỗi là PASS.

Policy upload, receipt/handoff/close-case và schema vị trí/capacity vẫn chưa chốt như P18 r03. Không chứng minh backend, phần cứng, durability hoặc screen reader thật. MOTION_P19–P24 vẫn theo tracking riêng; không tự coi đã hoàn tất. Không push/merge/deploy.

[Review](REVIEW.html) · [Preview](http://localhost:8766/flows/auth-session/?review=M18) · `minhanh / preview`. Chọn mode ở công cụ Motion ngoài app; mở bộ P18 ngoài app để thử fixture bốn tệp, bàn giao và lưới vị trí.
