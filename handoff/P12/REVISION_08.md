# P12 r08 — thiết kế lại form tạo và sửa footer chọn nhà cung cấp

Đã triển khai theo feedback user2026-09-29. Giữ P12.S04, nghiệp vụ/phiếu dở/giới hạn ghi chú200 và owner P04/P05/P09. **Visual mới chờ review**, behavior đã kiểm trong preview, production vẫn chưa tích hợp.

| Vùng | Căn cứ | Phương án trong phạm vi feedback |
|---|---|---|
| Chọn nghiệp vụ | B12 có3 lựa chọn; user yêu cầu nâng cấp r07 | Thu gọn tile, nền trắng/nhạt, viền và dấu chọn; giữ icon pastel dùng chung. Không tô kín một khối lớn cạnh hai khối nhạt |
| Kho/ngày | Kho duy nhất từ session, ngày do hệ thống cấp | Nhóm thành khối thông tin chỉ đọc có hierarchy; bỏ cảm giác hai ô nhập bị khóa |
| Nhà cung cấp/ghi chú | Field owner hiện hữu, limit200 | Field có thể thao tác rõ hơn, label17–18px, khoảng nhóm20–24px, ghi chú112px có cuộn/counter |
| Dialog lựa chọn | openChoiceDialog + app-modal và ảnh lỗi user | Sửa ràng buộc chiều cao trong component; header/footer không co, chỉ body cuộn. P12 có search cố định, footer hai nút bằng nhau, safe inset và chiều cao hữu dụng |

Số đo mới là lựa chọn triển khai để review, không gọi là CSS Designer đã chốt. Evidence trước–sau cùng viewport494×950,DPR1,Chromium,phiên fixture mới.

## Nguyên nhân và bản sửa

**Lỗi dialog tái hiện bằng runtime:** dialog878px (client876), form902px; nút Apply nằm từ879.8 tới927px trong khi đáy dialog914px. Root dialog đã `overflow:hidden`, nên phần nút bị cắt. Việc chỉ giảm padding footer sẽ không giải quyết ràng buộc sai này. [Số đo trước](evidence/revision-08/before/layout.json).

Đã bỏ trần902px độc lập của form. Picker dùng flex/min-height0 trong khung cha, header/footer không co; chỉ body cuộn. P12 supplier có chiều cao760px trong shell950px, form758px nằm trọn trong dialog, hai nút52px rộng bằng nhau, khoảng dưới20px. Search cố định, có nhãn nhà cung cấp đang chọn kể cả khi bộ lọc tạm ẩn lựa chọn đó. [Số đo sau](evidence/revision-08/after/layout.json).

**Form tạo:** bỏ mảng teal tô kín128px cạnh hai ô nhạt; thay bằng3tile104px, icon44px theo chuẩn chung, selected nền nhẹ/viền/dấu chọn. Mũi tên trên Xuất/Bảo hành chỉ rõ mở luồng tương ứng. Kho và ngày nằm trong một khối metadata; ngày ghi Cấp khi tạo phiếu, không là input khóa giả. Nhóm cần nhập có label rõ, trường nhà cung cấp trắng/chevron, ghi chú112px và counter200. CTA56px/bo12px neo đáy, field ngắn vừa khung, không cuộn dư. Không thay logic ngày, tạo phiếu hay quyền.

## Kiểm chứng trong revision này

- **7 nhóm create/picker PASS**,12capture form/dialog tại6viewport: form ngắn vừa khung; dialog không cắt/nút52px; search/selection/apply/cancel/Back/Escape/focus; backdrop; tên NCC dài qua bộ dữ liệu clone trong harness; quay về từ P05/P09 giữ note; chuyển supplier/note đúng P04, recordCalls0/inventoryDelta0. [Kết quả](evidence/revision-08/create-results.json).
- **5 nhóm History PASS**, gồm6trang dùng bộ lọc, Reset/Cancel/Apply, ngày Việt Nam và90ngày, dialog/focus/footer,6viewport. [Kết quả](evidence/revision-08/history-regression/reset-results.json).
- **1 nhóm P09 choices PASS:** status/sort/fault, backdrop, Back/Escape, commitOnChange và field Khác không đổi. [Kết quả](evidence/revision-08/p09-choice-results.json).
- **7 nhóm readable content PASS:** ghi chú749ký tự/250/2000+/Unicode/newline, full reader, tên dài, input200 và chống bypass. [Kết quả](evidence/revision-08/text/text-spacing-results.json).
- Tổng **20 nhóm browser PASS**. Không cộng41Node/44browser của r07 vào revision này. Không viết thêm unit test lặp markup cho thay đổi trình bày. Lần stress đầu không thay được catalogue đã freeze; harness đã sửa dùng clone, kết quả chạy hoàn tất nằm ở các file results trên.
- [Ảnh actual trước–sau](evidence/revision-08/REVIEW.html). Tôi đã xem trực tiếp form mới, dialog đầu/cuối danh sách và ca tên dài; chưa thay cho user nghiệm thu visual.

## File và giới hạn

Sửa documents.mjs/style.css và version stylesheet; shared/choice-dialog.mjs có2option mặc địnhfalse; history/style.css sửa primitive chiều cao picker dùng chung; UI_STANDARD và checkpoint P12. Chạy regression P08/P09 vì cùng primitive. Không sửa footer nav khóa, các tab/back/timeline r07, baseline, dist hoặc nghiệp vụ backend.

R08 **AWAITING_USER_REVIEW / PASS_SCOPED_PREVIEW / BLOCKED_PRODUCTION**. Proposal compact form đã áp dụng theo yêu cầu nâng cấp; không ghi là Designer/client đã duyệt. Dữ liệu vẫn trong bộ nhớ; reload preview mới nhận source r08 và đặt lại fixture theo contract hiện hữu. Root current_prompt của chat P13 được giữ.
