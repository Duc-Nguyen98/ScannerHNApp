# P21 r03 — nguồn và phạm vi rà soát

User yêu cầu rà soát kỹ và khắc phục lỗi UI/UX sau r02. Giữ P21.S01–S04, 24 board/91 panel, P20 r03 tạm chốt; không thay policy backend, footer Home/P03, ảnh baseline hoặc các màn khác đang làm.

| Phần | Nguồn | Cách xử lý |
|---|---|---|
| Bốn panel, thứ tự nội dung | B21, P21 prompt, DESIGN_TRACE.md | Giữ khung hiện hành và 6 cải tiến r02 |
| AppShell, màu/icon, reader, dialog | AGENTS.md, UI_STANDARD.md, issue.css, shared components | Giữ 494×950 CSS px, cuộn nội bộ, dùng primitive chung |
| Focus/cuộn khi dữ liệu về | UI_STANDARD: không giành focus mới; lifecycle reader | Sửa controller cục bộ P21; giữ reader mở và phục hồi đúng trigger |
| Kết quả đã đối chiếu | HANDOFF và owner P19 hiện hành | Escape/Back/Đóng chỉ đóng thông báo, không hoàn tác kết quả; đọc xác minh trước quét |
| Dữ liệu ngày/count thiếu hoặc dài | Missing ≠ 0, readable contract | Ngày sai hiện Chưa xác minh; escape text, giữ số gốc, containment cục bộ |
| Sao chép | r02 được yêu cầu, shared clipboard helper | Kiểm lại payload cùng owner sau Promise; bỏ phản hồi khi định danh thay đổi |
| Icon chưa xuất | Màu trạng thái tách nghiệp vụ | Chỉ checkpoint đã xác minh có màu xanh; clock chưa xuất giữ màu trung tính |

Trước sửa: source snapshot tại `evidence/revision-03/before/source`, ảnh r02 mặc định tại `before`, actual ca tái hiện tại `before/audit`. Script `scripts/audit_p21_r03.cjs before` chạy 13 nhóm, 12 FAIL/1 PASS. Các ca date/count/chuỗi dài dùng snapshot giả lập tại ranh giới view qua Playwright routing; delay đọc mẫu tăng từ 180 lên 900 ms để tái hiện tương tác giữa lúc chờ. Hook chỉ nằm trong test, không ghi vào source chạy thật. Các ca Escape/Back dùng owner P19 thật trong preview, không giả kết quả đối chiếu.

Ảnh trước–sau cùng Chromium/494×950 CSS px/DPR1/timezone Việt Nam/reduced motion. Phần hoàn thiện trạng thái lỗi là implementation choice chờ user review, không phải baseline Designer mới. Backend, clipboard/thiết bị thật và lưu bền chưa xác minh.
