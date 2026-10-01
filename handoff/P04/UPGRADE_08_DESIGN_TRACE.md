# P04 r08 — nguồn và lựa chọn triển khai trước code

User29/09/2026 yêu cầu triển khai đề xuất nâng cấp vừa trao đổi. Phạm vi P04 4panel và lifecycle; không mở board mới, không thay các contract nghiệp vụ.

| Phần | Nguồn | Áp dụng |
|---|---|---|
| Wizard4panel, quét/review/kết quả chờ Web | B04 + Contract2.0 + HANDOFF | Giữ panelID và nghiệp vụ record/chưa ghi sổ |
| Khung494×950, footer Home/P03 | Chốt user + UI_STANDARD HN-footer-locked-v1 | Không đổi Home/P03 |
| Nhập lượt mới | User chấp thuận đề xuất lần này | CTA mới tại kết quả thành công/thất bại xác định; không dùng cho nháp/busy/UNKNOWN |
| Ngữ cảnh phiếu và nháp | User chấp thuận đề xuất | Thẻ ngữ cảnh nhỏ ở S02, xem đầy đủ qua shared action feedback; tiếp tục nháp có nhãn và số mã, không tự bỏ phiếu |
| Lọc mã theo kết quả | User chấp thuận đề xuất | Tái sử dụng counter làm các nút lọc; lọc presentation từ attempts, không thay accepted/quantity/request |
| Serial theo SKU | User chấp thuận đề xuất | Disclosure trong card review, đúng mã accepted từngSKU, không thêm route/overlay |
| Mã vừa nhận | User chấp thuận đề xuất | Viền/nhãn trên dòng gần nhất, animation một lần nhẹ và hỗ trợ reduced-motion; không toast mới |
| Icon/dialog/nội dung dài | UI_STANDARD hiện hành; shared operation-icons/action-feedback/readable-text | Dùng token/components, không palette hoặc modal riêng; không cắt raw |
| Spacing thẻ ngữ cảnh, bộ lọc và disclosure | Lựa chọn triển khai cần user review | Không có baseline Designer cho các nhánh mới; ghi adaptation, không tự coi visual PASS |

Before/after chụp cùng fixture13 lượt (11valid,1duplicate,1invalid), CSS494×1000 và390×844, DPR1. Nguồn trước sửa là local source đang có cả đồng bộ dialog/readable và nối P12; không quay lại source r07 cũ để làm mất các sửa đổi đó. Ảnh source baseline B04 không sửa/resize.

Lựa chọn sau kiểm tra: camera khi chưa nhập tay160px (thay196px) để dành chỗ cho ngữ cảnh; khi nhập tay vẫn128px. Highlight dùng màu metadata trung tính, không dùng xanh nhập kho để ám chỉ mã lỗi thành hợp lệ. Một progress-stepper từ `shared/flow-guidance.mjs` xuất hiện trong lúc công việc chung thay đổi đồng thời; được giữ nguyên, không quy phần này là thiết kế mới của P04 r08. Before/after có khác biệt từ lớp dùng chung này, nên không dùng để kết luận pixel-perfect cho toàn màn. Capture after giữ giờ mã nhập tay01:45:00 như ảnh before bằng override đồng hồ chỉ trong test; không sửa source/baseline.
