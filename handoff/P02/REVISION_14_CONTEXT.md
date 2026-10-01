# P02 r14 — quyết định trước triển khai danh sách gần đây

| Loại nguồn | Nội dung áp dụng |
| --- | --- |
| BASELINE B02 | Khu vực Chứng từ gần đây có3 dòng và Xem tất cả; giữ vị trí/khung Home, footerLOCK và icon nghiệp vụ. Không sửa ảnhbaseline. |
| USER-CHANGE 2026-09-29 | Đề xuất số bản ghi vừa đủ; hiển thị theo thời gian mới nhất; **Xem tất cả đi quản lý Chứng từ P12**. Chỉ thị này thay chốt cũ Home Xem tất cả→Lịch sử, không đổi tab Lịch sử. |
| VERIFIED COMPONENT | P12 `mergeDocuments`, `selectDocuments`, `STATUSES/TYPES`, các trường `id/number/day/time/status/warehouseId`; P04/P05 confirmed receipts, P09 case source dùng chung. P12 chi tiết theo `doc` ID. |
| IMPLEMENTATION CHOICE | Tối đa3 dòng, không tạo đủ3 nếu nguồn ít hơn. Sắp theo day/time mới nhất, tie-break ID ổn định; không giả giờ cho bản ghi thiếu thời gian. Home hiển thị mã/loại/trạng thái/thời gian; đối tác và chi tiết tại P12. |
| IMPLEMENTATION CHOICE | Xem tất cả mở P12 mặc định tất cả loại/trạng thái/ngày, query rỗng, sort mới nhất, tránh bộ lọc cũ che chứng từ. Bộ lọc entryHome riêng để không ghi đè view thường/KPI. |
| UNKNOWN | API/timestamp production chưa được xác minh; dữ liệu đang là fixture đầy đủ. Không tuyên bố dữ liệuWMS realtime hoặc visualpixelPASS. |

Before/after cùng viewport494×950,DPR1, fixture xác nhận lúc2026-09-29T01:15:20Z (clock cố định chỉ trong browser QA). Giữ trạng thái triển khai hiện tại của các prompt khác.
