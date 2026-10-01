# P08 r21 — rà ổn định Lịch sử, 28/09/2026

## Phạm vi và phương án

Giữ giao diện đã duyệt; ưu tiên sửa hành vi tìm kiếm và hồi quy bộ lọc, điều hướng, trạng thái. Sáu trang: Lịch sử chung, Hoạt động theo ngày, Nhập/Xuất, NFC, Bảo hành và Phiên quét. Không thêm board/panel hoặc nghiệp vụ.

Workspace đang được các chat khác cập nhật đồng thời (P01–P07/P09 và Home). Đợt này không nhận thay đổi của các chat đó là công việc của P08; không ghi đè checkpoint current_prompt=P09. Không kết luận toàn hệ thống đã hết lỗi từ kết quả riêng P08.

## Hai lỗi đã sửa

1. Tìm kiếm từng ký tự từng dựng lại toàn DOM của màn, thay luôn input đang nhập. Đã giữ nguyên input và hàng tìm kiếm đang kết nối với document, chỉ cập nhật các phần kết quả/toolbar/tổng quan phía dưới. Tránh ngắt composition tiếng Việt, mất selection và nguy cơ đóng bàn phím mềm. Dùng cùng một handler cho cả sáu trang, vẫn cập nhật kết quả tức thì, lưu query và reset cuộn.
2. Lịch sử chung/nhập-xuất/tổng quan chỉ chuẩn hóa chữ đ thường; chữ Đ hoa tìm không nhất quán với các trang nghiệp vụ. Đã chuẩn hóa cả hai chiều, giữ nguyên dữ liệu nguồn và quy tắc lọc khác.

Không đổi CSS, màu sắc, kích thước card/header/nav, nhãn trạng thái, palette icon pastel hoặc thiết kế bộ lọc. Không sửa baseline hay dữ liệu mẫu để vượt test.

## Kiểm chứng

### Behavior

- Node: 26/26 PASS với `tests/history*.test.mjs`, `tests/business-history.test.mjs`, `tests/query-date-policy.test.mjs`, `tests/ui-operation-standard.test.mjs`.
- `check_history_search_stability.cjs`: 6/6 nhóm PASS; cùng node input/focus trong composition mô phỏng, kết quả live, rỗng, xóa lọc, tổng quan, drilldown/chi tiết và Back giữ query. Evidence cuối: `evidence/stability-2026-09-28/search-diagnostic/results.json` (tên thư mục diagnostic nhưng đây là lượt hoàn tất PASS).
- `check_history_reset_r19.cjs`: 5/5 nhóm PASS trên bản sửa; sáu trang Reset hôm nay/status All, Cancel không commit, Apply commit, Xóa lọc ngoài danh sách vẫn bỏ giới hạn ngày; Today chỉ điều hướng lịch; đổi ngày VN qua nửa đêm; khoảng đảo ngược và ngày ngoài 90 ngày bị chặn; cùng ngày hợp lệ; clipboard đúng nguồn và callback muộn không đổi tab. Evidence: `evidence/stability-2026-09-28/reset-final/reset-results.json`. Trường revision P08-r19 trong JSON là phiên bản suite gốc, không phải revision source hiện tại.
- `check_history_unified_r19.cjs`: 7/7 nhóm PASS trong giai đoạn đầu audit, trước bản sửa input; bao gồm bộ lọc theo nghiệp vụ, trạng thái lỗi/rỗng, P05 lựa chọn, legacy route/unknown ID/logout. Không coi đây là lượt hậu kiểm source r21. Evidence: `evidence/stability-2026-09-28/unified/browser-results.json`.
- `node --check docs/flows/history/history.mjs`: PASS.

### Visual

- Suite bộ lọc kiểm tra 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940: dialog trong app, không tràn ngang, ngày hiển thị, focus còn trong dialog.
- Đã trực tiếp xem ảnh Lịch sử chung, Tổng quan và dialog sau Reset. Chuẩn pastel nghiệp vụ, badge số lượng, lề và bố cục được giữ; không thêm redesign trang trí.
- Đây là hồi quy bố cục, không thay thế nghiệm thu visual của user.

### Giới hạn / tính trung thực

- Lượt toàn-repo ban đầu có test lỗi trong các module đang được chat khác sửa; không ghi nhận toàn hệ thống PASS.
- Các lượt search/reset đầu gặp timeout tải hub; một lượt có lỗi null querySelector. Giữ nguyên `search/failure.json`, `search-final/failure.json`, `reset/failure.json`. Không sửa/nới assertion để biến chúng thành PASS. Các lượt cuối cùng hoàn tất không có pageerror. Chưa đủ căn cứ kết luận nguyên nhân tải hub đã được P08 xử lý triệt để.
- Thử mở server kiểm thử riêng bị công cụ chặn; các lượt cuối dùng cổng preview 8766 hiện hữu, không dừng/restart server của chat khác.
- Composition được kiểm tra tự động ở mức DOM; bộ gõ/bàn phím thiết bị thật chưa thử. Backend/hardware integration không thuộc lượt này.

## File và nguồn

- Sửa: `docs/flows/history/history.mjs`, `history-model.mjs`.
- Thêm: `tests/history-search-stability.test.mjs`, `scripts/check_history_search_stability.cjs`.
- Suite Reset được thêm biến môi trường thư mục evidence/URL, không đổi assertion; không ghi đè evidence r19.
- SHA256 history.mjs: `833D9EC763C6B52BFBCF6A1D47DEC21BCBA134B4A77F645F6396B488BCA954D2`.
- SHA256 history-model.mjs: `9CEAE491357DC18D7CEFEBAA8C6E1DDE1928D7D34B641D00A1D3808C74934E81`.
- Fixture gốc vẫn `CDC2EC4B43FF6E36DD6B7CF4320994AC26C08826E2CF4C50D0F2BB842CA3D3B5`.
- Coverage giữ nguyên số panel/trạng thái nghiệm thu. Không push/merge/deploy.

## Đề xuất tiếp theo

Sau khi các chat cùng workspace hoàn tất, chạy một lượt hồi quy hệ thống trên source ổn định, đặc biệt đăng nhập → Home → hub Lịch sử → Back/Forward. Không cần thiết kế lại UI hiện tại chỉ để sửa lỗi logic.
