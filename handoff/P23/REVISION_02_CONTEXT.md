# P23 r02 — trước sửa

User yêu cầu áp dụng cả6 đề xuất UI/UX trong chat. Giữ4panel/frame494×950/owner/footer Home-P03; không API, mutation, hoặc tự nghiệm thu visual.

| Nguồn | Thay đổi được phép | Số đo/giới hạn |
|---|---|---|
| User + P22 dock r03 | Xóa query riêng; clear-filter chỉ khi có điều kiện; ngày/count cùng hàng | P08 search50px; tabs44px; target44px |
| B23 + user | Thứ tự card; marker Vừa xem | card radius12px, padding16–18px; mã gốc giữ trong detail/reader |
| B23 timeline + user | Gom time/actor; sự kiện mới nhất | metadata14px/1.5; note2dòng; không suy trạng thái |
| HANDOFF + user | Tách trạng thái phiên/kết quả; nhãn thống kê theo nghiệp vụ |3cột như B23, duplicate riêng, missing≠0 |
| P09/P20 owners + user | Mở hồ sơ/receipt có ID liên kết xác minh | adapter preview explicit reference, recheck handler; không dựa mã hiển thị |
| user | Tải lại ở dock/detail toolbar, footer chỉ Back | nút44px; giữ cache/cuộn/focus, timeout đọc15s |

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78 + working copy P01–P23r01. Source/screenshot trước sửa lưu revision-02/before. Các bố cục r02 là adaptation được phép triển khai, hình thức chờ review. Liên kết receipt không dùng nhãn Phiếu vừa xuất của P19 vì đây là đọc lại lịch sử. Scope production/quyền/schema vẫn chưa xác minh.
