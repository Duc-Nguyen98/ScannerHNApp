# P13 r05 — giữ menu và khung chi tiết

| Nguồn | Quyết định |
|---|---|
| User ảnh1,2026-09-29 | Chi tiết thông báo mất menu, cần giữ layout thống nhất |
| Nguyên nhân code | `.p13-detail-screen>.hn-nav{display:none}` ẩn nav trên S02/S04; không phải auth mất phiên |
| B13 lịch sử | Detail không có footer trong ảnh; chỉ thị user mới thay lựa chọn này |
| Component khóa | Dùng đúng5 mục `.hn-nav` Home/P03; không tạo footer thứ hai hoặc sửa palette/size/radius/icon |
| Implementation choice | Cả4 panel P13 dùng menu chung. Detail có CTA giữ dock trên menu, padding đáy44px để cách scan-circle; không có chứng từ thì không tạo dock rỗng |

Giữ shell494×950, header đứng yên; chỉ body cuộn. Không nén nội dung/leading hoặc đổi dữ liệu để ép vừa. S02/S04 đều là trang đọc nên giữ nav xuyên suốt, xử lý nguyên nhân CSS thay vì thêm override rời rạc theo loại event. Class detail vẫn phục vụ dock spacing và lifecycle P03, không còn ẩn menu.

Kiểm actual trước/sau cùng494×950,DPR1 với event user `p13-count-review-00832`, thông báo nhập PN-0005 và S04. Kiểm7 viewport, nav không đổi vị trí/style, CTA nằm trên vùng scan-circle; nội dung dài/reader/dialog khóa nền; Quét mã rồi Escape/Back trở lại đúng detail; Back từ danh sách giữ filter/pages/scroll. Header/back và các tab menu vẫn dùng routes hiện có. Không thêm màn, không sửa footer chung.

Visual candidate theo thay đổi user, chưa tự LOCKED. Backend scope/read receipt/notifications vẫn prototype, không đổi integration.
