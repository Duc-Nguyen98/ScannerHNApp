# P18 r03 — audit UI/UX trước sửa

User yêu cầu rà kỹ và khắc phục lỗi phát sinh. Phạm vi bốn panel P18 và dependency trực tiếp; giữ 24prompt/91panel, footerLOCK, dữ liệu/quyền và mọi quyết định nghiệp vụ. HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; source snapshot r02 tại evidence/revision-03/before/source.

| Phần | Bằng chứng trước sửa | Quyết định sửa |
|---|---|---|
| Footer form | Runtime đầu footer759.22→782.22 khi checkbox/người nhận đủ; nhảy23px | Giữ ô hướng dẫn/nút bổ sung trong lưới ổn định, disabled khi không còn thiếu; không giấu/xóa hàng theo từng phím |
| Vị trí | Chọn B2 làm details đang mở đóng lại; nav chọn Chứng từ | Chỉ cập nhật selection/detail đang chọn; giữ details/focus/scroll; tab theo owner P06, không đổi CSS footer |
| Viewer keyboard | PDF text 1px có tabindex0, focus bung paragraph; zoom max làm focus về BODY | Nút Đọc văn bản rõ ràng mở dialog chung; giữ focus tại control zoom ở biên bằng aria-disabled + handler guard |
| Zoom | Điểm giữa tài liệu x0.4548→0.3901,y0.4357→0.3737 khi tăng zoom | Neo tọa độ đọc theo tỷ lệ trang; double tap neo điểm chạm, button neo tâm viewport; chỉ document scroll |
| Glyph | Nút zoom dự tính24px nhưng computed17px do font inheritance; menu là ký tự nhỏ | SVG nét mảnh24px từ Lucide có sẵn trong Git HEAD (plus/minus/ellipsis-vertical), không tải icon mới |
| Source list | attachments=null hiện0/rỗng; queue giữ empty khi nguồn đã phục hồi | Phân biệt unknown/empty; đọc metadata từ owner theo thời điểm hiển thị/action, fixture queue riêng |
| Async / error | Rà lifecycle: PDF/image/read/download controller, cached file, retry/render errors | Tách controller, kiểm lại file trước/sau fetch; busy feedback, retry/focus hữu dụng; không ảnh hưởng request mutation |

Baseline B18/r01/r02 vẫn là nguồn lịch sử, không sửa. Bảng token r02 giữ hiệu lực: shell494×950/header76/card12/field48/note80&200ký tự/footer75. Chỉnh spacing để control/reader dễ dùng, không nén/cắt dữ liệu nhằm che overflow. Visual r03 cần review, không tự suy pixel-perfect từ assertions. Các probes before/after là cùng fixture/viewport494×950/DPR1/Arial, có thêm4viewport phụ và branch interaction.
