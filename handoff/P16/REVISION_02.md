# P16 r02 — áp dụng sáu đề xuất UI/UX

Đã thực hiện cả sáu đề xuất theo yêu cầu “Áp dụng đề xuất cho tôi”. Giữ bốn ID P16.S01–S04, shell494×950, footer khóa, quyền và owner tạo chứng từ. **Behavior PASS prototype; visual chờ review; integration production chưa xác minh.**

## Kết quả

1. S03 có điều kiện từ khóa/loại/ngày/trạng thái, mỗi nút chỉ bỏ đúng điều kiện đó. Xóa bộ lọc vẫn đặt lại toàn bộ; bỏ ngày bỏ cả khoảng từ–đến. Nhãn dài có đầy đủ trong aria-label/title và các controls phía trên.
2. Có từ khóa thì ưu tiên **Sửa từ khóa**; không có thì **Điều chỉnh bộ lọc**, dùng picker hiện hữu. Hủy/Escape không lưu thay đổi nháp.
3. Cache lỗi/cập nhật nói rõ **Đang hiển thị dữ liệu đã tải trước đó**. Nguồn hiện tại không có timestamp cập nhật nên không hiển thị giờ tự sinh.
4. Đợi250ms sau ngừng gõ; Enter tìm ngay; không gửi giữa composition tiếng Việt. Hủy timer/request cũ khi query đổi hoặc rời màn. Trong thời gian đợi truy vấn mới không hiển thị hàng cũ dưới từ khóa mới; chỉ báo tìm kiếm gọn thay skeleton cả danh sách. Tải đầu vẫn giữ S01.
5. Nút tìm bằng mã giữ vị trí, có aria-disabled và giải thích khi chưa có nguồn đọc hợp lệ. Handler không mở form vô ích; cache đã xác minh vẫn có thể tra cứu.
6. Tải lại giữ dòng đầu đang thấy bằng ID/offset và focus dòng còn tồn tại, kể cả khi dữ liệu đổi thứ tự. Dòng bị xóa dùng vị trí cuộn còn hợp lệ, không tự mở chứng từ. Preview có hai nút ngoài app để thử cập nhật chậm/phục hồi.

## Kiểm chứng và evidence

- `node scripts/check_p16_ux.cjs`: **7/7 nhóm PASS**, gồm20 capture bốn panel×5viewport, IME/debounce/Enter, bỏ riêng bộ lọc, scan guard, race, neo dòng khi đổi thứ tự. [Kết quả](evidence/revision-02/ux-results.json).
- Suite `check_p16_reads.cjs` chạy với output sang revision02, mỗi lần nhập kết thúc bằng Enter để phù hợp hành vi mới: **6/6 nhóm PASS**, gồm P15 network/401/403, retry single-flight và query dài. [Kết quả](evidence/revision-02/reads-regression/results.json).
- `check_documents_tabs.cjs`: **9/9 nhóm PASS**, sáu viewport, tabs/Back/focus/PDF. FooterLOCK: **4/4 viewport PASS**. Output riêng trong `evidence/revision-02/p12-tabs` và `footer`.
- Cùng năm file Node suite r01: **38/38 PASS**. [Log](evidence/revision-02/node-tests.txt). Tổng **26 nhóm/viewport browser**, không pageerror. Syntax và `git diff --check` đạt.

Before chụp từ source r01 lưu riêng qua request interception bằng `capture_p16_ux_before.cjs`; không thay working copy. Actual Chromium headless/DPR1/zoom1/Arial, viewport494×950,360×800,430×932,1440×900,340×420; regression P12 thêm1869×940. Diagnostics phát triển: selector status đổi sang radio thực; ca guard dùng dispatch để xác minh handler vì Playwright chặn click aria-disabled; đã sửa bố cục tránh phần artwork bị cắt khi có bốn điều kiện.

[Review trước–sau](REVIEW_02.html) · [Nguồn và lựa chọn hình thức](REVISION_02_SOURCE_MAP.md). Chip hai cột/min44px và vùng giải thích scan cố định là adaptation được triển khai trong phạm vi yêu cầu, chưa phải user nghiệm thu raster. Backend/auth/permission thật, thiết bị và screen reader thật vẫn chưa kiểm. Không push/merge/deploy.

Source thay đổi giới hạn ở `documents/documents.mjs`, `data-states/view.mjs`, `data-states/style.css`; model/API dữ liệu chung không đổi. RUN_STATE/coverage đã cập nhật, giữ91panel/24prompt và evidence r01.
