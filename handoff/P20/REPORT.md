# P20 r01 — lịch sử linh kiện

Revision mới nhất: [P20 r03 — audit và sửa14 ca lỗi](REVISION_03.md) · [Review trước–sau](REVIEW_03.html). Báo cáo r01 bên dưới được giữ làm lịch sử.

## Kết quả và phạm vi

Đã triển khai đủ P20.S01–S04, giữ disposition CURRENT và ID. UI nhúng vào ứng dụng hiện tại, mở từ P09/tab Linh kiện; context và action sang P19 giữ đúng case ID, tiếp tục đúng draft đang có. Dữ liệu POSTED từ nguồn chung P09 và receipt được P19 xác minh trong phiên preview. Không thay footer Home/P03, không sửa dist/gallery/ảnh baseline, không push/merge/deploy.

User tạm chốt P19 r03 ngày2026-09-29, state đồng bộ bổ sung sau; ghi riêng khỏi trạng thái production. P20 hình thức chờ review, không suy nghiệm thu từ số test.

Source HEAD thực tế và baseline: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Target `prototype`; thư mục `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Nhiều module đang untracked/dirty của các chat trước đã được giữ. Không có package.json gốc: không bịa lệnh build/lint.

Nguồn: [design trace/số đo trước code](DESIGN_TRACE.md), contract2.0, P20 prompt, BOARD_INDEX, AGENTS/UI_STANDARD, HANDOFF; DEV_PROPOSAL không được nâng thành backend contract. [Baseline](../../design/01_Main/BOARDS/02_NEW_BOARDS/18_lich_su_linh_kien.png), [review4panel](REVIEW.html), [ảnh trước P09](evidence/revision-01/before/P09-parts-494x950.png).

## Coverage và hành vi

| Panel | Nội dung | Actual | Visual / behavior / integration |
|---|---|---|---|
| P20.S01 | Context, phiếu theo nhóm SKU, quantity và số mã riêng, count phiếu đã tải | [S01](evidence/revision-01/after/P20-S01-494x950.png) | IN_PROGRESS / PASS / BLOCKED |
| P20.S02 | Phiếu cũ giữ DOM, skeleton cuối, request đơn, giữ scroll/focus | [S02](evidence/revision-01/after/P20-S02-494x950.png) | IN_PROGRESS / PASS / BLOCKED |
| P20.S03 | Lỗi inline, dữ liệu cũ còn, retry cùng cursor | [S03](evidence/revision-01/after/P20-S03-494x950.png) | IN_PROGRESS / PASS / BLOCKED |
| P20.S04 | Empty chỉ sau successful fetch; draft/unknown không thuộc POSTED | [S04](evidence/revision-01/after/P20-S04-494x950.png) | IN_PROGRESS / PASS / BLOCKED |

P20.A01–A05 PASS fixture: dedup document ID không cộng quantity; retry đúng cursor; lọc POSTED/case; khóa tải liên tiếp; closed chỉ đọc và kết thúc theo hasMore explicit. Không suy hết trang từ số phần tử. Guard actor/kho/authSession/permission trước và sau await; hủy/bỏ response khi đổi case/rời trang. Nguồn lỗi lần đầu không hiện0 hay empty. Trường quantity chưa biết hiện Chưa xác minh. Phiếu dở/UNKNOWN chuyển về owner P19, không tạo phiếu bù/retry ghi.

## Kiểm chứng thực chạy

- `node scripts/test_p20_logic.cjs`: **96/96 PASS**, gồm24 test mới P20 và hồi quy P19/P09/Home/prototype cũ. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_p20.cjs`: **7 nhóm PASS**. [Results](evidence/revision-01/after/results.json).
- `node scripts/check_p20_edges.cjs`: **5 nhóm PASS**, first-error, stale-case, keyboard/Back, draft→receipt P19, text250/2000+/Unicode/newline/HTML/reader/backdrop/Escape/focus. [Results](evidence/revision-01/edges/results.json).
- `node scripts/check_p20_layout.cjs`: **20 tổ hợp4panel×5viewport PASS**.494×950,360×800,430×932,1440×900,340×420; app luôn494×950 đồng nhất, header86/footer103, nội dung cuộn, không overflow ngang. [Metrics](evidence/revision-01/layout/metrics.json).
- `node scripts/run_p20_regression.cjs`: **9 nhóm P19 PASS**,20layout. Chỉ đổi thư mục evidence của suite hiện có, không đổi assertion. [Results](evidence/revision-01/p19-regression/results.json).
- `WARRANTY_NAVIGATION_EVIDENCE_DIR=handoff/P20/evidence/revision-01/p09-navigation node scripts/check_warranty_navigation.cjs`: **11 nhóm PASS**. [Results](evidence/revision-01/p09-navigation/navigation-results.json).
- `HOME_FOOTER_EVIDENCE_DIR=handoff/P20/evidence/revision-01/footer node scripts/check_home_footer_locked.cjs`: **4viewport PASS**; Home/P03 style khóa đồng nhất.
- `git diff --check`: exit0. Module mới được thực thi bởi Node/browser; không có build app production trong repo này.

Ảnh actual DPR1, local Public Sans, timezone Asia/Ho_Chi_Minh, reduced motion, browser zoom100%. Đã xem trực quan bốn panel và reader. B20 khác reference/frame/platform theo user-change nên không kéo méo để raster-diff, không tuyên bố pixel-perfect. Quyết định trang P20 riêng/link P09 và sizing reuse P19 được ghi là implementation choice cần review.

Trong vòng kiểm đã sửa: plus icon ban đầu fallback sai; tách class tools P20 khỏi selector P19; mất focus sau disable; scroll bị clamp khi error→loading làm giảm chiều cao; reader serial dài bị bó hẹp. File failure.json có thể còn từ lần chạy trước, là evidence audit; kết quả cuối dùng results.json. Một lỗi test locator tính cả dialog Home đang đóng đã sửa thành `[open]`, không phải app chồng overlay.

## File thay đổi

- Mới: `docs/flows/warranty-components/history-model.mjs`, `history-fixture.mjs`, `history-view.mjs`, `history.css`.
- Nối trực tiếp: `docs/flows/home/home.mjs`, `home-flow.mjs`, `docs/flows/warranty/warranty.mjs`, `docs/flows/auth-session/index.html`.
- Test/evidence: `tests/component-history.test.mjs`; `scripts/capture_p20_before.cjs`, `check_p20.cjs`, `check_p20_edges.cjs`, `check_p20_layout.cjs`, `run_p20_regression.cjs`, `test_p20_logic.cjs`; `handoff/P20/*`, coverage/RUN_STATE. P19 RUN_STATE chỉ ghi nhận user tạm chốt, không sửa source P19.

## Giới hạn và bàn giao

Production **BLOCKED**: chưa có hợp đồng đọc lịch sử được xác minh về endpoint/envelope, immutableID, cursor/sort/scope và quyền. Read-port nội bộ không phải API đề xuất được duyệt. Demo B20 có page overlap riêng; nguồn app thường không thêm phiếu giả để hiện Tải thêm. Không thay đổi tồn hoặc đóng hồ sơ. Hardware/virtual keyboard trên thiết bị thật NOT_RUN. Phiếu preview chỉ giữ trong bộ nhớ trang, reload mất dữ liệu.

P21/P23/P24 chưa triển khai đầy đủ; P20 không tự mở rộng nghiệp vụ các owner đó. Không có blocker cản review UI hiện tại. Bước tiếp: user review P20 r01; khi có backend contract thật, nối adapter và kiểm server scope/pagination/POSTED. Giữ toàn bộ revision mới của các chat khác.
