# P13 — Thông báo và theo dõi phiếu chờ Web

Entry: `../auth-session/` → xác nhận phiên → chuông Home. Bốn panel giữ `P13.S01–P13.S04`, route `#p02/notifications?panel=1..4`; chi tiết dùng `event` hoặc `doc` ID rõ ràng.

`notification-model.mjs` chứa **nguồn preview**, namespace `hn-scanner-notifications-preview-v1`, riêng theo authSessionId/actor/kho. Năm sự kiện có nguồn thiết kế B13; copy nhập/xuất cập nhật theo HANDOFF. Không phải thông báo WMS thật; không tạo push/email/SMS. Không persist; reload đặt lại. Badge Home và bộ lọc cùng đọc một store; chỉ receipt local xác minh mới đổi read/count. Lỗi hoặc phiên đổi giữ dữ liệu; chống gọi lặp một event đang xử lý.

Chứng từ và danh sách chờ dùng model P12 chung, gồm receipt đã xác minh từ P04/P05; tra bằng ID, lọc kho và trạng thái. Quyền preview dùng phiên fixture đã xác nhận có `warehouseOperations`; **không khẳng định đây là quyền notifications production**. Scope không xác minh thì không hiển thị dữ liệu. AppShell sở hữu reader/dialog/footer; module chỉ gắn readable markers, không mount reader thứ hai.

## Tích hợp còn bị chặn / đề xuất cần chốt

Chưa có adapter notifications production có thể gọi trong source prototype; production `BLOCKED`. Khi có contract được duyệt, cần nối nguồn events/list và receipt mark-read, scope đọc từng đối tượng theo actor/kho, tình huống bị thu hồi quyền và lỗi mạng. Đây là danh mục đầu vào cần xác nhận, **không phải API/permission/enum backend mới**.

Chưa được cung cấp URL Web, nên chỉ mở dialog hướng dẫn tìm theo mã phiếu trên hệ thống do đơn vị cấp. Không tự ghép domain/path. S03/S04 MIGRATED theo HANDOFF; không approve/reject/Post và không đổi tồn. P24 chỉ dùng chung nội dung WAITING_WEB; không tuyên bố P24 đã hoàn thành.

Nguồn gốc fixture và công cụ kiểm thử nằm ngoài AppShell, không có badge demo trong giao diện sản phẩm. Báo cáo và bằng chứng: `handoff/P13/REPORT.md`.

## r03 — tải theo đợt10

`NOTIFICATION_PAGE_SIZE=10` là lựa chọn UI được triển khai theo yêu cầu giới hạn/tải thêm, chưa phải contract backend. UI gọi `loadPage` của **adapter local**; không lấy toàn bộ list rồi chỉ ẩn CSS. Đợt đầu tối đa10; mỗi lần bấm tải tiếp tối đa10; không có infinite-scroll/prefetch. Sắp xếp ngày/giờ mới nhất trước, ID làm khóa phụ. Cursor giữ mốc thứ tự nên đọc/xóa khỏi bộ lọc Chưa đọc không làm nhảy offset và bỏ sót trang kế tiếp.

`notification-pages.mjs` giữ cache độc lập hai tab, gộp chống trùng ID, khóa request trùng, giữ trang/cursor khi lỗi, bỏ kết quả khác actor/session/kho hoặc dataset. Tổng unread vẫn từ nguồn; không suy từ kích thước trang. Sau đọc thành công, loại đúng tin đã đọc khỏi cache Chưa đọc, không tự tải tin bù. Back và đổi tab giữ trang/scroll. Cuối danh sách có số đang hiển thị, tải tiếp/loading/thử lại hoặc hết thông báo; lỗi dùng dialog chung.

Nguồn mặc định vẫn5 events (3 chưa đọc). Selector ngoài AppShell `Dữ liệu phân trang` có bộ37 events (24 chưa đọc), gồm32 thông báo vận hành cũ synthetic để kiểm thử10→20→30→37. Không sinh notifications thật. Reload trở về5 events. Contract production cho cursor, quyền, count và refresh events chưa được cung cấp; vẫn BLOCKED.

## r04 — caps chỉ ở lớp trình bày

Helper `notification-count.mjs`: chuông cap9+, tab cap99+; zero ẩn badge chuông, unknown kháczero. Title/aria-label và thống kê giữ số chính xác `vi-VN`. Không đổi `store.unread()` hoặc tổng trang. Nút nhãn ổn định Xem thêm, aria-label cho biết số tải tiếp; cuối nguồn chỉ một dòng Đã tải đủN thông báo, không gán đã đọc. Stress datasets0/1/9/10/99/100/999/1000 chỉ ở công cụ preview ngoài AppShell. Giới hạn caps là lựa chọn UI r04, chưa nghiệm thu Designer/backend.

## r05 — menu xuyên suốt trang chi tiết

Theo phản hồi user2026-09-29, S02/S04 giữ menu Home/P03 như danh sách. Không còn rule ẩn `.hn-nav` khi `.p13-detail-screen`. Class detail giữ để quản lý bố cục/lifecycle; dock CTA có khoảng cách với scan-circle, nội dung cuộn riêng. Không tạo footer mới, không thay hành vi đọc/điều hướng hoặc xác nhận phiên. Xem `handoff/P13/REVISION_05.md`.

## r06 — nội dung trước, metadata sau

Theo đề xuất được user yêu cầu triển khai, S02 đặt nội dung ngay sau tiêu đề/thời gian/nguồn; thời gian không lặp. Metadata Loại thông báo/Người tạo/Kho nằm trong disclosure native, nhớ trạng thái riêng từng event. Chứng từ liên quan hiện mã/loại/trạng thái trực tiếp và giữ CTA đúng ID; kho/NFC không có CTA giả. Read retry chỉ hiển thị sau failure, receipt/count không đổi. Xem `handoff/P13/REVISION_06.md`.

## r07 — lifecycle và focus

Kết quả bất đồng bộ cập nhật các row/count cần đổi, không render lại toàn màn. Giữ node Xem thêm/status để focus và thông báo hỗ trợ ổn định; không cướp focus nếu người dùng đã chuyển sang control khác. Body chờ overlay đóng rồi mới đồng bộ, không phá reader. Back khôi phục row/action gốc, deep-link fallback dùng replace. S04 dùng cùng điều kiện nhập/xuất cho nội dung và CTA. Không đổi source/cache/cursor hoặc shared components. Xem `handoff/P13/REVISION_07.md` và audit trước–sau.
