# P05 revision05 — khách vãng lai, lựa chọn metadata, số lượng1–99

Yêu cầu ngày27/09/2026 (ảnh `C:/Users/TAN MIE/Desktop/3.png`) thay thế giới hạn trước đây giữ cố định planned10 trong phạm vi P05: người dùng nhập số nguyên1–99, phiếu mới mặc định1; cần xử lý khách chưa có và làm hoạt động lựa chọn mã phiếu/người nhận/nhóm hàng.

## Đã triển khai

- Ba native select có keyboard/touch support. Danh sách là fixture trong prototype, không phải API mới.
- Mã phiếu: Phiếu mới (mẫu PX-0005, planned1), PX-0005 mẫu B05 (planned10), PX-0006 mẫu (planned2, An Bình, ZD421). PX-0004 lịch sử không được dùng thay phiếu mới. Mã hiển thị đều là mẫu; không tự sinh số chứng từ production. Chọn phiếu khác cần xác nhận inline trước khi thay người nhận/liên hệ/số lượng/nhóm/ghi chú và cấp định danh draft riêng. Hủy giữ dữ liệu; CTA tiếp tục bị khóa trong lúc chờ quyết định. Sau lượt quét đầu tiên không đổi nguồn phiếu/nhóm.
- Người nhận: hai khách mẫu đã có (Minh Phát/An Bình) tự điền liên hệ; Khách vãng lai/khách mới mở tên và xóa liên hệ của khách trước để nhập đúng người. Tên/phone/address bắt buộc; tên/địa chỉ không có regex giới hạn tiếng Việt tùy tiện, HTML được escape khi render. `recipientType=walk-in`, `recipientId=null`, chi tiết gắn vào document/request. Không gọi API tạo hồ sơ khách hàng, không giả danh ID đã tồn tại.
- Nhóm hàng: Máy in nhiệt (hai SKU), XP-420B, ZD421. Kiểm tra mã theo nhóm đã chọn; sai nhóm không tăng quantity. ID lựa chọn không có trong catalogue bị từ chối ở flow.
- Planned: text input + inputmode numeric + pattern `[1-9][0-9]?`; validator dùng `^[1-9][0-9]?$` cho raw string, sau đó kiểm tra integer1–99 trên document. Mặc định1 cho mỗi phiếu mới, chọn phiếu có sẵn điền kế hoạch của phiếu. Cho sửa thành1–99; không cho thấp hơn tổng đã soạn.
- Không parseInt/coerce/rút gọn chuỗi sai: rỗng/0/âm/100/số dài/thập phân/1e1/+1/01/khoảng trắng/chữ/số fullwidth đều có lỗi inline, giữ raw để sửa. Invalid có planned=null và plannedInput gốc; không đi tiếp, không quét, không gửi. Kiểm lại ở flow trước next/scan/send; không chỉ dựa vào thuộc tính HTML.
- Request đã gửi/đang gửi/UNKNOWN không cho sửa metadata, giữ nguyên request để đối chiếu/retry. Nháp, mã đã quét và lifecycle mới r02 giữ nguyên. Hoàn tất rồi mở lượt sau trở về số lượng1.
- Fixture batch7/10 chỉ chạy khi planned10/nhóm chung; trường hợp khác hướng dẫn sửa thông tin hoặc nhập từng mã. Baseline7/10→10/10 còn nguyên khi chủ động chọn mẫu10; không tự nạp đủ hay giảm kế hoạch.

## Kiểm chứng

- Node workspace **122/122 PASS**, trong đó **22 P05**. [Log](evidence/revision-05/node-tests.txt).
- Metadata mới **8 nhóm PASS**: default/select/autofill, source confirm/cancel, walk-in required/receipt, malformed/boundary1/99, group filter/lock, giảm số dưới đã soạn, fresh default1, layout390/1440. [Kết quả](evidence/revision-05/metadata-results.json).
- Validation **8**, lifecycle **8**, regression P05/P04 **12**, UX **8** nhóm PASS, tổng browser **44** nhóm. Kết quả nằm trong các thư mục `validation/`, `lifecycle/`, `regression/`, `ux/` dưới [evidence](evidence/revision-05).
- Regression được cập nhật để nhập rõ kế hoạch10 trước kịch bản10 sản phẩm, không giả định default10 nữa. Các assertion giữ identity/request/quantity/UNKNOWN/stock còn nguyên.
- Đã xem ảnh actual [khách vãng lai](evidence/revision-05/02-walk-in.png); nội dung dài cuộn trong shell494×950, CTA cố định, không tràn ngang.

UI/behavior đã kiểm bằng fixture; visual user review pending. Backend/camera chưa kiểm chứng. Validation browser/flow không thể thay bảo vệ máy chủ: khi tích hợp thật, server cần kiểm số lượng, recipient mode, source/group, permission, tồn và idempotency theo contract được duyệt. Không tuyên bố chống mọi sửa đổi JavaScript phía client.

Giữ checkpoint P08, công việc P03/P06–P08 hiện có, đủ91 coverage rows. Không sửa baseline, không push/merge/deploy.
