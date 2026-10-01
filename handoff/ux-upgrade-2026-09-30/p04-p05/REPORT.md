# P04/P05 — nâng cấp nhập tay và đối chiếu đổi phiếu30/09/2026

## Thay đổi đã áp dụng

- Nhập tay P04/P05 thu camera128→40CSSpx, giữ nhãn camera chưa kết nối. Khi form mở, ẩn hàng nút Nhập tay đang dư và đèn chưa khả dụng; Thu gọn/Escape về giao diện quét, Tiếp tục quét/soạn giữ ô nhập. P05 bỏ phần progress trùng trong nội dung khi nhập tay; thanh tiến độ cố định và counters vẫn đầy đủ.
- Form/ô nhập được giữ **kết nối DOM** trong lần cập nhật counters/danh sách để scan liên tiếp không làm mất focus hoặc thay node input. Giá trị, lỗi field, counters do owner quản lý. Enter/submit trong composition bị chặn; trạng thái IME gắn với node không mang sang input mới. Thay viewport đưa dòng mã vào vùng thấy được, không đổi AppShell.
- Dialog Đổi phiếu P05 thể hiện đúng người nhận, điện thoại, lượng cần soạn, nhóm hàng, địa chỉ và ghi chú **trước→sau**. Nhắc phải chọn lại địa chỉ. Nội dung đầy đủ dùng vùng cuộn của dialog chung, không reader/overlay thứ hai. Nút Hủy/Đổi phiếu và tone nguy hiểm giữ contract.
- Preview metadata dùng cùng helper pure với fixture makeDocument: mở/Hủy dialog không sinh documentId/scanSessionId và không giữ số thế hệ. Chỉ xác nhận mới gọi flow.select. Callback phải còn đúng document/version/nội dung, step1, không busy/request/UNKNOWN/lượt quét; nếu owner đã đổi thì giữ bản nhập mới và yêu cầu xem lại.
- Giữ P04r09/P05r11, tám ID panel, P17 exceptions,24board/91panel, khung494×950 và footerLOCK. Không sửa backend, ghi storage, WMS, camera, hardware, push/merge/deploy.

## Nguồn / visual

Nguồn trước sửa: [CONTEXT.md](CONTEXT.md); source gốc trongbefore-source. [REVIEW.html](REVIEW.html) đặt actual trước–sau cùng494×1000/DPR1/fixture1 mã. Mỗi manual có thêm6viewport; giờ lượt quét là đồng hồ phiên thực trong lần chụp, không dùng pixel-diff giả.

Lựa chọn triển khai mới (strip40px, khoảng trắng form, ẩn controls trùng, trình bày diff) là adaptation trong đề xuất được user cho phép; **AWAITING_USER_REVIEW**, không tự coi baseline Designer. Ảnh after có thêm thay đổi vùng chạm/header do root cùng đợt.

Ở494×1000 và các viewport cao≥844 trong ma trận, ô nhập/counter/lượt gần nhất đều nằm trong vùng nhìn thấy. Ở340×420, header Back có vùng chạm44px thực nên chiếm nhiều không gian; input vàcounter thấy được, danh sách vẫn cuộn nội bộ để đọc lượt gần nhất. Không clip nội dung dài chỉ để đạt không-scroll. Header/footer không đổi vị trí khi nội dung cuộn; không thay footer nav đã khóa. [Số đo trước–sau](measurements.json).

## Behavior / kiểm chứng

- **65/65NodePASS**: inbound, outbound, outbound-experience, outbound-geography, outbound-source-review.3 ca mới kiểm preview không sinhID, so khớp dữ liệu thật tạo sau confirm, fulltext2100+, stale document/version/request/UNKNOWN/scan locks. [Log](node-tests.txt).
- **11/11nhóm browser mớiPASS**,12manual viewport checks và6long-dialog viewport checks,0pageerror: [verified-touch/results.json](verified-touch/results.json). Bao gồm composition Enter/submit, input DOM identity/focus, raw draft/collapse/review Back, source Hủy/Escape/native Back, cập nhật owner muộn, nguồn UNKNOWN giữ request và không record lại.
- **11/11nhóm hồi quy P04PASS**, metadata/serial dài, P17, nháp, Back,6viewport reader: [inbound-regression-02/results.json](inbound-regression-02/results.json).
- **7/7nhóm hồi quy P05PASS**, shipping, soạn liên tục, filters, P17, edit review: [outbound-regression-touch/results.json](outbound-regression-touch/results.json).
- **6/6nhóm P05 select edgePASS**,6viewport: [outbound-select-touch/results.json](outbound-select-touch/results.json). **6/6nhóm P04 cataloguePASS**,6viewport: [inbound-select-touch/browser-results.json](inbound-select-touch/browser-results.json). Đã chạy sau rule vùng chạm cuối của root, gồm clear-input cần dành đủ chiều cao và padding để không chồng controls.
- Tổng phần việc **41nhóm browserPASS**, Node65 (không cộng lặp với tổngworkspace). Các kết quả cuối không pageerror.

Lưu log các lượt chưa đạt; không ghi đè evidence cũ. after/after-02/after-03/after-05 ghi iteration layout; after-04 chứa lượt còn dùng assert cũ. interim-layout là capture khám phá, không before gốc. before mới của revision này chỉ trongbefore.

Hai regression fixture được cập nhật để khớp trải nghiệm mới, giữ assertion nghiệp vụ: P05 nút Nhập tay trùng được ẩn khi mở nên thao tác tiếp tục dùng CTA Tiếp tục soạn; P04 scroll120 thay220 để field vẫn nằm trong vùng nhìn thấy trước P17 (nếu cố cuộn form ra ngoài rồi chọn Nhập mã, controller P17 hiện hữu chủ động reveal form). Các log chưa đạt nằm inbound-regression vàoutbound-regression.

## Lệnh đã chạy

```powershell
$env:MANUAL_UX_BEFORE='1'; $env:MANUAL_UX_OUTPUT='handoff/ux-upgrade-2026-09-30/p04-p05/before'; node scripts/check_manual_focus_upgrade.cjs
$env:MANUAL_UX_BEFORE='0'; $env:MANUAL_UX_OUTPUT='handoff/ux-upgrade-2026-09-30/p04-p05/verified-touch'; node scripts/check_manual_focus_upgrade.cjs
node --test tests/inbound.test.mjs tests/outbound.test.mjs tests/outbound-experience.test.mjs tests/outbound-geography.test.mjs tests/outbound-source-review.test.mjs
$env:INBOUND_PREVIEW_URL='http://127.0.0.1:8766'; $env:INBOUND_UI_AUDIT_DIR='handoff/ux-upgrade-2026-09-30/p04-p05/inbound-regression-02'; node scripts/check_inbound_ui_audit.cjs
$env:PREVIEW_BASE_URL='http://127.0.0.1:8766'; $env:OUTBOUND_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p04-p05/outbound-regression-touch'; node scripts/check_outbound_micro_audit.cjs
$env:PREVIEW_BASE_URL='http://127.0.0.1:8766'; $env:OUTBOUND_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p04-p05/outbound-select-touch'; node scripts/check_outbound_edge_cases.cjs
$env:INBOUND_PREVIEW_URL='http://127.0.0.1:8766'; $env:INBOUND_CATALOGUE_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p04-p05/inbound-select-touch'; node scripts/check_inbound_catalogue.cjs
```

Playwright Chromium browser riêng; P05 địa giới được mock không gọi API. Không chạm nháp trong tab user. WMS/keyboard thiết bị thật/persistence vẫn chưa xác minh; Node/browser prototype không đồng nghĩa production.

## Files

- `docs/flows/inbound/inbound.mjs`
- `docs/flows/inbound/style.css`
- `docs/flows/inbound/manual-entry.mjs`
- `docs/flows/outbound/outbound.mjs`
- `docs/flows/outbound/style.css`
- `docs/flows/outbound/fixture-adapter.mjs`
- `docs/flows/outbound/source-review.mjs`
- `tests/outbound-source-review.test.mjs`
- `scripts/check_manual_focus_upgrade.cjs`
- `scripts/check_inbound_ui_audit.cjs`
- `scripts/check_outbound_micro_audit.cjs`

[SHA256 hiện tại](source-sha256.json). Không chỉnh shared standards/auth/home/RUN_STATE/coverage ở subtask này; root tổng hợp.
