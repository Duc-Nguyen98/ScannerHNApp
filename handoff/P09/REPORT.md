# P09 — Bảo hành

Revision hiện hành: [r11 — rà soát và sửa lỗi UI/UX](REVISION_11.md). Nội dung r01 dưới đây giữ làm lịch sử bàn giao.

Đã dựng đủ bốn panel P09 trong prototype HTML/CSS/JS và nối Home, chứng từ gần đây BH-001, tra cứu P06 theo serial và nguồn hồ sơ/timeline dùng chung với Lịch sử. P08 r20 được user **tạm chốt** ngày 2026-09-27; vẫn giữ các giới hạn tích hợp và bổ sung state sau.

## Nguồn / target

- Source HEAD: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working directory `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`, target_kind=`prototype`. Source ứng dụng production không có trong phạm vi editable hiện tại.
- Đã đọc P09_Bao_hanh.md, 00_CONTRACT_CHUNG.md v2.0, BOARD_INDEX.csv do user cung cấp, HANDOFF và DEV_PROPOSAL trong warranty-components, AGENTS.md, UI_STANDARD.md và checkpoint P08 r20. Proposal không được dùng như API đã duyệt.
- Baseline dùng trực tiếp: [B09.png](../../../../ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B09.png). SHA256 `2ca3af4c77313c14eb709436ebd4dc98f74461c8890b1a8dc56db622bab57608`. Đường dẫn repo trong manifest là `design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png`; file đó không hiện diện trong checkout này. Không tạo lại hoặc sửa baseline để che thiếu source.
- Số đo estimated và quyết định trước code: [CONTEXT.md](CONTEXT.md). Trạng thái đầu vào: [INPUT_RUN_STATE.json](INPUT_RUN_STATE.json).

## Coverage

| ID | Kết quả | Visual | Behavior | Integration |
|---|---|---|---|---|
| P09.S01 | Danh sách, search, filter trạng thái, sort theo ngày tiếp nhận, Back giữ từ khóa/scroll; thêm theo quyền phiên | IN_PROGRESS | PASS fixture | BLOCKED |
| P09.S02 | Nhập serial, đối chiếu khách/sản phẩm; required/counter; xác nhận bước2 trong dialog thuộc cùng panel; mở case có sẵn hoặc tạo case mẫu mới | IN_PROGRESS | PASS fixture | BLOCKED |
| P09.S03 | Thông tin, tab POSTED, timeline cùng case; count theo quantity; cập nhật chẩn đoán/kết quả trong dialog; closed chỉ đọc | IN_PROGRESS | PASS fixture | BLOCKED |
| P09.S04 | Chỉ mở từ receipt update của đúng case, Chờ bàn giao, xem lại hồ sơ; không chuyển tồn/đóng case | IN_PROGRESS | PASS fixture | BLOCKED |

Không thêm prompt/board/panel baseline. Modal là state tương tác thuộc P09.S02/S03. P10–P24 chưa được coi hoàn tất. Mẫu BH-002 giữ trạng thái **Đã trả khách** theo nguồn Lịch sử hiện hành; không chép trạng thái cũ B09. Mẫu BH-001 đang kiểm tra theo cùng nguồn. Fixture linh kiện dùng trang xác nhận mới nhất `HISTORY_FIXTURES[0]` của prototype linh kiện: XLK-0002,2 mã,3 linh kiện. UI nói rõ dữ liệu đã tải; không coi là toàn bộ ledger, không trộn số2 cũ với quantity3 mới. Các case chưa có dữ liệu linh kiện dùng trạng thái thiếu dữ liệu, không gán0.

## Kiểm chứng thật

- `node --test tests/*.test.mjs tests/*.test.cjs`: **159/159 PASS**, gồm **8 ca P09**; [node-tests.txt](evidence/revision-01/node-tests.txt).
- `node scripts/check_warranty.cjs`: **10/10 nhóm PASS**; [browser-results.json](evidence/revision-01/browser-results.json). A01–A05 đều được kiểm ở logic và browser; bảng chi tiết tại [STATE_ACCEPTANCE.csv](STATE_ACCEPTANCE.csv).
- 24 ảnh bốn panel × sáu viewport:494×1000,360×800,430×932,1440×900,340×420,1869×940. Shell494×950 CSS px fit thống nhất, DPR1, zoom1, Arial; header/footer/nav ổn định, không overflow ngang. [render-metrics.json](evidence/revision-01/render-metrics.json) ghi viewport/font/scale qua kích thước screen và scrollTop0. Nội dung dài cuộn nội bộ; không yêu cầu mọi nội dung cùng xuất hiện trong một crop.
- `HOME_EVIDENCE_DIR=handoff/P09/evidence/revision-01/home-regression node scripts/check_home.cjs`:14/14 PASS. Test đã đổi kỳ vọng P09 từ pending sang implemented, giữ ID BH-001.
- `LOOKUP_EVIDENCE_DIR=handoff/P09/evidence/revision-01/lookup-regression node scripts/check_lookup.cjs`:11/11 PASS. P06 thiếu serial vẫn bị chặn, không lấy code/SKU thay serial; serial đã xác minh nối đúng intake P09.
- `HISTORY_EVIDENCE_DIR=handoff/P09/evidence/revision-01/history-regression node scripts/check_history_unified_r19.cjs`:7/7 PASS. Thêm override thư mục bằng chứng để không ghi đè r19. Bộ lọc/state đã chốt được giữ nguyên; nhãn tiếp nhận/chờ bàn giao chỉ xuất hiện khi có case tương ứng.
- Các lượt browser không có pageerror hoặc request ra ngoài local preview. Camera/hardware/API production: **NOT_RUN**. Kết quả fixture không phải xác nhận từ WMS.
- Đã xem trực tiếp các ảnh actual S01–S04, S02 ở340×420, và kiểm vị trí footer theo metrics. Bộ ảnh cuối nằm trong revision-01; initial.png chỉ là ảnh debug đầu, không dùng để nghiệm thu.

## Bằng chứng xem nhanh

[P09.S01](evidence/revision-01/P09-S01-494x1000.png) · [P09.S02](evidence/revision-01/P09-S02-494x1000.png) · [P09.S03](evidence/revision-01/P09-S03-494x1000.png) · [P09.S04](evidence/revision-01/P09-S04-494x1000.png) · [Hồ sơ đóng](evidence/revision-01/closed-case.png) · [UNKNOWN](evidence/revision-01/unknown.png).

## Giới hạn còn lại

1. **Visual:** chưa có font/ảnh máy/camera chính xác của Designer. Tái sử dụng ảnh máy đã được user cho phép ở P06; linh kiện dùng icon pastel trung tính thay vì gắn nhầm ảnh trục lăn vào đầu in/adapter. Camera có ảnh kho hiện hữu và báo chưa kết nối. B09 và shell494×950 khác tỉ lệ nên có nội dung cuộn. Chưa được user nghiệm thu P09; không báo giống100%.
2. **Contract production:** enum/status mapping, quyền chi tiết, policy required/length intake/update, idempotency/reconcile và source khách/serial cần DEV/backend cung cấp. Giới hạn200 lấy từ counter B09 **chỉ áp dụng fixture**. Adapter dùng namespace thiết kế, request ID/scanSessionId/version ổn định, duplicate/UNKNOWN/session guards; không tự gọi endpoint mới.
3. **Dependency:** đọc linh kiện là snapshot fixture có provenance, chưa đồng bộ phát sinh Post từ P19 hoặc phân trang ledger thật P20. Xuất mới P19/tiếp tục P21 chỉ có thông báo pending đúng case, không gọi luồng legacy hardcode BH-001 cho case khác. P18 bàn giao/P24 điều kiện đóng backend chưa chốt; không có thao tác đóng, thông báo khách, trừ tiền hoặc đổi tồn. Case closed được kiểm ở handler ngoài việc disable nút.

## File thay đổi trong P09

- Mới: `docs/flows/warranty/{index.html,style.css,warranty.mjs,warranty-model.mjs}`, `docs/flows/shared/warranty-cases.mjs`, `tests/warranty.test.mjs`, `scripts/check_warranty.cjs`, `handoff/P09/*`.
- Nối: `docs/flows/home/home.mjs`, `docs/flows/auth-session/index.html`, `docs/flows/lookup/lookup.mjs`, `docs/flows/history/business-history-data.mjs`.
- Component: `docs/flows/shared/app-modal.mjs` bổ sung textarea vào focus trap; dùng lại modal/choice-dialog/operation-icons, không tạo palette mới.
- Kiểm hồi quy: `scripts/check_home.cjs`, `scripts/check_lookup.cjs`, `scripts/check_history_unified_r19.cjs`.
- Bàn giao: `SCREEN_COVERAGE.csv`, `RUN_STATE.json`. Giữ nguyên thay đổi có trước trong warranty-components, P01–P08, contract-work; không chỉnh dist/gallery/baseline, không push/merge/deploy.

Chạy `python scripts/serve_preview.py`; mở `http://127.0.0.1:8766/flows/auth-session/`, tài khoản fixture `minhanh` / `preview` → Bắt đầu ca → Bảo hành. Công cụ P09 ngoài khung app cung cấp serial thử và mode xác nhận/lỗi/UNKNOWN. Các nháp chỉ giữ trong phiên prototype bộ nhớ; reload yêu cầu đăng nhập lại.
