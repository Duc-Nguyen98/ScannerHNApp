# P05 revision10 — triển khai6 nâng cấp thao tác

User29/09/2026 yêu cầu áp dụng toàn bộ6 đề xuất trong chat. Phạm vi là P05, giữ4 panel và logic nghiệp vụ. Nguồn/quyết định trước triển khai: [bảng đối chiếu](REVISION_10_CONTEXT.md). Đây là UI adaptation được user cho triển khai; hình thức mới vẫn chờ review, không tự gọi visual PASS.

## Đã triển khai

1. **Thông tin giao hàng gọn:** tên/điện thoại/địa chỉ hợp lệ thu thành card khi người dùng chọn Thu gọn hoặc chuyển sang số lượng/nhóm/ghi chú. Không thu khi đang gõ/chọn, không thu nếu invalid. Nút Sửa mở lại; request đã có thì chỉ Xem. Summary dùng readable-text chung với Xem đầy đủ nếu bị rút gọn. Giữ đầy đủ string trong document.
2. **Tiến độ luôn thấy:** S02 có dòng Đã soạn x/y · Còn n dưới header, nằm ngoài vùng cuộn. Đếm từ accepted.quantity thực, không lấy số lượt quét. Đủ số lượng hiển thị Đã đủ số lượng; giữ indicator bước chung hiện có.
3. **Nhập liên tục:** nút Xóa ô nhập có aria-label, chỉ xóa raw đang nhập/lỗi field, không xóa audit/accepted. Focus trả về ô nhập, Enter kiểm tra, bàn phím text phù hợp mã chữ-số; visualViewport resize đưa hàng input vào vùng nhìn thấy, không bật camera thật. Raw hợp lệ mới xóa theo pipeline hiện có.
4. **Sửa nhanh từ review:** S03 có Sửa thông tin giao hàng trước khi tạo request. Flow chuyển về S01 với returnToReview; quay lại kiểm tra phải qua validation, giữ documentId/scanSessionId/version/attempts/accepted. HeaderBack trong chế độ này cũng kiểm tra trước khi về S03. Pending/UNKNOWN/request đã có không cho editDelivery. Không tạo request mới để sửa phiếu đã gửi.
5. **Lọc mã:** Tất cả/Trùng/Lỗi có count/aria-pressed. Lỗi gồm invalid+blocked. Filter là presentation, không đổi audit/tổng đã soạn. Có empty state, giữ phân trang Xem tất cả trong tập lọc. Chi tiết mã lỗi mở dialog chung, nguyên raw/reason, Back/Esc đóng trước route. Khi đủ số lượng chọn Xem mã đã quét thì về bộ lọc Tất cả.
6. **Bảo vệ phiếu dở:** trạng thái Đang soạn/Đang gửi/Đang đối chiếu/Phiếu đã khóa, không ghi Đã lưu. Flow so document với bản mở ban đầu và theo dõi attempts/request. beforeunload chỉ gắn khi có thay đổi/mã chưa gửi/pending/UNKNOWN; về Home không làm mất guard của nháp, success/new attempt và logout/dispose gỡ guard. Không thêm localStorage hay giả autosave. Trình duyệt sở hữu nội dung prompt và có thể hạn chế prompt khi chưa có tương tác; không thể bảo đảm cứu nháp khi process/tab bị hệ điều hành đóng cưỡng bức.

UI mới dùng palette/component có sẵn: operation-icons, action-feedback/dialog-route, readable-text. Header/footer/shell494×950 giữ nguyên; status là trạng thái phiếu, không phải toast kết quả. Không thêm6 màn; vẫn P05.S01–S04, giữ P17.S02 dependency.

## Hành vi và bằng chứng

- **Node workspace345/345 PASS** tại lần chạy: [log](evidence/revision-10/node-tests.txt). P05 riêng31 bài gồm4 bài mới: quick-edit/immutable request, dirty lifecycle, filter bất biến, gắn/gỡ unload listener (`tests/outbound-experience.test.mjs`). Tổngworkspace bao gồm công việc song song khác, không quy tất cả cho P05.
- **10 nhóm browser nâng cấp PASS**, [kết quả](evidence/revision-10/upgrade-results.json): collapse/edit/validation, clear chỉ raw, exactfilter/empty/error detail + Back, fixedprogress6viewport, quick-edit giữ IDs/scans, Unicode/nội dung dài với đường đọc đầy đủ, **reload thật và hủy prompt**, UNKNOWN/reconcile/fresh, Home/logout cleanup.
- **14 nhóm hồi quy P05 và36 case layout PASS**, [kết quả](evidence/revision-10/dialog-regression/browser-results.json): dialog xác nhận trước đổi phiếu, backdrop/Escape/Back/focus, scan/duplicate/P17, failed request, UNKNOWN + đối chiếu, panelS04, mởP12 đúngID/Back, tên/note dài.
- Các kết quả browser cuối không có pageerror. Thử250+/2000+ ký tự trong địa chỉ và so string nguyên vẹn trong reader; không thay policy ghi chú200 ký tự. Keyboard viewport là mô phỏng Chromium, bàn phím/camera thiết bị thật chưa xác minh.

## Visual trước/sau và khác biệt

Actual cùng viewport494×1000/DPR1, cùng fixture10 sản phẩm yêu cầu, batch7hợp lệ+1trùng,1mã sai kho, ghi chú Giao hàng buổi sáng. Timestamp lượt nhập sai là runtime nên có thể khác. Không dùng pixel-diff để tự nghiệm thu.

| Nhánh | Trước | Sau |
|---|---|---|
| Thông tin hợp lệ | [before](evidence/revision-10/before/01-information.png) | [after](evidence/revision-10/after/01-information.png) |
| Quét/nhập mã lỗi | [before](evidence/revision-10/before/02-scanning.png) | [after](evidence/revision-10/after/02-scanning.png) |
| Review thiếu3 | [before](evidence/revision-10/before/03-review.png) | [after](evidence/revision-10/after/03-review.png) |

Ảnh state mới: [lọc lỗi](evidence/revision-10/05-error-filter.png), [shippingcard](evidence/revision-10/04-shipping-card.png), [sửa từ review](evidence/revision-10/07-review-edit.png);6 ảnh layout ở `06-filter-{width}.png`.

**Khác biệt ngoài r10:** giữa lần chụp trước/sau, công việc UI dùng chung bổ sung `shared/flow-guidance.mjs` (indicator3bước/tóm tắtreview) vào P05. Giữ thay đổi hiện có; không quy phần này cho6 nâng cấp r10 và không suy từ ảnh thành baseline đã duyệt. Do đó so sánh vertical spacing tổng thể còn chịu thay đổi component chung này. Không có raster Designer riêng cho card/filter/quick-edit mới; dùng chỉ thị user và component hiện hành, visual pending.

Giữ các trace test phát triển trong `failure.json` nếu còn: một lỗi nút Thu gọn không xuất hiện sau sửa field đã được sửa bằng control tồn tại ổn định và disabled khi invalid; các strict locator trúng dialog/reader ẩn là lỗi script đã sửa selector. Chỉ kết quả cuối mới tính PASS.

WMS ghi phiếu vẫn fixture; API địa giới v1 giữ nguyên, không kiểm live lại ở r10. Draft vẫn bộ nhớ tab; reload được cảnh báo chứ không có persistence. Giữ checkpoint toàn cục hiện hành (đã tiến qua P05),91 panel, không sửa baseline/dist/gallery, không push/merge/deploy.
