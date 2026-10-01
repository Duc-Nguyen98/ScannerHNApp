# P23 r03 — rà soát UI/UX và khắc phục
Ngày 30/09/2026 · User yêu cầu rà soát kỹ và sửa lỗi còn lại · Contract v2.0.

## Kết quả
**13 lỗi tái hiện được đã sửa.** Bộ audit 14 ca đạt sau sửa; A10 (đổi nguồn không mang cuộn cũ) đã đạt trước sửa, không tính là lỗi đã khắc phục. Hình thức **AWAITING_USER_REVIEW**; hành vi **PASS_PROTOTYPE**; integration **BLOCKED_PRODUCTION**. Không tuyên bố app không còn mọi lỗi hoặc production đã được nghiệm thu.

## Lỗi trước–sau
| Ca | Trước sửa | Khắc phục |
|---|---|---|
| A01 | Gõ từ khóa rồi Hủy bộ lọc: danh sách vẫn là kết quả cũ | Đồng bộ truy vấn đang chờ trước khi mở picker; Hủy không đổi ngày. |
| A02 | Đang lọc ngày nhưng nút lọc không có dấu/nhãn trợ năng | Dấu lọc và aria-label cập nhật tại adapter P23. |
| A03 | Tải lại chi tiết làm rơi focus ngay khi bắt đầu đọc | Giữ toolbar/footer trong DOM; aria-disabled chặn thao tác lặp nhưng giữ focus. |
| A04 | Đang đọc rồi focus Back dưới: kết quả trả về chuyển sang Back trên | Định danh focus bằng selector và vị trí, không chỉ tên action. |
| A05 | Đóng reader sau khi nguồn trả về làm mất focus nút Xem đầy đủ | Hoãn repaint dưới overlay; lấy focus lúc thực sự repaint, khôi phục sau khi reader được tạo lại. |
| A06 | Phiên nhập chưa xác minh vẫn ghi “Phiếu đã gửi” | Nhãn theo kết quả đã xác minh, không suy từ kết thúc phiên. |
| A07 | Tên sự kiện/giờ dài liền mạch tràn timeline | Wrap và reader chung 3/2 dòng; giữ nguyên raw string; nhóm thời gian/reader không chen vào tên người. |
| A08 | Event null làm crash màn chi tiết | Bỏ phần tử không có ID hợp lệ; giữ sự kiện có ID, không tự bịa sự kiện. |
| A09 | Back từ hồ sơ liên kết ghi về danh sách nhưng thực tế về phiên | Nhãn theo caller đã xác minh trong journey. |
| A11 | Debounce xóa DOM thẻ đang focus | Khôi phục thẻ theo ID sau repaint; không giành focus ngoài module. |
| A12 | Dòng từ chối/đọc trùng vẫn hiện lượng linh kiện như đã xuất | Chỉ trình bày lượng ở dòng accepted của phiên đã xác nhận xuất. |
| A13 | Nguồn trả về làm mất focus reader của mã gốc | Khôi phục đúng reader theo event ID; sự kiện bị bỏ thì về heading. |
| A14 | Áp dụng ngày từ nút ngày nhưng focus quay sang icon lọc | Ghi nhận và trả về đúng nút gọi picker. |

Mỗi ca có dữ liệu kiểm chứng tại [before/audit.json](evidence/revision-03/before/audit.json) và [after/audit.json](evidence/revision-03/after/audit.json). Ảnh cùng ca trong hai thư mục; ca crash có thể không có ảnh màn P23 vì màn không render được. Bản ghi A13 trước sửa đã chạy lại riêng sau lỗi timeout khởi tạo trang; kết quả tái hiện cuối là mất focus, không tính timeout test harness làm lỗi app. A11 điều khiển input+focus cùng một lượt JS để debounce không chạy trước bước tái hiện.

## Kiểm thử
- **149/149 test logic**, gồm **37 P23** (19 model +10 experience +8 r03).
- **67 nhóm trình duyệt**: P23 chính9 + cạnh biên7 + UX r02 8 + audit r03 14 + guard mới4 + P22 7 + P20 7 + P09 11.
- **50 tổ hợp layout P23**:20 cơ bản +10 nội dung dài r01 +10 controls/liên kết r02 +10 heading/ID dài r03, trên5 viewport.
- **4 viewport footer Home/P03** đạt. Kiểm riêng glyph Back trong ảnh raster của4panel: có nét trắng trong vùng icon; không sửa CSS header vì nghi ngờ ban đầu không tái hiện thành lỗi.
- Kiểm gửi đọc trùng khi busy (chuột/Enter), focus mới ngoài app, event reader bị xóa, raw text Unicode/2000+, Back/Escape/picker/IME, timeout15s/cache và logout.
- Syntax các module thay đổi và `git diff --check` đạt. Handoff verifier kiểm 24board/91panel, links, counts và các bản ghi revision P23 trước; cập nhật global state bằng patch riêng các trường P23, giữ công việc chat khác.

Lệnh:
```text
node scripts/audit_p23_r03.cjs after
node scripts/check_p23_r03_guards.cjs
node scripts/check_p23_r03_header.cjs after
node scripts/run_p23_r03.cjs logic
node scripts/run_p23_r03.cjs check_p23.cjs
node scripts/run_p23_r03.cjs check_p23_edges.cjs
node scripts/run_p23_r03.cjs check_p23_r02.cjs
node scripts/run_p23_r03.cjs check_p20.cjs
node scripts/run_p23_r03.cjs check_warranty_navigation.cjs
node scripts/run_p23_r03.cjs check_p22.cjs
node scripts/run_p23_r03.cjs check_home_footer_locked.cjs
node scripts/verify_p23_r03.cjs
```
Wrapper chỉ đổi đường evidence/selector chờ aria-disabled; không bỏ assertion nghiệp vụ. Evidence r01/r02 giữ nguyên.

## Phạm vi và nguồn
Chỉ sửa adapter `warranty-session-view.mjs`, `warranty-session-model.mjs`, `warranty-session-experience.mjs`, CSS P23; thêm test/script/evidence/handoff. Không sửa owner P09/P19/P20, shared picker/reader/dialog implementation, baseline hoặc dist/gallery. Giữ khung494×950, 4ID panel, footer Home/P03. [Nguồn/quyết định](REVISION_03_CONTEXT.md); [B23 gốc](evidence/revision-01/baseline/B23.png). Hình r03 là sửa trong adaptation r02 được cho phép, chưa tự trở thành baseline Designer đã duyệt.

## Giới hạn
Fixture test không chứng minh production. Nguồn phiên/event thực, backend permission/cursor/retention, thiết bị và lưu bền chưa xác minh. Phiên quét mặc định chưa có nguồn; opt-in mẫu ngoài app. UNKNOWN không retry Post; timeout15s chỉ đọc. Dữ liệu bộ nhớ mất khi reload/đăng xuất. P22 r03 vẫn tạm chốt, state đồng bộ bổ sung sau; P24 chưa hoàn tất. Không push/merge/deploy.

## Mở review
[Review trước–sau](REVIEW_03.html) · [Preview r03](http://localhost:8766/flows/auth-session/?v=p23-r03).
`minhanh / preview` → xác nhận phiên → Lịch sử → Bảo hành/Phiên quét; chọn **Mẫu B23** ngoài khung app.
