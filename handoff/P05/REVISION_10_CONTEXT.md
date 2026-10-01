# P05 r10 — nguồn và phạm vi trước triển khai

User29/09/2026 yêu cầu áp dụng6 đề xuất đã trao đổi: thu gọn giao hàng hợp lệ; tiến độ quét luôn thấy; xóa ô mã và hỗ trợ bàn phím; sửa nhanh từ review; lọc trùng/lỗi; bảo vệ khi reload/đóng tab có phiếu dở.

| Phần | Nguồn | Lựa chọn triển khai cần review |
|---|---|---|
| 4 panel/khung494×950/header/footer | B05 và những chốt P05 trước, shellHome | Giữ ID/kích thước, không sửa baseline |
| Thẻ giao hàng thu gọn | Chỉ thị user chấp nhận đề xuất mới | Chỉ thu gọn sau xác nhận thông tin hợp lệ hoặc rời cụm field; có Sửa; lỗi tự mở lại; không collapse giữa lúc đang gõ |
| Tiến độ ngắn | Đề xuất user chấp nhận | Một dòng cố định dưới header ở S02, không tạo panel; dùng count thực từ accepted |
| Xóa ô nhập | Đề xuất user chấp nhận | Chỉ xóa raw chưa submit, không xóa attempts/accepted; focus lại ô; không mở camera thật |
| Sửa từ review | Đề xuất user chấp nhận + khóa request hiện tại | Lưu điểm quay về trong flow; chỉ trước request, giữ ID/scans; quay lại review khi valid |
| Lọc Tất cả/Trùng/Lỗi | Đề xuất user chấp nhận | Lọc presentation, không thay totals; lỗi gồm invalid/blocked; chi tiết đọc bằng action dialog dùng chung |
| Cảnh báo reload/đóng tab | Đề xuất user chấp nhận | beforeunload theo dữ liệu thay đổi/scans/pending/UNKNOWN; browser quản lý nội dung và quyền hiện prompt; không giả autosave/persistence |
| Dialog/readable/icon | AGENTS.md, UI_STANDARD.md hiện hành | Tái sử dụng action-feedback/readable-text/operation-icons; không đổi chuẩn hệ thống |

Các nhánh mới chưa có raster Designer tương ứng: đây là adaptation được phép triển khai, hình thức vẫn chờ user review. Evidence before/after cùng viewport494×1000,DPR1 và fixture trong `evidence/revision-10/{before,after}`. Các kiểm layout/behavior không thay cho visual acceptance. Không push/merge/deploy, không ghi đè checkpoint hiện hành.
