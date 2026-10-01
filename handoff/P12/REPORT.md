# P12 · Chứng từ · r01

Ngày 2026-09-28. **Đã dựng đủ P12.S01–S04; behavior PASS trong prototype, visual chờ user nghiệm thu, integration production BLOCKED.** P11 r03 được user tạm chốt; bổ sung state đồng bộ để sau.

## Nguồn và target

- HEAD/source commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target_kind=`prototype`, HTML/CSS/JS trong `docs/flows/`.
- Đọc P12, Contract v2.0, BOARD_INDEX, AGENTS, UI_STANDARD, HANDOFF, DEV_PROPOSAL và component liên quan. Danh mục gallery tại `docs/index.html` vẫn giữ nguyên. Không sửa dist/gallery/baseline, không push/merge/deploy.
- B12 người dùng cung cấp **trùng byte** với board lấy từ Git HEAD: SHA-256 `bb73f81c628986d6a763d4a846f19229e60898ef016eb02022926603bea776ad`. File ảnh không hiện trong checkout nhưng Git object đọc được. [Bằng chứng nguồn](evidence/revision-01/baseline-verification.json), [baseline](evidence/revision-01/baseline-B12.png), [số đo trước triển khai](CONTEXT.md).
- Working copy đã có nhiều thay đổi chưa commit và một đợt đồng bộ dialog P01–P10 diễn ra cùng lúc. Giữ phần của chat khác; chỉ mở rộng dependency cần cho P12.

## Coverage

| ID | Kết quả | Actual 494×950 |
|---|---|---|
| P12.S01 | Search mã/loại/đối tác, tab nghiệp vụ, ngày/trạng thái, sắp xếp, loading/empty/error, giữ query/scroll khi Back | [Danh sách](evidence/revision-01/S01-494x950.png) |
| P12.S02 | Context chính xác theo ID; Thông tin/Tài liệu/Lịch sử, copy có xác minh clipboard, files giữ context; không có Duyệt/Post/Xóa | [Chi tiết](evidence/revision-01/S02-494x950.png) |
| P12.S03 | 11 sản phẩm / 3 SKU, 5+4+2; search trong phiếu, dialog chi tiết dòng chỉ đọc, số serial độc lập | [Sản phẩm](evidence/revision-01/S03-494x950.png) |
| P12.S04 | Chọn Nhập/Xuất/Bảo hành; kho khóa; supplier/note; chuyển P04/P05/P09 hiện có; giữ phiếu dở và UNKNOWN | [Tạo chứng từ](evidence/revision-01/S04-494x950.png) |

Visual: tất cả panel mẫu vừa khung 494×950, co đồng nhất; không overflow ngang/cuộn dư trong 24 trường hợp panel×viewport. Nội dung dài được kiểm bằng dữ liệu stress và vẫn cuộn nội bộ, header/nav giữ vị trí. Sáu viewport: 494×950, 360×800, 430×932, 1440×900, 340×420, 1869×940; Chromium headless, DPR1, zoom1, Arial local. Đây là review bố cục, chưa phải pixel-perfect/font Designer hay kiểm bàn phím thiết bị thật.

## Hành vi và dependency

- A01 PASS fixture: kết hợp tab/search/date/status/sort; dùng chung history-picker và policy ngày Việt Nam hôm nay−90 đến hôm nay. Đặt lại/Hủy/Áp dụng giữ đúng draft/apply semantics; loading/empty/error cùng danh sách. P16 ownership chung còn chờ.
- A02 PASS: quantity=11 và SKU=3; missing không quy thành0. Mã được P04/P05 ghi nhận không tự coi là serial đã được nguồn xác minh.
- A03 PASS ở UI: file dialog không mất ID/filter/scroll; Back/Escape đóng dialog trước. **Xem/tải nội dung thật BLOCKED P18**, không tạo PDF giả. P08 event mapping chỉ áp cho fixture PN-0005 có ID rõ; phiếu không có nguồn event hiển thị chưa có dữ liệu.
- A04 PASS fixture: P12 không có endpoint hay kho draft riêng. Supplier/note chỉ seed P04 draft mới rồi đi bước quét. Phiếu dở/UNKNOWN được xác nhận trước khi tiếp tục và không ghi đè. P05 vẫn kiểm người nhận/địa chỉ/số lượng kế hoạch; P09 mở Tiếp nhận.
- Sau record được xác minh ở P04/P05, nút Xem chứng từ mở P12 đúng documentId, lấy số lượng/note/đối tác từ owner flow; Back về đúng kết quả, không cấp thêm draft. Danh sách chỉ hợp nhất receipt xác minh của đúng actor/kho; không đưa DRAFT/UNKNOWN vào đây.
- A05 PASS: không có action/API Duyệt/Post nhập/xuất, không thay tồn; chứng từ POSTED vẫn chỉ đọc. Xác nhận và kết quả thao tác dùng action-dialog trong app, nền inert, focus trap/restore, Back/Escape; bấm nền không tự đóng.

## Kiểm tra đã chạy

| Lệnh | Kết quả / log |
|---|---|
| `node --test tests/documents.test.mjs tests/inbound.test.mjs tests/home.test.mjs tests/history-picker.test.mjs tests/query-date-policy.test.mjs tests/dialog-route.test.mjs` | **56/56 PASS** · [log](evidence/revision-01/node-tests.txt) |
| `node scripts/check_documents.cjs` | **18/18 nhóm PASS**, 24 panel×viewport và6 dialog captures, zero pageerror · [kết quả](evidence/revision-01/browser-results.json) |
| `HISTORY_EVIDENCE_DIR=handoff/P12/evidence/revision-01/history-regression node scripts/check_history_reset_r19.cjs` | **5/5 nhóm PASS** · [kết quả](evidence/revision-01/history-regression/reset-results.json) |
| `node --check` module documents/Home | PASS |
| `node scripts/capture_documents.cjs` | Capture ban đầu dùng để sửa cuộn dư; actual nghiệm thu là ảnh có suffix viewport ở trên |

Hai suite legacy `check_home.cjs` và `check_inbound.cjs` đã chạy nhưng **không PASS toàn suite**: Home còn chờ màn dependency/role=status tại luồng đã chuyển thành dialog trong đợt đồng bộ khác; inbound còn chờ `.p04-feedback` inline. Giữ [log Home](evidence/revision-01/home-regression-log.txt) và [log inbound](evidence/revision-01/inbound-regression-log.txt); không cộng vào số PASS. Các đường nối P12/P04/P05 được kiểm lại trong18 nhóm P12, bao gồm record, ID, Back, inventoryDelta=0. Không tuyên bố hồi quy toàn app. Không có package.json gốc nên không bịa lệnh build/lint. Địa giới trong browser test được mock; không gọi API/hardware mới.

## Khác biệt và giới hạn còn lại

- Nhập/xuất “Chờ duyệt” → “Chờ xử lý trên Web” theo HANDOFF; POSTED giữ “Đã ghi sổ”. BH-002 giữ badge legacy B12 “Chờ duyệt” chỉ để xem, không cấp quyền duyệt hay suy lifecycle backend bảo hành mới.
- B12 hiển thị24 nhưng chỉ6 record có nguồn nhìn thấy. Preview dùng6 mẫu và count thật, cộng receipt P04/P05 khi có; không tạo18 chứng từ giả để ép số24.
- Ngày tạo không editable khi chưa có contract. P12 hiển thị tự động khi tạo; P04 adapter có ngày mẫu, P05 không có ngày thì P12 ghi chưa có dữ liệu.
- Ảnh đóng gói tái sử dụng P06; ảnh đúng ZD421/DS2208 chưa có, dùng icon neutral. Không sinh/tải ảnh mới.
- WMS/backend, file content, scanner hardware, mapping permission/API thật và policy ngày vẫn BLOCKED. Dữ liệu trong memory phiên preview; reload về fixture, không coi là production.

## File thuộc thay đổi P12

- Mới: `docs/flows/documents/{document-model.mjs,documents.mjs,style.css,index.html}`, `tests/documents.test.mjs`, `scripts/{capture_documents.cjs,check_documents.cjs}`, handoff/P12.
- Dependency: `home/home.mjs`, `auth-session/index.html`, `inbound/inbound-flow.mjs`, `inbound/inbound.mjs`, `outbound/outbound.mjs`; `shared/detail-tabs.css` thêm selector P12, `shared/choice-dialog.mjs` hỗ trợ backdrop option, `history/history-picker.mjs` thêm nhãn tùy chọn; `scripts/check_home.cjs` nhận P12 là màn đã triển khai.
- Cập nhật coverage P12 và evidence dependency P04.S04/P05.S04; RUN_STATE chung đọc rồi merge, không xóa revision của chat khác. [Checkpoint](RUN_STATE.json), [state acceptance](STATE_ACCEPTANCE.csv), [source hashes](evidence/revision-01/source-hashes.json).


## Cập nhật r07 · 2026-09-29

Xem [REVISION_07.md](REVISION_07.md): dùng chung controls Lịch sử,4tab cố định, Back theo trang và timeline warning/success có đối chiếu sự kiện.41 Node +44 nhóm browser đạt trong preview; visual chờ review, production chưa tích hợp.


## Cập nhật r08 · 2026-09-29

[REVISION_08.md](REVISION_08.md): nâng cấp form tạo, tách readonly metadata và sửa ràng buộc chiều cao picker khiến footer bị cắt.20 nhóm browser PASS; visual chờ review, production chưa tích hợp.


## Cập nhật r09 · 2026-09-29

[REVISION_09.md](REVISION_09.md):5 đề xuất được user yêu cầu triển khai; progress3 bước, NCC ưu tiên và số kết quả, exact draft resume/UNKNOWN, review quantity/SKU và validation/busy.75Node +16 nhóm browser đạt; visual cần review, chưa tích hợp backend.


## Cập nhật r10 · 2026-09-29

[REVISION_10.md](REVISION_10.md): rà soát và sửa5 lỗi tái hiện, bổ sung focus sau tải file;26 nhóm browser đạt. Giữ P16/P17/P18 và owner integration mới; visual chờ review, production chưa nghiệm thu.
