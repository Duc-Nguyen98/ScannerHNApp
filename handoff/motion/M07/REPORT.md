# MOTION_P07 — NFC

Hoàn tất01/10/2026 (bắt đầu30/09). Target: prototype HTML/CSS/ESM, source commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. **Behavior PASS_SCOPED_UI_FIXTURE; visual motion chờ user review; production/NFC thật NOT_RUN.**

## Nguồn và gate

Đã đọc MOTION_P07_The_NFC.md, MOTION_CONTRACT v1.0 trong thư mục user cung cấp, Contract chung2.0 trong bộ24prompt, FLOW_GATE.json và M00 report/ownership/list audit; reuse M01–M06. FLOW_GATE ghi PASS, đủ91panel với assertion evidence. [Design trace](DESIGN_TRACE.md), [source trước](SOURCE_BEFORE.json), [manifest sau](SOURCE_MANIFEST.json).

Chỉ thị motion mới thay yêu cầu sóng vô hạn trước đây trong đúng phạm viP07: bỏ sóng chạy quanh artwork và ripple thành công. Giữ crop B07 gốc, geometry frame494×950, các ID/guard/fixture đã có. SHA artwork và M00 primitive/token không đổi. Không chuyển stack, cài thư viện hoặc sửa baseline.

## Mapping4panel /3mode

| Panel | Auto | OS reduced | Off | Owner/quyết định |
|---|---|---|---|---|
| P07.S01 | Press100ms/selected140ms | Press0, selected<=80ms | Static | ListViewport dùng native scroll; không row entrance, không replay/filter remount |
| P07.S02 | Chỉ báo nhỏ khi adapter phát listening | Cùng nội dung/trạng thái | Cùng nội dung/trạng thái | NfcFeedback STATIC_BY_DESIGN: dot trạng thái không loop; nền artwork tĩnh |
| P07.S03 | Card UID fade140ms sau flow.next xác minh | Opacity80ms | Static | NfcFeedback qua M00 noticeFeedback, trace label NfcVerified |
| P07.S04 | Check hiện có fade160ms sau receipt confirmed | Static | Static | SubmitFeedback qua M00 rowFeedback, trace label NfcConfirmed |

M02 vẫn sở hữu route opacity, overlay owner vẫn giữ dialog/focus/scroll-lock. Controller P07 chỉ animate descendant đúng phạm vi. Seen key theo UID/item/readAt và requestId; seed dữ liệu khi restore để Back/mount/mode-change không replay. Không gõ UID từng ký tự, count-up, confetti hoặc animate layout.

## Listening và cleanup đúng owner

- Adapter **mô phỏng** phát onListening chỉ trong lượt đọc hợp lệ và hỗ trợ AbortSignal. Đây là metadata vòng đời nội bộ, không là API/enum backend mới. Permission/unsupported không giả listening. UI không suy listening từ busy.
- `nfc-flow` sở hữu stopRead và token guard: rời module hoặc Back về danh sách hủy lượt đọc; callback muộn không khôi phục UID, không tạo mapping. Read khác link. StopRead không hủy request ghi đang xử lý hoặc xóa UNKNOWN; các guard/receipt cũ giữ nguyên.
- Motion chỉ đọc state. Không callback animation nào đọc thẻ, submit, đổi quyền hoặc ghi event. Document hidden bỏ chỉ báo active/cancel hiệu ứng; domain request vẫn theo lifecycle riêng, không tự restart khi quay lại.
- Controller/visibility listener chỉ có khi module active; hide/dispose idempotent, cancel WAAPI, không RAF/timer loop trong code motion P07. Handler tap gắn một lần theo lifetime module. Bấm lại tab đã chọn không render/scroll-top vô ích.

## Kiểm chứng

| Lệnh | Kết quả |
|---|---|
| `node scripts/check_motion_p07.cjs --before` |12 actual captures,4panel×3mode trước sửa |
| `node scripts/check_motion_p07.cjs` |**21 nhóm PASS**,7nhóm×3mode; domain và settled geometry bằng nhau |
| `node --test tests/nfc*.mjs tests/motion-p01.test.mjs tests/motion-p02.test.mjs` |**77/77 PASS**, gồm3ca mới listening/abort/late callback |
| `MOTION_P02_EVIDENCE_DIR=.../shell-regression node scripts/check_motion_p02.cjs` |**36 nhóm AppShell PASS** |
| `NFC_REPEAT_EVIDENCE_DIR=.../flow-regression node scripts/check_nfc_repeat.cjs` |**4 nhóm flow PASS**,5mãliên tiếp/UNKNOWN/text dài |

Tổng61nhóm browser. Ba mode cùng **14 lượt gọi read,1 mapping**, cùng receipt/UID/product; hardware calls0. Rapid read/confirm không nhân đôi operation. Read xong nhưng link failed không có check/success. UID đã liên kết bị chặn, không overwrite. Vào/ra NFC10lần/mode không tăng visibility listeners so với baseline mỗi lần về Home, không giữ indicator/read sau stop. Native scroll/dialog/Enter tìm UID/focus hoạt động.

Các ca mới chỉ dùng seed hiện hữu; không thêm tags để làm motion. Node tests bọc một read Promise trả muộn để chứng minh guard; chưa là chấp nhận phần cứng thật.

Evidence: [M07 results](evidence/results.json), [Node](evidence/node-tests.txt), [AppShell](evidence/shell-regression/results.json), [repeat](evidence/flow-regression/results.json).

## Visual / trace / performance

- [Ảnh trước](evidence/before) và12 ảnh sau theo panel/mode trong evidence; đã xem actual S02/S04. [S02 auto](evidence/auto-P07.S02.png), [S04 auto](evidence/auto-P07.S04.png).
- Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). `frames` trong results lấy computed opacity qua RAF kiểm tra, có frame dưới1 trong auto; off không tạo local motion frames. Không dùng ảnh tĩnh để chứng minh FPS.
- Điều kiện: Chromium494×950,DPR1, clock2026-09-30T01:15:20Z. Geometry12tổ hợp so theo tọa độ tương đối AppShell và kích thước, bằng actual trước sửa. Tọa độ trang trước có ca bị outer-scroll khi bấm tools; giữ dữ liệu gốc và chuẩn hóa theo shell, không che/mask nội dung. Captures sau chủ động đưa page về0 trước đo. Viewport nhỏ/keyboard-height có hồi quy M02.
- Profile S01: **446 nodes/30rows** mỗi mode, native scroll. Không có profile nghẽn list dài để biện minh virtualizer: NOT_NEEDED cho seed hiện tại, DEFERRED cho nguồn dài production; không virtualize vùng đọc.
- Source code đo trong phạm vi tăng **3.620byte**, xem manifest; không phải bundle production. FPS/dropped frames/input latency trên thiết bị thật NOT_MEASURED; không tuyên bố60fps.

Các lỗi test phát triển được lưu: selector mode nằm trong details đóng (đã mở đúng tools trước chọn); counter thấy remove listener lặp (hide được làm idempotent); lần so absolute tọa độ lệch bởi page scroll (đổi sang geometry tương đối shell). Shared primitive không sửa. Hồi quy shell dùng lại before.json M02 gốc, không tạo baseline giả sau sửa.

## Files, dependencies và tracking

Thêm `nfc/motion.mjs`, `scripts/check_motion_p07.cjs`; sửa `nfc/nfc.mjs`, `nfc/nfc-flow.mjs`, `nfc/fixture-adapter.mjs`, `nfc/style.css`, `home/home.mjs`(mode/cancel fanout), testNFC và assetREADME. M00 primitives/tokens/engine/scroller không đổi.

P06 picker/Back và UNKNOWN/5mã có hồi quyrepeat; P15 quyền/thiết bị và P17 xung đột giữ owner hiện tại. P22 event/history không suy ra từ animation hoặc tạo audit mới. API/capability/source mapping production vẫn là giới hạn integration cũ, không đổi thành PASS.

Cập nhật4hàngP07 trong MOTION_COVERAGE.csv và MOTION_RUN_STATE.json, checkpoint M07/RUN_STATE.json. Không sửa business RUN_STATE/SCREEN_COVERAGE hoặc đánh dấu backend đã tích hợp. Không tự chạyM08, không push/merge/deploy.
