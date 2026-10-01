# P04–P05 — đồng bộ HN-action-feedback-v1

Yêu cầu user ngày 28/09/2026: mở rộng chuẩn dialog P11 r03 cho P01–P10. Phần này chỉ sửa P04 Nhập kho, P05 Xuất kho; giữ đủ tám panel và đích phụ thuộc P17.S02. Không sửa model, adapter, contract dữ liệu hoặc nghiệp vụ gửi phiếu.

## Thay đổi và phân loại thông báo

| Màn | Đồng bộ | Nội dung được giữ đúng loại |
|---|---|---|
| P04.S01 | Lỗi thao tác tổng quát/phiên/quyền chuyển sang dialog | Validation tại field, ghi chú, danh mục loại nhập/NCC và hint tĩnh |
| P04.S02 | Bỏ dòng feedback tổng quát và thông báo “Đã thêm” tạm thời | Lỗi/duplicate ngay ô mã; số lượng, mã đã quét, lý do và tiến độ là dữ liệu bền của lượt quét; không mở popup cho mỗi mã |
| P04.S03 | Gửi bị từ chối → dialog Đã hiểu; UNKNOWN → Để sau / Đối chiếu | Nút kiểm tra kết quả đang chờ, request ID, trạng thái khóa yêu cầu và thông tin chưa đổi tồn |
| P04.S04 | Xem chứng từ chưa kết nối → dialog; kết quả đầy đủ giữ nguyên panel | Không mở dialog thành công trùng với panel; bố cục kết quả đã vừa khung |
| P05.S01 | Đổi phiếu → dialog Hủy / Đổi phiếu, mặc định focus Hủy; không thay dữ liệu trước confirm | Validation tại field, trạng thái tải/không tải được địa giới và nút thử lại, popup địa giới và dialog lựa chọn |
| P05.S02 | Bỏ feedback tổng quát và thông báo “Đã thêm” tạm thời | Lỗi/duplicate tại ô mã, số lượng/tiến độ/audit; P17.S02 vẫn hiện đúng sản phẩm không thể xuất |
| P05.S03 | Từ chối và UNKNOWN dùng chung kiểu dialog với P04 | Thiếu số lượng là trạng thái phiếu; giữ request bất biến, dữ liệu và đường retry sau kết quả xác định |
| P05.S04 | Xem chứng từ chưa kết nối → dialog; bớt 11 px padding cuối khối kết quả | Giữ cảnh báo chưa ghi sổ, summary, CTA, nav; nội dung dài vẫn cuộn trong app |

Các dialog dùng `shared/action-feedback.mjs` và `action-dialog.mjs`: một overlay trong app; nền inert; không đóng khi bấm nền; có focus trap, Escape, native Back và khôi phục focus. P05 thay phiếu dùng nút đỏ trầm vì thay thế metadata đang nhập. Trợ giúp đối chiếu Web là dialog thông tin riêng, không làm thay đổi trạng thái UNKNOWN.

Đóng/rời module xóa dialog và callback đang chờ để không hiện thông báo hoặc áp dụng lựa chọn cũ ở màn khác. Sau kết quả gửi bất đồng bộ, khôi phục trigger hiện tại trước khi mở thông báo để nút gửi nhận lại focus khi đóng.

## Visual

- Ma trận 340×420, 390×844, 494×1000, 768×1024, 1440×1000, 1869×940; giữ shell 494×950.
- P04.S04 vừa khung tự nhiên, không đổi CSS bố cục. P05.S04 trước sửa có **645 px nội dung / 638 px vùng cuộn**, dư 7 px. Giảm padding-bottom của khối success từ 25 xuống 14 px; không khóa/ẩn vùng cuộn để che nội dung.
- 66 case layout: tám panel × sáu viewport = 48; dialog UNKNOWN hai module × sáu = 12; dialog thay phiếu × sáu = 6. Kiểm header/footer không dịch khi wheel, dialog trong app, focus trong dialog và nền không cuộn.
- Bổ sung ghi chú nhiều dòng cho cả hai luồng; tên người nhận dài ở P05.S04 vẫn đọc hết bằng cuộn nội bộ. Không cắt dữ liệu.
- Đã xem ảnh P04 kết quả/UNKNOWN, P05 kết quả/confirm/tên dài. Visual đã kiểm kỹ thuật; chưa suy ra user nghiệm thu.

## Behavior

- **53/53 ca Node PASS:** inbound, outbound, outbound-geography. Log: [node-tests.txt](node-tests.txt).
- **23/23 nhóm browser PASS**, 66 case layout, **0 pageerror**: [browser-results.json](browser-results.json).
- Bao gồm Hủy, backdrop, Escape, native Back, Tab, Enter confirm; đúng một overlay; field validation; duplicate không tăng accepted; P17.S02; failure giữ request; UNKNOWN chặn gửi lại; cả nút persistent và nút Đối chiếu trong dialog đều không gọi record lần nữa; S04 không có popup thành công dư; re-entry tạo lượt mới và không mang thông báo cũ.
- Script: `node scripts/check_inbound_outbound_dialog_sync.cjs`. Có thể đổi `DIALOG_SYNC_BASE`, `DIALOG_SYNC_EVIDENCE_DIR`, `DIALOG_SYNC_MODULE=p04|p05`. Test địa giới được mock, không gọi API thật.
- Giữ các log bắt lỗi trước sửa: `focus-before.json`, `result-scroll-before.json`. `failure.json`/`failure.png` là dấu vết lượt chưa đạt; kết quả cuối dùng `browser-results.json`.

## Integration và phạm vi

Fixture trong bộ nhớ tab; record → Chờ xử lý trên Web, không Post và không đổi tồn. Không thêm persistence, camera, API WMS hoặc API địa giới mới. Chưa kiểm backend/hardware production. Không sửa baseline/dist/gallery, push/merge/deploy, shared components, coverage hoặc RUN_STATE trong phần việc này; root cập nhật tài liệu tổng hợp.

File sửa: `docs/flows/inbound/inbound.mjs`, `docs/flows/inbound/style.css`, `docs/flows/outbound/outbound.mjs`, `docs/flows/outbound/style.css`; thêm script kiểm chứng và bằng chứng tại thư mục này. Các assertion cũ đòi `.p04-feedback`, `.p05-feedback` hoặc `.p05-source-confirm` inline đã được thay bằng tiêu chí contract mới trong suite trên; không dùng suite cũ để yêu cầu quay lại UX đã bị thay thế.
