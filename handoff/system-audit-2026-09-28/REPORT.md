# Rà soát ổn định luồng và UI/UX — 2026-09-28

Target là prototype HTML/CSS/JS trong docs/flows. Điểm bắt đầu đã có P01–P09 và các dependency lịch sử/linh kiện. Không mở rộng board hoặc thay baseline/P02 LOCKED. Các thay đổi P04/P05/P09 xuất hiện đồng thời trong workspace được giữ; báo cáo này chỉ nhận phần sửa dùng chung và các lần kiểm chứng ghi bên dưới.

## Lỗi tìm thấy và cách xử lý

| Vấn đề | Bằng chứng / ảnh hưởng | Khắc phục |
|---|---|---|
| Trang trắng khi tải module không thành công | Tab thật chỉ có công cụ prototype, không có form. Network ghi ERR_CONNECTION_REFUSED. Có lúc hai tiến trình serve_preview.py cùng listen127.0.0.1:8766. | PreviewServer tăng accept backlog128 và dùng SO_EXCLUSIVEADDRUSE trên Windows; bootstrap bắt lỗi import, hiện thông báo/nút tải lại ngoài app. Không tự reload hoặc lưu session. Dùng8767 riêng cho kiểm tra, không tiếp tục can thiệp các máy chủ do công việc khác khởi động. |
| Tiêu đề tab giữ tên Nhập/Xuất khi về Home hoặc mở dependency | Home showRoute chưa đặt lại document.title; lớp destination cũ cũng được giữ. | Đặt tiêu đề đúng Home/P22/dependency và xóa lớp destination khi về Home. |
| Mũi tên Back ở đầu màn Quét mã hiện nhưng không bấm được | Header bị inert cùng phần nền, dù đã có handler data-p03-back. | Cho phép header tương tác và vào thứ tự Tab; giữ disabled khi busy hoặc Kho tạm dừng. S04 Back chỉ trở lại S02, không xóa dữ liệu. |
| Footer trong P03 trông khả dụng khi đang lưu nhưng handler từ chối | Controller đã chặn busy, UI chưa phản ánh. | Disable cả footer/Back trong khi lưu; khôi phục trạng thái disabled trước đó khi đóng/dispose. Không đổi màu/palette/layout. |
| Bộ kiểm tra P03 cũ không còn khớp module hiện có | Vẫn chờ “P09 chưa có”; tọa độ bấm backdrop theo chiều rộng394 cũ; kỳ vọng Tab không có header. | Cập nhật expectation theo P09 hiện có, lấy vị trí từ bounding box, kiểm thứ tự Tab mới. Mock nguồn địa lý đã có khi đi qua P05 để hồi quy không phụ thuộc mạng bên ngoài. |

Việc hai server cùng cổng và lỗi mạng là quan sát thực tế; không khẳng định đó là nguyên nhân duy nhất của mọi lần tải lỗi trước đây. Bộ kiểm tra tái tải và mô phỏng lỗi import xác minh hành vi sau sửa.

## Kiểm chứng

Kết quả cuối và đường dẫn từng suite ở [SUMMARY.json](SUMMARY.json). Log lỗi lượt đầu được giữ riêng, không dùng để chứng minh PASS. Không cộng các lượt chạy lại như các ca độc lập.

- Node: lần đầu173 PASS; lần kiểm nguồn cuối196 PASS, bao gồm test mới từ công việc song song. [Log cuối](evidence/node-final.txt).
- Kiểm tra browser theo module: Home, P03, Nhập, Xuất, Tra cứu, NFC, Lịch sử, Bảo hành, Back của Bảo hành và chuẩn icon. Phạm vi gồm gửi trùng, retry/UNKNOWN, bản nháp, giữ context/ID, logout/Back, bố cục responsive và dữ liệu fixture.
- Bộ kiểm tra ổn định riêng: lỗi import → nút tải lại → login;10 lần reload; title Home/dependency; Back header P03; busy lock/unlock; kho dừng; khung P02/P03 ở3 kích thước. [Kết quả](evidence/system/results.json).
- Tab IAB thật: bấm backdrop giữ picker; bấm Back header về Home, title P02 đúng. [Ảnh Home](evidence/live-home.png).
- Các kiểm tra UI dùng Chromium/viewport mô phỏng; thiết bị/camera/NFC thật chưa kiểm. P04/P05 không ghi sổ tồn, warranty components direct Post vẫn theo contract hiện có.

## Đồng bộ UI/UX và đề xuất

Giữ khung494×950/thu phóng chung, footer P02, backdrop vuông80%, màu P01 cho CTA và palette nghiệp vụ theo operation-icons.css; không trộn màu nghiệp vụ với cảnh báo/trạng thái. Không thay font/logo/texture khi chưa có nguồn chuẩn. [Phương án nâng cấp cụ thể](UI_UX_PROPOSALS.md) phân biệt phần đã sửa và phần cần duyệt thiết kế/contract trước.

**Visual:** kiểm tính đồng bộ/không tràn/chồng ở các trường hợp đã chạy; chưa chứng minh pixel-perfect hoặc nghiệm thu toàn bộ board. **Behavior:** theo kết quả thực tế trong SUMMARY.json. **Integration:** WMS/hardware chưa được xác minh; nguồn địa lý P05 đã có từ công việc trước, các suite có mock không chứng minh API live. Dữ liệu nghiệp vụ còn là fixture trong bộ nhớ.

Preview kiểm tra độc lập: http://127.0.0.1:8767/flows/auth-session/ (`minhanh` / `preview`). Cổng8766 và các bản sửa khác của workspace được giữ. Không push, merge, deploy, sửa dist/gallery hoặc triển khai thêm prompt.
