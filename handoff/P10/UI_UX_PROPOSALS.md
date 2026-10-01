# P10 — đề xuất UI/UX sau audit r03

## Đã xử lý trong phạm vi sửa lỗi

Back tiêu thụ đúng history entry; không lặp màn sau Back/Forward; khôi phục focus; không dựng lại form khi nhận event trùng; CTA Lưu chỉ bật khi có thay đổi; vùng bấm Back/Xóa44px; dialog có mô tả accessible. Giữ nhóm menu và logout đỏ r02.

## Trạng thái đề xuất

User đã duyệt áp dụng mục1 và2; hoàn tất trong [P10 r04](REVISION_04.md). Mục3 tiếp tục chờ contract/kết nối thực tế, không được suy thành quyền phát minh API hoặc state thành công.

## Nội dung đề xuất đã thảo luận

1. **Thông báo rõ “Có thay đổi chưa lưu” ở form.** Có thể đặt dòng nhỏ phía trên CTA, cùng phong cách helper của các form hệ thống; giúp hiểu vì sao Lưu đang bật. Chỉ xuất hiện khi dirty và biến mất khi hoàn nguyên. Đây là bổ sung copy/layout, không cần giả API. Hiện trạng đã có CTA disabled và dialog khi rời, nên không bắt buộc để luồng ổn định.
2. **Giảm lặp thị giác ở Tài khoản & bảo mật nếu muốn đồng bộ sâu hơn với S01.** Ba chức năng có thể dùng một card với divider như nhóm thông tin r02. Hiện S04 vẫn giữ bố cục B10 và không có lỗi hiển thị; chỉ thực hiện khi user duyệt thay đổi thiết kế S04, không tự suy từ chỉnh S01.
3. **Khi có contract profile/upload thật:** bổ sung lỗi ngay dưới field tương ứng, trạng thái đang lưu, kết quả theo receipt, tiến trình và thử lại upload theo lỗi nguồn. Quyền cần trạng thái loading/error/denied từ adapter thật; không tự biến dấu hỏi hiện tại thành tick xanh. Đây là phần tích hợp sau, không tạo policy, enum hay thành công giả để hoàn thiện hình thức.

Không đề xuất thêm ảnh trang trí, badge demo/version trong app, animation logout, hoặc mở thêm panel ngoài bốn panel P10. Phần giao diện hiện tại đã có thứ bậc rõ; ưu tiên hoàn tất nguồn dữ liệu và state có căn cứ.
