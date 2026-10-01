# P08 r22 — nguồn và phạm vi nâng cấp được yêu cầu

User duyệt triển khai đề xuất sáu nhóm UX trong chat: nhớ ngữ cảnh, dấu lọc đang bật, khoảng ngày nhanh, trạng thái rỗng có hướng xử lý, vùng chạm/bàn phím, phản hồi không nhảy bố cục.

| Vùng | Nguồn giữ nguyên | Thay đổi theo yêu cầu | Lựa chọn triển khai cần review |
|---|---|---|---|
| Sáu trang Lịch sử | B08 và sáu trang đã triển khai; icon pastel chung | Nhớ riêng từng trang trong phiên | Cache trong controller; không lưu vĩnh viễn, không ghi dữ liệu nghiệp vụ |
| Thanh tìm/lọc | history-controls, khung và màu hiện hữu | Chấm báo ngày/trạng thái đang áp dụng, nhãn đọc được | Chấm nhỏ viền trắng, không thêm hàng mới |
| Dialog bộ lọc | Dialog trong app, ngày xếp dọc, Đặt lại/Hủy/Áp dụng | Hôm nay/7/30/90 ngày chọn nhanh ở bản nháp | Bốn nút trong grid2×2, 44px; N ngày gồm hôm nay và N−1 ngày trước |
| Lịch con | Quy tắc ngày VN và giới hạn hôm nay−90 | Giữ Today chỉ điều hướng tháng | Không đổi endpoint còn lại hoặc tự commit |
| Rỗng/lỗi | Không biến thiếu nguồn thành0 | Phân biệt rỗng nguồn/không khớp/lỗi tải, một CTA phù hợp | Bỏ điều kiện lọc giữ loại nghiệp vụ/sắp xếp; thử lại nguồn giữ bộ lọc |
| Phản hồi | HN-action-feedback-v1 đã khóa | Tái sử dụng dialog hiện có, chống sao chép lặp | Không thêm toast/banner, không hiện dialog mỗi lần lọc |
| Bàn phím/vùng chạm | Footer LOCK và app494×950 | Chạm44px CSS, không autofocus input khi mở lọc | Focus heading; body cuộn, footer dialog không bị cắt |

Chỉ sáu trang Lịch sử. P12/P13 đang dùng chung controls/picker: tính năng mới opt-in hoặc scope P08, không tự đổi các màn đó. Không đổi API, dữ liệu, ID panel, baseline hoặc footer.

Before/after: cùng494×1000, DPR1, ngày giả lập29/09/2026, nguồn baseline; ảnh dưới evidence/revision-22. Layout mới là adaptation được yêu cầu, chưa phải visual đã nghiệm thu.
