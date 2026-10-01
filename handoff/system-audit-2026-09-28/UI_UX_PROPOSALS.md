# Đề xuất UI/UX sau rà soát — chưa thay giao diện LOCKED

Phạm vi: các panel đã triển khai P01–P09 và dependency đang có. Giữ 24 prompt/91 panel, không thêm màn, API hoặc quyền. Nguồn hình thức: P02 LOCKED, shared/UI_STANDARD.md, operation-icons.css và detail-tabs.css.

| Ưu tiên | Vấn đề / phương án cụ thể | Điều kiện nghiệm thu | Trạng thái |
|---|---|---|---|
| 1 | Phản hồi đang xử lý phải khớp khả năng thao tác. Với P03, footer và Back được disable trong khi lưu; thành công/lỗi trả lại đúng trạng thái. | Không có nút nhìn như bấm được nhưng bị chặn âm thầm; không gửi trùng, không mất nháp/UNKNOWN. | Đã sửa P03, kiểm tra hồi quy. |
| 1 | Lỗi khởi động preview có thông báo và nút tải lại ở ngoài app. Máy chủ dùng cổng riêng khi chạy kiểm tra đồng thời, ngăn bind trùng trên Windows. | Không tự reload phiên đang làm; mô phỏng lỗi import thấy thông báo; tải lại sau phục hồi dựng login. | Đã sửa và kiểm chứng. |
| 2 | Bổ sung một bộ mẫu state dùng chung cho loading, không có dữ liệu, lỗi tải, UNKNOWN và chỉ đọc. Mỗi mẫu nêu rõ kết quả, dữ liệu đang giữ và thao tác tiếp theo. | Loading không hiện số0 giả; UNKNOWN không dùng màu/biểu tượng thành công; retry chỉ xuất hiện khi nghiệp vụ cho phép. Giữ cấu trúc panel hiện tại. | Đề xuất tiếp theo; chưa áp dụng đồng loạt hoặc coi state mới là API contract. |
| 2 | Tách chế độ preview theo board với chế độ đánh giá thao tác trên điện thoại: kích thước chữ/control và vùng chạm cần được Designer duyệt riêng khi toàn khung 494×950 bị thu nhỏ. | Có một bộ token responsive được duyệt; kiểm thực trên điện thoại và bàn phím, không chỉ viewport mô phỏng; baseline không sửa. | Chưa áp dụng vì làm đổi kích thước màn đã chốt. |
| 3 | Bộ ví dụ trực quan cho component hiện có: header/back, tab chi tiết, trường form, CTA, dialog, empty/error/loading. Gắn nguồn CSS thực tế vào từng ví dụ để tránh copy màu/kích thước theo màn. | Mẫu lấy trực tiếp component shared; tách màu nghiệp vụ khỏi trạng thái; cập nhật chuẩn mới ở một nguồn. | Đề xuất tài liệu/preview ngoài app; không thêm panel nghiệp vụ. |

Không đề xuất tự động lưu mật khẩu, khôi phục phiên sau logout, tự mở camera, phát thông báo thật hoặc tự tạo phiếu mới khi UNKNOWN. Persistence nháp qua reload, idempotency/đối chiếu và offline cần contract/backend riêng trước khi triển khai production.

Thứ tự đề nghị: chốt bộ mẫu state → duyệt quy tắc responsive thực trên thiết bị → bổ sung ví dụ component. Không cần redesign toàn app để áp dụng các bước này.
