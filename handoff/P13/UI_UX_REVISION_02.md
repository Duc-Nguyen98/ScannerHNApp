# P13 r02 — đề xuất và triển khai theo phản hồi 1.png

User yêu cầu xử lý viền/lề và tác vụ rườm rà ngay, không chỉ đề xuất. Phạm vi S01/S02 phần thông báo, giữ đủ S03/S04 theo dõi Web.

## Nguyên nhân

S01 đang lồng `.p13-scroll` padding24px với button padding18px; card radius14px/gap16px trên nền xanh nhạt. Trục icon thực tế cách mép42px, text100px. Khối tác vụ đầu màn có border và padding riêng16px/24px. Các vùng lọc/card khác nhau tạo các dải nền dọc và ngang được khoanh trong ảnh. Bộ lọc nằm trong scroller nên biến mất khi cuộn dài.

## Phương án chọn

- Nền trắng liền cho S01/S02. Chỉ một lề chính24px; icon44px, gap14px, text bắt đầu82px. Loại bỏ card nổi/radius/border/shadow và gap giữa thông báo; ngăn bằng divider1px từ trục text tới lề phải. Giữ padding dọc20px và leading1.5.
- S01 chỉ có header + lọc Chưa đọc/Tất cả + danh sách + footer. Hai tab cao52px, chữ/underline biểu thị lựa chọn, không thêm khung lồng. Tab đứng ngoài scroller để luôn truy cập được.
- Bỏ hẳn khối tác vụ Theo dõi Web trên S01. Tại S02 của phiếu nhập/xuất đang chờ có link chữ phụ “Các phiếu chờ Web”, dưới CTA Xem chứng từ. Đây là đường vào S03, giữ4 panel, không thêm menu/overlay/route mới.
- Bỏ chevron trên từng dòng vì toàn dòng đã là nút. Giữ icon nghiệp vụ, dot chưa đọc, thời gian, nội dung, status và reader khi rút gọn; không sửa dữ liệu, nghiệp vụ hay badge nguồn.
- S02 bỏ nền/card/padding lồng, metadata dùng một bảng thoáng trên nền trắng; dock CTA không hiện trống cho thông báo không có chứng từ. Mark-read tự động giữ nguyên; nút thử lại chỉ xuất hiện khi chưa đánh dấu được.
- Không sửa footer Home/P03, shell494×950, giới hạn nhập hay các màn khác. S03/S04 giữ thiết kế r01 và hành vi chỉ đọc.

Đây là thiết kế ứng dụng theo phản hồi user, chưa tự gắn LOCKED/pixel-perfect. Đo lại actual tại494/459/360/430/1440/340/1869, kiểm tab/Back/reader, các trạng thái nguồn, tất cả4 panel và footer. Lưu ảnh và log riêng revision-02.
