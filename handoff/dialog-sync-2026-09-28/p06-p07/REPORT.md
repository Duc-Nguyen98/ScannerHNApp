# P06–P07 — đồng bộ HN-action-feedback-v1

Phạm vi ngày 28/09/2026: user yêu cầu kiểm tra/áp dụng chuẩn P11 r03 cho P01–P10. Báo cáo này chỉ bàn giao P06 và P07, không nghiệm thu các module khác.

## Thay đổi

| Màn / tình huống | Trước | Sau |
|---|---|---|
| P06.S01 bộ lọc chưa có contract | Banner đẩy nội dung | Dialog thông báo / Đã hiểu; không tự thêm tiêu chí |
| P06.S02 thiếu serial bảo hành, chặn in/quét | Banner đẩy nội dung | Dialog; không đổi quyền hay dùng SKU thay serial |
| P06.S04 chứng từ chưa được phép mở | Banner đẩy nội dung | Dialog; giữ query/category/item/scroll |
| P06 chọn sản phẩm cho NFC | Banner dùng chung feedback | Hint tĩnh mô tả chế độ chọn; không mở dialog gây cản chọn |
| P06.S04 lỗi khoảng ngày | Validation tại field | Giữ nguyên field, aria-invalid, disabled Apply; không tạo dialog |
| P07.S01 bộ lọc; P07.S02 đọc lỗi/khóa/xung đột/quyền | Banner trong scroller, tự kéo scroll về đầu | Dialog trong app; giữ vị trí nội dung và UID/request |
| P07.S03 thất bại đã xác định | Banner | Dialog; giữ request cho retry đúng luồng |
| P07.S03 UNKNOWN | Banner | Dialog Để sau / Đối chiếu; Để sau/Back/Escape không gửi lại; CTA đối chiếu vẫn hiện trên màn |
| P07 sao chép UID | Dòng feedback thêm dưới bảng | Dialog kết quả dựa trên clipboard promise; chống click trùng; thay thế rồi khôi phục chi tiết thẻ, không chồng overlay |
| P07 chi tiết thẻ | Back có thể rời màn; backdrop tự đóng | Route dialog riêng, Back/Escape đóng trước; backdrop không đóng; trả focus về trigger |
| P07.S04 đã liên kết | Panel kết quả có receipt | Giữ nguyên panel và ID; không mở thêm popup trùng kết quả |

Tái sử dụng `shared/action-feedback.mjs` do luồng tích hợp chính cung cấp. P07 chỉ bổ sung metadata của lần update vào callback `onChange(snapshot, patch)` để phân biệt thông báo mới với rerender: không tự hiện lại lỗi cũ khi đổi tab/search. Không thay snapshot/request/receipt contract.

## Bố cục

- P06.S03 tồn kho theo 4 vị trí có 12px cuộn dư: giảm 8px padding cuối và 4px khoảng cách hint. Kết quả chuẩn `scrollHeight = clientHeight = 768`.
- P07.S02 đọc thẻ có 29px cuộn dư: giảm khoảng trống ngoài artwork (padding scroller, gap section, margin touch). Kết quả chuẩn `scrollHeight = clientHeight = 788`.
- P07.S03 và S04 đã vừa khung, không cần đổi bố cục; S04 `734 = 734`.
- P06 danh sách/chi tiết/lịch sử và danh sách 30 thẻ P07 vẫn cuộn tự nhiên khi nội dung dài. Không ẩn/cắt dữ liệu để ép fit.
- Không đổi artwork B07, phone, waves, animation keyframes, reduced-motion, kích thước khung hay header/footer/nav. Giữ 4 panel của từng board.

## Kiểm chứng

**Behavior:** `node --test tests/lookup.test.mjs tests/nfc.test.mjs` đạt 33/33; log `node-tests.txt`. Có kiểm phân biệt missing/zero, read-only, code/SKU/serial, UID chưa đồng nghĩa liên kết, conflict/locked, UNKNOWN giữ request và phiên, receipt đúng actor/kho, đọc/lưu về muộn, 5 mã liên tiếp.

**Browser:** 42 nhóm đạt, không pageerror:

- `browser-results.json`: 11 nhóm mới; 8 panel × 6 viewport = 48 bản đo/ảnh. Thêm 2 dialog × 6 viewport, backdrop, wheel nền, Tab/Shift+Tab, Enter/double-click action, Escape/Back, focus, copy success/failure/restore details, cancel UNKNOWN, đối chiếu từ CTA và từ dialog, picker P06.
- `lookup-regression/browser-results.json`: 11 nhóm P06, gồm long-content/Back/serial/date/P03/session logout.
- `nfc-regression/browser-results.json`: 11 nhóm P07, gồm mọi kịch bản đọc/ghi, Back/Forward, no-overwrite, kho dừng, logout, không gọi hardware.
- `nfc-repeat/results.json`: 4 nhóm, gồm 5 mã liên tiếp và chuỗi dài vẫn đọc/cuộn hết.
- `nfc-stability/results.json`: 5 nhóm, gồm clipboard retry, IME tổng hợp, lỗi xuất hiện vẫn giữ scroll dưới nội dung dài và UNKNOWN khi kho dừng.

Các script regression được cập nhật kỳ vọng banner thành dialog theo contract mới; không bỏ các assertions về identity/mutation/capability.

**Visual:** đã xem trực tiếp ảnh P07.S04, dialog lỗi NFC và dialog UNKNOWN; metrics trên 6 viewport xác nhận containment, không overflow ngang, header/footer/nav không dịch khi wheel. Hình thức mới chờ user review, không tuyên bố pixel-perfect Designer.

**Integration:** fixture/bộ nhớ preview; không gọi API/NFC thật, không bổ sung quyền nghiệp vụ. Backend/hardware production vẫn chưa kiểm chứng.

Các lượt thử trước có lỗi selector thử nghiệm bắt copy ở panel nền và hidden Home name dialog; đã sửa selector kiểm đúng dialog đang mở, giữ failure.json/ảnh làm trace. Lượt cuối `browser-results.json` mới là kết quả đạt.
