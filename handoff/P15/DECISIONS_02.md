# P15 r02 — sáu nâng cấp UX người dùng yêu cầu áp dụng

User yêu cầu áp dụng toàn bộ sáu đề xuất ngay sau review r01. Giữ bốn ID, B15, footerLOCK và semantics UNKNOWN. Các kích thước mới là lựa chọn triển khai cần review, không phải số đo Designer.

| Nguồn | Trước r01 | Sau r02 |
|---|---|---|
| User đề xuất1 | Thử lại chung | Tải lại nếu lỗi đọc; Đối chiếu kết quả khi UNKNOWN; thiếu nguồn dùng Xem cách xử lý |
| User đề xuất2; owner P04/P05 | Không có ngữ cảnh | Số phiếu/loại/trạng thái từ owner đúng actor/kho, Quay lại phiếu; không thêm mã giả |
| User đề xuất3; auth r01 | Thông báo hết phiên chung | Giải thích tiếp tục đúng phiếu sau login+xác nhận; chỉ nêu giữ trong trang, không khẳng định đã lưu server |
| User đề xuất4 | Denied còn CTA xin lại; NFC hai nút cùng hướng dẫn | Denied ưu tiên hướng dẫn; kiểm tra lại là phụ để dùng sau khi đổi settings; unsupported một hướng dẫn riêng cho đúng thiết bị |
| User đề xuất5 | Contact nổi dù chưa cấu hình | Thao tác bị chặn chỉ khi nguồn chỉ rõ; chưa có contact hiện hướng dẫn phụ, không bịa kênh |
| User đề xuất6; shell/component r01 | Hero144/icon100, gap42; CTA trong vùng cuộn | Hero112/icon76, khoảng cách gọn; nội dung cuộn riêng và dock CTA cố định cho S01–03 |

Header100px/title25, lề24, CTA56px và footer sẵn có giữ nguyên. Dock padding20px; hero bottom16px; context card font17/25.5, mã dài dùng readable-text shared, không cắt dữ liệu. Device cards giữ cấu trúc hai card. Before/after chụp494×950 DPR1 Arial cùng fixture default, Chromium; nhánh context/UNKNOWN được kiểm thêm. Không sửa policy/backend/API.
