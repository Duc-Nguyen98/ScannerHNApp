# P08 r07 — focus tìm kiếm và đồng bộ Hoạt động theo ngày
User gọi “Cập nhật theo ngày”; áp dụng vào P08.S04 Hoạt động theo ngày đang có, không đổi tên hay thêm panel.
## Thay đổi
- Bỏ outline/box-shadow bên trong input tìm kiếm. Không bỏ focus/khả năng gõ, Tab hoặc caret; chỉ viền ngoài nhẹ #7898af khi focus-visible. Không ảnh hưởng focus của các control khác.
- S04 dùng màu nền nhạt, icon xanh xám/nét1.8 và chữ cùng hệ r06. Các nhóm có tile44px, icon28px, vùng bấm>=64px; grid chỉ đọc giữ6 ô và5 nhóm mở danh sách.
- Bỏ nhãn mô phỏng trong S04 cho đồng bộ S01/S02; tools vẫn nêu đúng nguồn fixture. S03 chưa sửa.
- Giữ số liệu, heading, hướng dẫn, date picker r04, ngày thiếu là unavailable chứ không0. Không thay dataset/query/route nghiệp vụ.
## Kiểm chứng
- Browser r07:3/3 nhóm PASS. Search không inner outline, gõ lọc2 kết quả HN12345, Tab/Shift+Tab đúng.
- S04 tại6 viewport:494×1000,360×800,430×932,1440×900,340×420,1869×940. Shell494×950, không tràn ngang, nội dung cuộn trên nav. Đã xem ảnh render thực tế.
-09/09:12+6+4+3+5=30;08/09:3+2+1+1+1=8. Calendar một overlay; drilldown warranty đúng ngày/type, Back giữ ngày;01/10 không có nguồn không biến thành0.
- Hồi quy r04:7/7 PASS trong evidence riêng revision-07/r04-regression. Lần chạy này trước bước tinh chỉnh row76→64/tile48→44; suite r07 chạy lại sau tinh chỉnh và PASS.
- Node history/history-picker/history-detail/warranty-component-history:21/21 PASS. Baseline/history-fixtures/P07 hashes giữ nguyên.
- Visual chờ user nghiệm thu. Backend/hardware NOT_RUN. Không chạy lại toàn bộ P03/P05; lỗi cũ ngoài scope không tự sửa/không tuyên bố toàn hệ thống PASS.
## Bằng chứng
evidence/revision-07/browser-results.json; search-focused.png; daily-494x1000.png và5 viewport; daily-calendar.png; r04-regression/browser-results.json.
Không push/merge/deploy. Giữ24 prompt/91 panel, không sửa baseline.
