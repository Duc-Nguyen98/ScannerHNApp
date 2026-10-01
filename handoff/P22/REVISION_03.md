# P22 r03 — rà soát và sửa lỗi UI/UX

Đã sửa **12 ca lỗi tái hiện được** của r02; giữ sáu nâng cấp trước đó. **Visual AWAITING_USER_REVIEW · Behavior PASS_PROTOTYPE · Integration BLOCKED_PRODUCTION.** Không tuyên bố hết mọi lỗi trong toàn app hoặc đã nghiệm thu production.

[Review trước–sau](REVIEW_03.html) · [Nguồn/quyết định trước sửa](REVISION_03_CONTEXT.md) · [Ca trước sửa](evidence/revision-03/before/audit-results.json) · [Ca sau sửa](evidence/revision-03/after/audit-results.json).

## Các ca đã sửa

| ID | Ca tái hiện ở r02 | Sửa r03 |
|---|---|---|
| 01 | Vào chi tiết bằng deep link rồi Back tạo caller giả ở danh sách | Fallback replace không gắn p22From; Back tiếp về hub, không quay vòng |
| 02 | Rời danh sách lúc tải lại bị ghi là lỗi đọc | Phân biệt tải chưa hoàn tất với nguồn đọc lỗi; callback muộn không thay trạng thái |
| 03 | Mở chi tiết từ cache lỗi nhưng mất cảnh báo nguồn cũ | Chi tiết (cả event không có trong tập đã đọc) nêu rõ lần đọc trước |
| 04 | UID dài chiếm cả hai dòng, che serial | UID và serial có dòng riêng, ellipsis độc lập; chi tiết/reader/copy giữ đủ mã |
| 05 | Tên người thao tác dài làm thẻ phình rất cao | Tên gọn hai dòng, mở thẻ xem đủ tên qua reader chi tiết |
| 06 | Đổi tab giữa composition làm trạng thái IME mắc kẹt | Reset composition/timer theo vòng đời DOM; ô mới tìm kiếm bình thường |
| 07 | Debounce tìm kiếm thay dữ liệu nền khi picker đang mở | Hoãn repaint đến khi đóng overlay, cập nhật count/clear/query cùng nhau |
| 08 | Nút tải lại disabled làm rơi focus bàn phím | Trả focus khi đọc xong nếu người dùng chưa chọn chỗ khác; không giành focus |
| 09 | Tập dữ liệu chưa đầy đủ nhưng rỗng bị diễn đạt như không có lịch sử | Ghi chưa tìm thấy trong dữ liệu đã tải/chưa xác minh toàn bộ; count là đã tải |
| 10 | Giá trị nguồn sai kiểu thành [object Object], có nút copy không hoạt động | Trường trình bày sai kiểu/blank thành Chưa xác minh, không hiện copy giả; string hợp lệ giữ nguyên |
| 11 | Bộ lọc ngày/trạng thái thiếu dấu hiệu ở nút lọc | Thêm dot theo mẫu component và aria-label; kiểm cả kích thước thực của dấu lọc |
| 12 | Source đọc lại thay DOM khi summary đang focus, focus rơi ra body | Phục hồi selector/heading hợp lệ trong app; không lấy focus khỏi bộ mô phỏng ngoài app |

Ca12 sử dụng bộ mô phỏng để đổi nguồn; nguồn đổi vẫn reset expanded đúng chủ đích, không giữ metadata cũ sang nguồn mới. Nhánh phản hồi đọc giữ nguyên nguồn được kiểm riêng qua tải lại/Cancel/Apply. Guard toggle bỏ sự kiện từ DOM đã tháo.

## Kiểm chứng

- **90/90 test logic**, gồm34 test P22, qua `node scripts/run_p22_r03.cjs test_p22.cjs`. [Log](evidence/revision-03/regression/logic/node-tests.txt).
- **12/12 ca audit trước–sau** qua `node scripts/audit_p22_r03.cjs before|after`. Trước sửa12 FAIL assertion, không pageerror; sau sửa12 PASS. Mỗi ca đăng nhập riêng, cùng494×950/DPR1/clock2026-09-30. Source r02 lưu trước sửa ở `before/source`.
- **24 nhóm trình duyệt hồi quy r01/r02**:7 chính +8 edge +9 UX. Wrapper `scripts/run_p22_r03.cjs` chỉ đổi nơi ghi evidence và adapter selector cũ. [Chính](evidence/revision-03/regression/after/results.json) · [Edge](evidence/revision-03/regression/edges/results.json) · [UX](evidence/revision-03/ux-regression/results.json).
- **7 nhóm thao tác kết hợp bổ sung**: query/picker/Cancel; focus mới; read/filter/Apply; hủy tải/callback muộn/retry; double Back/Forward; clipboard muộn/reader; layout có bộ lọc dài và cache lỗi. [Kết quả](evidence/revision-03/combinations/results.json).
- Tổng **43 nhóm trình duyệt**, không cộng layout vào số nhóm; không pageerror trong các lượt đạt. **40 tổ hợp layout** (20 panel +10 nội dung dài +10 bộ lọc dài/cache detail), **4 viewport footer Home/P03**. [Footer](evidence/revision-03/footer/results.json).
- Layout kiểm frame494×950, vùng cuộn trong app, header/footer, controls không tràn ngang, target44px; viewport494×950/360×800/430×932/1440×900/340×420. Assertion layout không đồng nghĩa đúng từng pixel thiết kế.
- Đã xem trực quan ảnh danh sách UID dài, cache detail, dot filter, tên dài và các nhánh kết hợp. Chọn ảnh trước–sau cùng điều kiện trong REVIEW_03.

Preview đã dừng sau lần ngắt tác vụ; lượt kết nối thất bại ban đầu không được tính là lỗi sản phẩm. Đã khởi động lại server local rồi tái hiện đủ12 lỗi bằng assertion. Hai lượt harness bổ sung cần sửa selector Hủy (hai nút data-cancel) và mô phỏng focus như click thật; không tính thêm lỗi app. `combinations/failure.json` giữ dấu vết harness, `results.json` là lượt hoàn tất đạt.

## Phạm vi và giới hạn

Nguồn app chỉnh: `docs/flows/history/nfc-audit-view.mjs`, `nfc-audit-model.mjs`, `nfc-audit.css`. Test logic thêm vào `tests/nfc-audit.test.mjs`; thêm ba script audit/regression/combination r03. Không sửa shared picker/dialog/reader, Home/P03 footer, owner P07/P19/P20/P21, schema API, baseline hay dist/gallery. Giữ91ID/24board; P22.S01 MIGRATED, S02–S04 CURRENT; P21 vẫn tạm chốt.

UID/serial/actor được kiểm kiểu tại adapter trình bày, không sửa dữ liệu nguồn. Không suy thiếu dữ liệu thành0. Backend event NFC/mapping/quyền/cursor, thiết bị NFC và clipboard thật chưa xác minh; dữ liệu giả lập không chứng minh production. Read timeout15giây không áp dụng Post. Preview chỉ giữ bộ nhớ, reload/logout mất. P23/P24 full boards chưa hoàn tất. Không push/merge/deploy.

Preview: http://localhost:8766/flows/auth-session/?v=p22-r03 — `minhanh / preview` → Lịch sử → NFC → chọn Mẫu B22 trong bộ mô phỏng ngoài khung. Mặc định chưa có nguồn; dùng Nội dung dài/Lần tải lại để kiểm nhánh. Nếu đang mở bản cũ, reload sẽ lấy source mới **và mất dữ liệu preview trong bộ nhớ**.
