# Đồng bộ P08–P09 theo HN-action-feedback-v1 — 28/09/2026

Phạm vi được user yêu cầu: kiểm tra và áp dụng contract P11 r03 ngược về P01–P10. Báo cáo này chỉ chịu trách nhiệm P08 Lịch sử và P09 Bảo hành; không suy ra toàn bộ app/production đã nghiệm thu. Không đổi số board/panel, baseline, dữ liệu nghiệp vụ hoặc thêm backend/hardware.

## Đã sửa

- P08: sao chép mã thành công/thất bại dùng dialog chung; bỏ dòng `.p08-feedback`. Callback clipboard muộn không được mở dialog trên tab/bản ghi khác. Thông báo khoảng ngày cũ ngoài giới hạn cũng dùng dialog và lưu phạm vi đã làm sạch để không báo lặp khi quay lại.
- P08: bộ lọc/sắp xếp có history boundary riêng. Back chỉ đóng dialog, giữ trang/query/scroll; Hủy/Reset không commit. Áp dụng đợi history dialog đóng rồi mới ghi bộ lọc. Bấm nền không đóng.
- P09: lỗi thao tác và giới hạn tích hợp dùng dialog chung, bỏ `.p09-feedback`. Lỗi lưu xử lý đóng form trước khi mở thông báo, không chồng overlay; “Tiếp tục chỉnh sửa” mở lại đúng hồ sơ, bản nhập và request ID.
- P09 UNKNOWN: dialog “Để sau / Đối chiếu”; giữ request ID/session/version, khóa ghi lặp và giữ nút đối chiếu trong trạng thái pending. Đóng/Back không gửi lại; sau đối chiếu xác minh mới vào P09.S04.
- P09 tiếp nhận: giữ đầy đủ bảng xác nhận sản phẩm/serial/khách/lỗi; dùng heading/footer/action token của dialog chung, focus Hủy, CTA ghi đúng “Tiếp nhận” hoặc “Mở hồ sơ”. Tiếp nhận mới đã xác minh có dialog thành công “Đã hiểu”; mở hồ sơ cũ không giả có một lần ghi mới.
- Form cập nhật và xác nhận không đóng khi bấm nền. Validation serial/lỗi/kết quả vẫn tại field. Hint tĩnh, read-only, empty/loading, ngữ cảnh hồ sơ không thuộc bộ lọc và pending reconciliation vẫn là nội dung trạng thái.
- P09.S04 giữ nguyên panel kết quả đầy đủ, không mở thêm dialog trùng. Nội dung ngắn đã tự vừa khung 494×950; không cần ép height/ẩn overflow. Nội dung kết quả dài thật vẫn cuộn và đọc được đến cuối.

## Mapping panel / trạng thái

| Panel | Nội dung giữ nguyên | Feedback / cuộn sau kiểm tra |
|---|---|---|
| P08.S01 | Danh sách; sáu trang lịch sử dùng chung controls; tất cả ngày mặc định | Filter/sort dialog có Back riêng; loading/empty/source-error ở body; danh sách dài cuộn |
| P08.S02 | Chi tiết lịch sử, thông tin/lịch sử/tệp; đúng mã nguồn | Copy → dialog thành công/lỗi, focus về nút copy; chi tiết dài cuộn |
| P08.S03 | Phiên quét, counts theo nguồn, mở rộng mã | Không thêm thông báo/panel; nội dung dài cuộn trong khung |
| P08.S04 | Tổng quan hoạt động theo cùng bộ lọc | Áp dụng/reset/hủy giữ contract; header/nav không dịch |
| P09.S01 | 8 hồ sơ, tìm kiếm/status/sort và ngữ cảnh Back | Thông báo chung ở dialog; danh sách/empty/pending giữ nguyên |
| P09.S02 | Tiếp nhận; chọn lỗi18 mục, Other cần mô tả, serial chính xác | Xác nhận trước tiếp nhận; chỉ receipt mới hiển thị thành công; field validation giữ tại field |
| P09.S03 | Hồ sơ ba tab; ledger5 phiếu/tổng8 linh kiện; đã trả khách chỉ đọc | Lỗi xử lý/UNKNOWN là một dialog trên hồ sơ; form nháp không mất |
| P09.S04 | Receipt cập nhật đúng case; Chờ bàn giao; Xem hồ sơ / Về danh sách | Result ngắn không scroll dư; kết quả dài cuộn tự nhiên; không giả Đã trả khách |

Các alias Lịch sử NFC/Bảo hành/Phiên quét có screen-id P22/P23 hiện hữu chỉ được hồi quy qua component lịch sử dùng chung; không tuyên bố hoàn tất các board sau P11.

## Kiểm chứng

- Node: **50/50 PASS** qua history*, business-history, query-date-policy và warranty* (`node-tests.txt`). Test P08 vẫn khóa SHA baseline B08 và history fixture. Bỏ hai hash nguyên file P07 (style/module) vì user đã cho phép sửa P07 để đồng bộ dialog; artwork/motion P07 do suite module sở hữu kiểm tra, không biến source có sửa được duyệt thành lỗi toàn repo.
- Browser mới: **12/12 nhóm PASS** (`browser-results.json`): sáu trang bộ lọc, copy thành công/lỗi/callback muộn, bốn panel P08, xác nhận tiếp nhận, lỗi/retry, UNKNOWN/defer/Back/confirm, double submit, intake mới xác minh, result ngắn/dài, closed/deep-link.
- Shared choice bổ sung sau khi root khóa backdrop: **1/1 nhóm PASS** (`choices-results.json`), kiểm status/sort/fault, Back/Escape, không commit khi chạm nền và Other vẫn bắt buộc mô tả.
- Browser hồi quy: P09 **10 nhóm** (`warranty-regression/browser-results.json`), P09 update/navigation **11 nhóm** (`update-regression/update-results.json`), P09 stability **7 nhóm** (`stability-regression/stability-results.json`), P08 filter/date/clipboard **5 nhóm** (`history-regression/reset-results.json`).
- Viewport: 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940. Kiểm shell494×950, overflow ngang, dialog trong app, một overlay, focus trong dialog; wheel trên result ngắn không đổi content/header/footer; long result195 ký tự vẫn cuộn.
- Trực tiếp xem ảnh copy, intake confirm, intake success, update failure và result. Không redesign bố cục/màu nghiệp vụ đã duyệt. Đây là visual QA kỹ thuật, còn chờ user nghiệm thu.

## Giới hạn và diễn biến kiểm thử

Backend/WMS, camera/NFC thật và production: **NOT_RUN**. Đọc/ghi trong bộ nhớ fixture, không gọi API mới.

Có các lượt harness đầu cần chỉnh selector từ `.hn-action-dialog` sang `[open]` vì P02 có dialog tên đóng thường trực, và chờ hai animation frame sau resize trước đo layout. Một lượt cuối gặp P01 “Chưa tải được giao diện prototype” khi reload; giữ `failure.json`/`failure.png` cho khả năng tải preview và chạy lại toàn suite, không nới điều kiện kiểm tra. Kết quả cuối xem `browser-results.json`, không dùng file failure làm kết luận PASS.

Suite stability cũ ban đầu có output hardcode r08 nên đã vô tình làm mới5 ảnh và `stability-results.json` của r08 trong lượt PASS hiện tại. Đã sao chép chính bằng chứng đó vào `stability-regression/`, thêm biến môi trường output cho các lượt sau; đây không phải bằng chứng lịch sử r08 nguyên bản. Không sửa dữ liệu nghiệp vụ hoặc source ngoài phạm vi để che việc này.

## File đã chỉnh trong phạm vi này

- `docs/flows/history/history.mjs`, `history-picker.mjs`
- `docs/flows/warranty/warranty.mjs`, `style.css`
- `tests/history.test.mjs`
- `scripts/check_dialog_sync_p08_p09.cjs`, `check_dialog_sync_p09_choices.cjs` (mới)
- `scripts/check_history_reset_r19.cjs`, `check_warranty.cjs`, `check_warranty_update.cjs`, `check_warranty_stability.cjs` (assertions theo dialog mới; output chỉ định bằng env)

Phụ thuộc chung do root quản lý: `shared/action-feedback.mjs`, `action-dialog.mjs/css`, `app-modal.mjs`, `dialog-route.mjs`, import stylesheet ở auth entry. Không sửa Home/auth entry/global coverage/RUN_STATE/shared files trong phần việc này. Bảo toàn module P12 do chat khác thêm đồng thời.

## Đính chính provenance r08

Đã đánh dấu ngay đầu [báo cáo r08](../../P09/REVISION_08.md) rằng sáu file bị ghi đè thuộc lượt chạy hiện tại. Giữ toàn bộ các kết luận lịch sử bên dưới, không tái chụp hay suy diễn khôi phục. Danh sách file, hash hiện tại và các vị trí đã tìm bản gốc: [EVIDENCE_PROVENANCE.json](EVIDENCE_PROVENANCE.json). Không tìm được bản gốc byte-identical trong các vị trí đã kiểm tra; chưa khôi phục nguyên bản.
