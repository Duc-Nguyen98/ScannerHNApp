# Bàn giao bộ màn Scanner bổ sung — 17 đến 22

## Nguồn và phạm vi

- Nghiệp vụ chốt mới từ người dùng ngày 10/09/2026 được ưu tiên hơn board/tài liệu cũ: bỏ UI Duyệt/Post nhập/xuất trên App; Home Xem tất cả đi Lịch sử; linh kiện bảo hành vẫn Post trực tiếp; lưu và tiếp tục đúng phiếu; đối chiếu Web khi không xác minh được; khóa kho sau mã đầu; lịch sử POSTED phân trang/chống trùng.
- Source `main` lần đối chiếu hiện là `f281bde0933902aafe9b086bce5d085153a438aa`. App public đã chuyển từ bundle `index-gYnGkeH2.js` sang `index-ByhS5GZF.js`. Các thay đổi mới nhất được ghi nhận theo xác nhận khách hàng; không khẳng định source public main đã chứa toàn bộ chúng.
- Bộ này là thiết kế và prototype tương tác trên ScannerHNApp; không phải bản deploy App thật, không gọi API ghi và không thay đổi WMS. Dữ liệu fixture cho thiết kế được phép dùng theo chốt Scanner.
- Public Sans và palette/white cards/deep-blue header kế thừa bộ hiện tại. Không chỉnh ảnh baseline Login, Xác nhận phiên, Home hoặc board cũ.

## Mapping màn hình

| Board | Màn / trạng thái | Liên hệ source / hợp đồng |
| --- | --- | --- |
| 17 | Quét, sheet số lượng, xác nhận, xuất thành công | `WarrantyComponentIssueFlow`; 2 mã/hộp = 3 linh kiện; Post trực tiếp |
| 18 | POSTED trong hồ sơ, đang tải thêm, lỗi trang tiếp theo, rỗng | `WarrantyDetailScreen`, `useWarrantyComponentHistory`; tải thêm/chống trùng theo chốt mới |
| 19 | Phiếu dở, tiếp tục đúng phiếu, cần đối chiếu Web, kiểm tra kết quả Post | Lưu documentId/version/codes/checkpoint theo xác nhận khách. Unknown scan không được gửi lại mù |
| 20 | Hub lịch sử, nhật ký NFC, chi tiết NFC, nguồn lịch sử chưa khả dụng | Contract NFC **đề xuất chờ DEV chốt**, xem `DEV_PROPOSAL.md`; không suy log từ trạng thái chip |
| 21 | Danh sách/timeline bảo hành, danh sách/chi tiết phiên quét | Bảo hành dùng nguồn hiện hữu; contract phiên quét **đề xuất chờ DEV chốt** |
| 22 | Số lượng vượt tồn, hộp chưa thể xuất, chờ xử lý trên Web, hồ sơ đã trả | Validation/gating/record vs Post; hồ sơ đóng chỉ đọc, không xuất thêm |

## Quy tắc UI

- Nhập/xuất chính: `Gửi phiếu lên Web` → `Chờ xử lý trên Web`; mô tả `Phiếu đã gửi, chưa ghi sổ`. Không có nút Duyệt/Post nhập/xuất trên các màn mới.
- Linh kiện: quét → kiểm tra → xác nhận xuất → backend xác nhận Post → `Đã xuất`. Thành công không được tạo chỉ từ request đang gửi.
- Kho hiển thị `Kho Hoa Nam`; không thêm trải nghiệm nhiều kho. Đã có mã thì không đổi kho.
- Tem linh kiện đơn có số lượng 1. Mã hộp mở sheet, nhận số nguyên dương và không vượt tồn khả dụng nếu server cung cấp. Chuỗi mã minh họa: `LK0001-HN001`, `BOX-LK-0002-01`.
- Tiếp tục phiếu: giữ cùng mã phiếu. Mã đã ghi nhận/xác minh trên server không có nút xóa tùy ý trong phần resume. Dữ liệu chưa chắc chắn chuyển sang đối chiếu, không tạo phiếu mới bù.
- Lịch sử chỉ POSTED. Tải thêm giữ vị trí/dữ liệu cũ, gộp theo ID, khóa bấm khi tải; lỗi trang tiếp theo không làm rỗng danh sách đã có; hết trang có nhãn kết thúc.
- NFC/bảo hành/phiên quét: truy vết theo nghiệp vụ, không mở rộng quyền quản trị. Thiếu nguồn event hiện trạng thái chưa có dữ liệu, không giả lập thành lịch sử thật.
- Điều kiện đóng hồ sơ/khóa xuất theo trạng thái vẫn giữ từ nghiệp vụ App. Không sửa cơ chế này bằng cách chỉ ẩn/hiện nút trong backend thật.

## Tương tác trong prototype

- `?scene=...`: chọn trạng thái trong panel DEV.
- `?mode=screen&scene=...`: kiểm tra khung mobile.
- `?mode=board&board=17` đến `22`: trình bày bốn màn/board.
- Nhập mã trong preview để mở sheet, kiểm số lượng, bỏ dòng, kiểm tra tổng và xem kết quả fixture.
- Lưu phục vụ trình diễn trong namespace localStorage `hn-scanner-design-preview-v3`, không đọc/ghi dữ liệu App thật. Nút `Mở lại phiên đã lưu` ở panel DEV để kiểm tra resume; `Đặt lại dữ liệu thiết kế` chỉ reset namespace này.
- Tải thêm dùng trang fixture có ID giao nhau để kiểm chống trùng; không gọi backend.
- Hướng dẫn Web không chứa URL WMS tự suy đoán. Khi triển khai thật, DEV nối URL Web được bên vận hành cung cấp và quyền truy cập phù hợp.
- Các ví dụ kết quả NFC/phiên quét là thiết kế minh họa theo contract đề xuất; panel DEV ghi rõ không kết nối WMS.

## Tài liệu cũ

Board 11 có mô tả duyệt tách Post và một số board cũ có thanh Chứng từ/Duyệt. Giữ nguyên làm lịch sử thiết kế, đánh dấu trên gallery; các quy tắc nghiệp vụ mới ở tài liệu này được ưu tiên. Không sao chép nguyên văn chúng vào App mới.

## Phương pháp dựng

Imagegen từng được thử nhưng trả lỗi model/tài khoản. Bộ bàn giao tiếp tục từ source HTML/CSS/JS đã dựng, tái sử dụng ảnh kho người dùng cung cấp và font local, không tạo lại ảnh bằng phương án API riêng. PNG là ảnh chụp trực tiếp bộ màn đã render trong browser; source editable và fixture được bàn giao cùng.

## Kiểm chứng

Kết quả kiểm tra responsive/tương tác, ảnh xuất và checksum sẽ lưu tại `handoff/scanner-screens-17-22/QA.json` trong repo. Đây là kiểm tra prototype, không thay thế E2E App/WMS thật.
