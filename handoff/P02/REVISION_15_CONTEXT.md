# P02 UX r15 — nguồn/quyết định trước sửa (2026-09-29)

User đã yêu cầu áp dụng6 đề xuất của lượt trước. Đây là authorization chức năng trong prototype hiện có, không phê duyệt backend hoặc pixel-perfect.

| Nguồn | Áp dụng |
| --- | --- |
| USER-CHANGE | Shortcut phiếu dở, tile feedback, Back giữ context, nhập mã liên tục, clear filter empty state, ngày Hôm nay/Hôm qua. |
| LOCKED COMPONENTS | Footer/icon/action dialog/readable text theo AGENTS + UI_STANDARD; Home max3recent, View all→P12. |
| VERIFIED SOURCE | Owner P04/P05 giữ documentId/scanSessionId/version/request/accepted trong memory; start(context.documentId) không tạo run khác. Chỉ dùng snapshot owner, không đoán nhóm scan hoặc khôi phục backend. |
| IMPLEMENTATION | Home hiện shortcut cho mỗi phiếu owner có ID/scope/phiên khớp và chưa recorded. UNKNOWN là “Cần đối chiếu”, busy là “Đang gửi”; mở lại để xem/đối chiếu, không gửi lại tự động. Hai owner có2phiếu thì hiển thị2shortcut, không giấu bớt. |
| IMPLEMENTATION | Có shortcut thì body cuộn được dưới footer cố định; không xóa/bớt3recent để ép vừa. Giữ cả window scroll và inner Home scroll. |
| VERIFIED SOURCE | P04/P05 đã giữ focus/reset ô mã hợp lệ và select mã trùng/lỗi. Tái sử dụng, kiểm lại Enter/IME/không duplicate; không thêm banner kết quả trái contract dialog. |
| IMPLEMENTATION | “Xóa bộ lọc” dùng shared button, chỉ ở nguồn đã tải nhưng filtered result rỗng; không che lỗi/UNKNOWN/loading. Reset view read-only, giữ dữ liệu/nghiệp vụ/scope. |
| IMPLEMENTATION | Hôm nay/Hôm qua dựa ngày Asia/Ho_Chi_Minh; ngày cũ ghi ngày, tooltip/aria giữ đầy đủ. Không gọi API thời gian; cập nhật lại khi trở về Home/tab. |
| UNKNOWN | Không sourcebackend/hardware/sessionpersist; các shortcut chỉ trong phiên fixture đang sống. UI mới là adaptation cần review hình thức. |

Before/after Home494×950,DPR1, clock QA2026-09-28T01:15:20Z; ảnh theo từng nhánh mới trong evidence/revision-15-ux. Không sửa baseline/dist/gallery.
