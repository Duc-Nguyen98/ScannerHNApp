# P13 r07 — audit lỗi UX

Phạm vi người dùng: rà soát/sửa các lỗi UI/UX P13 và các cạnh điều hướng trực tiếp. Không mở lại thiết kế các module khác đang có thay đổi đồng thời. r06 tạm chốt được giữ là lịch sử; các sửa audit là revision mới.

| Nguồn | Quyết định sửa |
|---|---|
| User yêu cầu rà soát kỹ | Kiểm happy path, tải trễ1200ms, đổi tab/Back/reader trong lúc request đang chạy |
| before/audit-results.json | 6 lỗi tái hiện: mất focus khi load, response cướp focus, mark-read phá reader, Back không trả dòng, fallbackBack tạo entry mới, page chen vào empty |
| UI_STANDARD | Reader/dialog một lớp, giữ focus và Back; footer/menu/leading/icon không đổi |
| Hướng thực thi | Giữ node nút và status; cập nhật các dòng cần đổi thay vì render cả màn; hoãn cập nhật body khi có overlay; focus chỉ chuyển nếu người dùng vẫn ở control gọi request |
| Navigation | Lưu origin của list/chi tiết trong phiên; Back về row còn tồn tại hoặc row kế tiếp/tab; deep-link fallback replace thay push |
| Giới hạn | Không tự thêm quyền/API/enum; không tự chốt visual chỉ bằng tests; loại dữ liệu không phải nhập/xuất không có dock xử lýWeb |

Before và after dùng cùng script/cases; ảnh fail và kết quả thực lưu riêng. Preview8766 đang có nhiều kiểm tra từ chat khác; audit dùng serverlocal8781 cùng workspace để giảm tranh chấp, không restart/kill server hoặc tiến trình chat khác. Một lần thử đầu trên8766 timeout ở bước tải login (không được tính là lỗi UX P13); chạy lại8781 tái hiện được lỗi ứng dụng.
