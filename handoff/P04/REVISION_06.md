# P04 revision06 — loại nhập và tìm nhà cung cấp

Yêu cầu: ba loại Nhập sản phẩm / Nhập linh kiện / Khác; thêm10–15 NCC mẫu và tìm kiếm trong dropdown. Triển khai15 NCC fixture, source HEAD da9f623, target prototype. Giữ P08 checkpoint và các flow khác; không sửa baseline, không deploy.

## Đã triển khai

- Loại nhập có đúng3 lựa chọn; mặc định Nhập sản phẩm. Chọn cập nhật typeId/type thực trong document và request, có kiểm catalogue tại flow; không chỉ đổi text. Khóa loại sau lượt scan đầu, bảo toàn ý nghĩa phiếu; field có giải thích khi khóa.
- NCC có15 mục, tên và mã NCC-001…NCC-015, ID fixture riêng. Giữ Minh Phát làm default. Tên/mã hiển thị trên menu, loại/NCC đã chọn xuất hiện cả Review và Kết quả. Không gọi API tạo NCC, không dùng ID giả làm ID WMS.
- Tìm ngay khi gõ, không phân biệt hoa/thường, hỗ trợ dấu tiếng Việt/đ→d, tìm nhiều từ không cần đúng thứ tự và mã NCC. Ví dụ `hai dang`, `đăng hải`, `NCC-008`, `008` cùng tìm Hải Đăng.
- Focus vào ô search khi mở; kết quả đếm trực tiếp, nút × xóa search (không xóa lựa chọn), thông báo khi không thấy; query rỗng khôi phục15 mục, mở lại reset search nhưng giữ NCC đã chọn/dấu tích.
- ArrowDown/ArrowUp vào đầu/cuối danh sách đã lọc; Home/End trong list, Enter chọn, Escape hủy trả focus về trigger. Không kết quả + Enter không chọn giả; IME composition không chốt lựa chọn. Keyboard focus và selected có nhận biết.
- Search/help/count ở đầu popup, danh sách cuộn riêng; popup tự mở trên/dưới, luôn trong thân app, không đẩy field/footer, chỉ1 popup mở, dọn listener khi dispose. Giữ khung494×950 và cơ chế preview Home.
- NCC có thể đổi ở Bước1 trước gửi, kể cả sau khi quay lại từ quét; không mất note/mã/định danh. Request/busy/UNKNOWN/recorded khóa thay đổi ở flow. Lượt mới reset về defaults, không mang search hoặc kết quả cũ.

## Dataset mẫu

| Mã | Nhà cung cấp |
|---|---|
| NCC-001 | Công ty Minh Phát |
| NCC-002 | Công ty An Bình |
| NCC-003 | Công ty Thiên Long |
| NCC-004 | Công ty Hoàng Gia |
| NCC-005 | Công ty Đại Việt |
| NCC-006 | Công ty Tân Phú |
| NCC-007 | Công ty Phúc An |
| NCC-008 | Công ty Hải Đăng |
| NCC-009 | Công ty Nam Việt |
| NCC-010 | Công ty Đông Á |
| NCC-011 | Công ty Bình Minh |
| NCC-012 | Công ty Hưng Thịnh |
| NCC-013 | Công ty Kim Long |
| NCC-014 | Công ty Sao Việt |
| NCC-015 | Công ty Thành Công |

Dữ liệu tổng hợp cho demo, không xác minh pháp nhân/tồn tại thật. Ba loại là metadata được user yêu cầu; không tự suy quy tắc mã/quantity hay Post linh kiện từ nhãn. Pipeline scan hiện có vẫn là fixture HN12345–HN12355; catalogue mã phân theo loại production chưa được cung cấp. Không có điều kiện planned mới hoặc thay đổi tồn.

## Kiểm chứng

- **137/137 Node PASS**, thêm4 tests: unique catalogue/search, chọn cả3 loại và15NCC giữ identity/request, forged ID/name và khóa scan/request, fresh defaults. [Log](evidence/revision-06/node-tests.txt).
- `node scripts/check_inbound_catalogue.cjs`: **6 nhóm PASS**, **6 viewport**. [Kết quả](evidence/revision-06/browser-results.json). Kiểm keyboard/search/empty/clear/filter/cancel, popup/footer invariant, type scan lock, review/request/UNKNOWN/check/fresh defaults. Không JS errors.
- Hồi quy đồng bộ UX **8 nhóm PASS**,6 viewport: [kết quả](evidence/revision-06/sync-regression/browser-results.json). Hồi quy Nhập kho **11 nhóm PASS**: [kết quả](evidence/revision-06/inbound-regression/browser-results.json). Tổng25 nhóm browser, không pageerror; không tính lại các suite cũ chưa chạy.
- Ảnh đã xem: [Loại nhập](evidence/revision-06/01-types.png), [15 NCC](evidence/revision-06/02-suppliers.png), [Tìm theo mã](evidence/revision-06/03-search.png), [không có kết quả](evidence/revision-06/04-empty.png), [review](evidence/revision-06/06-review.png), [kết quả](evidence/revision-06/07-result.png).
- Lần test đầu query role option toàn page đếm cả native options trong tools: scope lại đúng popup đang mở; `failure.*` là log lần đầu, `browser-results.json` là kết quả cuối.

Files: thêm `inbound/catalogue.mjs`; sửa fixture-adapter/validation/flow/UI/select-control/CSS; import version p04-catalogue-r06; tests và script catalogue. Không sửa source Xuất kho, Home layout, các baseline hoặc tổng91 panel.

Visual chờ user review; backend/camera và nguồn NCC thật chưa tích hợp. Dữ liệu vẫn trong bộ nhớ; reload mất nháp. Không push/merge/deploy hoặc reload tab nháp của user.
