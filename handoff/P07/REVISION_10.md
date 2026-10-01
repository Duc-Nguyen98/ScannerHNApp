# P07 r10 — Sóng lặp vô hạn, minh họa ở lớp trên

27/09/2026. Theo yêu cầu user: sóng chạy liên tục và không phủ lên minh họa NFC.

- Animation đọc thẻ chuyển từ3 chu kỳ sang infinite, giữ chu kỳ3.2s. Ba lớp dùng delay0/-1.0666667/-2.1333333s, có sóng đang chạy ngay lúc hiển thị và các nhịp xen kẽ.
- Tách3 lớp trong stacking context cô lập: nền B07 z-index0; sóng z-index1; phần điện thoại gốc B07 z-index2. Foreground crop bằng CSS clip-path, vẫn cùng tọa độ/kích thước ảnh gốc.
- Bỏ mix-blend-mode:multiply; dùng normal, hình điện thoại che sóng phía sau thay vì hòa màu. Không thay source PNG.
- Giữ hỗ trợ reduced-motion của hệ thống. Không thay bố cục, nội dung hoặc nghiệp vụ; hiệu ứng dấu tích thành công không thuộc thay đổi này. CSS cache p07-r10.

## Kiểm chứng

Motion suite PASS: kiểm iterationCount=infinite, z-index foreground lớn hơn mọi sóng, blend normal, có sóng nhìn thấy ở các mốc600/1300/2400/16000/600000ms. Các mốc được đặt qua timeline animation, không phải chờ thực10 phút. Reduced-motion và6 viewport footer/Home tiếp tục PASS.

Ảnh desktop trước/sau:0 pixel thay đổi ngoài dải minh họa y410–610. So sánh phần trong điện thoại giữa các mốc:3 mốc giống hệt, mốc16000ms có44 pixel khác tập trung một cột, chênh kênh tối đa11; không dùng phép so này để tuyên bố pixel-identical ở mọi phase. Kiểm stacking/blend và xem ảnh xác nhận điện thoại giữ foreground.

[Ảnh](evidence/revision-10/motion/read-1300.png) · [Kết quả](evidence/revision-10/motion/results.json) · [So sánh ảnh](evidence/revision-10/layer-comparison.json).

Node/luồng nghiệp vụ không chạy lại cho sửa CSS này. Backend/hardware NOT_RUN. Giữ91 panel, không push/merge/deploy.
