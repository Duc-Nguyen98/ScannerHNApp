# P17 r02 / P16 accessibility — trước triển khai

User “Áp dụng đề xuất cho tôi” chấp thuận sáu đề xuất trong chat: ngữ cảnh phiếu, hành động khả dụng, phục hồi thao tác, ba trạng thái đối chiếu, sao chép thông tin được phép và thông báo/focus tiếp cận.

| Phần | Nguồn | Thực hiện dự kiến |
|---|---|---|
| Shell/4panel/footer | B17 + r01 + UI_STANDARD khóa | Giữ 494×950, ID, component footer; header và dock ổn định |
| Ngữ cảnh | User-approved #1 | Dòng số phiếu và số mã hợp lệ dưới header, cao tối thiểu44px; wrap/reader khi dài, không lấy thiếu dữ liệu thành0 |
| CTA | User-approved #2 | Camera chưa kết nối: Nhập mã primary, trở lại danh sách secondary; không fake hardware. Renderer nhận khả năng từ owner; chưa có adapter camera thật thì không bật Quét lại |
| Khôi phục | User-approved #3 | Snapshot UI scroll/focus/selection theo documentID tại owner; giữ filter/module state; explicit Nhập mã chọn mã lỗi để sửa; mã gốc trong attempts giữ nguyên |
| UNKNOWN | User-approved #4 | Tách idle/checking/unavailable theo busy + nguồn check, không timer thành success; giữ khóa retry |
| Copy | User-approved #5 + dialog contract | Whitelist số phiếu/requestID/documentID/scan session/version; kiểm actor/quyền/kho; clipboard thất bại dùng dialog có nội dung để sao chép thủ công; không tự gửi thông tin |
| Accessibility | User-approved #6 | Live region bền nằm ngoài vùng render lại; thông báo tải/đối chiếu ngắn; giữ focus thao tác trong pending và hoàn tất khi control còn, fallback rõ nghĩa |

Card/type/icon kế thừa r01: Arial16/24, header22/32, controls56, radius12–14. Dòng context mới và nút copy là adaptation đã cho phép triển khai, chưa nghiệm thu raster. Before source/capture ở evidence/revision-02/before; after cùng viewport/DPR/font. Chỉ sửa presentation/lifecycle; không thêm quyền/API nghiệp vụ, không Post hoặc overwrite NFC.
