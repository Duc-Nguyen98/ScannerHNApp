# P24 r02 — sáu cải tiến được user yêu cầu triển khai

User: “Áp dụng đề xuất cho tôi”, sau sáu đề xuất UI/UX P24. Đây là cho phép triển khai cả sáu; hình thức mới chờ review, chưa tự thành baseline đã duyệt.

| Phần | Nguồn | Thay đổi |
|---|---|---|
| S01 | P19 sheet, owner lines/pending; đề xuất1 | So sánh số lượng của dòng đang sửa trước→sau; chỉ hợp lệ mới hiển thị sau xác nhận, không suy tồn sau Post |
| S02 | P19 owner snapshot; đề xuất2 | Số mã hợp lệ được giữ và mã phiếu đúng owner; “Sửa mã vừa nhập”; reader cho ID dài |
| S03 | P04/P05 verified record; đề xuất3/4 | CTA chính Xem phiếu + mã; mở bằng documentId. Hai mốc đã gửi/chờ Web; chưa ghi sổ/chưa đổi tồn, không bịa sự kiện Web |
| S04 | P20/P09 + P23 case ID; đề xuất5/6 | Một notice chỉ đọc dưới context; không lặp footer. Link trực tiếp quá trình P23, Back giữ cache/cuộn/focus đúng caller |

Giữ 4 panel, 24 board/91 panel, frame494×950, footer Home/P03, màu nghiệp vụ và status riêng, target44px, shared dialog/reader. Không đổi schema/backend, owner guard, record/Post/UNKNOWN, và các phiếu của chat khác. B24 là baseline lịch sử; r01 là nguồn trước sửa, stored tại evidence/revision-02/before/source và ảnh cùng viewport/DPR1/font local/timezone VN. S01 edit là nhánh adaptation của sheet P19, không có raster riêng trong B24.

Số đo kế thừa r01: P19 header86px, body padding20/gap14, card12px, input70px; S03 shared Public Sans17/1.5, heading26/1.35; controls ít nhất44px. Dòng so sánh nằm trong body cuộn; trình tự hai mốc thay nội dung giải thích cũ để tránh tăng chiều cao thừa; footer chính/phụ vẫn ổn định. Không thay primitive chung ngoài presentation waiting-web.
