# P05 revision04 — UX vùng nhập tay và màn quét xuất kho

Yêu cầu 27/09/2026: đề xuất và triển khai cải thiện vùng khoanh đỏ trong `C:/Users/TAN MIE/Desktop/1.png` và màn hình quét nói chung. Phạm vi: **P05.S02**; giữ bốn panel và quy tắc nghiệp vụ. Đây là thay đổi UI theo chỉ thị mới, không sửa baseline B05 để hợp thức hóa bản dựng.

## Vấn đề và giải pháp đã áp dụng

| Vấn đề | Thay đổi |
|---|---|
| Ô nhập, nút kiểm tra và nút đóng thiếu phân cấp; nút kiểm tra xuống dòng | Thẻ nền trắng/viền xanh nhạt; header Nhập mã sản phẩm + Thu gọn; label riêng; input 52px và CTA 126px cố định, chữ một dòng. |
| Phản hồi dễ tách xa vùng nhập; thành công thiếu xác nhận tại chỗ | Một vùng status ngay dưới input: hướng dẫn, thành công xanh kèm mã và tổng số, duplicate vàng, lỗi đỏ. Rỗng không tạo lượt quét. Bỏ hiển thị lặp thông báo lỗi toàn màn khi đã có lỗi inline. |
| Khó nhập liên tiếp hoặc sửa mã sai | Enter kiểm tra; valid xóa ô và giữ focus; lỗi/trùng giữ nguyên raw và chọn nội dung để thay nhanh. Escape/Thu gọn trả focus về Nhập tay và giữ mã chưa gửi. Không submit lúc đang dùng IME xác nhận ký tự. |
| Camera chiếm diện tích khi nhập tay | Thu ảnh camera từ 220 xuống 128 CSS px khi mở nhập tay; shell vẫn 494×950 và scale dùng chung Home. |
| Đèn trông có thể sử dụng dù chưa có camera | Nút vô hiệu hóa, nhãn Đèn chưa sẵn sàng; camera tiếp tục ghi Chưa kết nối. Không gọi camera thật. |
| Chưa rõ thiếu bao nhiêu và nên làm gì tiếp | Thêm progressbar + số lượng còn thiếu. Khi 0 mã: khóa Kiểm tra phiếu kèm lý do; 1–9 mã: vẫn cho review nhưng không nới điều kiện gửi; 10/10: Kiểm tra phiếu là primary, secondary Xem mã đã quét. |
| Cảnh báo trùng dài và danh sách ít ngữ cảnh | Tổng trùng không tính gộp vào tiến độ; danh sách có số lượt, lỗi kèm lý do; duplicate có màu vàng và nhãn riêng. Chỉ hiện Xem tất cả khi hơn bốn lượt. Empty state có hướng dẫn Nhập tay. |

Accessibility: label, aria-expanded/controls, progress có tên, aria-invalid chỉ cho lỗi nhập, aria-live status, disabled có lời giải thích, keyboard focus. Màu luôn đi kèm chữ. Status dành sẵn ít nhất 40px, lỗi dài được wrap không cắt nội dung. Header/footer ổn định, phần thân cuộn. Thu gọn không xóa draft, không cộng mã.

Thông báo hiển thị cho invalid được đổi sang ngôn ngữ người dùng (Không tìm thấy sản phẩm / Mã không thuộc kho đang thao tác); raw và lý do trong audit fixture giữ nguyên. Danh sách/mã nhập được escape khi render HTML. Không đổi flow/adapter nghiệp vụ, số lượng, request, ID hay reset policy. S01/S03/S04 giữ bố cục; validation revision03 và P17.S02 vẫn hoạt động. Giữ toàn bộ công việc P03/P06–P08 có trước, không tự triển khai prompt tiếp theo.

## Kiểm chứng

- **118/118 Node PASS** trong workspace hiện tại. Đây là tổng thực tế sau cả công việc P03 hiện có, không quy hai test P03 mới cho thay đổi này. [Log](evidence/revision-04/node-tests.txt).
- **8 nhóm UX PASS**, đo khung/layout trên 6 viewport: 340×420, 390×844, 494×1000, 768×1024, 1440×1000, 1869×940. [Kết quả](evidence/revision-04/ux-results.json).
- **8 nhóm validation PASS**: [kết quả](evidence/revision-04/validation/browser-results.json).
- **8 nhóm lifecycle PASS**: success/failure/new run từ hai đường, draft/pending/UNKNOWN giữ nguyên: [kết quả](evidence/revision-04/lifecycle/browser-results.json).
- **12 nhóm hồi quy P05/P04 PASS**: [kết quả](evidence/revision-04/regression/browser-results.json).
- Tổng **36 nhóm browser PASS**, không có lỗi JS ở các suite. Đã xem trực tiếp ảnh actual trạng thái valid, invalid trên mobile và đủ số lượng; không tràn ngang/nút cắt chữ, shell 494×950.

Ảnh review: [Nhập mã hợp lệ](evidence/revision-04/04-valid.png), [trùng](evidence/revision-04/05-duplicate.png), [lỗi mobile](evidence/revision-04/07-error-390x844.png), [đủ số lượng](evidence/revision-04/08-complete.png).

Visual mới chờ user duyệt. Backend/camera/bàn phím thiết bị thật chưa kiểm chứng; các lượt test là fixture trên browser riêng, không reload tab nháp của user. Không push/merge/deploy.
