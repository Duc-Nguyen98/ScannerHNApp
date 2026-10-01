# MOTION_P16 — hoàn tất trong phạm vi prototype

**4/4 panel đạt auto, OS reduced và off.** Không redesign/deploy; visual cần user review. Kết quả motion không thay trạng thái backend/business integration.

## Source, gate và ownership

MOTION_CONTRACT1.0 + Contract2.0; FLOW_GATE gate_status PASS và M00 ready đã xác minh. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working copy có các lượt M01–M15 và UI mới hơn. [Nguồn trước code](SOURCE_MAP.md), [manifest trước](SOURCE_BEFORE.json), [sau](SOURCE_AFTER.json), [patch](changes.patch). Giữ fixture `document-model.mjs`/`mergeDocuments`:24 chứng từ, các ID/status/quantity không đổi; đồng hồ capture cố định2026-10-01 theo Asia/Ho_Chi_Minh.

Chỉ sửa bốn file: `documents/motion.mjs`, `documents/documents.mjs`, `data-states/view.mjs`, `data-states/style.css`. M16 mở rộng controller M12 hiện hữu, dùng **M00 dataState**; không tạo provider/listener/scroller thứ hai. M02 giữ route fade, AppModal giữ overlay và focus. Core primitive/token, data model, seed, owner ghi và footer không đổi.

## Mapping

| Panel | Auto | Reduced/off | Quy tắc |
|---|---|---|---|
| P16.S01 |6 skeleton tĩnh, spinner hiện hữu0.9s chỉ khi request thực sự pending | Indicator/text tĩnh, không loop | Không shimmer; thời gian debounce chưa có request không quay spinner |
| P16.S02 | Icon/text opacity .65→1 trong140ms |80ms/0ms | Chỉ sau response xác minh rỗng; CTA và dữ liệu hiện ngay |
| P16.S03 | Vùng icon/text fade140ms |80ms/0ms | Input/filter/CTA không animate hoặc remount vì motion |
| P16.S04 | **STATIC_BY_DESIGN** | Cùng nội dung/hành vi | Error và Retry hiện ngay; loading/cached refresh theo request owner |

P12 filter feedback chỉ áp vào kết quả có hàng. P16 tự sở hữu notice empty/no-results, tránh fade đồng thời cả cha và con. State đã quan sát được tiêu thụ cả ở off/hidden; Back, repaint, đổi mode không replay state cũ. Không animate từng row, height, quantity, scroll hoặc guard. Hide/dispose/mode/OS/expiry dùng lifecycle M12 để cancel. Không callback animation nào đọc/ghi nghiệp vụ.

## Nghiệm thu thực thi

- `node scripts/check_motion_p16.cjs --before`: capture12 panel/mode trước sửa.
- `node --test tests/motion-p16.test.mjs tests/data-states.test.mjs tests/documents.test.mjs tests/motion-p01.test.mjs tests/dialog-route.test.mjs`: **43/43 PASS**, [log](node-tests.txt).
- `node scripts/check_motion_p16.cjs`: **24 nhóm PASS** (8×3mode), [results](evidence/results.json). Bao gồm A chậm/B nhanh rồi exit; rapid retry chỉ một pending read; không empty trung gian; debounce; Back/no replay; mode/OS/hidden cancellation; cache/anchor;10 vòng navigation/listener cleanup; reader/focus ở360×420; read-only/expiry guard.
- Chạy `scripts/check_motion_p12.cjs` bằng wrapper Node, chỉ đổi output sang `handoff/motion/M16/m12-regression`: **27 nhóm PASS** (9×3mode), [results](m12-regression/results.json). Bao gồm filter/Cancel, nguồn P13→P12, product selection11quantity/3SKU, validation, failed owner request/resume, native scroll, PDF busy và cleanup.
- Cả ba mode M16 có **34 read calls**, cùng seed/domain result, **0 request ghi,0 camera/NFC**. M12 có1record bị từ chối/mode và inventoryDelta0, không thêm operation do motion.
- **12/12 geometry/text/DOM comparison sau settle bằng bản trước sửa** tại494×950,DPR1,Arial,zoom1,Chromium. [Comparison](evidence/comparison.json). Pixel raw có3 ảnh bằng tuyệt đối;9 ảnh khác19–377pixel, bao gồm phase spinner và các cạnh raster. Không resize/mask hoặc tự đặt ngưỡng PASS; chưa quy toàn bộ sai khác nhỏ cho một nguyên nhân, giữ ảnh để review.

Lượt test đầu có khác read count vì riêng auto chạy thêm một truy vấn kiểm OS. Đã sửa harness để ba mode thực hiện cùng workload rồi chạy lại đủ; không sửa domain để làm số đếm khớp. Diagnostics được giữ riêng, kết quả cuối là results.json.

## Motion evidence và hiệu năng

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Browser ghi được opacity trung gian:82 mẫu ở auto,60 mẫu OS reduced,0 mẫu ở off; không chỉ suy motion từ ảnh tĩnh. [Review](REVIEW.html).

Source tăng **1115byte chưa nén**, không phải production bundle/gzip delta. DOM geometry và số node các panel không tăng. Giữ native list/6 skeleton; virtualization **NOT_NEEDED trong scope này**, stress/hardware profiling vẫn deferred theo M00. Long-task raw nằm trong results; workload trước/sau khác số ca kiểm nên không dùng tổng long-task làm kết luận nhanh hơn/chậm hơn. Không tuyên bố60fps, latency hay phần cứng đạt từ Chromium emulation.

Giới hạn: API/WMS/quyền backend/camera/NFC/keyboard và screen reader thiết bị thật **NOT_RUN**. Read adapter kiểm thử được tiêm vào dependency hiện hữu; không phải backend. Không sửa SCREEN_COVERAGE/RUN_STATE nghiệp vụ; chỉ cập nhật motion tracking. M17–M24 motion chưa hoàn tất.
