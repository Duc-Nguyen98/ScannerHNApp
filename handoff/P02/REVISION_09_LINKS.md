# P02 r09 — giảm nhiễu hai dòng khoanh đỏ

User yêu cầu đề xuất giữ/bỏ hai mục và áp dụng ưu tiên UX. Đây là thay đổi copy/affordance được yêu cầu trực tiếp, không đổi board/phạm vi nghiệp vụ.

- **Bỏ “Chọn nghiệp vụ để bắt đầu →”**: đây là paragraph không có action, nội dung lặp lại ý của bốn thẻ bên dưới nhưng màu/mũi tên trông như link. Giữ tiêu đề Tác vụ kho.
- **Giữ “Xem tất cả”**: có action cần thiết đi từ danh sách gần đây tới hub Lịch sử theo HANDOFF. Bỏ mũi tên, dùng text-button13px/weight500 không nền/viền; giữ màu link, hover underline và focus-visible. Accessible label/title nói rõ mở Lịch sử. Không đổi đích thành Chứng từ/P12.
- Không sửa KPI/giờ ca, footer LOCK, icon nghiệp vụ, khoảng cách/thứ tự thẻ hay hành vi backend.

Kiểm trình duyệt Chromium thực: helper không còn; Xem tất cả không SVG; click và Enter tới #p02/history, heading Lịch sử thao tác; Back về Home/focus đúng; timestamp ca không đổi. Footer nền trắng và scan-circle giữ đúng màuLOCK.494px và360px không overflow ngang. Không JS errors. Không tạo thêm unit tests cho sửa copy/style nhỏ này.

[Kết quả](evidence/revision-09-links/checks.json) · [Ảnh494](evidence/revision-09-links/home-494.png) · [Ảnh360](evidence/revision-09-links/home-360.png).

Files: home/home.mjs (helper + text-button), home/style.css (2 rule nhỏ cho text-button), cache version entry P01. Visual thay đổi nhỏ chờ user review; integration và blocker toàn màn giữ nguyên.
