# P02 r16 — nguồn và quyết định trước sửa

Yêu cầu: rà soát và sửa lỗi UI/UX bản hiện tại. Phạm vi lần này: Home và các đường đi/Back/dialog từ Home; kiểm hồi quy module dùng chung, không triển khai prompt mới. Workspace đang có công việc P18 của lượt khác, giữ nguyên.

| Hạng mục | Nguồn/ràng buộc | Quyết định |
| --- | --- | --- |
| Bố cục, thương hiệu, footer | B02; AGENTS.md; UI_STANDARD HN-footer-locked-v1 | Giữ frame 494×950, lưới, palette nghiệp vụ, footer và số recent tối đa 3. |
| Trạng thái kho | session warehouse.active, Home cho phép đọc khi kho tạm dừng | Sửa màu trạng thái theo giá trị thật; không đổi quyền hoặc write guard. Màu cảnh báo là adaptation cần review hình thức. |
| Live refresh focus | r15 cập nhật nhãn ngày/dữ liệu, yêu cầu Back giữ context | Giữ focus dòng hiện tại theo ID khi thay DOM; mất dòng thì fallback heading. Không cướp focus khi đang ở dialog/module khác. |
| Vùng bấm | Xem tất cả hiện cao 24px (probe thực tế) | Tăng vùng tương tác lên 44px trong tọa độ frame; giữ vị trí chữ và khoảng cách section. Preview vẫn scale cả khung. |
| Nội dung dài/UNKNOWN | Giữ nguyên dữ liệu; không tự báo thành công | Kiểm tra mã dài, chia phần text/meta không đè nhau; UNKNOWN có nhãn tiếng Việt, không giả số 0. |
| Độ đọc chữ nhỏ | Text phụ và badge trạng thái Home | Đo tương phản trước/sau, chỉ đậm màu chữ nếu cần; không đổi nền hoặc icon nghiệp vụ/footer. |

Before: evidence/revision-16-audit/before-home.png, before-draft-focus.png. Probe đổi đồng hồ QA từ 28/09 sang 30/09 làm focus về body khi recent đổi nhãn. Nhánh stopped chưa có before screenshot riêng; lỗi màu được xác định từ CSS dùng màu hoạt động cho mọi trạng thái. Việc kiểm logic không phải nghiệm thu visual hoặc tích hợp WMS. Không thay asset chưa xác minh bằng asset tự tạo.
