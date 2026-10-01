# P08 r11 — lịch sử dùng chung, bổ sung dữ liệu, đồng bộ chọn P05
Ngày: 2026-09-27. User duyệt cập nhật3 ô chọn P05 và bổ sung mẫu thay vì khóa lọc ngày Bảo hành. User yêu cầu bỏ nhãn demo trong giao diện người dùng; không lặp lại cảnh báo này trong phản hồi.
## Triển khai
- history-controls.mjs là cùng markup cho tìm kiếm, tab, ngày/trạng thái, số kết quả, sort/Xóa lọc của General, Nhập-xuất, NFC, Bảo hành, Phiên quét. Ngày có cùng search/filter và date picker một ngày, không sort thống kê vô nghĩa.
- history-picker.mjs nhận statusOptions/scopeLabel/statusTitle theo nghiệp vụ, không hardcode tất cả trạng thái vào mọi trang. Đổi tab nghiệp vụ bỏ trạng thái không còn phù hợp, giữ query/ngày.
- General và Nhập/xuất giữ nguồnB08. Daily lọc query/status từ full source trước khi cộng nhóm; drilldown mang cùng query/status/day.
- NFC: Thành công/Đã thu hồi; Bảo hành: Đang kiểm tra/Đã trả khách; Phiên: Chờ xử lý trên Web/Đã xuất (nhãn Kết quả chứng từ, không đồng nhất với phiên Hoàn thành).
- Các list nhúng cũ chuyển qua renderer chung trong cùng shell. Cả legacy route scene=nfc/warranty/sessions cũng chuyển đúng view. Standalone board files không bị thay bằng gallery hoặc board raster.
- Dùng lại detail r05 theo ID, lấy timeline có nguồn từngrecord; Bảo hành có full year, case/serial/model/actor và timeline. Giữ ngày09/09 của mốc tiếp nhận BH-002 riêng, không ép mọi event về ngày snapshot.
- Bỏ nhãn Dữ liệu mô phỏng trong các trang lịch sử đang dùng; bỏ hậu tố(mẫu) của option Phiếu mới. Ghi chú kỹ thuật nằm ngoài app/bàn giao, không đặt lại badge trong app.
- P05 source/recipient/group dùng choice-dialog.mjs và choice-options.mjs cùng radio/spacing/fonts/Cancel-Apply của lịch sử. Giữ confirm đổi phiếu ở layer nghiệp vụ; sau scan source/group bị khóa. Province/district giữ component trước đó, không thay workflow địa chỉ.
## Dữ liệu được bổ sung
- NFC10 events (4 đã có +6), Bảo hành8 cases (giữ ID/thông tin2case gốc, bổ sung6), Phiên8 sessions (3 gốc +5).
- PQ-0002/PQ-0003 bổ sung actor/kho/codes; kiểm total=accepted+duplicate và quantity từngsession. Mã trùng trỏ đúng mã đã chấp nhận, không cộng lượng.
- Giữ nguyên frozen shared/history-fixtures.js/B08 và PQ-0001 19/18/1, quantity17. Phần mở rộng trong business-history-data.mjs; không sửa baseline.
- Các nghiệp vụ là bộ nguồn khác nhau (activity/event/case snapshot/session), không lấy số card bảo hành hay NFC để thay số hoạt động/ngày của B08.
- Các serial được bổ sung mới dùng định danh riêng theo loại sản phẩm/phiên, tránh gán sản phẩm khác vào mã catalogue hiện có. Các2case ban đầu giữ serial đã có. P06 bỏ hậu tốdemo ở brand/alt text, không đổi tồn hoặc ảnh.
- Không tuyên bố tỷ lệ khớp99% với dữ liệu sản xuất khi chưa có nguồn đối chiếu.
## Coverage
- P08.S01–S04 giữ nguyên. Business view dùng data-panel P08 cho component styling và data-screen-id theo mapping cố định:
  NFC list/detail=P22.S02/S03; warranty list/detail=P23.S01/S02; session list/detail=P23.S03/S04.
- Đây là nâng cấp các dependency lịch sử đã được user đưa vào scope, không đánh dấu toàn promptP22/P23 hoàn tất; không triển khai P09–P24 toàn bộ.
- P23 link linh kiện/nguồn production của fullboard chưa được nghiệm thu trong đợt này; không tự nối quyền/thao tác ghi mới.
## Kiểm chứng đúng source cuối
- Node toàn workspace:142/142 PASS,0FAIL. Không nhận công sửa các lỗiP05 ở lượt trước; chỉ ghi kết quả hiện tại.
- check_history_unified.cjs:7/7 nhóm PASS.5list ×6viewport=30 captures;3P05dialog ×6viewport=18captures, kèm filters/detail/daily.
- Layout:494×950, scroll trong, nav cố định, không tràn chữ/horizontal. Đã xem trực tiếp ảnh NFC/warranty/session, filter Bảo hành, P05recipient.
- Behaviors: query/type/date/status, clearing invalid status on type change, Back context, unknown ID fail-closed, legacy route, runtime loading/error/unavailable/empty; session code/counts; source-confirm cancel/apply; postscan lock; logout/back guard.
- Date regression:6/6 nhóm PASS gồm boundary90/91/future, midnight Vietnam, manual older data và6viewport. Evidence riêng revision-11/date-regression.
- Visual user acceptance pending; integration backend/hardware NOT_RUN. Tests là local behavior evidence, không integration certificate.
## Bàn giao
- evidence/revision-11/browser-results.json, node-tests.txt, date-regression/browser-results.json
- warranty-494x1000.png, nfc-494x1000.png, sessions-494x1000.png, warranty-filter.png, daily-filtered.png, outbound-source/recipient/group.png
- New shared components: history-controls, choice-options, choice-dialog; business-history-data
- scripts/check_history_unified.cjs; tests/business-history.test.mjs
- RUN_STATE/SCREEN_COVERAGE giữ91 ID/24 prompt. R01–r10 evidence không ghi đè.
Không push/merge/deploy; không tự thêm API/quyền/hardware.
