# Audit sau sáu cải tiến — 30/09/2026 r02

User yêu cầu rà soát kỹ và khắc phục các lỗi UI/UX phát sinh. Phạm vi chính là P01–P11 và các điểm nối bị ảnh hưởng bởi sáu cải tiến UX20260930-r01. P01 r06 / P23 r03 của chat khác được giữ. Không tự triển khai P24 hay contract mới.

| Nguồn | Cách dùng |
|---|---|
| Baseline B01–B11, HANDOFF và Contract2.0 | Giữ ID panel, nghiệp vụ và guard dữ liệu |
| UX20260930-r01 được user yêu cầu triển khai | Điểm xuất phát để tái hiện lỗi, chưa phải raster đã duyệt |
| Footer/icon/dialog/readable-content đã khóa | Không thay palette/nav; nội dung dài đọc đủ trong app |
| Yêu cầu audit mới | Sửa lỗi tái hiện và nguyên nhân, giữ các hành vi đang đúng |
| Lựa chọn xử lý edge cases | Bố cục phụ và focus cần ảnh trước–sau cùng điều kiện; hình thức chờ review |

Các dữ liệu dài/nguồn chậm/lỗi trong probe được tạo trong browser test riêng, không ghi vào phiên người dùng hoặc backend. Không dùng số test để khẳng định hết mọi lỗi ngoài phạm vi đã kiểm. Bằng chứng trong shared/, p04-p05/, p06-p07/, routes/.
