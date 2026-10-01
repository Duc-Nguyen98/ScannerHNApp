# P04 r08 — nâng cấp thao tác nhập kho đã được user yêu cầu

Triển khai29/09/2026 theo yêu cầu áp dụng đề xuất:4 ưu tiên và2 hỗ trợ (nhận biết lượt quét/nháp). Target vẫn prototype; source HEAD da9f623. [Nguồn và lựa chọn hình thức trước code](UPGRADE_08_DESIGN_TRACE.md). Giữ4 panel, shell494×950, footer chung, icon/dialog/readable contracts hiện hành. Không sửa baseline hay nghiệp vụ ghi sổ.

## Đã làm

1. **Nhập lượt mới** ngay trên S04, hoặc ở S03 sau thất bại đã xác định. Chỉ terminal recorded/not-recorded mới tạo lượt; busy/UNKNOWN/nháp bị chặn ở controller, không chỉ ẩn nút. Lượt cũ đưa vào finishedRuns để P12 vẫn đọc được; request/session/document mới riêng, không gửi thêm lệnh và không mang filter/note/UI cũ. Nút double-click không tạo hai draft vì lần thứhai đã là draft. Xem chứng từ và Home vẫn còn ở hàng phụ tại kết quả.
2. **Ngữ cảnh phiếu tại S02:** mã phiếu, loại nhập, NCC, nút Chi tiết mở đúng shared action feedback. Nội dung dài có shared reader, Back/Escape đóng dialog trước; không chồng overlay. Không đưa token/ID nội bộ vào phần hướng dẫn thao tác thường.
3. **Lọc bằng bộ đếm:** Tất cả/Hợp lệ/Trùng/Lỗi, aria-pressed rõ; bộ đếm luôn lấy toàn bộ attempts, danh sách lọc chỉ là presentation. Tổng quantity/review/accepted/request không đổi. Xem tất cả/Thu gọn hoạt động trên nhóm đang xem; nhóm rỗng có đường về tất cả. Filter giữ qua review/back nhưng reset khi tạo lượt mới.
4. **Xem serial theo SKU:** chạm card review mở/thu danh sách riêng của SKU đó, hiển thị quantity từng mã và tổng. Chỉ accepted vào nhóm, duplicate không xuất hiện lần hai. Serial lấy từ field do fixture validation cung cấp; không suy raw QR/BOX thành serial. Nếu nguồn chỉ có mã quét chưa có serial, hiển thị mã và Chưa có serial; serialCount tách khỏi quantity. Không thêm API/enum production; P12 adapter hiện hành được kiểm hồi quy riêng.
5. **Mã gần nhất:** nhãn Gần nhất và viền/nhấn nền trung tính trong1,8giây, không loop; reduced-motion tắt animation. Không thêm success toast hoặc banner kết quả trái contract; status hợp lệ/trùng/lỗi vẫn có chữ/màu riêng. Giữ focus ô nhập để quét liên tiếp, raw sai/trùng giữ để sửa.
6. **Tiếp tục phiếu dở:** khi rời rồi mở lại, thẻ ngữ cảnh hiện Tiếp tục phiếu dở và số mã đang giữ. Không reset/cấp phiếu mới khi chưa kết thúc, không thêm thao tác bỏ dữ liệu. Persistence vẫn ở bộ nhớ phiên, không giả lưu bền.

## Kiểm tra thực tế

- `node --test tests/inbound.test.mjs tests/documents.test.mjs`: **45/45 PASS** (31 P04 +14 P12),5 tests nâng cấp mới. [Log](evidence/revision-08/node-regression.txt). Kiểm direct newRun guards/archive/new IDs/no side effect, filter purity/counts/order, SKU/count không suy raw, P12 vẫn đọc đúng phiếu cũ sau newRun.
- `node scripts/check_inbound_upgrade.cjs`: **10 nhóm PASS**,6 viewport. [Kết quả](evidence/revision-08/qa/results.json). Context Back/backdrop/Tab/focus; empty/filter/unchanged payload; reduced motion; serial groups; thành công/lượt mới; nháp; UNKNOWN/đối chiếu; thất bại/lượt mới; shell/CTA.
- `node scripts/check_inbound_upgrade_long.cjs`: **2 trường hợp PASS**,NCC dài250 và2100 ký tự (newline/Unicode/từ liền/HTML literal), source được route-mock trong browser test riêng. [Kết quả](evidence/revision-08/long-content/results.json). Reader full string đúng, Back/focus, popup/footer trong app; không sửa catalogue thật để hợp thức hóa ảnh.
- `DIALOG_SYNC_MODULE=p04 DIALOG_SYNC_BASE=http://127.0.0.1:8774 DIALOG_SYNC_EVIDENCE_DIR=handoff/P04/evidence/revision-08/dialog-regression node scripts/check_inbound_outbound_dialog_sync.cjs`: **9 nhóm PASS**,30 layout cases. [Kết quả](evidence/revision-08/dialog-regression/browser-results.json). Validation, dialog lỗi/UNKNOWN, không cuộn nền, kết quả ngắn vừa khung, Xem chứng từ P12/Back giữ exact result.
- Tổng **21 nhóm/case browser PASS**, không pageerror ở các lần đạt. Viewports340×420,390×844,494×1000,768×1024,1440×1000,1869×940. Không báo toàn repo PASS vì nhiều module đang được sửa đồng thời; chỉ chạy các suite liên quan.
- Test mới lượt đầu selector `.hn-action-dialog` gặp cả dialog tên Home đang đóng; scope `[open]` đúng dialog đang tương tác rồi rerun đạt. Log failure cũ được giữ, không dùng làm evidence PASS.

## Hình ảnh trước–sau và giới hạn visual

[Before494](evidence/revision-08/before/S02-494x1000.png) / [After494](evidence/revision-08/after/S02-494x1000.png), [Before390](evidence/revision-08/before/S02-390x844.png) / [After390](evidence/revision-08/after/S02-390x844.png). Có8 before +8 after cho đủ4panel×2viewport cùng fixture/DPR. [Thông số before](evidence/revision-08/before/metrics.json), [after](evidence/revision-08/after/metrics.json).

Các nhánh: [lọc trùng](evidence/revision-08/qa/02-filter-duplicate.png), [lọc lỗi](evidence/revision-08/qa/02-filter-invalid.png), [SKU mở](evidence/revision-08/qa/03-serials.png), [kết quả/new run](evidence/revision-08/qa/04-completed.png), [nháp](evidence/revision-08/qa/05-resume.png), [thất bại](evidence/revision-08/qa/06-failed.png), [nội dung dài](evidence/revision-08/long-content/context-2100.png).

Đây là **adaptation theo chỉ thị user**, chưa có baseline Designer cho context/filter/disclosure/new CTA. Không tự gán visual PASS dựa vào test. Các source font/icon/ảnh B04 còn sai khác như báo cáo trước. Progress-stepper chung thay đổi đồng thời được giữ, không nhận công là phần r08 tự thiết kế. Không sửa CSS/footer/luồng module khác.

## File và bàn giao

- `inbound/inbound.mjs`, `style.css`, `inbound-flow.mjs`, `fixture-adapter.mjs`; thêm `scan-view.mjs` presentation. Tái dùng counter/card đang có, shared action-feedback và readable-text; không tạo controller dialog/Back mới.
- Tests P04, scripts capture/upgrade/long; version import entry/bootstrap/app/home để lần tải mới nhận đúng P04. Giữ các thay đổi Home/P05/P12 đang có.
- Lưu RUN_STATE riêng P04, cập nhật field revision P04 trên checkpoint chung, giữ prompt đang làm của task khác và đủ panel IDs. Không push/merge/deploy.

Behavior đạt trong fixture; visual chờ user review; backend/camera/lưu nháp bền vẫn chưa xác minh. Nhập linh kiện/Khác chưa có quy tắc catalogue production riêng, không tự đổi sang Post hoặc tạo tồn. Đóng/reload tab vẫn mất nháp fixture như trước; không tự reload tab đang làm của người dùng.
