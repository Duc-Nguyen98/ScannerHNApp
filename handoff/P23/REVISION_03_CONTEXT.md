# P23 r03 — phạm vi và nguồn trước sửa

User yêu cầu rà soát kỹ UI/UX và khắc phục lỗi còn lại. Giữ sáu nâng cấp r02, owner nghiệp vụ, bốn panel P23.S01–S04, 24 board/91 panel, khung494×950 và footer Home/P03.

| Nguồn | Kiểm tra và sửa trong phạm vi |
|---|---|
| B23 + r02 user-authorized | Giữ cấu trúc; sửa overflow, focus và nhãn trạng thái gây hiểu sai |
| UI_STANDARD dialog/readable | Reader gọn, raw nguyên vẹn; Back/Escape/trigger; không chồng overlay |
| Shared historyControls/picker | Xử lý debounce khi picker mở/đóng; dấu lọc ở adapter P23; không sửa default caller khác |
| HANDOFF/owner P09/P20 | Null event không crash; trạng thái chưa xác minh không khẳng định gửi/xuất; liên kết ID kiểm lại |
| User audit request | Tái hiện trước sửa từng ca; chạy cùng ca sau sửa và regression |

Trước sửa dùng working copy P23 r02, actual 494×950/DPR1/Vietnam tại evidence/revision-03/before. Không dùng test PASS làm nghiệm thu hình thức; nhánh edge là adaptation trong contract hiện có. Không thay backend policy hoặc baseline/dist/gallery.
