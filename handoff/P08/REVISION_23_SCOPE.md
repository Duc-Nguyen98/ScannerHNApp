# R23 — nguồn thiết kế và lỗi tái hiện trước sửa

Phạm vi: sáu trang Lịch sử và picker/chi tiết/phiên quét liên quan. Giữ footerLOCK, icon pastel,24board/91panel; không đổi nghiệp vụ hoặc dữ liệu.

| Vùng | Nguồn giữ | Vấn đề / bằng chứng | Cách sửa giới hạn |
|---|---|---|---|
| Phiên quét | P08.S03, palette shared/UI_STANDARD | PQ-0002 là Nhập kho nhưng heading nội dung ghi Phiên quét mã; 0 mã trùng vẫn đỏ; chữ/icon link xanh gắt khác list | Dùng loại phiên từ nguồn, số0 trung tính, cảnh báo chỉ khi có trùng; cùng typography/metadata palette đã có |
| Xem tất cả mã | CTA và danh sách hiện hữu | Audit trước: nút nhảy151px theo viewport khi mở rộng | Giữ scroll/anchor và width nút khi mở/thu gọn; không thêm panel |
| Trạng thái bảo hành | BUSINESS_CONFIG có received/handover | BH-003/BH-005 detail đang classunknown/icon cảnh báo | Ánh xạ trạng thái nguồn sang màu neutral/processing/waiting, không biến chờ bàn giao thành hoàn tất |
| Danh sách mã | Giữ mã/SKU/serial/time đầy đủ | Cột thời gian và mã dài chen chúc; detail còn typography đời cũ | Wrap có kiểm soát, không cắt định danh, màu và border theo component hiện có |
| Calendar bàn phím | Picker chung/date policy | Arrow trái tại đầu tháng không chuyển ngày trước dù còn trong giới hạn | Di chuyển ngày thật xuyên tháng, vẫn chặn bound/opposite endpoint |

Before: evidence/revision-23/before/ cùng494×1000,DPR1,29/09/2026. Các chỉnh spacing/màu là adaptation sửa lỗi theo yêu cầu user, cần review sau; không dùng số test để tự nghiệm thu.
