# MOTION_P12 — Chứng từ

2026-10-01 · **PASS_SCOPED_UI_FIXTURE** · P12.S01–S04 đạt auto, OS reduced và off. Hình thức chờ user review; không deploy, không nâng trạng thái business/backend thành PASS.

## Nguồn, gate và ownership

Đã đọc MOTION_P12_Chung_tu.md, MOTION_CONTRACT.md v1.0 từ gói user chỉ định; AGENTS/UI_STANDARD và contract v2.0 còn hiệu lực. `handoff/flow/FLOW_GATE.json` có gate_status PASS; M00 PASS_HARNESS_READY_FOR_MOTION_P01, primitive đã được promote vào `shared/motion/`. Baseline Designer B12 tại commit `da9f623…` không sửa. So sánh motion dùng actual trước M12 của source hiện hành, không gọi đây là Designer đã nghiệm thu.

- **DocumentList:** consumer `documents/motion.mjs`, reuse M00 dataState140ms. Chỉ fade khi filter/query/sort đã commit và nguồn ready; Cancel, mount, Back, refresh nguồn không tự replay. Counter và status áp dụng ngay; không có hiệu ứng riêng trên badge/text trạng thái.
- **DocumentDetail:** AppShell/M02 là owner opacity180ms duy nhất. Key theo list/create/documentID; bốn tab trong cùng chứng từ không đổi route key. Không key theo query, không giữ outgoing clone.
- **FormFeedback / product selection:** reuse notice140ms trên lỗi mới và rowFeedback160ms trên nội dung hàng được chọn. Không animate quantity, số SKU, input/IME hoặc kích thước hàng. Selected background dùng màu có sẵn, cùng hình thức trong mọi mode.
- Controller M12 chỉ tồn tại khi module active; hide/dispose gỡ policy/listener và cancel effect. Hủy callback trình bày đang đợi dialog-history bằng epoch; không hủy/ghi lại domain request theo animation.
- Overlay vẫn do app-modal/dialog-route sở hữu; không thêm enter/exit owner riêng. Scroll vẫn native, M12 không thêm RAF/scroller/provider/thư viện.

## Mapping panel

| Panel | Áp dụng | Phần static / reuse |
|---|---|---|
| P12.S01 | Filter140ms; reduced80ms; off0 | Native scroll, counter/status ngay; không entrance theo từng row |
| P12.S02 | Route fade180ms qua M02; reduced/off0 | Metadata/ID và quyền ngay; liên kết P13→P12→Back giữ nguồn |
| P12.S03 | Selection160ms; reduced/off0 |11 sản phẩm/3SKU không count-up; row height không đổi; tab/query giữ context |
| P12.S04 | Validation140ms; reduced80ms; off0 | Mount/đóng overlay không tạo phiếu. CTA P12 là handoff đồng bộ, không có request ghi riêng để dựng spinner giả. Busy/submit theo request thuộc P04/P05 dùng M04/M05 hiện hữu |

Spinner tải PDF và P16 loading nằm trong P12 theo policy của consumer: auto dùng indicator hiện hữu, reduced/off giữ hình tĩnh/nhãn busy; document hidden pause phần trang trí. Read/domain request vẫn có vòng đời riêng, không chờ animation.

## Kiểm chứng

- **35 Node tests PASS**: existing M00/M01 primitives, M02 shell, documents và dialog-route. [Log](node-tests.txt).
- **27 nhóm browser P12 PASS** (9×3mode): filter/Apply/Cancel/rapid tap; nguồn thông báo và đúngID; metadata/counter tức thì; selected row/serial/modal; validation/mount; failed request/resume; native scroll/Back; loading/error/read-only/PDF busy; OS/live mode, hidden,10cycles và expiry cleanup. [Results](evidence/results.json).
- **36 nhóm AppShell regression PASS** (12×3mode): Home/footer geometry,100/140/180ms, rapid routes/Back, focus/scroll, P03, guard/expiry/logout. [Results](shell-regression/results.json). Reference `shell-regression/before.json` là bản baseline thật đã lưu của M02, không phải capture mới sau sửa.
- **12/12 geometry và pixel comparison sau settle khớp actual trước M12**:4panel×3mode, Chromium494×950,DPR1. Pixel equality này chỉ chứng minh không redesign trong lượt motion, không nghiệm thu lại raster B12. Có kiểm thêm360×420 khi scroll.
- Ba mode có cùng domain signature: ghi chú/supplier/accepted SKU+quantity/outcome. Mỗi mode1record call bị từ chối, inventoryDelta0; request và document giữ nguyên khi resume. Bỏ ID/timestamp ngẫu nhiên khi so giữa phiên; trong từng phiên kiểm deep equality chính request/ID.
- Không gọi camera/NFC. Sau10vòng vào/ra mỗi mode, số listener về đúng baseline; hidden/mode change/expiry không còn effect của P12. Mode off vẫn hoàn tất luồng.
- Lỗi harness ban đầu (selector Hủy trùng, thiếu baseline regression) và lần trace hết dung lượng không tính PASS. Final kết quả ở các file results trên. Sửa release của consumer thành idempotent khi hide nhiều lần; không sửa business flow để làm test xanh.

## Bằng chứng motion và giới hạn đo

[Review](REVIEW.html), [summary](SUMMARY.json), [source/diff](SOURCE_MANIFEST.json), [patch](changes.patch).

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). WAAPI và các frame opacity được lấy trong browser, không chỉ kiểm tên class hoặc duration. Trace có đoạn đổi mode trực tiếp; do đó trace khởi đầu off có thể ghi effect ở đoạn test sau khi chủ động chuyển sang auto/reduced. Các ca giữ nguyên off đã kiểm không tạo effect.

Profile danh sách:24row/405node trong cả before và after, DOM delta0. Không có profile dài chứng minh cần virtualization: không thêm virtualizer, giữ quyết định M00 deferred cho stress/hardware. Source byte delta nằm trong SUMMARY, không coi là production bundle/gzip delta. Long-task/frame samples là quan sát emulation; không tuyên bố60fps hoặc suy latency phần cứng.

Ổ C thiếu dung lượng khi ghi trace regression đầu. Giữ các trace P12 hoàn chỉnh và artifact lịch sử; không xóa dữ liệu user. Lần regression cuối dùng TEMP/TMP theo command tại `D:/CodexTemp/ScannerHNApp-M12` và tùy chọn MOTION_PRIVATE_TRACE=1 sẵn có (trace nhẹ, ảnh geometry riêng). Không đổi biến môi trường hệ thống. Hồi quy36nhóm đã chạy xong; lỗi lưu trữ không được báo thành lỗi app hoặc bỏ qua kiểm tra.

## Files và trạng thái bàn giao

Mới `docs/flows/documents/motion.mjs`; nối lifecycle/filter/validation/selection/route key trong documents.mjs; CSS opt-in; Home chỉ fan-out mode/cancel và dùng routeKey P12 với shell hiện hữu. M00 primitive/tokens, Home motion engine và document fixture/model giữ nguyên hash so với trước M12. Tracking chỉ cập nhật4 dòng P12 trong MOTION_COVERAGE và MOTION_RUN_STATE; business integration/SCREEN_COVERAGE không bị ghi đè.

Backend thật, lưu bền, camera/NFC và60fps thiết bị thật: **NOT_RUN**. Visual **USER_REVIEW_PENDING**. Không deploy, không thêm yêu cầu metadata PROPOSED và không đổi24board/91panel.
