# P01 r06 — sáu đề xuất UX được yêu cầu triển khai

User: “Áp dụng đề xuất cho tôi”, sau danh sách sáu đề xuất trong chat. Đây là cho phép triển khai, không phải nghiệm thu hình thức.

| Phần | Nguồn | Thay đổi / giới hạn |
| --- | --- | --- |
| P01.S01/S02 | B01 gốc + P01 r03 + shared AppShell hiện tại | Giữ artwork, màu, SVG, header/footer, ID; không sửa baseline |
| Bàn phím / Caps Lock / con trỏ | Đề xuất 1–2 được user yêu cầu | Hint theo sự kiện hỗ trợ, không lưu/sửa password; Enter không submit khi IME |
| Hướng dẫn phiên | Đề xuất 3; notice P01 hiện có | Đổi nội dung notice theo trạng thái thực; không thêm quyền/kho/API; trạng thái mới là adaptation chờ review |
| Home tải riêng | Đề xuất 4 | Import động cùng nguồn/version hiện tại; retry giao diện không startShift lại; callback cũ không mount sau logout |
| Vùng bấm | Đề xuất 5; component hiện có | Mở rộng link Quên mật khẩu và reader/close trong P01, không sửa footerLOCK hoặc palette |
| Quay lại / giữ focus | Đề xuất 6; Home/module owners hiện tại | Tái sử dụng cơ chế đang có; P01 quay về từ recovery trả focus đúng trigger, không giữ mật khẩu qua route |

Trước sửa: ảnh thực 494×950 tại evidence/revision-06-ux/before-*.png. Nội dung mới chưa có raster Designer. Kiểm thử prototype, không đại diện thiết bị thật/backend. Nguồn hiện đã tới P23, không ghi đè checkpoint của công việc khác.
