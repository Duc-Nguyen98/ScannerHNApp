# P08 — Lịch sử · r01

Ngày 27/09/2026. **Đã triển khai đủ 4/4 panel prototype; behavior fixture PASS; visual chờ user nghiệm thu; integration thật BLOCKED/NOT_RUN.** Không chuyển sang P09. P07 r10 được user tạm chốt, giữ nguyên UI/artwork/business flow.

## Nguồn và target

- HEAD/source commit: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.
- Workspace: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`; `target_kind=prototype`, HTML/CSS/JS trong `docs/flows/`.
- Đã đọc P08_Lich_su.md, Contract chung v2.0, BOARD_INDEX.csv của user và HANDOFF/DEV_PROPOSAL. Gallery mapping đã đối chiếu source `docs/index.html`, không dùng gallery22 mục. Không sửa gallery/dist/baseline.
- B08 do user cung cấp: [nguyên bản](baseline/B08.png), SHA256 `78aa9384caf3f2ed600ead4f1c8518a8c254fccaadc96d1e5c8483d5f4c67aa2`. File board ở đường dẫn design trong snapshot local không có; dùng đúng bản user đính kèm, không thay bằng ảnh board khác. Không xác nhận đã fetch lại ảnh remote.
- Số đo và quyết định trước code: [CONTEXT.md](CONTEXT.md). Snapshot tiến độ trước P08: [INPUT_RUN_STATE.json](INPUT_RUN_STATE.json).
- Working copy có sửa từ trước, không reset/clean/commit/push/merge/deploy. File warranty flow đã có sửa P02/P03/POSTED-history; giữ và mở rộng đúng dependency P08.

## Coverage

| Panel | Kết quả đã dựng | Bằng chứng |
|---|---|---|
| P08.S01 | Search phiếu/serial/người;5 tabs;date/status;sort;6 dòng đầu + tải thêm;48 fixture activities;back giữ query/category/sort/scroll | [Actual](evidence/P08-S01-494x1000.png) · [đối chiếu](evidence/comparison-S01.png) |
| P08.S02 | Đúng LS/document ID;copy;Thông tin/Timeline/Đính kèm;tick chỉ theo4 event seed;Gửi phiếu lên Web chưa ghi sổ | [Actual](evidence/P08-S02-494x1000.png) · [đối chiếu](evidence/comparison-S02.png) |
| P08.S03 | PQ-0001;actor/kho/start/end;19=18+1;5 dòng đầu/mở đủ19;P23 cùng model/ID;document result tách trạng thái phiên | [Actual](evidence/P08-S03-494x1000.png) · [đối chiếu](evidence/comparison-S03.png) |
| P08.S04 | Chọn ngày;grid12/6/4/3/5/30;drilldown đúng ngày/type;ngày08/09=8;ngày thiếu source không thành0 | [Actual](evidence/P08-S04-494x1000.png) · [đối chiếu](evidence/comparison-S04.png) |

[Xem 4 panel](evidence/P08-four-panels.png) · [Trang review](REVIEW.html) · [State acceptance](STATE_ACCEPTANCE.csv).

## Behavior / integration boundary

- **P08.A01–A05 PASS trên fixture**, không phải integration PASS. Search/date/status không đổi loại; unknown ID không fallback bản ghi đầu; NFC mở `NFC-B08-004`, ngày09/09/2026 11:05, HN12345; session mở `PQ-0001`, không dựng theo khoảng giờ. Browser Back và nút Back từ P22/P23 giữ context P08.
- Home Lịch sử/Xem tất cả vẫn đến hub P22. Hub thêm edge “Lịch sử chung”, “Hoạt động theo ngày”; “Nhập/xuất” trong app mở subview P08. Chỉ nối dependency, không nghiệm thu toàn bộ P22/P23.
- Một nguồn `shared/history-fixtures.js` dùng ở P08/P22/P23, gồm records/NFC events/sessions. NFC không đọc current tag state P07 để dựng audit. Không ghi WMS, không đổi tồn, không chứa auth token.
- Correction có trace: P23 PQ-0001 cũ5 lượt tra cứu → fixture B08 cùng ID19 lượt (18 accepted/1 duplicate). Quantity17 theo17 serial accepted×1; NFC accepted quantity0, duplicate quantity0. Không dùng quy tắc fixture làm contract production.
- Day aggregates tính trên tập fixture đầy đủ, activityId duy nhất, nhóm loại trừ nhau;09/09=30,08/09=8,07/09=6,06/09=4. Không từ page6 dòng. Production định nghĩa nhóm/counter và boundary ngày chưa chốt.
- Tab đính kèm hiển thị2 metadata seed nhưng không giả có file. P12/P18 chỉ thông báo pending với document context, không tự tạo route/API/upload/download.
- Loading/error/empty/unavailable tách biệt; retry chỉ đọc fixture. Filter dialog nằm trong app, focus trap/Escape/return focus; nav và header ổn định, chuột/bàn phím cuộn nội bộ, scrollbar ẩn. P03 vẫn một overlay; logout/Back không khôi phục nội dung protected.

## Kiểm tra thật đã chạy

| Lệnh | Kết quả / evidence |
|---|---|
| `node --check docs/flows/history/history.mjs` và `node --check docs/flows/warranty-components/flow.js` | PASS syntax |
| `node --test tests/*.test.mjs tests/*.test.cjs` | **110/110 PASS**, gồm6 test P08; [log](evidence/node-tests.txt) |
| `node scripts/check_history.cjs` | **11 nhóm PASS**,24 ảnh4 panels×6 viewport +4 ảnh runtime; JS errors0/external requests0; [results](evidence/browser-results.json), [metrics](evidence/render-metrics.json) |
| `HOME_EVIDENCE_DIR=handoff/P08/evidence/home-regression; node scripts/check_home.cjs` |14 nhóm PASS; [results](evidence/home-regression/browser-results.json) |
| `DIALOG_EVIDENCE_DIR=handoff/P08/evidence/dialog-regression; node scripts/check_dialogs.cjs` |14 nhóm PASS; [results](evidence/dialog-regression/browser-results.json) |
| `NFC_EVIDENCE_DIR=handoff/P08/evidence/nfc-regression; node scripts/check_nfc.cjs` |11 nhóm PASS; [results](evidence/nfc-regression/browser-results.json) |
| `NFC_MOTION_EVIDENCE_DIR=handoff/P08/evidence/nfc-motion; node scripts/check_nfc_motion.cjs` |PASS sóng infinite/foreground/reduced-motion/6 footer layouts/Home; [results](evidence/nfc-motion/results.json) |
| `python scripts/evidence_history.py` |4 crop/actual comparison + strip4 panels; hash source/baseline [manifest](evidence/source-sha256.json) |
| `git diff --check` |PASS; chỉ warning Git LF/CRLF, không whitespace error |

Env vars ở bảng là ký hiệu; PowerShell thực chạy `$env:NAME='path'`. Không có package.json ở gốc nên không bịa npm build/lint/typecheck. Test hash P01 trước đây khóa toàn file warranty flow không còn đúng khi P08 được phép nối hub; bỏ riêng hash flow đó, giữ nguyên hash auth/baseline và10 test behavior POSTED history. Lần test đầu103/104 fail đúng hash cũ, sau sửa test ràng buộc đúng phạm vi là110/110 PASS. Browser lần đầu phát hiện font shorthand Home làm tràn tabs, đã sửa CSS scope P08 và chạy lại toàn bộ P08. `failure.*` là artifact chẩn đoán lần đầu, không phải kết quả r01 cuối.

## Visual và khác biệt còn lại

- CSS shell494×950, scale đồng nhất theo Home; capture viewport494×1000,360×800,430×932,1440×900,340×420,1869×940;DPR1,zoom1;Arial local/system theo prototype hiện có. Tất cả24 capture không overflow ngang, content scroller không vượt nav.
- Đã xem trực quan4 actual và ảnh strip. B08 có khung365×840/statusbar giả; actual dùng shell user chốt, không thêm statusbar giả. Comparison giữ pixel tự nhiên, không resize méo baseline. Không có ngưỡng pixel-diff/font Designer hợp lệ: **visual IN_PROGRESS/review-needed**, không tự PASS/pixel-perfect.
- Font và SVG icon từ repo (box nét thay hộp3D, NFC sourced icon), header sạch không texture Designer; chi tiết màu/shape/font chưa tuyệt đối. Timeline/nhãn chờ Web được cập nhật nghiệp vụ có nguồn. Nav Lịch sử active thay Quét mã sai ngữ cảnh trong ảnh cũ. Nội dung dài cuộn trong, không ép toàn bộ extras vào một ảnh.
- Baseline unchanged. Không sinh ảnh/font/icon mới hoặc tải assets ngoài.

## Files thay đổi

Mới: `docs/flows/history/{index.html,history.mjs,history-model.mjs,style.css}`, `docs/flows/shared/history-fixtures.js`, `tests/history.test.mjs`, `scripts/check_history.cjs`, `scripts/evidence_history.py`, `handoff/P08/*`.

Nối dependency: `docs/flows/home/{home.mjs,home-flow.mjs}`, `docs/flows/auth-session/index.html`, `docs/flows/warranty-components/{flow.js,index.html}`, `tests/{auth-session-visual-contract.test.mjs,warranty-component-history.test.cjs}`. Cập nhật `SCREEN_COVERAGE.csv` đủ91 dòng baseline và `RUN_STATE.json`; P22.S01/P22.S03/P23.S04 ghi partial dependency, không chốt board sau.

## Phần còn chờ / cách xem

1. User nghiệm thu hình thức P08 r01. Exact font/icon Designer nếu cần mức khớp cao hơn.
2. DEV/BA chốt nguồn đọc history/NFC/session + scope quyền + định nghĩa aggregate/day; chưa coi DEV_PROPOSAL là API đã duyệt.
3. P12 chứng từ/P18 tệp nguồn chưa tích hợp. Hardware/backend production **NOT_RUN**.

Preview đang phục vụ tại `http://127.0.0.1:8766/flows/auth-session/` (`python scripts/serve_preview.py`). `minhanh / preview` → Bắt đầu ca → Lịch sử → Lịch sử chung. Công cụ P08 ngoài app mở nhanh4 panel. Source fixture được nạp lại khi reload; không lưu nghiệp vụ thật.
