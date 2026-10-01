# P06 — nguồn và phạm vi trước sửa, 30/09/2026

User yêu cầu áp dụng sáu đề xuất của chat. Phần P06 phụ trách đề xuất 3 (tối đa ba sản phẩm vừa xem khi tìm kiếm trống) và 5 (khoảng ngày nhanh dùng P08). Giữ bốn panel P06, khung494×950, footerLOCK, trạng thái nguồn và contract dialog/reader.

| Thành phần | Nguồn | Phân loại / phạm vi |
|---|---|---|
|Danh sách/chi tiết/tồn/lịch sử |B06 và P06 hiện hành |BASELINE: giữ ID, nguồn đọc và thông tin nghiệp vụ |
|Vừa xem tối đa3 khi query trống; nhớ trong phiên, xóa logout |Đề xuất được user yêu cầu áp dụng trong chat hiện tại |USER_CHANGE |
|Nhóm Vừa xem dạng hàng gọn trước kết quả, ID/category/actor/kho/phiên riêng |Tái dùng nét, màu, bo góc và typography của P06; chưa có raster cho nhánh mới |IMPLEMENTATION_CHOICE: adaptation chờ user review |
|Hôm nay/7/30/90ngày |P08 `openHistoryPicker({quickRanges:true})`, `history-ux.mjs` |REUSE: cùng logic/cấu trúc, không sao chép lịch |
|Mặc định Tất cả ngày |Contract lịch sử đã chốt trong user context |CORRECTION: source trước sửa còn preset mẫu01–09/09, đổi về rỗng cả hai ngày |
|Apply/Hủy/Back/Reset,90ngày Việt Nam |Shared history-picker, query-date-policy |LOCKED_COMPONENT: chỉ opt-in |

Ảnh thực tế trước/sau dùng cùng script `scripts/check_lookup_recent_upgrade.cjs`, phase `before`/`after`; cùng viewport494×1000 và360×800,DPR1,clock30/09/2026 13:00 Việt Nam,Arial,thứ tự mở HN12345→46→47 rồi Back. Chụp lịch sử HN12346 và dialog ngày cùng điều kiện. File source trước sửa được sao chép vào `source-before/`. Không sửa ảnh baseline hoặc evidence revision cũ. Không coi assertion hình học/test hành vi là user nghiệm thu hình thức.

Không thêm lưu bền, API, mutation, quyền, panel hay policy backend. ID gần đây chỉ trong bộ nhớ mountLookup; dữ liệu tên/tồn/SKU/serial luôn lấy lại từ nguồn khi hiển thị/mở. Không suy nguồn lỗi thành không còn sản phẩm. Nguồn preview chưa phải nguồn production.
