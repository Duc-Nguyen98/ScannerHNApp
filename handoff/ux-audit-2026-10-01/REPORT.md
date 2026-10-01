# Rà soát UI/UX ScannerHNApp - 01/10/2026

## Phạm vi và nguồn

- Nguồn public trước sửa: `f15fc4863474a5133b572485e5d6952c0b213d4b`, build `final-3b1249193760`.
- Bản sửa: build `final-a23199ef8256`. Chủ sở hữu thay đổi: lớp Review (`docs/review`), không sửa model, adapter nghiệp vụ hoặc `docs/flows`.
- Giữ 24 board / 91 panel, thiết kế/artwork Login và Home, footer Home/P03, 50 sơ đồ P00-P24 và các định danh nghiệp vụ.
- Build kiểm lại toàn bộ hash nguồn M24 trước khi đóng gói. Không sửa bằng chứng M24 cũ hoặc tự nâng trạng thái nghiệm thu hình thức.
- Kiểm tra bằng Chromium/Playwright, dữ liệu fixture. Đây không phải chứng nhận backend, thiết bị thật, Safari/Firefox hay UAT của người dùng.

## Lỗi đã tái hiện và sửa

| Mã | Trước sửa | Xử lý / kiểm tra sau sửa |
| --- | --- | --- |
| UX01 | Đi từ P04.S02 sang P04.S03 nhưng link và mẫu ghi lỗi vẫn ghi S02 | Lấy panel đang hiển thị, đồng bộ URL; mẫu ghi lỗi có cả panel thực tế, seed và kích thước iframe |
| UX02 | Chọn kịch bản chưa mở đã khiến link nhận nhầm danh tính | Tách lựa chọn chờ mở khỏi kịch bản đã áp dụng; Hủy không đổi ngữ cảnh |
| UX03 | Đổi App Preview / Review Mode tải lại iframe, làm mất nháp | Đổi chế độ ngay trên phiên hiện tại, giữ nguyên window và accepted rows |
| UX04 | Bảng công cụ mobile không khóa nền, Tab thoát ra ngoài, Escape không đóng | Inert nền, focus trong bảng, nút đóng, Escape trả focus và giải phóng khóa khi resize |
| UX05 | Đang tải mẫu vẫn sửa được board/kịch bản | Khóa tập điều khiển trong xác nhận/tải, chụp tham số trước tác vụ, dọn listener và mở khóa cả khi lỗi |
| UX06 | Ảnh sơ đồ lỗi không có đường thử lại cho cùng board | Nút Thử lại, giữ nguyên app; lưu lựa chọn board/loại sơ đồ cả khi đóng rồi refresh |
| UX07 | Màn hình ngang 640x360 chỉ còn khoảng 50px cho sơ đồ | Thu gọn phần đầu, cho nhóm công cụ cuộn, giữ viewport sơ đồ tối thiểu 80px |

Gia cố bổ sung: reset RAF khi thay iframe; một xác nhận tại một thời điểm; tab User/Data dùng roving tabindex; không phát live announcement lặp khi panel không đổi.

## Đối chiếu thiết kế

| Thành phần | Nguồn / quyết định | Thay đổi lần này |
| --- | --- | --- |
| Login, Home, footer, UI nghiệp vụ P01-P24 | AGENTS.md, UI_STANDARD.md, source M24 | Không thay source hoặc artwork |
| Khung Review | Public trước sửa và `panels-before` | Sửa trạng thái, lifecycle, focus và khả năng xem trên màn thấp |
| Công cụ mobile / tải lại sơ đồ | Lựa chọn triển khai cho lỗi tái hiện, không phải thiết kế đã được duyệt | Thêm nút đóng/thử lại; chờ người dùng review hình thức |
| P10 geometry cảnh báo | Vùng chạm pseudo-element và badge camera của avatar | Đã xem ảnh thực tế; không phải text tràn, không đổi UI để làm mất cảnh báo |

## Bằng chứng

- `before-r02/results.json`: 8 ca thất bại trong 10 ca, tương ứng 7 nhóm lỗi trên (focus mobile có 2 ca).
- `after-r02/results.json`: 13/13 đạt, gồm lỗi mạng rồi phục hồi, Hủy với lựa chọn chưa áp dụng, giữ nháp, focus, link và sơ đồ.
- `panels-before/results.json`, `panels-after/results.json`: 91/91 panel ở 1440x950 và 360x800, mỗi lượt 182 ảnh. Không lỗi trang/HTTP và không tràn ngang khung trong những mẫu này.
- Ảnh dùng cùng seed/viewport; đồng hồ và UUID fixture sinh tại runtime có thể khác. Không dùng so sánh này để tự công nhận pixel-perfect hoặc visual PASS.
- `flow-viewer-after/results.json`: 7 nhóm đạt; 50 ảnh, 150 đường tải PNG/SVG/Mermaid; đối chiếu 360/390/430/1440.
- `logic-tests.log`: 765/765 kiểm thử logic đạt.
- `../FINAL/evidence/ux-20261001-controls/results.json`: 8 nhóm điều khiển, đăng nhập/đăng xuất/Back đạt.
- `../flow/evidence/ux-audit-20261001`: 24/24 bộ hồi quy board đạt khi dùng kết quả P03 chạy lại ở `ux-audit-20261001-p03-r03` sau cập nhật harness.
- `../FINAL/evidence/ux-20261001-journeys-*`: 12 hành trình x Auto/OS-Reduced/Off = 36/36 đạt trên runtime đóng gói.
- `REVIEW.html`: bảng đối chiếu ảnh trước/sau theo từng panel và từng ca tái hiện.
- `TRACE_SCAN.json`: quét chữ ký token/private key trong 321 ZIP / 2.080 mục text, không phát hiện chữ ký đã liệt kê. Một ZIP cũ M09 không hoàn chỉnh vẫn giữ nguyên, không phải sản phẩm của lần sửa này.

Harness P03 giữ kiểm tra đầy đủ DOM/style footer; chỉ loại thuộc tính đo motion `data-motion-primitive` khỏi bản clone đối chiếu, không sửa DOM thật. Focus ban đầu được kiểm là tác vụ đầu tiên, sau đó kiểm Shift+Tab/Tab ở biên Back. Hai lần thất bại trước đó được giữ nguyên.

Thư mục `before` là lần chạy khi server local chưa khởi động, không phải bằng chứng lỗi sản phẩm. `before-r01`, `before-r02`, `after-r01` và toàn bộ trace/log trung gian đều được giữ lại theo yêu cầu.

## Giới hạn

- Không khẳng định hết mọi lỗi có thể có. Bộ kiểm tra này bao phủ fixture, các kích thước và thao tác nêu trên; hình thức vẫn cần người dùng duyệt.
- Refresh mở lại mẫu của panel, không khôi phục nội dung nháp đã chỉnh. Liên kết review không phải snapshot dữ liệu; điều này được ghi trong mẫu báo lỗi.
- Các chức năng đã chủ động khóa do thiếu backend/quyền vẫn giữ nguyên. Không tạo API giả thành công để làm UI có vẻ hoàn chỉnh.
- Không thêm animation, không đổi policy Post/UNKNOWN, không gửi dữ liệu nghiệp vụ ra dịch vụ thật.

## Public đã xác minh

- GitHub Pages đã build/deploy source `30983f99a67c8bdd6f91fa82d7ed9a10a897c4b8`, build `final-a23199ef8256`.
- `public/results.json`: 13/13 ca UI/UX đạt trong phiên Chromium mới, kiểm đúng build được phục vụ.
- `flow-viewer-public-r02/results.json`: 7 nhóm đạt, đủ 50 ảnh / 150 link tải. Lượt đầu gặp một HTTP 503; đã giữ nguyên `flow-viewer-public/failure.json`. Chạy lại nguyên bộ đạt, không sửa source hay hạ assertion. Nguyên nhân hạ tầng cụ thể chưa xác minh.
- `PUBLIC_BYTES.json`: SHA-256 của 6 tệp shell/catalog trên public trùng bản local đã kiểm tra.
- `TRACE_SCAN_PUBLIC.json`: 334 ZIP / 2.158 mục text, không phát hiện chữ ký token/private key đã liệt kê; cùng một ZIP M09 cũ không hoàn chỉnh, không xóa hoặc viết đè.
- `PUBLIC_RESULT.json` ghi code commit và review-tree đã kiểm. Commit bàn giao tiếp theo chỉ thêm report/test/evidence, giữ nguyên review-tree này.
- Primary checkout/index đang có công việc dở dang được giữ nguyên. Push thực hiện qua index cô lập trong kho archive; không reset/clean worktree của người dùng.
