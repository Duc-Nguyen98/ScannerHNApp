# P07 — Enter để tra cứu, 30/09/2026

User yêu cầu áp dụng các đề xuất UX trong chat; phạm vi P07 ở lượt này là đề xuất4: Enter tại ô tìm kiếm mở kết quả duy nhất đã xác minh, nhiều kết quả chuyển focus đến danh sách. Đây là điều hướng đọc, không đọc phần cứng hay liên kết thẻ.

| Phần | Nguồn | Thực thi/lựa chọn |
|---|---|---|
| 4panel, artwork, animation | B07; r10; r13 hiện hành | Không sửa CSS/artwork hoặc cấu trúc panel |
| Enter từ ô tìm | Chỉ thị user áp dụng đề xuất4; P06 Enter hiện hữu | Dùng dialog thông tin thẻ hiện tại; nhiều kết quả focus hàng đầu |
| Nguồn thành công | Adapter fixture P07 đang đồng bộ, memory-only | Thêm status ready/denied cục bộ để phân biệt kết quả hợp lệ; không phải enum backend |
| Chặn auto-open | Yêu cầu giữ scope; P06 IME guards; UI_STANDARD | Query rỗng/IME/Enter giữ lâu/nguồn lỗi không mở; nguồn partial chỉ focus |
| Back, Escape, focus | app-modal/dialog-route dùng chung và r13 | Đóng chi tiết về input, giữ query/tab/scroll; không tạo overlay thứ hai |
| Before/after | Actual browser494×1000,DPR1,cùng fixture/route | Source snapshot source-before; ảnh/results ở before/after; hình thức chờ review |

Không đổi quyền, mapping, request/receipt, dữ liệu thẻ, storage, backend hay footer. Test fixture không đồng nghĩa tích hợp production/phần cứng.
