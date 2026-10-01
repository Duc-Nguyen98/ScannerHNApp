# P09 r10 — tối ưu thao tác và phân cấp nội dung

## Nguồn thay đổi trước triển khai

| Phần | Nguồn | Áp dụng |
|---|---|---|
| Bốn panel, nghiệp vụ | B09 / Contract v2.0 / HANDOFF | Giữ ID S01–S04 và điều kiện ghi/UNKNOWN/read-only |
| Khung, icon, tab hồ sơ, reader, dialog | UI_STANDARD / component shared hiện hành | Giữ shell 494×950; tab P08; operation-icons; readable-text; action-feedback |
| 7 đề xuất UX trong chat | User yêu cầu áp dụng ngày 2026-09-29 | Danh sách có lỗi tóm tắt/lọc nhanh; tiếp nhận 3 nhóm; thu gọn quét; hồ sơ chia nhóm; dialog rõ đối tượng; trở về giữ ngữ cảnh; vùng chạm/focus |
| Số đo, bố trí bộ lọc nhanh và nhóm mới | Lựa chọn triển khai cần user review | Adaptation từ component hiện có, không phải baseline Designer mới |
| Footer Home/P03 | HN-footer-locked-v1 | Không chỉnh |

Ảnh trước/sau chụp bằng cùng script `scripts/capture_warranty_ux.cjs`, viewport 494×1000 và 360×800, DPR1, thời gian cố định 29/09/2026 10:00 Việt Nam, cùng dữ liệu/chuỗi thao tác. Lưu tại `evidence/revision-10/before` và `after`. Bản trước bao gồm các cập nhật shared contract sau r09, không giả là ảnh r09 nguyên bản.

Visual chờ người dùng duyệt. Behavior và integration được ghi riêng sau kiểm thử; không tuyên bố pixel-perfect hoặc tích hợp WMS/camera.

## Kết quả triển khai

- Danh sách: thẻ hồ sơ phân cấp mã/trạng thái, sản phẩm, serial, khách hàng, lỗi chính và ngày tiếp nhận. Lỗi dài xem tối đa3 dòng; mở hồ sơ để đọc đầy đủ qua reader chung. Tìm kiếm hỗ trợ tên khách/lỗi không dấu. Bốn nút lọc nhanh có badge số lượng theo query, cùng biến status với dialog; bấm lại lựa chọn đang bật về Tất cả.
- Tiếp nhận: ba nhóm trong S02 (Xác định sản phẩm, Chọn lỗi tiếp nhận, Thông tin bổ sung). Serial hợp lệ thu gọn scanner, focus phần chọn lỗi; Đổi sản phẩm mở lại nhập mã. Mã mới không hợp lệ giữ sản phẩm cũ, request và ghi chú; CTA bị khóa cho tới khi xác định mã mới hoặc chọn Giữ sản phẩm hiện tại. Không tự bật camera.
- Chọn lỗi: ô tìm kiếm cố định, hiển thị lựa chọn hiện tại; chọn áp dụng ngay như r04. Nhãn Thay đổi rõ ràng; Other-only textarea giữ mô tả dở nhưng không gửi mô tả cũ khi chọn lỗi khác.
- Hồ sơ: summary gọn hơn, ba tab vẫn dùng CSS chung P08. Thông tin tiếp nhận và Xử lý sửa chữa thành hai nhóm riêng. Nội dung dài giữ nguyên nguồn và reader chung.
- Cập nhật: định danh hồ sơ/serial, trạng thái hiện tại và đích Chờ bàn giao; focus kết quả khi đã có chẩn đoán. Vùng hành động cố định có lý do nút Lưu bị khóa; validation tại trường, giới hạn200 giữ nguyên. Không thêm overlay hay thông báo kết quả inline.
- Trở về: giữ query/filter/scroll; hồ sơ vừa cập nhật có nhấn nhẹ5giây (hỗ trợ reduced motion). Hồ sơ nằm ngoài bộ lọc có thẻ ngữ cảnh tĩnh và nút Xem hồ sơ, không tự xóa bộ lọc. Thẻ này giải thích danh sách đang xem, không phải toast kết quả.
- Vùng chạm tối thiểu44px cho các control được sửa; header/footer và dialog actions ở trong app. Dữ liệu đọc hiện đồng bộ trong bộ nhớ, không thêm thời gian tải hay skeleton giả. Các trạng thái chờ/lỗi/UNKNOWN tiếp tục dùng controller hiện có.

## Phân biệt nguồn và phần cần review

Đây là adaptation được user yêu cầu triển khai từ đề xuất trong chat. Bộ lọc nhanh, ba nhóm tiếp nhận và phân nhóm hồ sơ không có raster Designer mới cho từng nhánh; chúng chưa được nghiệm thu visual. Giữ4panel/24board/min91panel, trạng thái nghiệp vụ, số liệu giả lập r09, readonly, request/session/version và các giới hạn P19/P21. Footer Home/P03, module khác, baseline, dist không chỉnh. Không push/merge/deploy/API/hardware.

Bộ kiểm thử cũ được chỉnh để đi qua Đổi sản phẩm trước khi nhập mã thứ hai, xác nhận dialog tiếp nhận trước Back, và kiểm deep link case thay vì nút recent BH-001 đã bị Home/P12 thay thế theo yêu cầu riêng ngày29/09. Không nới lỏng assertion. Log thử chưa đạt vẫn được giữ: navigation/update cũ lệch thao tác; lần kiểm touch-target phát hiện min-height32 của CSS cũ, đã sửa44 rồi kiểm lại.

Bàn phím đã kiểm bằng thao tác Tab/Enter/Escape/Back và viewport thấp; chưa kiểm bàn phím ảo trên thiết bị thật. Production WMS/camera/hardware vẫn NOT_RUN. Các chat khác đang làm P13 và module liên quan; không thay checkpoint chính của họ bằng P09.

## Kiểm chứng cuối

- **30/30 Node PASS**: warranty + business-history; gồm regression mới về đổi serial không hợp lệ giữ request/draft.
- **44/44 nhóm browser PASS**: UX6, chi tiết6, nghiệp vụ10, Back/navigation11, cập nhật11. Toàn bộ không có pageerror.
- UX6 có6viewport; kiểm vùng chạm44px, toàn bộ dialog/footer trong shell, không tràn ngang, Other-only, tìm không dấu, 2000+ ký tự/newline/Unicode/HTML literal/từ liền dài; reader giữ nguyên nội dung và trả focus đúng.
- 20 ảnh trước và20 ảnh sau tại cùng2viewport/DPR/fixture/thời gian, cộng bằng chứng regression. Đã xem ảnh thực tế tiếp nhận đã chọn, danh sách, hồ sơ, dialog cập nhật và picker; đây là kiểm tra trình bày, không phải Designer/user visual acceptance.
- Bằng chứng cuối: `node-tests.txt`, `ux/results.json`, `detail/detail-results.json`, `regression/browser-results.json`, `navigation-verified/navigation-results.json`, `update-final/update-results.json`, `source-sha256.json` trong `evidence/revision-10/`.
- Visual **IN_PROGRESS**, Behavior **PASS trong prototype**, Integration **BLOCKED / production NOT_RUN**. Không dùng kết quả này để đánh dấu các board khác hoàn tất.
