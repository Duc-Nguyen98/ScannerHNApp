# P02 r07 — Ca bắt đầu theo kết quả xác nhận phiên

Yêu cầu mới thay đồng hồ chạy r06 bằng thời điểm xác nhận ca. Target vẫn prototype; giữ nguyên bố cục/màu r06 và các module/checkpoint có trước.

- Adapter P01 trả `startedAt` ISO UTC sau khi kiểm tra phiên/quyền/kho và xác nhận fixture thành công. Đây là receipt nội bộ prototype, không tự quy định API production. Mỗi session chỉ có1 mốc; gọi lại adapter nhận cùng receipt.
- Controller lưu `shiftStartedAt` từ receipt khi `preview-ready` và timestamp hợp lệ. Không lấy giờ đăng nhập, giờ click trước khi kiểm tra hoặc giờ render Home. Response thiếu timestamp/sai timestamp→UNKNOWN, không mở Home hoặc tự lấy Date.now bù.
- Home hiển thị **Ca bắt đầu · UTC+7**, `HH:mm:ss` theo Asia/Ho_Chi_Minh; time.datetime giữ ISO đầy đủ. Không có timer chạy nữa. Giờ không đổi khi đợi, quay về Home, đổi fixture KPI/tên, hoặc mở module khác.
- Logout/expired teardown xóa mốc; xác nhận phiên mới nhận mốc mới. Callback của request cũ sau logout không tạo lại mốc. Reload vẫn theo contract P01 hiện có: phiên in-memory bị hủy và phải xác nhận lại; không thêm persistence hoặc khôi phục phiên giả.
- Hai KPI nghiệp vụ UNKNOWN không làm mất receipt ca đã biết. Bỏ hardcode08:30 trong Home fixture adapter. Múi giờ thiết bị không ảnh hưởng cách hiển thị; **nguồn thời gian của fixture vẫn là đồng hồ thiết bị tại lúc adapter xác nhận**, chưa phải giờ server WMS. Khi có backend thật cần nối timestamp xác nhận chính thức qua adapter.

## Kiểm chứng

- `node --test tests/auth-session.test.mjs tests/auth-session-stability.test.mjs tests/auth-session-visual-contract.test.mjs tests/home.test.mjs tests/vietnam-clock.test.mjs`: **36/36 PASS**. Bao gồm thời điểm sau await, idempotent cùng session, chuyển ca, UNKNOWN/denied/expired, malformed timestamp, late response sau logout và UTC+7/qua ngày/năm.
- `node scripts/check_home_shift.cjs`: **6 nhóm PASS**,3 viewport494×950,360×800,1264×712. Browser cố ý timezone America/New_York; Home khớp UTC+7. Mốc nằm trong khoảng xác nhận, double-click không tạo2 mốc, giữ cố định sau1.5s và qua P06/fixture rerender, session mới có mốc mới. Không JS error.
- `node --check home.mjs`, `git diff --check`:exit0. Không thay CSS hoặc baseline trong r07.

[Kết quả browser](evidence/revision-07-shift/results.json) · [Log Node](evidence/revision-07-shift/node-tests.txt) · [Ảnh actual](evidence/revision-07-shift/home-494.png).

Files: P01 auth-flow/fixture-adapter, Home home/fixture-adapter/vietnam-clock formatter, tests Home/time, browser check mới. Clock helper chạy mỗi giây đã loại bỏ; script kiểm r06 được lưu tại evidence/revision-06-clock/check_home_clock-r06.cjs, entry `scripts/check_home_clock.cjs` chuyển tiếp kiểm shift hiện hành. Cache entry r07. Chỉ cập nhật ghi chú vào RUN_STATE, không thay current_prompt của công việc khác. Không coi timestamp fixture là production shift success hoặc nâng nghiệm thu integration.
