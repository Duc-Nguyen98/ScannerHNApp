# P08 r02 — phạm vi user đã duyệt

User xác nhận triển khai7 hạng mục trong chat. Chỉ P08 và điểm nối trực tiếp P22/P23; không triển khai board tiếp theo. Giữ24 prompt/91 panel, baseline và dữ liệu fixture.

1. Khi nhúng lịch sử trong app: một shell494×950, font/header/nav đồng bộ P07, bỏ statusbar giả và footer Back thừa. Standalone P22/P23 vẫn giữ thiết kế riêng.
2. Hub Lịch sử chung đọc toàn nguồn; Nhập/xuất có scope chỉ inbound/outbound, không tạo nguồn khác.
3. Số kết quả/tổng nguồn riêng; khoảng ngày thật; lựa chọn sort có nhãn; xóa lọc giữ scope nghiệp vụ.
4. S02 Thông tin chỉ mốc cuối; timeline đầy đủ ở tab riêng. S04 grid chỉ đọc, danh sách mở drilldown, không bỏ grid/panel.
5. S03 mở danh sách phiên P23 thay vì lặp chi tiết; chọn phiên dùng lại S03 cùng model/ID, Back giữ context.
6. Technical notes Pxx/fixture quantity/reporting definition ra tools. Nhãn Dữ liệu mô phỏng luôn rõ. Thiếu tệp/chứng từ chỉ thông tin tại chỗ, bỏ CTA vô tác dụng.
7. Badge theo dữ liệu mọi record; thiếu actor/kho không fallback danh tính. Chuẩn hóa CSS P08 theo P06/P07, không sửa P01–P07 visual/state.

Số đo có nguồn kế thừa CONTEXT.md: shell494×950, header86px,nav75px,padding18px,body radius24px,card12px,icon28px,Arial theo P07. Audit xác minh iframe phone494×800/Public Sans/statusbar1/Back3; lớp embedded mới chỉ áp history-hub/nfc/nfc-detail/events-unavailable/sessions/session-detail.

Visual delta do user duyệt, không sửa B08. R01 evidence giữ nguyên; r02 trong evidence/revision-02. Nếu cần thay dữ liệu mẫu/API/quyền hoặc board khác, dừng và hỏi lại user.
