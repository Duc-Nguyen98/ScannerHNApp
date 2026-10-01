# P08 r13 — thống nhất mặc định Tất cả ngày và bộ lọc khoảng ngày

User đã xác nhận rõ thay đổi ngữ nghĩa: cả6 màn mặc định Tất cả ngày, dùng Từ ngày–Đến ngày; Hoạt động theo ngày tổng hợp phạm vi đã chọn, không chỉ1 ngày.

## Áp dụng
- initialFilters mặc định from/to rỗng cho General/Nhập-xuất và toàn bộ history entries. Bỏ mốc ngày fixture khỏi state khởi tạo/router.
- S04 dùng chính shared picker mode filter như5 trang còn lại. Không còn control chọn1 ngày riêng trong luồng app. Các helper day legacy không được sử dụng ở S04.
- dayFilters nay giữ cùng fields q/from/to/status/type/scope, mặc định all-days. History state cũ chỉ có q/status được bổ sung defaults rỗng, không ép lại ngày09/09.
- readRange lọc nguồn đầy đủ rồi dedup activityId và cộng5 nhóm. Default48;08–09/09=38;09/09=30. Không sửa fixture hoặc baseline.
- Header tổng quan: all=Tổng quan hoạt động; range=Tổng quan theo khoảng ngày; same-day=Tổng quan trong ngày. Subtitle nêu đúng phạm vi.
- Drilldown mang from/to/query/status và category đúng, Back khôi phục đầy đủ. Xóa lọc ởS04 xóa cả ngày, trả all-days.
- Data source unavailable/missing scope vẫn null, khác query không khớp trả0. Không suy dữ liệu thiếu thành0.
- Giữ rule90 ngày inclusive, khóa future/day91; no-date là đọc lịch sử không giới hạn bộ lọc ngày.

## Xác minh r13
- check_history_range.cjs:4/4 groups PASS.6 màn ×6 viewport, default textTất cả ngày, same style metrics, same2 inputs from/to rỗng.
- Single-day/multi-day/all-day caption/totals; sum và drilldown khớp; query/status/Back/Cancel/clear; boundary locks; unavailable/empty; hub re-entry resetdefaults đều kiểm.
- check_history_unified_r13.cjs:7/7 groups PASS. Assertion daily được cập nhật theo quyết định mới: allwaiting29 vs ngày09/09waiting18; clearall48 vs30. Không sửa/rerun evidence cácrevisiontrước.
- Node toàn workspace145/145 PASS.3 test mới kiểm all-default, range sums/dedup, scope/status/query và unavailable/empty.
- Đã xem ảnh actual General/Daily/Daily-filter. Visual chờ user nghiệm thu; integrationNOT_RUN. Không nhận định mọibrowserstate ngoài phạm vi đã được test.

## Bằng chứng
evidence/revision-13/range-results.json; history-general-494x1000.png; history-daily-494x1000.png; history-daily-filter.png; daily-range.png; unified-regression/browser-results.json; node-tests.txt.
Giữ91 panel/24prompt, sourcefixture/baseline; không push/merge/deploy.
