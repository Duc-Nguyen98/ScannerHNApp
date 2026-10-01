# P13 r04 — số lượng lớn, badge và cuối danh sách

| Nguồn | Quyết định |
|---|---|
| User 2026-09-29 ảnh1 | Chuông24; đề nghị9+ và tối ưu100/1000 |
| User ảnh2/3 | Tab Chưa đọc và hai dòng thống kê cuối trang/nút số lượng gây dài/rối |
| Component hiện có | Home bell38×48, icon30; r03 phân trang10+10, count nguồn thật; tab và footer cố định |
| Lựa chọn triển khai | Chuông1–9, từ10 thành9+; tab0–99, từ100 thành99+. Không dùng1K làm mất nghĩa/ngôn ngữ. Caps chỉ là presentation |
| Contract giữ nguyên | Không thêm mark-all-read/xóa/reset dữ liệu; unread chỉ đổi sau receipt; UNKNOWN khác0; đủ4 panel |

Badge chuông hộp22×18px, font11px, giữ vị trí hiện có. 0 ẩn badge; chưa biết hiển thị? và nhãn rõ. Tab giữ2 cột hiện có, không thêm nút. Title/aria-label mang số chính xác có dấu phân nhóm tiếng Việt (1.000). Trong tab Chưa đọc, thống kê cuối trang vẫn thể hiện tổng chính xác để người dùng touch không phải dùng hover.

Cuối trang chưa hết: một dòng `Đã tải10 /1.000 thông báo` + nút nhãn ổn định `Xem thêm`. Accessible label nêu đúng số tải tiếp tối đa10 hoặc số còn lại; không đổi số trong nhãn nút. Đã hết: chỉ một dòng `Đã tải đủ37 thông báo`, bỏ counter lặp và nút. Dùng “đã tải” thay “đã xem hết” để không làm người dùng tưởng mọi tin đã đọc. Rỗng: giữ empty state, không thêm dòng0/0.

Caps áp dụng thống nhất ở render Home ban đầu, sync unread sau đọc/đổi bộ dữ liệu và tabP13. Không tải1000 tin để tính badge; count nguồn độc lập với page10. Prototype giữ nguồn trong bộ nhớ cho thử nghiệm; không tuyên bố benchmark/contract production. Các đợt người dùng chủ động tải vẫn nối tiếp như r03, không tự xóa các trang cũ.

Thêm lựa chọn kiểm thử số lượng lớn ngoài AppShell. Kiểm0/1/9/10/99/100/999/1000, transition10→9 và100→99, unknown/invalid, geometry chuông/tab/nav, số chính xác và10→20 với nguồn1000. Lưu before/after37 tại494×950,DPR1 cùng dữ liệu; caps và nhãn footer là adaptation theo yêu cầu user, chưa visual LOCKED.
