# P08 r06 — làm dịu vùng icon/nội dung danh sách
Phạm vi: vùng khoanh trong ảnh user, các hàng lịch sử P08.S01. Chỉ sửa CSS được scope theo panel; không thay logic hoặc dữ liệu.
## Áp dụng
- Icon43→30px, stroke2.2→1.8; tile64→56px, nền #eef6fa, nét #4f7990. Một màu chung cho năm loại, vẫn giữ hình phân biệt.
- Mã lịch sử19px/600 #203f60; nghiệp vụ17px/500 #426082; chữ phụ15px #55718c. Nhịp12px và card12px cùng nhóm thiết kế bên trong.
- Giữ nội dung, timestamp, badge trạng thái, filter, nav, shell494×950. Detail r05/session/daily/hub không nhận CSS mới.
## Xác minh r06
- visual-results.json:6 viewport PASS, tile/icon/weight đúng, không tràn ngang, nav cố định. Contrast chữ chính/nghiệp vụ/phụ trên nền card>=4.5:1, icon trên tile>=3:1.
- Bấm icon LS-0003 vào đúng BH-001, Back đúng; icon detail vẫn32px (không bị CSS danh sách tác động).
- r04-regression/browser-results.json:7/7 nhóm PASS chạy trên source r06; không ghi đè evidence r04.
- detail-regression/browser-results.json:5/5 nhóm PASS, 3 tab ×6 viewport, đúng source r06.
- Đã xem ảnh list494×1000. Visual chờ user nghiệm thu. Backend/hardware NOT_RUN.
- Không chạy lại toàn bộ Node/P03/P05. Các lỗi ngoài phạm vi ghi ởr03/r04 chưa được xử lý ởr06; không tuyên bố toàn hệ thống PASS.
- Không đổi baseline/fixture, không thêm/bỏ panel; giữ91 IDs. Không push/merge/deploy.
## Bằng chứng
evidence/revision-06/list-494x1000.png và5 kích thước còn lại; visual-results.json; detail-unchanged.png; r04-regression; detail-regression.
