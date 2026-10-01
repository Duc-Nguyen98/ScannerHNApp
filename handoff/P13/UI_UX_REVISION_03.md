# P13 r03 — phân trang chủ động

| Nguồn | Quyết định |
|---|---|
| B13/P13 IDs | Giữ4 panel, list/detail notification và2 panel MIGRATED theo dõi Web |
| User request + ảnh1/2 | Không tải vô hạn; giới hạn mặc định và chỉ tải tiếp khi bấm Xem thêm |
| Component/contract | Giữ nền trắng/lề24px/tab đứng yên r02; footer khóa; reader3 dòng; lỗi thao tác dùng dialog |
| Implementation choice cần review | 10 tin lần đầu +10 mỗi lần tiếp theo, mới nhất trước; không tự tải khi cuộn |
| Không có baseline Designer | Vùng cuối danh sách: Đang hiển thị N thông báo + nút Xem thêm10/Đang tải/Thử tải thêm; hết trang thì nhãn Đã xem hết |

10 là kích thước một đợt dữ liệu, không phải số dòng ép vừa màn hình. Với body1.5 và mỗi tin150–180px, người dùng cuộn tự nhiên trong app. Ít hơn10 thì hiển thị đúng số có thật, không tạo hàng trống hoặc nút chết. So với5, số lần bấm giảm; so với20, lần đầu gọn hơn. Đây là lựa chọn sản phẩm cho prototype, không tuyên bố chuẩn bắt buộc hay contract backend.

Mỗi tab giữ riêng cache/cursor/vị trí cuộn; Back từ chi tiết giữ đợt đã tải. Badge Chưa đọc là tổng nguồn, không phải số đã tải. Mark-read có receipt mới trừ; không tự nạp tin bù vào tab Chưa đọc sau khi đọc một tin. Cursor dựa mốc sắp xếp/ID để không bỏ sót khi tin đã đọc rời bộ lọc. Hợp nhất chống trùng ID; khóa request đang gửi; hồi đáp khác session/filter không ghi vào tab hiện tại. Lỗi tải tiếp giữ dữ liệu, cursor, scroll; báo dialog một lớp, thử lại cùng trang.

Nguồn hiện có5 events: vẫn giữ. Thêm bộ37 events kiểm thử ở công cụ ngoài app để xem đầy đủ các đợt10→20→30→37; không giả nguồn WMS hoặc badge unread. Page adapter chỉ là contract local preview; production cần API cursor/scope/read-count được chốt riêng. Before/after cùng494×950,DPR1,5 events ban đầu; thêm ảnh states loading/error/end và bộ37 để review hành vi mới.
