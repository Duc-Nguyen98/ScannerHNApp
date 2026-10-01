# Nguồn và phạm vi trước sửa — P04/P05

- Baseline B04/B05: giữ đủ tám panel; nhập tay là nhánh của S02, không thêm panel.
- Component hiện tại: khung494×950, footerLOCK, operation-icons, action-feedback/dialog và readable-text; P04r09/P05r11 giữ các nâng cấp mới và P17 exception.
- User30/09/2026 cho phép áp dụng đề xuất2 (nhập tay tập trung) và6 (đổi phiếu có đối chiếu thông tin trước→sau).
- Lựa chọn triển khai cần review: camera mởNhập tay thu từ128px thành dải ngắn; vùng mã/manual/counter ưu tiên đọc; dialog chỉ rõ giá trị bị thay thế, địa chỉ cần chọn lại. Không có raster Designer riêng cho nhánh này.
- Before và after: cùng fixture/viewport/DPR1, browser riêng không chạm tab nháp user. Source trước sửa lưu ởbefore-source. Không sửa baseline/dist/gallery/backend/session policy.
