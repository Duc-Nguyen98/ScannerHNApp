# P19 r02 — sáu nâng cấp được user yêu cầu

User: “Áp dụng đề xuất cho tôi” sau danh sách6 đề xuất. Cho phép triển khai cả6; hình thức r02 vẫn chờ review. Giữ4panel/ID,494×950, footerLOCK, quyền và điều kiện xuất r01.

| Phần | Nguồn trước sửa | Thay đổi được yêu cầu | Lựa chọn triển khai |
|---|---|---|---|
| Nhập liên tục | shared scan-entry, P19 r01 | thu gọn camera, ưu tiên nhập/danh sách, giữ focus | camera64px trong chế độ tay; giữ nguyên DOM ô nhập khi nhận mã; danh sách gần nhất không thêm toast |
| Sửa hộp | S03 card và S02 sheet r01 | sửa qty ngay Kiểm tra | nút số lượng trên dòng BOX chưa ghi nhận; vẫn dùng owner.scan/quantity và sheet chung; xóa/tem đơn/UNKNOWN không mở sửa |
| Stepper | input70px, nút60px r01 | chọn toàn bộ số; khóa− tại1 và+ tại tồn | native input selection, disabled theo số và available đã biết; không tự gán tồn0 |
| Tiếp tục | P09 tác vụ linh kiện; owner P19 pending | nhãn số mã/tổng, UNKNOWN đối chiếu | snapshot hiện tại đúng actor/kho/phiên/case/document; không tạo phiếu mới khi resume; P21 lưu bền chưa tích hợp |
| UNKNOWN | S03 identifiers luôn bung r01 | hướng dẫn trước; chi tiết mở rộng | warning ngay dưới context, details native giữ full request/scan-session/version; CTA cố định ở footer |
| Phiếu vừa xuất | P09 trả về tab parts r01 | cuộn/focus viền thẻ receipt mới | truyền ID receipt đã xác nhận qua navigation; kiểm đúng case/POSTED; cuộn nội bộ, marker tiêu thụ một lần |

Reference before: evidence/revision-02/before (r01 source + same494×950 actuals). Asset/font/icon vẫn nguồn local r01, ảnh kho thay ảnh kệ thiếu giữ nguyên. Header86px, card12px radius, body17px, footerCTA60px giữ. Thay đổi spacing manual/qty control là adaptation theo yêu cầu mới, không tự coi là baseline Designer.
