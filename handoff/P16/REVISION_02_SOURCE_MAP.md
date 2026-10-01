# P16 r02 — sáu đề xuất được user yêu cầu áp dụng

Nguồn: yêu cầu “Áp dụng đề xuất cho tôi” sau sáu đề xuất UI/UX P16; giữ Contract2.0, UI_STANDARD, nguyên4panel và footerLOCK.

| Thay đổi | Nguồn / thực hiện |
|---|---|
| Bỏ từng điều kiện | User-approved feature; chip trong S03 cho query/type/date/status; chỉ bỏ điều kiện được chọn, reset toàn bộ giữ nguyên |
| CTA theo nguyên nhân | Có query: Sửa từ khóa; không query: Điều chỉnh bộ lọc dùng picker owner |
| Cache rõ nghĩa | Giữ nguồn cùng query/scope; copy nói rõ dữ liệu đã tải trước đó. Không có timestamp nguồn thì không hiển thị giờ |
| Tìm kiếm | 250ms sau ngừng gõ; Enter ngay; IME không gửi giữa composition; cancel timer và request cũ khi đổi query/rời màn |
| Tìm mã chưa khả dụng | Giữ kích thước nút; aria-disabled + lý do ngắn, chặn mở form khi chưa có nguồn xác minh |
| Tải lại giữ vị trí | Neo bằng ID dòng đầu đang thấy và offset; phục hồi focus ID nếu còn, clamp nếu dòng biến mất |

Số đo kế thừa r01: shell494×950, header86px, controls50/44/44px, footer75px/scan62px. Chip min44px, gap8px, button radius12px; các giá trị chip là implementation choice trong phạm vi user yêu cầu, chưa raster sign-off. Không đổi icon nghiệp vụ hay trạng thái.

Before lưu r01 và source snapshot; after cùng Chromium/DPR1/zoom1/viewport494×950, bổ sung ma trận360×800,430×932,1440×900,340×420. Nhánh mới không có baseline riêng là adaptation cần review.
