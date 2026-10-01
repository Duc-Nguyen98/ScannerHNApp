# P05 revision 03 — Validation trường và số điện thoại

Yêu cầu ngày 27/09/2026: xử lý regex phone và validate các trường, gồm ô nhập mã đang dùng thông báo mặc định của browser trong ảnh `C:/Users/TAN MIE/Desktop/1.png`.

## Phạm vi và quy tắc

- Chỉ sửa form/flow P05 và import version liên quan. Workspace hiện đã có P06–P08; giữ nguyên checkpoint P08 và toàn bộ công việc có trước.
- Số điện thoại bắt buộc: kiểm tra định dạng Việt Nam, di động 10 chữ số bắt đầu 03/05/07/08/09 hoặc cố định 11 chữ số bắt đầu 02. Cho phép thay 0 bằng +84; cho phép một dấu cách/chấm/gạch nối giữa nhóm chữ số. Ví dụ `0901 234 567`, `+84 901 234 567`, `028 3822 1234`. Chỉ bỏ khoảng trắng ngoài và dấu phân cách để kiểm tra; dữ liệu gốc trong phiếu không bị viết lại. Không xác thực số đang hoạt động/chủ sở hữu, không OTP/API.
- Regex sau kiểm tra cú pháp dấu phân cách: `^(?:0|\+84)(?:[35789][0-9]{8}|2[0-9]{9})$`. Đây là quy tắc form prototype theo yêu cầu mới; không phải API/contract backend được duyệt.
- Mã phiếu, người nhận, số điện thoại, địa chỉ, nhóm hàng không được trống/chỉ khoảng trắng. Số lượng từ phiếu nguồn phải nguyên dương; không cho sửa để giảm kế hoạch 10. Các dữ liệu nguồn bị null/thiếu được chặn an toàn. Không thêm regex tên/địa chỉ tùy tiện.
- Ghi chú tùy chọn, tối đa 200 ký tự; UI có maxlength và bộ đếm. Flow chặn >200 khi bị gọi trực tiếp, không âm thầm cắt mất nội dung.
- Kiểm tra lại metadata trước chuyển bước và trước tạo yêu cầu gửi. Lỗi inline, viền đỏ, aria-invalid/aria-describedby/aria-live; focus trường lỗi đầu tiên khi tiếp tục; cập nhật lỗi sau blur hoặc khi sửa trường đã kiểm tra.
- Ô mã có `novalidate` và lỗi inline thay bong bóng native. Rỗng/chỉ khoảng trắng không tạo lượt quét. Mã khác giữ nguyên raw, dùng pipeline kiểm tra hiện có; không trim/uppercase mã. Invalid/duplicate giữ giá trị để sửa; valid mới xóa ô nhập. Duplicate không cộng số lượng. Lỗi nghiệp vụ P17.S02 vẫn giữ nguyên.
- Giữ ID, phiên quét, mã đã nhận, request và vòng đời r02. Không reset draft/pending/UNKNOWN. Chưa thay đổi nghiệp vụ gửi Web/chờ xử lý/chưa ghi sổ.

## Kiểm chứng

- Node toàn workspace: **116/116 PASS**, trong đó **18 P05**. [Log](evidence/revision-03/node-tests.txt).
- Validation browser: **8 nhóm PASS**, gồm required/regex/correction, note200, empty/raw/duplicate, bảo toàn draft, gửi đủ10, lượt mới, layout390/1440. [Kết quả](evidence/revision-03/browser-results.json).
- Lifecycle P05: **8 nhóm PASS**, gồm cả hai đường mở, thành công/thất bại, draft/pending/UNKNOWN. [Kết quả](evidence/revision-03/lifecycle/browser-results.json).
- Hồi quy P05/P04: **12 nhóm PASS**. [Kết quả](evidence/revision-03/regression/browser-results.json).
- Các suite browser trên không có lỗi JavaScript. Đã xem ảnh actual [lỗi metadata mobile](evidence/revision-03/04-layout-390.png) và [mã trống](evidence/revision-03/03-empty-code.png). Shell vẫn 494×950 CSS px, nội dung cuộn, CTA ổn định.
- Visual state mới chờ user duyệt; không tuyên bố pixel-perfect với B05. Backend/hardware chưa tích hợp/kiểm chứng.

Không reload tab làm mất dữ liệu người dùng; kiểm thử bằng browser riêng. Không push/merge/deploy.
