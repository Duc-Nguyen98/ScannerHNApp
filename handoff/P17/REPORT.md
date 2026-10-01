> Bản sửa mới: [Audit r03 — 7 lỗi UI/UX](REVISION_03.md) · [Review trước–sau](REVIEW_03.html).

> Bản mới: [P17 r02 — sáu nâng cấp UX](REVISION_02.md) · [Review r02](REVIEW_02.html).

# P17 r01 — Ngoại lệ quét

Đã dựng đủ **P17.S01–S04** trong prototype và nối trực tiếp owner P04/P05/P07. **Behavior PASS prototype; visual AWAITING_USER_REVIEW; integration BLOCKED production.** Không thay đổi tồn kho, không Post nhập/xuất, không ghi đè mapping NFC.

## Nguồn và phạm vi

- HEAD kiểm tra: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working directory `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`; source HTML/CSS/JS tại `docs/flows`.
- Prompt P17, BOARD_INDEX và Contract2.0 do user cung cấp; B17 tương ứng board gốc **15**, không nhầm P19/board17. Bản ảnh tham chiếu không sửa tại [B17](evidence/revision-01/B17.png), đã đối chiếu SHA256 trùng byte với Git object ở HEAD.
- UI áp các quyết định mới hơn trong AGENTS/UI_STANDARD: shell494×950 scale đồng nhất; footerLOCK; icon pastel nét mảnh; dialog kết quả; reader nội dung dài. Nghiệp vụ theo HANDOFF, DEV_PROPOSAL chưa phải contract backend.
- [Bảng nguồn/số đo trước sửa](REVISION_01_SOURCE_MAP.md), [review trước–sau](REVIEW.html), [source snapshot trước sửa](evidence/revision-01/before/source), [patch dependency](evidence/revision-01/dependency-changes.patch), [manifest](evidence/revision-01/manifest.json).

## Coverage

| Panel | Owner và kết quả | Disposition | Evidence |
|---|---|---|---|
| P17.S01 | P04/P05: camera minh họa có khung đỏ, lỗi từ nguồn, raw giữ nguyên, Quét lại/Nhập mã; mã lỗi không vào accepted | LEGACY_ADAPTED | [Actual](evidence/revision-01/P17-S01-494x950.png) |
| P17.S02 | P05: reason nguồn, sản phẩm/SKU riêng, phiếu liên quan chỉ hiện khi readable=true; Quét mã khác giữ phiếu | LEGACY_ADAPTED | [Actual](evidence/revision-01/P17-S02-494x950.png) |
| P17.S03 | P07: UID/mapping nguồn, Xem liên kết dùng dialog chỉ đọc P07, Hủy không thay mapping; không thêm quản trị thay thẻ | LEGACY_ADAPTED | [Actual](evidence/revision-01/P17-S03-494x950.png) |
| P17.S04 | P04 và biến thể P05: UNKNOWN giữ request/phiếu/phiên/version/mã; check chỉ đọc; resend disabled; receipt khớp chuyển Chờ xử lý trên Web | LEGACY_ADAPTED | [Actual](evidence/revision-01/P17-S04-494x950.png) |

Không loại panel hoặc biến bốn lỗi thành toast. Các nhánh ngoại lệ vốn có dependency P17 nay dùng chung `scan-exceptions/view.mjs`/`style.css`. Không tạo state machine nghiệp vụ thứ hai. Màn kết quả có ID không mở thêm dialog thông báo trùng. Dialog xem NFC và reader vẫn dùng cơ chế overlay/Back/focus hiện hữu.

## Logic đã kiểm

| Ca | Kết quả prototype |
|---|---|
| A01 | Invalid không đổi accepted/quantity; raw và source reason giữ nguyên; retry/manual/native Back giữ document và mã hợp lệ |
| A02 | Hàng đã xuất bị chặn; nhấn lặp không record; không giải phóng reservation/đổi phiếu; dữ liệu phiếu ngoài quyền không xuất hiện trong UI, kể cả số phiếu trong câu reason |
| A03 | NFC conflict không đổi mapping khi Hủy, Back, confirm lặp; Xem liên kết chỉ đọc và có đúng một overlay |
| A04 | Timeout khóa gửi; check khớp request mở kết quả owner và Xem chứng từ đúng ID; không record lần hai hoặc tăng/giảm tồn |
| A05 | Không có hàm check/nguồn status: giữ UNKNOWN, hiện blocker, không tự retry hoặc chuyển success theo timer |

Đã bổ sung điều kiện cho negative receipt: `not-recorded`/`rejected` chỉ giải phóng UNKNOWN khi request khớp đầy đủ và adapter fixture xác nhận cho phép retry cùng request. Đây là giao diện adapter **fixture**, không tự định nghĩa API/enum WMS. Reason/status thiếu ghi chưa xác định; không giả kết luận “đã xuất”. Response validate lỗi/throw/malformed không làm hỏng accepted list.

## Kiểm chứng thực chạy

- `node --test tests/scan-exceptions.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs tests/nfc.test.mjs tests/recovery-shift.test.mjs tests/p14-logout-retention.test.mjs`: **114/114 PASS**, gồm15 test P17 mới. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_p17.cjs`: **6/6 nhóm PASS**, **20 actual capture** cho4panel×5viewport. [Kết quả/metrics](evidence/revision-01/browser-results.json).
- `node scripts/check_p17_edges.cjs`: **5/5 nhóm PASS**: nội dung250/2000+/newline/Unicode/từ dài, reader/Back/focus, phiếu ngoài quyền, thiếu reason/status, UNKNOWN xuất và retry đã đối chiếu. [Kết quả](evidence/revision-01/edges/results.json).
- `$env:HOME_FOOTER_EVIDENCE_DIR='handoff/P17/evidence/revision-01/footer'; node scripts/check_home_footer_locked.cjs`: **4/4 viewport PASS**, footer Home/P03 giữ nguyên. [Kết quả](evidence/revision-01/footer/results.json).
- Syntax các module chỉnh và `git diff --check` đạt. Diff-check Git chỉ bao phủ file tracked; source prototype phần lớn đang untracked như trước khi bắt đầu, được kiểm syntax và lưu patch đối chiếu riêng.
- Browser Chromium headless, DPR1, zoom1, reduced motion, Arial. Main viewports494×950,360×800,430×932,1440×900,340×420; long-content thêm1869×940. Scroll trong app; before và actual tham chiếu494×950. Không pageerror trong các suite hoàn tất.
- Đã xem actual bốn panel, ảnh nội dung dài và viewport thấp. Trong kiểm tra đã sửa CSS P07 kế thừa khiến card NFC cao và cảnh báo phải cuộn. Lỗi selector của lượt browser đầu được giữ trong diagnostics; các file results.json là kết quả chạy hoàn tất sau sửa. Không tuyên bố pixel-perfect từ test layout.

## Các file ứng dụng thay đổi

- Mới: `docs/flows/scan-exceptions/view.mjs`, `style.css` — presentation4panel, không ghi nghiệp vụ.
- P04/P05: `inbound.mjs`, `outbound.mjs`, hai flow và hai fixture-adapter — mount ngoại lệ, giữ dữ liệu, kiểm chứng kết quả/status; thêm kịch bản thiếu nguồn status ngoài app.
- P07: `nfc.mjs`, `nfc-flow.mjs` — hiển thị conflict và cancel có guard; dùng detail dialog sẵn có.
- `auth-session/index.html` — nạp CSS P17. Không sửa CSS footer chung, Home router, P15/P16, gallery/dist hay ảnh baseline.
- Test/script/báo cáo/state/coverage tại đúng thư mục P17; ghi nhận tạm chốt P01 đúng lời user, không tự coi P16 đã được duyệt.

## Khác biệt hình thức và blocker

1. **Chờ user review visual.** B17 là raster nhiều màn có status bar/home indicator; actual dùng shell494×950 đã khóa và không thêm thanh hệ thống giả. Padding/type/card/CTA theo source map là adaptation có nguồn, chưa nghiệm thu raster.
2. Camera dùng asset ảnh kho P04 có sẵn; chưa có asset kiện hàng/barcode tách riêng đúng B17. UI ghi Camera chưa kết nối. Không lấy ảnh board làm UI.
3. Sample nguồn hiện có dùng `HN99999`/`NFC-OLD-003`/`HN12346`, khác số mẫu B17; không đổi raw/UID để khớp ảnh. Hiện SKU/serial riêng. Ngày gửi UNKNOWN chưa có nguồn thì ghi **Chưa xác định**, không lấy ngày tạo thay thế.
4. **Production BLOCKED:** chưa có contract status/record/retry, quyền xem phiếu liên quan và mapping production; adapter hiện là fixture. Chưa kiểm camera/NFC/keyboard scanner thật, WMS thật, screen reader thật hoặc lưu bền qua reload. Nháp tiếp tục trong phạm vi retention preview hiện hành, không hứa persistence production.
5. UNKNOWN Post linh kiện vẫn do P21/P24 phụ trách; P17 không thay Post thành record nhập/xuất và không đánh dấu P18–P24 hoàn tất.

## Mở kiểm tra

[Preview](http://localhost:8766/flows/auth-session/) · `minhanh / preview`.

- **S01:** Nhập kho → Tiếp tục quét mã → Nhập tay → nhập `HN-NOT-FOUND`. Có thể nhập `HN12345` trước để kiểm giữ1mã hợp lệ.
- **S02:** Xuất kho → điền địa chỉ theo form hiện hành → Bắt đầu soạn hàng → Nhập tay `HN99999`.
- **S03:** Thẻ NFC → Quét hoặc liên kết → ở bộ mô phỏng P07 ngoài app chọn “Thẻ gắn sản phẩm khác” → Đọc thẻ mô phỏng.
- **S04:** Nhập kho, thêm `HN12345` → Kiểm tra phiếu → trong bộ P04 ngoài app chọn “Timeout nhưng đã record” → Gửi phiếu lên Web → Kiểm tra trạng thái. Chọn “Thiếu nguồn tra trạng thái” để xem blocker A05.

Chưa push/merge/deploy. P17 r01 sẵn sàng review prototype; bước tiếp theo là review hình thức, không coi đây là production sign-off.
