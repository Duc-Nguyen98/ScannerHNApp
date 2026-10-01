# Không dùng các ảnh trong thư mục này làm nghiệm thu

Ảnh thử CDP có thể sai scale/crop sau đổi viewport trên host Windows; 2 file438 được thử ghi JPEG vào tên PNG. Tất cả được giữ nguyên để truy vết, không phải actual cuối. Actual cuối ở thư mục cha là `P01-*.jpg`, lấy nguyên bytes từ browser surface và kiểm tra trực quan. Không sửa/resize ảnh lỗi thành ảnh được coi là PASS.
