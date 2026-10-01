# P03 revision 06 — Backdrop không điều hướng, footer thao tác rõ ràng

Ngày 2026-09-27. Theo chỉ thị mới nhất của người dùng: bấm vùng backdrop không đóng dialog hoặc trả về Trang chủ; chỉ các control điều hướng mới thực hiện chuyển màn.

## Thay đổi

- Chặn click backdrop/vùng trống tại UI và chặn `cancel('backdrop')` trong controller cho cả S01–S04. Không đổi panel, URL, document, message hay trạng thái UNKNOWN.
- Footer P02 giữ nguyên DOM/CSS, được mở lại tương tác khi P03 hiển thị. Menu dùng route hiện có; Quét mã mở picker hoặc phiếu chưa hoàn tất. Đích chưa triển khai tiếp tục báo dependency.
- Menu không xóa phiếu, không tự xác nhận kết quả lưu, không vượt kiểm tra phiên/kho; đang lưu thì từ chối điều hướng. UNKNOWN được giữ để đối chiếu khi quay lại.
- Tab/Shift+Tab đi qua dialog rồi footer, không thoát vào nền/công cụ prototype. Không khai báo vùng dialog là `aria-modal=true` khi footer bên ngoài vẫn tương tác được. Các nút đóng/quay lại/ESC/Back rõ ràng giữ chính sách có trước.
- Không thay thiết kế P02 LOCKED, opacity 80%, góc backdrop, margin/padding hoặc logic lưu của P04–P08.

## Kiểm tra

- 118/118 tests Node PASS, trong đó 16 tests P03. Bổ sung kiểm backdrop ở S01–S04, lưu thất bại/UNKNOWN, menu giữ định danh và chặn lúc busy.
- 16 nhóm browser P03 PASS: click backdrop nhiều vị trí trên bốn panel; giữ caller P06; UNKNOWN qua menu; năm nút footer; đúng nghiệp vụ bốn tác vụ; focus/scroll ở sáu kích thước bổ sung và reference. 29 ảnh đo layout + 4 ảnh sau click backdrop. [Kết quả cuối](evidence/revision-06/final/browser-results.json), [số đo](evidence/revision-06/final/render-metrics.json).
- 14 nhóm browser Home PASS, 7 captures, không page error hay external request. [Hồi quy Home](evidence/revision-06/home-regression/browser-results.json).
- Lần kiểm đầu phát hiện thứ tự Tab đi khỏi app vì footer đứng trước host trong DOM. Đã sửa thứ tự focus và chạy lại; log lỗi đầu giữ tại `evidence/revision-06/browser-failure.json`, không phải kết quả hiện hành.

**Behavior:** PASS trong fixture. **Visual:** hình thức footer được kiểm so với P02 hiện tại; chưa nghiệm thu pixel-perfect toàn board. **Integration:** BLOCKED, chưa có backend/hardware thật; thử trên Chromium headless. Không push/merge/deploy.

Preview: http://127.0.0.1:8766/flows/auth-session/ → đăng nhập fixture `minhanh` / `preview` → bắt đầu ca → Quét mã. Refresh trang đang mở để nạp JS mới.
