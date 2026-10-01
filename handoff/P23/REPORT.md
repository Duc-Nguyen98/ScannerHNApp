# P23 r01 — Bảo hành & phiên quét

Đã triển khai đủ **P23.S01–S04** trong app preview. **Visual: AWAITING_USER_REVIEW · Behavior: PASS_PROTOTYPE · Integration: BLOCKED_PRODUCTION.** User đã tạm chốt P22 r03; state đồng bộ bổ sung sau. Không coi kết quả test là nghiệm thu hình thức.

[Review trước–sau](REVIEW.html) · [Nguồn/số đo trước sửa](DESIGN_TRACE.md) · [Acceptance](STATE_ACCEPTANCE.csv).

## Nguồn, target và phạm vi

- HEAD thực tế và baseline: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working copy có thay đổi P01–P22, được giữ nguyên. Target **prototype**, HTML/CSS/JS tại `docs/flows/`; không có bước build/package riêng cho module này.
- Nguồn: prompt P23, Contract2.0, BOARD_INDEX, ảnh B23, AGENTS/UI_STANDARD, HANDOFF. DEV_PROPOSAL không được coi là API đã duyệt.
- [Baseline B23 user cung cấp, sao chép nguyên bản](evidence/revision-01/baseline/B23.png). Đường dẫn design ghi trong manifest không có file ở working copy này, vì vậy review dùng đúng file đính kèm; đã so SHA256 nguồn/copy trùng nhau. Không sửa baseline/dist/gallery; không push/merge/deploy.

## Panel và nghiệm thu

| Panel | Đã làm | Evidence |
|---|---|---|
| S01 Lịch sử bảo hành | Search case/serial; Tất cả/Đang kiểm tra/Đã trả khách; ngày mặc định tất cả; đọc cùng owner P09 | [Actual](evidence/revision-01/after/S01-494x950.png) |
| S02 Quá trình hồ sơ | Timeline từ event ID, actor/time/note; không suy từ status; closed read-only; link đúng case P20 | [Actual](evidence/revision-01/after/S02-494x950.png), [Closed](evidence/revision-01/after/closed-case.png) |
| S03 Lịch sử phiên | Nguồn riêng, mặc định unavailable, mẫu B23 opt-in; nhóm ngày/count đã tải; các loại độc lập | [Actual](evidence/revision-01/after/S03-494x950.png), [Unavailable](evidence/revision-01/after/unavailable.png) |
| S04 Chi tiết phiên | Exact session/event IDs; accepted/rejected/duplicate/issued quantity riêng; thiếu dữ liệu không thành0 | [Actual](evidence/revision-01/after/S04-494x950.png), [Missing](evidence/revision-01/after/missing.png) |

P23.A01–A05 **PASS trong prototype**: BH001/002 đúng timeline, PQ0003 có2 mã/3 linh kiện, PQ0002 chờ Web, PQ0001 tra cứu không có phiếu kho; ID lạ không fallback; thiếu nguồn không tạo dữ liệu giả; Back giữ filter/scroll/focus; hồ sơ đóng không xuất thêm. A04 production vẫn BLOCKED vì chưa có schema/nguồn thực để tích hợp.

## Kết quả chạy thật

- `node scripts/regression_p23.cjs logic`: **131/131 test**, gồm **19 test P23**. [Log](evidence/revision-01/regression/logic.txt).
- `node scripts/check_p23.cjs`: **9 nhóm** (gồm matrix layout). [Results](evidence/revision-01/after/results.json).
- `node scripts/check_p23_edges.cjs`: **7 nhóm** (gồm matrix dài), picker Apply/Cancel/Reset/bounds ngày VN, Back/scroll, IME + response muộn, timeout/cache, Unicode/2000+, logout/Back. [Results](evidence/revision-01/edges/results.json).
- Hồi quy qua `node scripts/regression_p23.cjs <script>`: `check_p22.cjs` **7 nhóm**; `check_p20.cjs` **7 nhóm**; `check_warranty_navigation.cjs` **11 nhóm**; `check_home_footer_locked.cjs` **4 viewport**. Log JSON dưới [regression](evidence/revision-01/regression/).
- Tổng **41 nhóm trình duyệt** gồm nhóm matrix; không cộng lại từng tổ hợp thành nhóm. P23 **30 tổ hợp layout**:20 panel +10 nội dung dài; P22/P20 có ma trận hồi quy riêng. Không pageerror trong các lượt PASS. Syntax checks Node đạt cho model/view/Home.
- Capture actual trước–sau viewport494×950 CSSpx, DPR1, browser zoom mặc định, font Public Sans local; frame494×950 được co đồng nhất tại360×800/430×932/1440×900/340×420. Edge clock30/09/2026, timezone Asia/Ho_Chi_Minh. B23 nguyên bản390×844 khác frame đã khóa; không kéo méo ảnh hoặc tuyên bố pixel-perfect. Đã xem trực quan bốn panel và các ảnh nội dung dài/reader.

Lượt đầu phát hiện Xóa lọc chưa xuất hiện khi query đổi và rủi ro thay DOM ô nhập khi nguồn trả về; đã sửa và chạy lại. Edge harness ban đầu thiếu chờ Home, cố click nút Apply đã disabled và kỳ vọng nhãn lỗi không đúng; sửa harness, không tính thành lỗi app. `failure.json` lưu dấu vết lần chạy cũ, `results.json` là lượt hoàn tất.

## Thay đổi và khác biệt còn lại

Module mới: `history/warranty-session-model.mjs`, `warranty-session-fixture.mjs`, `warranty-session-view.mjs`, `warranty-session.css`. Nối trong `home/home.mjs`, `history/embedded-history.mjs`, stylesheet entry `auth-session/index.html`. Dùng lại controls/picker/dialog/reader/icon, không sửa implementation shared hoặc footerLOCK. Thêm19 logic tests, capture/main/edge/regression scripts và handoff. Cập nhật UI_STANDARD, P22 temporary acceptance, coverage/RUN_STATE.

- Bảo hành hiện có8 hồ sơ từ owner P09, timeline BH001 gồm sự kiện xuất linh kiện có thật trong fixture; không ép về2 thẻ/2event của B23. Đây là khác biệt dữ liệu, không copy hồ sơ riêng.
- `PQ-0001` legacy P08 là fixture nhập khác B23 tra cứu. Route P08 generic giữ nguồn cũ; chỉ business-specific routes/hub sang P23. B23 tách namespace và không dùng fallback ID. Không coi hai fixture cùng mã là cùng entity.
- Mẫu PQ0002/PQ0001 chỉ có số tổng trong B23, không có danh sách event gốc: hiện rõ chưa cung cấp chi tiết, không bịa12/5event cho đủ UI.
- Dock search/date/count, tải lại, trạng thái nguồn/missing và dòng trạng thái phiên/duplicate là adaptation từ component hiện hữu, chờ user review. Nội dung dài cuộn trong app; header/footer ổn định.

## Blocker và bước tiếp

Backend session/event schema, mapping result POSTED/RECORDED, quyền đọc, cursor/page completeness và retention chưa xác minh. Adapter hiện tại chỉ là presentation/preview, không gọi endpoint đề xuất. Cần DEV cung cấp contract và nguồn đọc thật trước tích hợp; không tự chốt API. Read timeout15giây chỉ cho nguồn đọc, không áp Post. Camera/NFC/clipboard/keyboard thiết bị thật NOT_RUN. Preview giữ bộ nhớ trang; reload/logout mất dữ liệu. P24 chưa triển khai, không tuyên bố hoàn tất toàn app.

Preview: http://localhost:8766/flows/auth-session/?v=p23-r01 — `minhanh / preview` → Lịch sử → Bảo hành hoặc Phiên quét. Muốn xem B23, chọn **Mẫu B23** ở bộ mô phỏng P23 ngoài khung app. P23 r01 chờ user review hình thức.
