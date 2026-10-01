# P03 — Dialog cố định · bàn giao prototype

**Cập nhật kích thước:** [Revision 08 — Quét mã kế thừa khung 494×950 của P02](REVISION_08.md). Thay chính sách khung P03 394px/cao theo viewport trước đây.

**Mới nhất:** [Revision 07 — xác minh và cập nhật trực tiếp tab preview](REVISION_07.md).

**Cập nhật 2026-09-27:** [Revision 06 — backdrop không điều hướng, footer có thể thao tác](REVISION_06.md). Chính sách backdrop S01/S02 và khóa footer mô tả bên dưới là lịch sử, đã được thay bằng chỉ thị mới trong revision 06.

**Mới nhất:** [Revision05 — sửa hai góc nền hở, giữ nguyên footer P02](REVISION_05.md).

**Bản sửa hiện hành:** [Revision 04 — dùng trực tiếp footer P02 LOCKED](REVISION_04.md), thay các chỉnh sửa footer riêng ở r02/r03. Backdrop vuông80% giữ nguyên.

**Bản sửa mới nhất:** [Revision 03 — lề/padding, backdrop vuông góc, footer và gutter 15px](REVISION_03.md). Xem evidence revision-03 cho kết quả hiện hành.

**Cập nhật hiện hành:** [Revision 02 — menu neo đáy, backdrop 80%, màu nút theo P01](REVISION_02.md). Chỉ thị mới thay các thông số hình thức tương ứng; nội dung bên dưới giữ làm lịch sử bàn giao ban đầu.

Đã triển khai đủ **4/4 panel P03** bằng HTML/CSS/JS tương tác và nối với P02. P02 được người dùng tạm chốt; lần này chỉ thay dependency trực tiếp của P03. **Behavior PASS trong prototype; visual FAIL/cần review; integration BLOCKED.** Không tuyên bố pixel-perfect hoặc backend thật.

## Nguồn và target

- Source commit thực tế: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target_kind=`prototype`.
- Workspace: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`.
- Contract v2.0, BOARD_INDEX, P03 người dùng cung cấp và HANDOFF hiện hành được đối chiếu. DEV_PROPOSAL không được chuyển thành API/quyền/enum production.
- B03 đính kèm **trùng byte** với ảnh tại commit trên. [Baseline bất biến](evidence/B03-reference.png), SHA256 `a13e65f782ac8f64048a1a3ea2dfe615a62cdb9c99076d8ba5cdefaeb0901caa`. Không dùng `01_dialog_fixed.png` thay baseline.
- File board không materialize trong sparse working tree; đọc bằng `git show`. Gallery public không mở được qua web tool; danh mục đúng board xác minh từ `docs/index.html:71` cùng commit. Không sửa gallery.
- [Quyết định và số đo trước code](CONTEXT.md). Kích thước app crop tham chiếu 394×692 CSS px, DPR1, zoom1; crop loại status bar OS/home indicator/caption, giữ mọi control app. Đo ảnh đều **estimated**.

## Phạm vi đã dựng

| Panel | Kết quả và hành vi | Visual | Behavior | Integration | Actual / đối chiếu |
|---|---|---|---|---|---|
| P03.S01 | Sheet bốn tác vụ, đóng về caller; truyền đúng operation/actor/kho; không chọn nghiệp vụ mặc định hoặc mở camera | FAIL | PASS | BLOCKED | [Actual](evidence/P03-S01-394.png) / [So sánh](evidence/comparison-S01.png) |
| P03.S02 | Tiếp tục giữ documentId, scanSessionId, version, codes. Lưu chờ xác nhận; lỗi giữ dữ liệu; timeout khóa retry mù và hỗ trợ điểm kiểm tra kết quả | FAIL | PASS | BLOCKED | [Actual](evidence/P03-S02-394.png) / [So sánh](evidence/comparison-S02.png) |
| P03.S03 | Kho dừng/UNKNOWN chặn route và save/discard/resume handler. Esc/backdrop không bỏ guard. Home/lịch sử vẫn dùng phiên hiện tại. Contact thiếu cấu hình báo rõ | FAIL | PASS | BLOCKED | [Actual](evidence/P03-S03-394.png) / [So sánh](evidence/comparison-S03.png) |
| P03.S04 | Quay lại/Esc giữ dữ liệu; xác nhận chỉ bỏ phần chưa lưu local fixture đúng actor/kho. Không xóa server-recorded/POSTED/UNKNOWN/nháp đã lưu | FAIL | PASS | BLOCKED | [Actual](evidence/P03-S04-394.png) / [So sánh](evidence/comparison-S04.png) |

[Tổng quan actual bốn panel](evidence/P03-actual-overview.png). [Ma trận nghiệm thu A01–A05](STATE_ACCEPTANCE.csv).

Một modal host/component dùng props/state chung, quản lý inert, focus trap và trả focus/scroll về caller. S01/S02 cho Esc/backdrop đóng; S04 Esc quay lại S02, backdrop không hủy; S03 không dismiss ngoài CTA. Khi đang lưu không đóng hoặc submit trùng. Safe area có CSS inset; màn hẹp/chiều cao giảm cho phép cuộn trong dialog và Tab đưa CTA vào vùng nhìn thấy.

Tab **Quét mã** của P02 nối S01 (hoặc S02 nếu có phiếu chưa lưu). CTA **Quét hoặc nhập mã sản phẩm** của Home vẫn giữ P06. P04/P05/P06/P09 nhận context nhưng chưa có scanner tích hợp; đích báo dependency. P21 hiện có là prototype resume linh kiện ở namespace riêng, không nhận bừa phiếu nhập `PN-0001` và không giả lập tiếp tục sang phiếu khác. Điểm nối P15 trạng thái nguồn live vẫn chờ; không triển khai thêm board.

## File đã thêm/sửa

- Thêm `docs/flows/scanner-dialogs/{dialog-flow.mjs,fixture-adapter.mjs,dialogs.mjs,icons.mjs,style.css}`.
- Sửa dependency `docs/flows/home/home.mjs`, `home-flow.mjs`: mount/dispose dialog, tab quét, context, runtime warehouse guard; P01 vẫn kiểm kho/quyền trước khi bắt đầu phiên.
- `docs/flows/auth-session/index.html`: thêm duy nhất stylesheet P03. CSS/auth controller/adapter/icon P01 giữ nguyên.
- Thêm `tests/scanner-dialogs.test.mjs`, `scripts/check_dialogs.cjs`; cập nhật `scripts/check_home.cjs` để giữ kiểm tra route cũ và xuất evidence hồi quy riêng. Tab scanner mới được kiểm ở script P03.
- Hồ sơ `handoff/P03/`, `handoff/P02/P03_DEPENDENCY_UPDATE.md`, `SCREEN_COVERAGE.csv`, `RUN_STATE.json`.

Các thư mục P01/P02 và scripts/tests vốn đang untracked từ trước vẫn được giữ. Thay đổi có trước tại `docs/flows/warranty-components/flow.js` không bị sửa; `git diff --stat` chỉ liệt kê file tracked này, không phải thống kê toàn bộ thay đổi P03. Không sửa dist/assets/ảnh baseline, không push/merge/deploy.

## Kiểm tra đã chạy

```powershell
python scripts/serve_preview.py
node --test tests/*.mjs tests/*.cjs
node scripts/check_dialogs.cjs
$env:HOME_EVIDENCE_DIR = 'handoff/P03/evidence/home-regression'
node scripts/check_home.cjs
python handoff/P03/compare_reference.py
```

- **47/47 tests Node PASS**: 33 hồi quy có trước + 14 test P03, bao gồm timeout thật bằng timer, receipt sai phiếu/phiên, phản hồi muộn sau dispose/mất auth. [Output thật](evidence/test-output.txt).
- **13 nhóm trình duyệt P03 PASS**, 21 captures. [Kết quả](evidence/browser-results.json), [metrics](evidence/render-metrics.json). Không page errors, external requests hay yêu cầu camera trong lần chạy cuối.
- **14 nhóm hồi quy Home PASS**, 7 captures riêng. [Kết quả](evidence/home-regression/browser-results.json). Kiểm P01→P02, P22, ba ID chứng từ, scroll/focus, phiên/quyền/UNKNOWN, logout/Back.
- Ma trận P03: 394×692 reference, 360×800, 430×932, 1440×900, 394×420 mô phỏng chiều cao bàn phím. CTA cuối không cần scroll ở reference; viewport thấp kiểm Tab/cuộn đưa control hoàn toàn vào dialog. Bàn phím/thiết bị thật: **NOT_RUN**.
- Không package.json/lệnh build/lint production có sẵn ở target này; không bịa kết quả build.

Khi review actual lần đầu phát hiện style `.primary` của P01 gây nút P03 cao quá và cắt Hủy. Đã đổi sang class P03 riêng, bổ sung assertion toàn bộ CTA baseline nhìn thấy, rồi chạy lại. `evidence/home-regression/browser-failure.json`/`failure.png` nếu có là log lần chạy cũ lỗi selector hai summary; selector đã sửa, kết quả hiện hành là `browser-results.json`. Không dùng log cũ để chứng minh PASS.

## Sai khác và giới hạn còn lại

- **Visual FAIL:** B03 chưa có font/icon/texture source chính xác; dùng Arial hệ thống, SVG có nguồn repo và CSS màu/gradient estimated. So sánh thấy khác typography, icon scan/hand/box, nền texture và vài px spacing. Bố cục/control/thứ tự CTA đã dựng; chưa có ngưỡng pixel nghiệm thu được duyệt, không resize/mask baseline hoặc tự đặt PASS. [Điều kiện đối chiếu](evidence/baseline-comparison.json).
- **Integration BLOCKED:** adapter chỉ lưu trong bộ nhớ tab, namespace `hn-scanner-dialog-preview-v1`. Đóng/reload tab không khôi phục draft; đây không phải persistence production. Không gọi API ghi/DELETE, không gửi thông báo, không đổi tồn hay quyền.
- Đang thiếu nguồn live trạng thái kho, API lưu/kiểm tra kết quả, contract hủy/quyền server, kênh quản trị; P04/P05/P06/P09/P21/P15 chưa nối với luồng này. Các trường/tên kết quả nội bộ fixture không phải đề xuất schema production.

Ba nhóm đầu vào cần khi tích hợp tiếp: (1) API lưu/check/cancel đã duyệt và quyền/phạm vi xóa; (2) nguồn trạng thái kho và kênh liên hệ quản trị đã cấu hình; (3) font/icon/texture source chính xác hoặc quyết định visual review B03. Các thiếu hụt này không ngăn phần prototype độc lập đã hoàn thành.

## Mở preview

[Preview local](http://127.0.0.1:8766/flows/auth-session/) → `minhanh` / `preview` → xác nhận phiên → tab **Quét mã**. Để xem đủ bốn trạng thái, mở **Kịch bản kiểm tra P03 · 4 panel** ở khối công cụ ngoài app. Kịch bản S03 đặt kho dừng; dùng selector ngoài app để khôi phục trạng thái fixture. Không tự chuyển sang P04–P24.
