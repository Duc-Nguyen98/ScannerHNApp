# P04 — Nhập kho · bàn giao prototype

**Hiện hành: [Revision09 — sửa Back mất scroll, metadata/NCC dài và grid reader](REVISION_09.md).** Có before/after và kiểm các điểm nối P17/P12 mới nhất; không thay các contract đã chốt.

**Hiện hành: [Revision08 — nhập lượt mới, ngữ cảnh phiếu, bộ lọc mã, xem serial theo SKU](REVISION_08.md).** User đã yêu cầu triển khai; hình thức adaptation còn chờ review. Giữ nguyên các contract dialog/readable/footer mới và nối P12 đang có.

**Hiện hành: [Revision07 — rà soát ổn định, NCC/bàn phím/feedback/retry và guard](REVISION_07.md).** Lỗi đã có bằng chứng trước–sau; báo riêng kết quả P04 và các test ngoài phạm vi đang thay đổi đồng thời.

**Hiện hành: [Revision06 — ba loại nhập,15 NCC và tìm kiếm trong dropdown](REVISION_06.md).** Catalogue có ID/name validation, search có/không dấu và mã, giữ lựa chọn tới review/request/kết quả; dùng cùng khung và lifecycle đã chốt.

**Cập nhật hiện hành: [Revision05 — đồng bộ UI/UX phù hợp từ Xuất kho](REVISION_05.md).** Giữ nghiệp vụ nhập và khung Home; bổ sung form validation, popup, nhập liên tiếp, feedback, footer, explicit newAttempt. P08 checkpoint/công việc có trước được bảo toàn.

**Behavior hiện hành: [Revision04 — làm mới lượt nhập sau kết quả xác định, cả Home/P03](REVISION_04.md).** Kết quả thành công/thất bại cũ không còn được dùng lại khi mở lượt mới; draft/UNKNOWN được giữ để tiếp tục/đối chiếu. 63 Node tests và7 nhóm kiểm browser thực PASS.

**Hiện hành: [Revision03 — P04 cùng khung 494×950 và cùng tỷ lệ preview với Home P02](REVISION_03.md).** Quy định khung340px/scale1 của revision02 bên dưới đã được thay thế theo phản hồi người dùng; cuộn nội dung độc lập được giữ.

**Cập nhật mới nhất:** [Revision02 — sửa thu nhỏ/lệch/nhảy bố cục Bước1–3](REVISION_02.md). P04 hiện giữ scale1, dùng vùng nội dung cuộn và header/footer ổn định. Các mô tả thu/phóng toàn màn và ảnh/metrics bên dưới là bằng chứng lần đầu; xem revision02 cho giao diện hiện hành.

Đã dựng **4/4 panel** bằng HTML/CSS/JS trong `docs/flows/inbound/`, nối Home → Nhập kho và P03 → Nhập kho. P03 được người dùng **tạm chốt**; P05–P24 chưa triển khai thêm. **Behavior PASS trong fixture; visual FAIL/cần review; integration BLOCKED.**

## Nguồn, target và bảo toàn công việc

- HEAD thực tế `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target_kind `prototype`; workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`.
- Contract chung v2.0, P04, BOARD_INDEX do người dùng cung cấp; [số đo và quyết định trước code](CONTEXT.md).
- B04 đính kèm trùng byte với `design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png` tại commit; SHA256 `b0f13c4aff332518a6d5348eac6452dd8e4aa9bf98347568df9e527073c3a67f`. [Baseline bất biến](evidence/B04-reference.png).
- Gallery public không truy cập được qua web tool; mapping kiểm tại `docs/index.html` ở HEAD. Không sửa gallery/dist/baseline, không push/merge/deploy. Giữ thay đổi có trước, gồm `warranty-components/flow.js`, P01–P03 và các tests.

## Bốn panel

| Panel | Kết quả | Visual | Behavior | Integration | Bằng chứng |
|---|---|---|---|---|---|
| P04.S01 | Kho từ phiên, mã fixture readonly, loại nhập/NCC fixture, ghi chú 200 ký tự; metadata bắt buộc không được relax | FAIL | PASS | BLOCKED | [Actual](evidence/P04-S01-340.png) · [Đối chiếu](evidence/comparison-S01.png) |
| P04.S02 | Camera minh họa chưa bật, đèn báo dependency; Nhập tay và batch camera fixture dùng cùng validate, giữ mã gốc/thời gian/kết quả; xem đủ lượt | FAIL | PASS | BLOCKED | [Actual](evidence/P04-S02-340.png) · [Đối chiếu](evidence/comparison-S02.png) |
| P04.S03 | Tóm tắt đúng phiếu/actor/kho, SKU tính từ mã hợp lệ; Back/sửa ghi chú không mất mã; CTA Gửi phiếu lên Web | FAIL | PASS | BLOCKED | [Actual](evidence/P04-S03-340.png) · [Đối chiếu](evidence/comparison-S03.png) |
| P04.S04 | Chỉ sau receipt khớp toàn bộ request; Chờ xử lý trên Web, chưa ghi sổ; Home và boundary chứng từ đúng ID | FAIL | PASS | BLOCKED | [Actual](evidence/P04-S04-340.png) · [Đối chiếu](evidence/comparison-S04.png) |

[Tổng quan 4 panel](evidence/P04-actual-overview.png) · [Nghiệm thu A01–A05](STATE_ACCEPTANCE.csv).

**Trace thay đổi copy:** HANDOFF hiện hành `docs/flows/warranty-components/HANDOFF.md`, mục Quy tắc UI, thay Gửi duyệt → Gửi phiếu lên Web; kết quả Đã gửi phiếu nhập / Chờ xử lý trên Web / Phiếu đã gửi, chưa ghi sổ. Bỏ lời hứa tự thông báo phê duyệt. S03/S04 disposition=MIGRATED. Component `docs/flows/shared/waiting-web.mjs` sẵn cho P24.S03 tái dùng; không đánh dấu P24 đã triển khai. Mã PN-0005 readonly, thay dấu x trong ảnh vì không có contract cho sửa/xóa mã server.

## Hành vi và dependency

- Namespace `hn-inbound-preview-v1`; 12 lượt → 11 mã hợp lệ + 1 trùng; nhóm SKU 5+4+2. Mã lạ giữ raw và báo nguồn P06/P17 chưa tích hợp. Không xóa dòng đã ghi nhận, không gọi Post, không thay đổi tồn.
- Kho/actor/quyền từ phiên P01; route và handler kiểm kho dừng/UNKNOWN. P03.S03 dùng lại dialog chung, không tạo overlay thứ hai hoặc hủy phiên đã xác nhận.
- Đang gửi chặn submit trùng. Timeout/throw/receipt sai → giữ request/document/scan session/version/codes, khóa gửi lại và sửa payload. Check trạng thái có deadline; chỉ receipt khớp mới thành công. Chỉ sau phản hồi xác nhận chưa record mới cho retry cùng request. Receipt muộn không tự tạo success.
- Home/Back trong cùng phiên giữ nháp trong bộ nhớ. Logout dispose controller; Back không khôi phục phiên. Reload/đóng tab không có persistence — chưa phải lưu nháp production.
- Context resume P03 với PN-0001 và mã cũ được giữ nguyên tại boundary hiện hữu vì thiếu metadata/catalog đã xác minh; không thay bằng PN-0005. Ba chứng từ Home PN-0001/PX-0004/BH-001 và hub P22 giữ nguyên.
- P12 chưa có đích tương ứng cho phiếu mới: Xem chứng từ báo dependency kèm đúng ID. Timeout có điểm kiểm tra trạng thái P17.S04 trong P04 và hướng dẫn đối chiếu; chưa có route/API P17 hoặc URL WMS được duyệt. Không triển khai thêm board.
- DEV_PROPOSAL không được dùng làm API/enum/quyền production. Adapter không phải fixture sẽ chặn gửi do thiếu contract đã duyệt.

## Kiểm tra thật

```powershell
python scripts/serve_preview.py
node --test tests/*.mjs tests/*.cjs
node scripts/check_inbound.cjs
$env:HOME_EVIDENCE_DIR = 'handoff/P04/evidence/home-regression'
node scripts/check_home.cjs
$env:DIALOG_EVIDENCE_DIR = 'handoff/P04/evidence/dialog-regression'
node scripts/check_dialogs.cjs
python handoff/P04/compare_reference.py
```

- **57/57 Node tests PASS**, gồm 10 ca mới P04, 47 ca hồi quy. [Output](evidence/test-output.txt).
- **11 nhóm trình duyệt P04 PASS**: metadata, 12/11, review/back, single record, responsive, manual/duplicate/error/keyboard, timeout/check, native Back, kho dừng, P03 picker, logout. [Kết quả](evidence/browser-results.json).
- **14 nhóm Home và 13 nhóm P03 PASS**. [Home](evidence/home-regression/browser-results.json), [P03](evidence/dialog-regression/browser-results.json). Không page error, external request hoặc camera request trong các lần chạy đạt.
- Reference 340×847 CSS px, DPR1, zoom1; ma trận 360×800, 430×932, 1440×900, 340×420 mô phỏng chiều cao bàn phím. [Metrics](evidence/render-metrics.json). Preview thu/phóng đồng đều toàn màn; control nằm trong app, tools ngoài app.
- Không có package/build/lint production ở target; không bịa lệnh build. Thiết bị thật, camera/đèn, bàn phím OS và WMS **NOT_RUN**.
- P03 lần đầu lỗi selector công cụ bị trùng sau khi thêm P04; đã sửa và chạy đạt. `browser-failure.*` trong evidence hồi quy là lần thất bại cũ, không dùng làm bằng chứng PASS.

## Sai khác và phần chờ

Visual còn khác font/texture, ảnh camera không có hộp đúng B04, thumbnail hộp dùng SVG repo; một số metric chữ/spacing/icon chưa trùng baseline. [So sánh](evidence/baseline-comparison.json) dùng crop gốc, không resize/mask; không tự đặt ngưỡng pixel PASS. Nhãn mới khác có chủ ý theo HANDOFF.

Ba nhóm đầu vào để tích hợp tiếp: (1) metadata/create/record/status và quyền backend đã duyệt; (2) catalog sản phẩm, camera/đèn, đích P12/P17 và persistence/resume đúng phiếu; (3) font/icon/ảnh camera và hộp chuẩn B04 hoặc quyết định visual review. Thiếu các nguồn này không ngăn phần prototype hiện tại nhưng chưa cho phép đánh dấu integration PASS.

## File thay đổi và mở preview

Thêm `docs/flows/inbound/{index.html,inbound.mjs,inbound-flow.mjs,fixture-adapter.mjs,icons.mjs,style.css}`, shared `waiting-web.mjs`, `tests/inbound.test.mjs`, `scripts/check_inbound.cjs`, hồ sơ P04. Sửa dependency `home/home.mjs`, thêm stylesheet ở `auth-session/index.html`; cập nhật selector/đích kỳ vọng trong hai script hồi quy. Cập nhật coverage và RUN_STATE, giữ 91 panel.

[Mở preview local](http://127.0.0.1:8766/flows/auth-session/) → `minhanh` / `preview` → xác nhận phiên → **Nhập kho**. Bước 2 mở công cụ **Kịch bản kiểm tra P04** ngoài app, chọn **Nạp 12 lượt quét B04 (fixture)**; kiểm tra phiếu và gửi để xem S04. Selector kết quả gửi dùng thử UNKNOWN/timeout. Không tự chuyển sang P05.
