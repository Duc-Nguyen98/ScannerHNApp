# P13 r07 — rà soát và sửa lỗi UX

Đã rà soát P13 và các đường đi trực tiếp sang Home/P03/P12, giữ hình thức r06 đã tạm chốt và thay đổi của các chat khác. **Tái hiện và sửa 7 lỗi**, không đánh dấu “không còn mọi lỗi” ngoài phạm vi kiểm chứng. [Phạm vi/nguồn sửa](AUDIT_REVISION_07.md).

## Lỗi đã tái hiện và khắc phục

| Lỗi trước sửa | Cách khắc phục |
|---|---|
| Xem thêm mất focus ngay khi gửi request | Giữ nguyên node nút và vùng status; aria-disabled kết hợp guard request, không dựng lại control |
| Trang trả về muộn kéo focus khỏi nút người dùng vừa chọn | Chỉ chuyển tới tin mới nếu focus vẫn ở đúng control gọi request |
| Kết quả mark-read muộn đóng reader đang mở | Cập nhật dòng/count tại chỗ; hoãn cập nhật body khi có overlay, tiếp tục sau khi đóng |
| Back trả focus về header, mất vị trí thao tác trên list | Nhớ dòng gọi, trả về dòng đó hoặc dòng kế tiếp/tab khi tin đã đọc rời bộ lọc; giữ scroll/pages |
| Back từ deep link đẩy thêm history entry, gây vòng quay lại | Fallback dùng replaceState, không tạo trang mới; Back kế tiếp về Home |
| Trang đang tải chen các tin vào trạng thái rỗng đã chọn | Không áp dụng response vào trạng thái trình bày loading/empty/error; cache vẫn giữ đúng, busy phản ánh trạng thái |
| S04 mở ID bảo hành báo Không tìm thấy nhưng vẫn có dock xử lý Web | Dùng cùng guard loại chứng từ cho render và handler; chỉ nhập/xuất hợp lệ có dock S04 |

Không sửa shared footer/dialog/reader, model dữ liệu hoặc cache cursor. Giữ import `clearFilterButton` và các bổ sung từ chat khác. Không tự thêm màu active cho disclosure, không đổi giới hạn nhập hoặc quyền.

## Bằng chứng trước–sau

- [Audit trước](evidence/revision-07/before/audit-results.json): 6 FAIL / 1 PASS; [biên loại chứng từ trước](evidence/revision-07/before-boundary/audit-results.json): 1 FAIL. Không tính lỗi startup vào số lỗi ứng dụng.
- [Audit sau](evidence/revision-07/after/audit-results.json): **8/8 PASS**. Cùng workflow, fixture và độ trễ request được kéo từ180 lên1200ms để tái hiện thao tác nhanh trong thời gian chờ; không thay độ trễ sản phẩm.
- [Reader đã bị đóng trước sửa](evidence/revision-07/before/A03-reader-survives-read-receipt.png) / [reader được giữ sau sửa](evidence/revision-07/after-reader/reader-preserved.png). Lần kiểm riêng reader sau cùng còn xác minh row đã đọc đúng và focus trở lại trigger.
- [Dock sai loại trước sửa](evidence/revision-07/before-boundary/A08-invalid-waiting-document-actions.png); các case sau đều PASS. Hình thức baseline r06 vẫn được giữ, chỉ sửa trạng thái tương tác/lifecycle.

## Các lệnh đã chạy

Các lệnh browser dùng `PREVIEW_BASE_URL=http://127.0.0.1:8781`, output riêng revision-07; biến môi trường đặt bằng PowerShell.

- `node scripts/audit_notifications.cjs`: **8 case PASS** sau sửa; có thêm lần kiểm riêng A03, không cộng trùng vào tổng.
- `node scripts/check_notifications.cjs`: **14 nhóm PASS**. [Log cuối](evidence/revision-07/regression-final/browser-results.json).
- `node scripts/check_notification_pages.cjs`: **9 nhóm PASS**. [Log](evidence/revision-07/pagination/pagination-browser-results.json).
- `node scripts/check_notification_detail_nav.cjs`: **5 nhóm PASS**, 35 geometry cases ở7 viewport. [Log](evidence/revision-07/nav/detail-nav-results.json).
- `node --test tests/notifications.test.mjs tests/notification-pages.test.mjs`: **21/21 PASS**. [Log](evidence/revision-07/node-tests.txt).
- `node --check docs/flows/notifications/notifications.mjs`: PASS.

Tổng **36 nhóm/case browser không trùng +21 ca Node**. Các suite cuối không pageerror. Giữ kiểm 10+10, retry/dedup, hai tab, exact ID, footer/menu, dialog/reader, Unicode/nội dung dài, Back/scroll và logout. Thay đổi source chỉ nằm trong P13 controller/CSS, CSS version ở auth entry và scripts/handoff của P13.

## Môi trường và giới hạn

Nhiều chat đang kiểm thử cùng workspace. Có lần startup preview chưa hiện login trong30 giây, không có pageerror và chưa chạy case nghiệp vụ; kết quả thất bại đó giữ tại [regression lần đầu](evidence/revision-07/regression/browser-failure.json). Đã chạy lại bộ cuối thành công trên server cục bộ8781 cùng source. Không kill/restart server8766 hay tiến trình chat khác. Script regression chỉ cho phép reload một lần nếu chưa có login và chưa có startup error hiển thị, trước mọi thao tác phiên.

Visual: giữ mốc r06 tạm chốt, state audit mới có evidence để review; không tự nâng thành pixel-perfect. Behavior PASS cho phạm vi đã chạy. Integration vẫn BLOCKED_PRODUCTION; không kiểm WMS/phần cứng. Giữ4 ID P13 và91 panel, không push/merge/deploy.

Đã nạp lại preview chính8766 và xác nhận P13-r07 hiển thị. Server8781 dành cho audit đã dừng sau khi hoàn tất; không ảnh hưởng8766.
