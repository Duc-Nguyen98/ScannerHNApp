# P09 r11 — rà soát lỗi UI/UX phát sinh

## Nguồn trước khi sửa

| Vùng | Nguồn/giới hạn | Hướng sửa |
|---|---|---|
| 4 panel và nghiệp vụ | B09, Contract2.0, owner P09 | Giữ panel, validation200, request/version, trạng thái và guard |
| Nhập serial/đổi sản phẩm | P09 r10 theo yêu cầu user | Sửa trạng thái giao diện bị kẹt, không đổi định danh/request |
| Dialog | HN-action-feedback / app-modal / UI_STANDARD | Header và actions luôn tiếp cận; dữ liệu dài cuộn trong app |
| Lỗi tiếp nhận | Danh mục18/Khác, commit khi chọn của r04 | Enter trong tìm kiếm không xác nhận lựa chọn ẩn |
| P18 và shared mới | Thay đổi hiện hữu sau r10 | Bảo toàn callback bàn giao và nút xóa lọc, không ghi đè module khác |
| Hình thức sửa nhỏ | User yêu cầu rà soát29/09 | Adaptation cần review, không tự gọi visual PASS |

Probe trước sửa: `evidence/revision-11/before/observations.json`. Ảnh r11 trước bao gồm cập nhật của các module khác sau r10; không dùng ảnh r10 cũ thay bằng chứng hiện trạng.

## Lỗi tái hiện và thay đổi

1. **Kiểm tra lại serial hiện tại bị kẹt**: mã trùng sản phẩm đã chọn vẫn để editing=true, giữ form và khóa CTA. Nay coi là xác định thành công trên giao diện, thu gọn form, giữ nguyên draft/request/receipt của owner; không gọi select lại hay tạo sản phẩm.
2. **Escape/Thu gọn giấu ô nhập nhưng giữ pending serial**: trạng thái đổi vẫn khóa CTA. Nay hủy riêng mã đổi chưa xác minh, giữ sản phẩm/lỗi/ghi chú cũ, phục hồi focus Đổi sản phẩm. Hai thao tác dùng cùng helper.
3. **Enter tìm lỗi áp dụng radio ẩn**: có lựa chọn cũ, tìm không khớp và Enter vẫn submit form picker, đóng dialog. P09 chặn Enter ở ô search; chọn option vẫn commit ngay theo r04. Không thay mặc định shared picker của module khác.
4. **Metadata dài đẩy nút dialog ra ngoài**: probe trước ghi footerBottom2296 trong dialogBottom903. Định danh chuyển sang vùng cuộn trong body, cao tối đa140px, đọc đầy đủ bằng chuột/bàn phím; form kế thừa giới hạn chiều cao dialog, header/actions không bị đẩy ra ngoài. Không sửa/cắt text nguồn.
5. **Thông báo lỗi nhập lặp ở field và footer**: khi field đã được đánh dấu, footer chỉ hướng dẫn chung; chi tiết lỗi nằm một lần tại field. Trước khi nhập vẫn có lý do nút Lưu chưa khả dụng. Textarea Enter thêm dòng, không gửi.
6. **Đã có hồ sơ nhưng thiếu lối mở trực tiếp**: thêm nút Mở hồ sơ [ID] sau đối chiếu serial, dùng session guard đọc. Hoạt động cho hồ sơ mở/đã trả khách, không đòi nhập lại lỗi, không tạo request/receipt/ghi mới. Luồng tiếp nhận và validation cũ không bị bỏ.
7. **Khoảng cách CTA Bàn giao mới**: giữ callback P18 hiện hữu; bổ sung khoảng cách với card tiếp theo. Có kiểm Back từ P18 về đúng case/tab/draft.

Đổi metadata trong dialog là adaptation bố cục để đáp ứng chuẩn không che actions; chưa có raster Designer của nhánh định danh2000+ ký tự. Trạng thái Visual vẫn chờ review, không suy ra từ test.

Bảo toàn thay đổi của các chat khác: clearFilterButton, onHandoff/P18, shared controls và checkpoint chính. Không push/merge/deploy; không bật camera/gọi WMS.

## Kiểm chứng

- Node **30/30 PASS**: warranty + business-history, không đổi policy ghi dữ liệu trong revision này.
- Browser **45 nhóm PASS**: audit lỗi mới7, UX6, update11, regression10, navigation11. Kiểm layout6viewport, focus/keyboard/Back, readonly, UNKNOWN/reconcile/duplicate và P06/P18.
- Probe trước/sau tái hiện cùng thao tác. Tên/serial2000+ ký tự: sau sửa footer ở trong dialog, body627px thay vì36px; text nguyên vẹn trong vùng cuộn. Đã xem ảnh actual dialog thường và dài, không dùng geometry làm bằng chứng nghiệm thu Designer.
- Bằng chứng trong `evidence/revision-11/`: `before/observations.json`, `after/observations.json`, `audit/results.json`, `ux/results.json`, `update/update-results.json`, `regression/browser-results.json`, `navigation/navigation-results.json`, `node-tests.txt`; ảnh thường ở `before/standard` và `after/standard` cùng494/360viewport, DPR1, thời gian29/09/2026 10:00 VN.
- Probe lặp lần đầu bị timeout khi chờ login; bản probe cuối dùng context mới cho mỗi nhóm độc lập, tránh mang phiên sang nhóm khác. Không thay code auth để làm test qua. Các suite nghiệp vụ/back riêng đều đạt.
- **Visual:** chờ user review. **Behavior:** PASS trong prototype đã kiểm. **Integration:** BLOCKED/NOT_RUN production/camera. Bàn phím ảo và cảm ứng trên máy thật chưa kiểm; không khẳng định toàn app hết mọi lỗi.
