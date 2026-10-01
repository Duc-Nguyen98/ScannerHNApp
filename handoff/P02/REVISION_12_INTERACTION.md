# P02 r12 — phản hồi KPI dạng ô bấm

Theo yêu cầu user: gạch chân khi bấm/rê chuột KPI trông như link web và kém phù hợp với app. Đã bỏ text-decoration trên nhãn KPI, giữ nguyên nội dung/số đếm và đích lọc.

- Default: chữ/màu như trước; toàn ô là button.
- Hover chỉ khi pointer fine + thiết bị có hover: nền `#f0f7fa`, không gạch chân/đổi màu nhãn.
- Press: nền `#e4f0f5`, bỏ filter brightness của nút này để không nhuộm màu chữ/icon trạng thái. Không translate/scale nên không xê dịch layout.
- Focus-visible: giữ viền focus trong ô cho người dùng bàn phím; không xóa focus để đổi lấy hình thức. Reduced motion tắt transition; bình thường background transition120ms. Không hover sticky trên thiết bị chỉ touch.
- Disabled/UNKNOWN không có hover/pressed feedback hoạt động. FooterLOCK, giờ ca và handler KPI không sửa.

Kiểm browser thực: hover/pressed không underline và bounding box bằng default; click mở đúng phiếu waiting; Back/focus bàn phím có outline; reduced-motion transition0s. [Checks](evidence/revision-12-interaction/checks.json), [Hover](evidence/revision-12-interaction/hover.png), [Pressed](evidence/revision-12-interaction/pressed.png), [Keyboard](evidence/revision-12-interaction/keyboard.png). Không thêm unit test hoặc chạy lại toàn bộ suite cho thay đổi CSS nhỏ này.

Files: home/style.css và version stylesheet trong P01/index.html. Không thay interaction của link văn bản khác hoặc nền menu footer. Thay đổi hình thức chờ user review; backend không thay đổi.
