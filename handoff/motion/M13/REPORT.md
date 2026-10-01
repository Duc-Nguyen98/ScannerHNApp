# MOTION_P13 — Thông báo / Theo dõi chờ Web

Đã triển khai và kiểm đủ **P13.S01–S04** ở auto, OS reduced và off. FLOW_GATE PASS_UI_FIXTURE và M00 đủ điều kiện; không mở lại dựng board, không đổi nghiệp vụ. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working copy đã có M01–M12 cùng các sửa UI/UX. [Source manifest](SOURCE_MANIFEST.json), [patch](changes.patch), [summary](SUMMARY.json). Giữ seed `hn-scanner-notifications-preview-v1`, nguồn5 tin và bộ stress1000 đã có; hashes notification-model/pages/CSS giữ nguyên.

## Mapping và ownership

| Panel | Motion áp dụng | Static / reuse |
|---|---|---|
| P13.S01 | Đổi bộ lọc: opacity140ms; OS reduced80ms; off0 | Unread dot/count theo nguồn ngay; append không fade lại hàng cũ; không bay badge về chuông |
| P13.S02 | Route fade180ms do M02/AppShell, key theo event ID; reduced/off0 | Mark-read chạy theo domain, không phụ thuộc animation completion; ID/quyền/nội dung giữ nguyên |
| P13.S03 | Danh sách chờ Web đổi loại: fade140/80/0 | Giữ MIGRATED; chỉ đọc, không inbox approval |
| P13.S04 | Vùng trạng thái chờ Web fade140/80/0 khi gặp state mới theo ID/version/status | Trạng thái áp dụng ngay; đã tiêu thụ cả khi off/hidden nên Back không replay; không approve/reject/Post |

Consumer mới `notifications/motion.mjs` dùng **M00 createMotionController/dataState**, không tạo provider, overlay manager hoặc scroller. `notifications.mjs` nối filter intent sau khi dữ liệu đã sẵn sàng, status dedup và lifecycle. Home chỉ fan-out mode/cancel và route identity cho shell hiện có. Primitive/token M00 và engine Home motion giữ nguyên hash, không sửa shared timing.

Geometry/scale/footer/readable content giữ owner cũ. Số lượng, input, metadata, trạng thái, unread dot và badge static-by-design. Hide/dispose gỡ controller; OS/mode/hidden/overlay/security cancel effect; không có domain action trong callback hoàn tất, không thêm delay cho spinner. Cùng bộ DocumentList/P12 hiện hữu được mở bằng ID, không dựng một list/provider khác.

## Kiểm chứng thực chạy

- `node --test tests/motion-p13.test.mjs tests/motion-p02.test.mjs tests/notifications.test.mjs tests/notification-pages.test.mjs`: **27/27 PASS**. [Log](node-tests.txt).
- `node scripts/check_motion_p13.cjs --before`: baseline4 panel ×3mode, source/profile/trace thật trước tích hợp.
- `node scripts/check_motion_p13.cjs`: **24 nhóm PASS (8×3mode)**: filter/rapid tap, mark-read/error, link P12/Back, MIGRATED/no approval, append/scroll/keyboard-height, rapid routes/cancel, mất quyền, expiry, OS/mode/hidden và10 vòng mount/hide.
- `node scripts/check_motion_p02.cjs` với `MOTION_P02_EVIDENCE_DIR` riêng và `MOTION_PRIVATE_TRACE=1`: **36 nhóm PASS** hồi quy shell, footer, route, P03, guards và cleanup. Baseline shell là ảnh/geometry M02 đã lưu, không chụp lại giả thành trước-sửa.
- Cả3 mode có cùng final domain signature: **4 mark-read dispatch local,9 load-page,0 camera/NFC**, cùng unread/document result; không có HTTP ghi. QA đếm dispatch sau guard dedup bằng instrumentation trong response module test, không đổi file adapter hoặc điều khiển nghiệp vụ. Mode off vẫn hoàn thành toàn bộ luồng.
- **12/12 geometry sau settle bằng actual trước M13**, cùng Chromium494×950,DPR1,Arial,clock fixture cố định; thêm360×420. Pixel exact11/12; auto S04 khác trong dải bóng footer x16–477/y868–875 (max channel delta24), không lệch geometry. [So sánh](geometry-comparison.json). Không đổi CSS để ép screenshot trùng hoặc tuyên bố pixel-perfect B13.

## Evidence và hiệu năng

Ổ C gần hết dung lượng, nên TEMP/TMP chỉ đặt trong lệnh chạy tại `D:/CodexTemp/ScannerHNApp-M13/tmp`, không đổi biến hệ thống hay xóa artifact cũ. Trace/ảnh nặng lưu ởD:

- [Results P13](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/results.json>) · [Shell regression](<D:/CodexTemp/ScannerHNApp-M13/shell-regression/results.json>).
- Trace thật [auto](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/auto-trace.zip>) / [OS reduced](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/os-reduced-trace.zip>) / [off](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/off-trace.zip>).
- Ảnh [S01](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/auto-P13.S01.png>) / [S02](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/auto-P13.S02.png>) / [S03](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/auto-P13.S03.png>) / [S04](<D:/CodexTemp/ScannerHNApp-M13/evidence/after/auto-P13.S04.png>).
- [Before results](<D:/CodexTemp/ScannerHNApp-M13/evidence/before/results.json>) và ảnh/trace cùng thư mục; [dải shadow chẩn đoán](<D:/CodexTemp/ScannerHNApp-M13/evidence/nav-shadow-diagnostic.png>).

WAAPI log và RAF samples ghi opacity thực trong browser. Trace mang tên off/reduced có đoạn chủ động đổi mode khi kiểm ngắt giữa chừng; các ca giữ off đã xác minh0 effect. Không suy chuyển động từ screenshot tĩnh.

Profile nguồn1000 nhưng chỉ tải10→20 theo pagination: **20 rows/335 nodes trước và sau, DOM delta0**. Append wall time có cả delay nguồn và tự động hóa: auto278→260ms, reduced265→306ms, off267→285ms; một mẫu mỗi mode không đủ kết luận nhanh/chậm hoặc60fps. Source text delta+3003 bytes, không phải production bundle/gzip. Long-task và frame samples giữ trong results/trace. Không thêm virtualization: giữ native pagination; chưa có profile full1000 render hoặc thiết bị thật chứng minh cần virtualizer.

Lần harness đầu đòi3 row trước khi nguồn async sẵn sàng: đã sửa test chờ data-ready, không thay thời gian request. Lần chạy ban đầu được giữ ở `after-initial`; chỉ results cuối được tính PASS.

## Trạng thái bàn giao

Behavior/motion **PASS_SCOPED_UI_FIXTURE**; actual visual chờ user review, có shadow delta đã nêu. Production/WMS, lưu bền, phần cứng và60fps thiết bị thật **NOT_RUN**. Không đổi `SCREEN_COVERAGE.csv`/business integration. MOTION_COVERAGE giữ91 dòng, chỉ4 dòng P13 cập nhật; S03/S04 vẫn MIGRATED theo contract nghiệp vụ. Không deploy hoặc thêm thư viện.
