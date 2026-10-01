# P07 r06 — Sóng NFC và bố cục nút hoàn tất

27/09/2026. Theo yêu cầu mới: animation tỏa phía sau thẻ NFC và căn cụm nút phía dưới theo bố cục bên trên. Giữ bốn panel P07 và nghiệp vụ hiện có; chưa chuyển P08.

## Thay đổi

- S02: minh họa điện thoại bằng SVG nội tuyến, sóng CSS nằm phía sau trong khung 194px. Ba lớp sóng lệch nhịp, chỉ đổi transform/opacity, không đẩy nội dung. Chạy ba chu kỳ rồi dừng, giữ nền sáng tĩnh. Không dùng animation làm bằng chứng thiết bị đang đọc NFC thật.
- S04: thêm sóng xanh lá nhẹ quanh dấu tích, chạy hai chu kỳ sau thành công. Chỉ xuất hiện cùng receipt đã xác nhận như trước.
- Cả hai hiệu ứng tắt khi `prefers-reduced-motion: reduce`, không nhận pointer và không đi vào accessibility tree.
- Ba nút S04 cao 56 CSS px, cùng lề trang 18px và khoảng cách 10px. Cột icon/chữ thẳng với bảng thông tin. Thêm icon nhà lấy từ bộ icon hiện có; giữ nguyên hành động Về Trang chủ. Nút chính, phụ và về trang chủ phân biệt bằng màu/nền.
- Thu gọn khoảng trắng phần thành công để viền cuối bảng thông tin hiển thị đầy đủ ở fixture mặc định. Nội dung dài vẫn cuộn phía trên footer cố định. Không đổi shell 494×950.
- Thay crop raster ở S02 bằng SVG/CSS để tách lớp sóng khỏi hình điện thoại. Ảnh baseline gốc giữ nguyên, không sửa để hợp thức hóa giao diện mới. CSS cache version `p07-r06`.

## Kiểm chứng lần này

- `check_nfc_alignment.cjs`: **33 capture PASS**, bốn panel và trạng thái đọc ở sáu viewport, dialog và chuỗi dài. Mở rộng phép đo từ nút đầu tiên sang toàn bộ nút footer. [Metrics](evidence/revision-06/alignment/metrics.json).
- `check_nfc_motion.cjs`: **PASS** ba mốc animation thực, vị trí hướng dẫn không đổi khi sóng chạy; reduced-motion trên S02/S04; chiều cao/khoảng cách/cột chữ/hai mép của cả ba nút; toàn bộ viền summary nằm trong vùng nhìn ở sáu viewport; thao tác Home. [Metrics](evidence/revision-06/motion/results.json).
- `check_nfc_repeat.cjs`: **4 nhóm PASS** — năm mã liên tiếp, đổi mã làm mất read cũ, UNKNOWN bảo toàn request và đối chiếu, text dài/cuộn cuối. [Kết quả](evidence/revision-06/repeat/results.json).
- Đã xem ảnh sóng ở mốc 1300ms và S04 desktop. Node 104/104 là kết quả r05 trước đó, **không chạy lại** trong lần sửa giao diện này. Backend/hardware vẫn NOT_RUN.

Sáu viewport: 1869×940, 1495×752, 685×872, 494×1000, 360×800, 340×420; Chromium, DPR1. Không suy rộng thành kiểm chứng mọi thiết bị. Visual tổng thể chờ user review.

## Preview

[Mở preview](http://127.0.0.1:8766/flows/auth-session/) → `minhanh` / `preview` → Bắt đầu ca → Thẻ NFC → Quét hoặc liên kết thẻ NFC. Dùng bộ chọn mã mô phỏng bên ngoài app để đọc → Tiếp tục → Xác nhận liên kết → màn Hoàn tất.

- [Sóng đọc thẻ](evidence/revision-06/motion/read-1300.png)
- [Hoàn tất, nút cùng cột](evidence/revision-06/motion/success-1869x940.png)
- [Giảm chuyển động](evidence/revision-06/motion/read-reduced-motion.png)

Không push/merge/deploy. Giữ công việc Home có trước và đầy đủ 91 hàng coverage.
