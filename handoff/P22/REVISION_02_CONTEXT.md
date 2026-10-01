# P22 r02 — sáu đề xuất được user yêu cầu áp dụng

User: “Áp dụng đề xuất cho tôi” sau sáu đề xuất trong chat. Cho phép triển khai, không phải nghiệm thu visual mới. Giữ4panel, frame494×950, S01/hub6/no shortcut, HomeP12, footerLOCK, source-only event và production BLOCKED. Source commit da9f623; working copy prototype có công việc P01–P22 chưa commit, không reset.

| Thay đổi | Nguồn | Số đo/lựa chọn thực thi trước sửa |
|---|---|---|
| Controls gọn | user đề xuất1 + history-controls | r01 search50/tabs64, intro và summary rời; r02 search50/tabs44, ngày+count một hàng44, gap8; bỏ intro lặp. Mục tiêu giảm dock, không đổi khung. |
| Xóa riêng | user đề xuất2 | × vùng bấm44; chip ngày/status/type riêng; query giữ nguyên DOM/IME; empty có CTA tương ứng. |
| Thẻ dễ đọc | user đề xuất3 + B22 | Loại/UID+serial/thời gian+actor; icon md44/stroke1.8/palette chung, card padding16/gap8; vừa xem theo event ID trong phiên. |
| Thay thẻ | user đề xuất4 | Nhóm UID trước → thay thế dạng dọc, reason ngay dưới; metadata đối chiếu mở rộng native details, giữ trạng thái theo event. |
| Copy | user đề xuất5 + action-feedback | UID/serial/gói allowlist lấy raw string; copy async có scope/route/payload guard, kết quả dialog trong app. |
| Reload | user đề xuất6 | Giữ kết quả cùng source/scope khi lỗi/tải; trạng thái nguồn có nhãn rõ, không toast; không bịa updatedAt. Không áp timeout lên mutation. |

Before giữ snapshot source và ảnh r01 tại evidence/revision-02/before; after cùng494×950/DPR1/fixture. Các tỷ lệ r02 là adaptation được yêu cầu triển khai, chờ review, không tự thành baseline Designer.
