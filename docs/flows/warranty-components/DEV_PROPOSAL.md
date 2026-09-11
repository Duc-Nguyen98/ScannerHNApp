# Đề xuất hợp đồng dữ liệu cho DEV chốt

Trạng thái: **ĐỀ XUẤT — chưa tự động trở thành API/contract đang chạy**. Người dùng yêu cầu chuẩn bị phương án cụ thể để gửi DEV xác nhận. Không thay đổi validation hoặc backend từ tài liệu này.

## A. App gửi phiếu thiếu thông tin để hoàn thiện trên Web

### Phân tách đúng hai mốc

- **Gửi phiếu lên Web:** ghi nhận mã đã quét; chưa tăng/giảm tồn. UI dùng “Chờ xử lý trên Web”, mô tả “Phiếu đã gửi, chưa ghi sổ”.
- **Xác nhận trên Web WMS:** kiểm đủ thông tin, quyền, version, số lượng và trạng thái; xác nhận thì Post.
- **Ngoại lệ đã chốt:** xuất linh kiện bảo hành trên App vẫn create → scan → Post trực tiếp; không áp dụng nhánh gửi duyệt của nhập/xuất chính cho luồng này.

### Ma trận trường đề xuất

| Trường/nhóm | Khi App gửi phiếu | Trước khi Web Post |
| --- | --- | --- |
| Người thao tác, quyền, kho | Bắt buộc; server lấy từ phiên xác thực/phân quyền. Dự án một kho; không nhận actor tùy ý từ client | Kiểm lại quyền và kho trên server |
| Loại nghiệp vụ nhập/xuất | Bắt buộc | Không được đổi tùy ý làm sai ý nghĩa mã đã quét |
| Mã vật phẩm/serial hoặc mã hộp, SKU đã đối soát, số lượng | Ít nhất một mã hợp lệ. Tem đơn = 1; hộp có số lượng nguyên dương. Mã gốc lưu làm bằng chứng | Kiểm lại đủ dòng, tồn, đúng loại hàng/kho, serial và tính hợp lệ của mã |
| Mã phiên quét + client_request_id/idempotency key | Bắt buộc, giữ ổn định khi gửi lại cùng yêu cầu | Dùng để truy vết và ngăn tạo trùng |
| Tên phiếu, ghi chú, đối tác/nhà cung cấp | Cho phép chưa điền; server cấp mã phiếu. Hiện rõ trường cần bổ sung trên Web | Hoàn thiện theo nghiệp vụ và policy WMS; không dùng chuỗi giả để vượt validation |
| Nhóm người nhận, tên/ID người nhận của xuất hàng | Đề xuất cho phép thiếu tại mốc gửi | Bắt buộc trước Post xuất hàng khi nghiệp vụ cần đối tượng nhận |
| Điện thoại, tỉnh/phường, địa chỉ | Đề xuất cho phép thiếu; nếu nhập thì kiểm định dạng | Bắt buộc khi có giao hàng/liên hệ theo policy, không bắt vô điều kiện cho mọi loại phiếu |
| Số lượng kế hoạch/mục tiêu | Nếu phiếu nguồn có kế hoạch thì giữ nguyên; nếu quét tự do thì server tính tổng đã quét | Phải giải quyết chênh lệch trước Post; quét thiếu không có nghĩa được phép xuất thiếu |
| File đính kèm | Không bắt buộc tại mốc gửi trừ policy cụ thể | Theo loại chứng từ/policy của Web |

Đề xuất: App cho gửi lô quét chưa đủ metadata/kế hoạch, nhưng không chấp nhận mã sai hoặc giả dữ liệu bắt buộc. Web quyết định hoàn thiện/can thiệp; App không tự sửa số lượng kế hoạch để làm đủ.

### Phản hồi record đề xuất

Giữ envelope và enum trạng thái WMS hiện có. Thêm thông tin độ đầy đủ nếu backend chưa có; các trường dưới đây là contract đề xuất, không khẳng định đã được hỗ trợ:

```json
{
  "document_id": "server-issued-id",
  "document_no": "PN-0005",
  "version": "server-version",
  "ready_for_post": false,
  "missing_fields": ["recipient_name", "recipient_address"],
  "quantity_check": {"planned": 10, "scanned": 7, "complete": false},
  "next_action": "COMPLETE_ON_WEB"
}
```

- Không tự tạo enum server “Chờ xử lý trên Web”; đây là nhãn UI cho phiếu đã ghi nhận nhưng chưa Post.
- Lỗi record: giữ nháp và idempotency key. Timeout/kết quả chưa rõ: tra lại theo client_request_id trước khi gửi lại.
- Post Web phải từ chối khi `ready_for_post` chưa thỏa điều kiện tính lại tại thời điểm Post; không chỉ tin cờ cũ trong client.
- FE và BE cần cùng chốt thay đổi này. Source `f281bde` đang bắt buộc người nhận/điện thoại/tỉnh/phường/số lượng trước khi quét, nên chỉ thay chữ UI sẽ chưa đủ.

## B. Lịch sử NFC: dùng sự kiện nghiệp vụ thật

### Nguồn chính

- Gán/thay thẻ: sự kiện phát sinh sau khi backend xác nhận mapping NFC thành công, không lấy lúc chỉ đọc UID/prepare làm “đã gán”.
- Thu hồi/báo mất/hỏng: sự kiện sau khi backend lưu thay đổi trạng thái kèm lý do.
- Ưu tiên đọc audit/event backend đã có. Nếu audit hiện tại không phục vụ Mini App, bổ sung API đọc có phân quyền; không biến danh sách `/mini-app/nfc-tags` thành nhật ký bằng cách suy diễn lịch sử từ trạng thái cuối.
- Nếu chưa có nguồn event: hiển thị “Chưa có dữ liệu lịch sử”, không dựng sự kiện giả hoặc nói “Chưa có thao tác”.

### Schema sự kiện tối thiểu đề xuất

```json
{
  "event_id": "immutable-server-event-id",
  "event_type": "NFC_BOUND",
  "occurred_at": "2026-09-10T07:35:00Z",
  "actor": {"id": "staff-id", "display_name": "Minh Anh"},
  "warehouse_id": "warehouse-id",
  "item_id": "item-id",
  "sku_code": "LK-0001",
  "serial": "HN12345",
  "tag_uid": "NFC-8A2F",
  "previous_tag_uid": null,
  "document_id": null,
  "scan_session_id": "session-id",
  "result": "SUCCEEDED",
  "reason": null,
  "request_id": "correlation-id"
}
```

Nhóm event đề xuất: `NFC_BOUND`, `NFC_REPLACED`, `NFC_DEACTIVATED`, `NFC_MARKED_LOST`, `NFC_MARKED_DAMAGED`. Tên thực tế phải map tới event backend đang có; không đổi contract chỉ để khớp ví dụ.

### API đọc đề xuất nếu chưa có API phù hợp

`GET /api/v1/mini-app/nfc-events?cursor=...&limit=20&event_type=...&from=...&to=...&q=...`

- Server áp scope người/kho theo quyền; không tin user_id hoặc warehouse_id client gửi để mở rộng quyền.
- Thứ tự `occurred_at DESC, event_id DESC`; cursor ổn định, trả `items`, `next_cursor`, `has_more`.
- Client chống trùng theo `event_id`. Khi tải thêm lỗi giữ các trang đã tải. Khi quyền không cho xem tên người thực hiện, dùng nhãn server trả về.

## C. Lịch sử phiên quét: tách phiên, lần quét và chứng từ

### Nguồn và định danh

Source cũ có khai báo `/api/v1/scan/events`, nhưng chưa có UI đọc endpoint này. DEV cần kiểm tra schema thật: nếu thiếu `session_id` thì bổ sung liên kết phiên; không ghép phiên bằng cách suy đoán khoảng thời gian gần nhau.

- Mỗi lần bắt đầu nghiệp vụ có `client_session_id` ổn định; server cấp/map `session_id`.
- Mỗi lần quét có `client_event_id`; gửi lại cùng event không tạo dòng trùng. Phân biệt camera đọc trùng một tem với nhiều thao tác người dùng khác nhau.
- `auth_session_id`/token đăng nhập không phải `scan_session_id`. Không đưa token vào nhật ký.
- Kết quả “đã xuất” chỉ từ trạng thái Post backend; “gửi phiếu thành công” không được đổi thành POSTED.

### Schema phiên đề xuất

```json
{
  "session_id": "server-session-id",
  "client_session_id": "stable-client-session-id",
  "operation": "WARRANTY_COMPONENT_ISSUE",
  "actor_id": "staff-id",
  "warehouse_id": "warehouse-id",
  "started_at": "2026-09-10T07:30:00Z",
  "ended_at": "2026-09-10T07:35:00Z",
  "state": "COMPLETED",
  "result": "POSTED",
  "document_id": "document-id",
  "warranty_case_id": "case-id",
  "accepted_code_count": 2,
  "rejected_code_count": 0,
  "duplicate_attempt_count": 0,
  "issued_quantity": 3
}
```

Event quét: `event_id`, `client_event_id`, `session_id`, thời điểm quét, loại QR/barcode/NFC, SKU/serial, số lượng nếu có, `ACCEPTED/REJECTED/DUPLICATE`, lý do từ server, `document_id/line_id`, `request_id`. Lưu mã gốc theo chính sách dữ liệu; không ghi ảnh camera, mật khẩu/token hoặc PII không cần thiết.

### API đề xuất nếu API hiện có chưa đủ

- `GET /api/v1/mini-app/scan-sessions`: danh sách phiên, filter nghiệp vụ/ngày/trạng thái, cursor.
- `GET /api/v1/mini-app/scan-sessions/{id}`: metadata phiên.
- `GET /api/v1/mini-app/scan-sessions/{id}/events`: mã và kết quả từng lần quét, cursor.
- Nếu cần tiếp nhận log offline: `POST .../scan-sessions` và `POST .../{id}/events/batch` theo idempotency/event ID. Đây là đề xuất mở rộng cần DEV/backend duyệt; không gọi từ bộ thiết kế.
- Ghi log không làm thay đổi tồn và không thay thế bằng chứng giao dịch. Đồng bộ log thất bại không được tự gửi lại lệnh Post kho.

## D. Lịch sử bảo hành: tái sử dụng nguồn hiện hữu

- Danh sách hồ sơ `/mini-app/warranty-cases`; timeline `/mini-app/warranty-cases/{id}/events` đã có trong source đối chiếu.
- Bổ sung lối vào từ Lịch sử và bộ lọc, không tạo một kho dữ liệu lịch sử thứ hai.
- Lịch sử linh kiện đọc chứng từ liên kết `warranty_case_id` + `POSTED`; giữ riêng mục phiếu DRAFT để tiếp tục.
- Phân trang chống trùng bằng ID phiếu; quyền/kho và status do backend kiểm soát.

## E. Các mục gửi DEV chốt

1. Chấp nhận ma trận trường ở phần A và bộ `missing_fields`/điều kiện Post; chỉ relax trường metadata đã duyệt, không relax kiểm mã/tồn/quyền.
2. Chọn audit/event NFC đang có để map schema B; tạo endpoint mới chỉ khi cần.
3. Xác nhận `/scan/events` có khóa phiên; nếu thiếu, bổ sung định danh theo phần C.
4. Thống nhất cursor/page contract, sắp xếp ổn định và ID chống trùng cho mọi danh sách.
5. Định nghĩa thời gian giữ log, quyền xem theo tài khoản/kho, xử lý offline và timestamp máy lệch giờ. Không tự chốt số ngày lưu khi chưa có policy.

Không cần thay đổi chốt: App không có UI Post nhập/xuất chính; linh kiện bảo hành vẫn Post trực tiếp; một kho; tiếp tục đúng phiếu, trường hợp chưa xác minh phải đối chiếu Web.
